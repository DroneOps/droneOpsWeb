<script lang="ts">
	// src/routes/por-hacer/+page.svelte
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import ProyectoCard from '$lib/tablero/ProyectoCard.svelte';
	import ProyectoPanel from '$lib/tablero/ProyectoPanel.svelte';
	import NuevoProyecto from '$lib/tablero/NuevoProyecto.svelte';
	import Calendario from '$lib/tablero/Calendario.svelte';
	import {
		CORREOS_OCULTOS,
		DIAS_HECHO_VISIBLE,
		normalizarProyecto,
		saludEfectiva,
		estaEstancado,
		esReciente,
		involucrado,
		iniciales,
		type Proyecto,
		type Categoria,
		type Miembro
	} from '$lib/tablero/tipos';

	let { data } = $props();

	type TabId = 'todos' | 'grupo' | number;
	type Foco = 'todos' | 'atrasados' | 'estancados';

	// ---- Estado ----
	let proyectos = $state<Proyecto[]>([]);
	let categorias = $state<Categoria[]>([]);
	let miembros = $state<Miembro[]>([]);
	let cargando = $state(true);
	let errorCarga = $state('');

	let abiertoId = $state<number | null>(null);
	let creando = $state(false);
	let tab = $state<TabId>('todos');
	let foco = $state<Foco>('todos');
	let soloMios = $state(false);
	let busqueda = $state('');
	let hechoAbierto = $state(false);
	let verTodosHechos = $state(false);

	// ----- Calendario -----
	let vista = $state<'lista' | 'calendario'>('lista');

	// ---- Quién soy ----
	const miEmail = $derived(data.user?.email ?? '');
	const yo = $derived(miembros.find((m) => m.email === miEmail) ?? null);
	const esMesa = $derived(yo?.es_superadmin ?? false);

	// ---- Catálogos ----
	const miembrosVisibles = $derived(miembros.filter((m) => !CORREOS_OCULTOS.includes(m.email)));
	const categoriasActivas = $derived(categorias.filter((c) => c.activa));
	const competencias = $derived(categoriasActivas.filter((c) => c.tipo === 'competencia'));
	const mapaCategorias = $derived(new Map(categorias.map((c) => [c.id, c])));

	function nombreDe(email: string): string {
		return miembros.find((m) => m.email === email)?.user ?? email.split('@')[0];
	}

	function categoriaDe(p: Proyecto): Categoria | undefined {
		return p.categoria_id !== null ? mapaCategorias.get(p.categoria_id) : undefined;
	}

	// ---- Pestañas: Todos · una por competencia · Grupo ----
	const tabs = $derived<{ id: TabId; label: string }[]>([
		{ id: 'todos', label: 'Todos' },
		...competencias.map((c) => ({ id: c.id as TabId, label: c.nombre })),
		{ id: 'grupo', label: 'Grupo' }
	]);

	function perteneceATab(t: TabId, p: Proyecto): boolean {
		if (t === 'todos') return true;
		if (t === 'grupo') return categoriaDe(p)?.tipo === 'grupo';
		return p.categoria_id === t;
	}

	// ---- Filtros ----
	const visibles = $derived(
		proyectos.filter((p) => {
			if (soloMios && !involucrado(p, miEmail)) return false;
			const q = busqueda.trim().toLowerCase();
			if (q && !p.titulo.toLowerCase().includes(q)) return false;
			return true;
		})
	);

	function contar(t: TabId): number {
		return visibles.filter((p) => p.estado !== 'done' && perteneceATab(t, p)).length;
	}

	const enTab = $derived(visibles.filter((p) => perteneceATab(tab, p)));

	const nCurso = $derived(enTab.filter((p) => p.estado === 'in_progress').length);
	const nRevision = $derived(enTab.filter((p) => p.estado === 'in_review').length);
	const nAtrasados = $derived(
		enTab.filter((p) => p.estado !== 'done' && saludEfectiva(p) === 'atrasado').length
	);
	const nEstancados = $derived(enTab.filter((p) => estaEstancado(p)).length);

	const delTablero = $derived(
		enTab.filter((p) => {
			if (foco === 'atrasados') return p.estado !== 'done' && saludEfectiva(p) === 'atrasado';
			if (foco === 'estancados') return estaEstancado(p);
			return true;
		})
	);

	// Lo urgente primero: atrasados, luego estancados, luego el resto
	function rango(p: Proyecto): number {
		return saludEfectiva(p) === 'atrasado' ? 0 : estaEstancado(p) ? 1 : 2;
	}

	const enRevision = $derived(delTablero.filter((p) => p.estado === 'in_review'));
	const enCurso = $derived(
		delTablero
			.filter((p) => p.estado === 'in_progress')
			.sort((a, b) => rango(a) - rango(b) || (a.orden ?? 0) - (b.orden ?? 0))
	);
	const porIniciar = $derived(delTablero.filter((p) => p.estado === 'not_started'));
	const hechos = $derived(delTablero.filter((p) => p.estado === 'done'));
	const hechosRecientes = $derived(hechos.filter(esReciente));
	const hechosAnteriores = $derived(hechos.filter((p) => !esReciente(p)));
	const hechosMostrados = $derived(verTodosHechos ? hechos : hechosRecientes);

	const proyectoAbierto = $derived(
		abiertoId !== null ? (proyectos.find((p) => p.id === abiertoId) ?? null) : null
	);
	const siguienteOrden = $derived(Math.max(0, ...proyectos.map((p) => p.orden ?? 0)) + 1000);

	// ---- Mutaciones locales (las usan el panel, el modal y el tiempo real) ----
	function aplicar(p: Proyecto) {
		if (p.archivado_en) {
			proyectos = proyectos.filter((x) => x.id !== p.id);
			return;
		}
		proyectos = proyectos.some((x) => x.id === p.id)
			? proyectos.map((x) => (x.id === p.id ? p : x))
			: [...proyectos, p];
	}

	function quitar(id: number) {
		proyectos = proyectos.filter((p) => p.id !== id);
		if (abiertoId === id) abiertoId = null;
	}

	function alternarFoco(f: Foco) {
		foco = foco === f ? 'todos' : f;
	}

	function alternarSoloMios() {
		soloMios = !soloMios;
		try {
			localStorage.setItem('tablero:soloMios', soloMios ? '1' : '0');
		} catch {
			/* sin almacenamiento: no pasa nada */
		}
	}

	// ---- Carga y tiempo real ----
	async function cargar() {
		const [pRes, cRes, mRes] = await Promise.all([
			supabase.from('tareas').select('*').is('archivado_en', null).order('orden', { ascending: true }),
			supabase.from('categorias').select('*').order('orden', { ascending: true }),
			supabase.from('admins').select('email, user, es_superadmin, area').order('user', { ascending: true })
		]);

		const fallo = pRes.error ?? cRes.error ?? mRes.error;
		if (fallo) {
			errorCarga = fallo.message;
		} else {
			proyectos = (pRes.data ?? []).map((fila: unknown) => normalizarProyecto(fila));
			categorias = (cRes.data ?? []) as Categoria[];
			miembros = (mRes.data ?? []) as Miembro[];
		}
		cargando = false;
	}

	onMount(() => {
		try {
			soloMios = localStorage.getItem('tablero:soloMios') === '1';
		} catch {
			/* ignorar */
		}

		cargar();

		const canal = supabase
			.channel('proyectos-tiempo-real')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, (payload: any) => {
				if (payload.eventType === 'DELETE') {
					const id = payload.old?.id;
					if (typeof id === 'number') quitar(id);
				} else if (payload.new) {
					aplicar(normalizarProyecto(payload.new));
				}
			})
			.subscribe();

		return () => {
			supabase.removeChannel(canal);
		};
	});
</script>

<svelte:head>
	<title>Proyectos · DroneOps</title>
</svelte:head>

<div class="mx-auto max-w-[1440px] px-6 py-6 text-slate-900 sm:px-12 sm:py-10">
	<!-- Encabezado -->
	<header class="flex flex-wrap items-end justify-between gap-4 border-b-[2.5px] border-black pb-2">
		<h1 class="titulo-tablero text-4xl font-bold tracking-tight uppercase sm:text-5xl">Proyectos</h1>
		
		<div class="flex rounded-lg border border-slate-300 bg-slate-100 p-1">
			<button
				type="button"
				onclick={() => (vista = 'lista')}
				class="rounded-md px-3 py-1 text-xs font-bold transition {vista === 'lista' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
			>
				Lista
			</button>
			<button
				type="button"
				onclick={() => (vista = 'calendario')}
				class="rounded-md px-3 py-1 text-xs font-bold transition {vista === 'calendario' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
			>
				Calendario
			</button>
		</div>

		<div class="flex flex-wrap items-center gap-2 pb-1">
			<button
				type="button"
				onclick={alternarSoloMios}
				aria-pressed={soloMios}
				class="rounded-full border px-4 py-1.5 text-xs font-bold transition {soloMios
					? 'border-purple-600 bg-purple-50 text-purple-700'
					: 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				Mis proyectos
			</button>
			<button
				type="button"
				onclick={() => (creando = true)}
				class="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700"
			>
				+ {esMesa ? 'Nuevo proyecto' : 'Proponer idea'}
			</button>
		</div>
	</header>

	{#if cargando}
		<p class="py-20 text-center text-sm text-slate-500">Cargando proyectos...</p>
	{:else if errorCarga}
		<div class="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
			<p class="font-bold">No se pudo cargar el tablero</p>
			<p class="mt-1">{errorCarga}</p>
		</div>
	{:else}
		<!-- Pestañas por competencia -->
		<nav class="mt-5 flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Competencias">
			{#each tabs as t (t.id)}
				<button
					type="button"
					onclick={() => (tab = t.id)}
					class="shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition {tab === t.id
						? 'border-purple-600 text-purple-700'
						: 'border-transparent text-slate-500 hover:text-slate-900'}"
				>
					{t.label}
					<span class="ml-1 font-mono text-xs text-slate-400">{contar(t.id)}</span>
				</button>
			{/each}
		</nav>

		{#if vista === 'lista'}
			<!-- Resumen y filtros -->
			<div class="mt-4 flex flex-wrap items-center gap-2">
				<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{nCurso} en curso</span>
				{#if nRevision > 0}
					<span class="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{nRevision} en revisión</span>
				{/if}
				{#if nAtrasados > 0 || foco === 'atrasados'}
					<button
						type="button"
						onclick={() => alternarFoco('atrasados')}
						aria-pressed={foco === 'atrasados'}
						class="rounded-full px-3 py-1 text-xs font-semibold transition {foco === 'atrasados'
							? 'bg-red-600 text-white'
							: 'bg-red-100 text-red-700 hover:bg-red-200'}"
					>
						{nAtrasados} atrasados
					</button>
				{/if}
				{#if nEstancados > 0 || foco === 'estancados'}
					<button
						type="button"
						onclick={() => alternarFoco('estancados')}
						aria-pressed={foco === 'estancados'}
						class="rounded-full px-3 py-1 text-xs font-semibold transition {foco === 'estancados'
							? 'bg-amber-600 text-white'
							: 'bg-amber-100 text-amber-800 hover:bg-amber-200'}"
					>
						{nEstancados} sin avances
					</button>
				{/if}
				<span class="flex-1"></span>
				<input
					type="search"
					bind:value={busqueda}
					placeholder="Buscar proyecto..."
					aria-label="Buscar proyecto"
					class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none sm:w-56"
				/>
			</div>

			{#if delTablero.length === 0}
				<div class="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
					<p class="font-bold text-slate-700">No hay proyectos que mostrar aquí</p>
					<p class="mt-1 text-sm text-slate-500">
						{soloMios || foco !== 'todos' || busqueda
							? 'Prueba quitando los filtros.'
							: 'Propón una idea con el botón de arriba.'}
					</p>
				</div>
			{/if}

			<!-- Para revisión -->
			{#if enRevision.length > 0}
				<section class="mt-6">
					<h2 class="mb-3 flex items-center gap-2 text-sm font-bold text-sky-700">
						En revisión · {enRevision.length}
						<span class="font-normal text-slate-400">esperando la decisión de la mesa</span>
					</h2>
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
						{#each enRevision as p (p.id)}
							<ProyectoCard
								proyecto={p}
								categoria={categoriaDe(p)}
								mostrarCategoria={tab === 'todos' || tab === 'grupo'}
								{nombreDe}
								onabrir={() => (abiertoId = p.id)}
							/>
						{/each}
					</div>
				</section>
			{/if}

			<!-- En curso -->
			{#if enCurso.length > 0}
				<section class="mt-8">
					<h2 class="mb-3 text-sm font-bold text-purple-700">En curso · {enCurso.length}</h2>
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
						{#each enCurso as p (p.id)}
							<ProyectoCard
								proyecto={p}
								categoria={categoriaDe(p)}
								mostrarCategoria={tab === 'todos' || tab === 'grupo'}
								{nombreDe}
								onabrir={() => (abiertoId = p.id)}
							/>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Por iniciar -->
			{#if porIniciar.length > 0}
				<section class="mt-8">
					<h2 class="mb-3 text-sm font-bold text-slate-600">Por iniciar · {porIniciar.length}</h2>
					<div class="space-y-2">
						{#each porIniciar as p (p.id)}
							{@render fila(p)}
						{/each}
					</div>
				</section>
			{/if}

			<!-- Hecho (colapsado) -->
			{#if hechos.length > 0}
				<section class="mt-8">
					<button
						type="button"
						onclick={() => (hechoAbierto = !hechoAbierto)}
						aria-expanded={hechoAbierto}
						class="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"
					>
						<span aria-hidden="true">{hechoAbierto ? '▾' : '▸'}</span>
						Hecho · {hechosRecientes.length}
						<span class="font-normal text-slate-400">últimos {DIAS_HECHO_VISIBLE} días</span>
					</button>

					{#if hechoAbierto}
						<div class="mt-3 space-y-2">
							{#each hechosMostrados as p (p.id)}
								{@render fila(p)}
							{:else}
								<p class="text-sm text-slate-400">Nada terminado en este periodo.</p>
							{/each}
							{#if hechosAnteriores.length > 0}
								<button
									type="button"
									onclick={() => (verTodosHechos = !verTodosHechos)}
									class="pt-1 text-xs font-bold text-purple-700 hover:underline"
								>
									{verTodosHechos ? 'Ocultar anteriores' : `Mostrar anteriores (${hechosAnteriores.length})`}
								</button>
							{/if}
						</div>
					{/if}
				</section>
			{/if}

		{:else}
			<!-- AQUÍ SE RENDERIZA EL CALENDARIO -->
			<Calendario proyectos={delTablero.filter(p => p.fecha_limite)} />
		{/if}
	{/if}
</div>

<!-- Fila compacta para "Por iniciar" y "Hecho" -->
{#snippet fila(p: Proyecto)}
	<button
		type="button"
		onclick={() => (abiertoId = p.id)}
		class="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-purple-400"
	>
		<span class="flex-1 text-sm font-semibold {p.estado === 'done' ? 'text-slate-500' : 'text-slate-900'}">
			{p.titulo}
		</span>
		{#if tab === 'todos' || tab === 'grupo'}
			<span class="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
				<span class="h-2 w-2 rounded-full" style="background-color: {categoriaDe(p)?.color ?? '#cbd5e1'}"></span>
				{categoriaDe(p)?.nombre ?? 'Sin categoría'}
			</span>
		{/if}
		{#if p.lider_email}
			<span
				title="Líder: {nombreDe(p.lider_email)}"
				class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-purple-600 bg-purple-100 text-[10px] font-bold text-purple-800"
			>
				{iniciales(nombreDe(p.lider_email))}
			</span>
		{:else}
			<span class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Sin líder</span>
		{/if}
	</button>
{/snippet}

{#if proyectoAbierto}
	{#key proyectoAbierto.id}
		<ProyectoPanel
			proyecto={proyectoAbierto}
			{categorias}
			miembros={miembrosVisibles}
			{miEmail}
			{esMesa}
			{nombreDe}
			oncambio={aplicar}
			oneliminado={quitar}
			oncerrar={() => (abiertoId = null)}
		/>
	{/key}
{/if}

{#if creando}
	<NuevoProyecto
		categorias={categoriasActivas}
		miembros={miembrosVisibles}
		{esMesa}
		{siguienteOrden}
		oncreado={(p) => {
			aplicar(p);
			creando = false;
			abiertoId = p.id;
		}}
		oncerrar={() => (creando = false)}
	/>
{/if}

<style>
	@import url('https://fonts.cdnfonts.com/css/sansation');

	.titulo-tablero {
		font-family: 'Sansation', sans-serif;
	}
</style>