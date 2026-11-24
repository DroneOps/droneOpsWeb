<script lang="ts">
	// src/routes/por-hacer/+page.svelte
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import ProyectoCard from '$lib/tablero/ProyectoCard.svelte';
	import ProyectoPanel from '$lib/tablero/ProyectoPanel.svelte';
	import NuevoProyecto from '$lib/tablero/NuevoProyecto.svelte';
	import GestionDepartamentos from '$lib/tablero/GestionDepartamentos.svelte';
	import Calendario from '$lib/tablero/Calendario.svelte';
	import {
		CORREOS_OCULTOS,
		DIAS_HECHO_VISIBLE,
		normalizarProyecto,
		mensajeError,
		esReciente,
		involucrado,
		iniciales,
		compararEnProgreso,
		type Proyecto,
		type Competencia,
		type Departamento,
		type Membresia,
		type Miembro
	} from '$lib/tablero/tipos';

	let { data } = $props();

	type TabId = 'todos' | 'mios' | 'cumplidos';

	// ---- Estado ----
	let proyectos = $state<Proyecto[]>([]); // no archivados
	let archivados = $state<Proyecto[]>([]); // se cargan al abrir "Cumplidos"
	let archivadosCargados = $state(false);
	let competencias = $state<Competencia[]>([]);
	let departamentos = $state<Departamento[]>([]);
	let membresias = $state<Membresia[]>([]);
	let miembros = $state<Miembro[]>([]);
	let cargando = $state(true);
	let errorCarga = $state('');
	let errorAccion = $state('');

	let abiertoId = $state<number | null>(null);
	let creando = $state(false);
	let gestionando = $state(false);
	let tab = $state<TabId>('todos');
	let hechoAbierto = $state(false);
	let verTodosHechos = $state(false);

	// Los tres filtros desplegables
	let filtroComp = $state<number | 'ninguna' | null>(null); // competencia
	let filtroDepto = $state<number | null>(null); // departamento
	let filtroArea = $state<number | null>(null); // área (de la mesa)

	// ----- Calendario -----
	let vista = $state<'lista' | 'calendario'>('lista');

	// ---- Quién soy ----
	const miEmail = $derived(data.user?.email ?? '');
	const yo = $derived(miembros.find((m) => m.email === miEmail) ?? null);
	const esMesa = $derived(yo?.es_superadmin ?? false);

	// ---- Catálogos ----
	const miembrosVisibles = $derived(miembros.filter((m) => !CORREOS_OCULTOS.includes(m.email)));
	const competenciasActivas = $derived(
		competencias.filter((c) => c.activa).sort((a, b) => a.orden - b.orden)
	);
	const deptosActivos = $derived(
		departamentos.filter((d) => d.activo).sort((a, b) => a.orden - b.orden)
	);
	const deptosEquipo = $derived(deptosActivos.filter((d) => d.tipo === 'equipo')); // "Departamento"
	const areasMesa = $derived(deptosActivos.filter((d) => d.tipo === 'mesa')); // "Área"
	const mapaCompetencias = $derived(new Map(competencias.map((c) => [c.id, c])));
	const mapaDeptos = $derived(new Map(departamentos.map((d) => [d.id, d])));

	function nombreDe(email: string): string {
		return miembros.find((m) => m.email === email)?.user ?? email.split('@')[0];
	}

	function competenciaDe(p: Proyecto): Competencia | undefined {
		return p.competencia_id !== null ? mapaCompetencias.get(p.competencia_id) : undefined;
	}

	function deptosDe(p: Proyecto): Departamento[] {
		return p.departamentos_ids
			.map((id) => mapaDeptos.get(id))
			.filter((d): d is Departamento => d !== undefined);
	}

	// ---- Vistas principales: arriba y juntas, cada una con su ícono y su color ----
	// Los colores salen de la paleta del sitio: morado (marca), rosa (acento) y azul.
	const VISTAS = [
		{
			id: 'todos',
			label: 'Todos',
			icono: 'todos',
			activo: 'border-purple-600 bg-purple-50 text-purple-700',
			tinte: 'text-purple-600'
		},
		{
			id: 'mios',
			label: 'Mis proyectos',
			icono: 'mios',
			activo: 'border-pink-600 bg-pink-50 text-pink-700',
			tinte: 'text-pink-600'
		},
		{
			id: 'cumplidos',
			label: 'Cumplidos',
			icono: 'cumplidos',
			activo: 'border-blue-600 bg-blue-50 text-blue-700',
			tinte: 'text-blue-600'
		}
	] as const;

	// Estilo de los desplegables (se resaltan cuando tienen un filtro puesto)
	const selBase =
		'rounded-lg border px-3 py-2 text-sm font-semibold transition focus:border-purple-500 focus:outline-none';
	const selActivo = 'border-purple-600 bg-purple-50 text-purple-700';
	const selInactivo = 'border-slate-200 bg-white text-slate-600 hover:border-slate-300';

	function perteneceATab(t: TabId, p: Proyecto): boolean {
		if (t === 'mios') return involucrado(p, miEmail, membresias);
		return t === 'todos';
	}

	// ---- Filtros ----
	function pasaFiltros(p: Proyecto): boolean {
		if (filtroComp === 'ninguna' && p.competencia_id !== null) return false;
		if (typeof filtroComp === 'number' && p.competencia_id !== filtroComp) return false;
		if (filtroDepto !== null && !p.departamentos_ids.includes(filtroDepto)) return false;
		if (filtroArea !== null && !p.departamentos_ids.includes(filtroArea)) return false;
		return true;
	}

	const hayFiltros = $derived(filtroComp !== null || filtroDepto !== null || filtroArea !== null);
	const visibles = $derived(proyectos.filter(pasaFiltros));

	function contar(t: TabId): number | null {
		if (t === 'cumplidos') return null;
		return visibles.filter((p) => p.estado !== 'done' && perteneceATab(t, p)).length;
	}

	const enTab = $derived(visibles.filter((p) => perteneceATab(tab, p)));

	// En progreso: lo que vence primero va primero
	const enProgreso = $derived(
		enTab.filter((p) => p.estado === 'in_progress').sort(compararEnProgreso)
	);
	const hechos = $derived(enTab.filter((p) => p.estado === 'done'));
	const hechosRecientes = $derived(hechos.filter(esReciente));
	const hechosAnteriores = $derived(hechos.filter((p) => !esReciente(p)));
	const hechosMostrados = $derived(verTodosHechos ? hechos : hechosRecientes);

	// Cumplidos: lo completado más lo archivado
	function fechaCierre(p: Proyecto): number {
		return Date.parse(p.archivado_en ?? p.completado_en ?? p.creado_en);
	}
	const cumplidos = $derived(
		[...proyectos.filter((p) => p.estado === 'done'), ...archivados]
			.filter(pasaFiltros)
			.sort((a, b) => fechaCierre(b) - fechaCierre(a))
	);

	// En el calendario solo caben los proyectos que tienen fecha de entrega
	const sinFecha = $derived(enTab.filter((p) => !p.fecha_limite && p.estado !== 'done').length);

	const proyectoAbierto = $derived(
		abiertoId !== null
			? (proyectos.find((p) => p.id === abiertoId) ?? archivados.find((p) => p.id === abiertoId) ?? null)
			: null
	);
	const siguienteOrden = $derived(Math.max(0, ...proyectos.map((p) => p.orden ?? 0)) + 1000);

	// ---- Mutaciones locales (las usan el panel, los modales y el tiempo real) ----
	function insertar(lista: Proyecto[], p: Proyecto): Proyecto[] {
		return lista.some((x) => x.id === p.id) ? lista.map((x) => (x.id === p.id ? p : x)) : [...lista, p];
	}

	function aplicar(p: Proyecto) {
		if (p.archivado_en) {
			proyectos = proyectos.filter((x) => x.id !== p.id);
			if (archivadosCargados) archivados = insertar(archivados, p);
			return;
		}
		archivados = archivados.filter((x) => x.id !== p.id);
		proyectos = insertar(proyectos, p);
	}

	function quitar(id: number) {
		proyectos = proyectos.filter((p) => p.id !== id);
		archivados = archivados.filter((p) => p.id !== id);
		if (abiertoId === id) abiertoId = null;
	}

	async function seleccionarTab(t: TabId) {
		tab = t;
		if (t === 'cumplidos' && !archivadosCargados) await cargarArchivados();
	}

	// ---- Carga y tiempo real ----
	async function cargarDeptos() {
		const [dRes, mRes] = await Promise.all([
			supabase.from('departamentos').select('*').order('orden', { ascending: true }),
			supabase.from('departamento_miembros').select('departamento_id, email, rol')
		]);
		if (!dRes.error) departamentos = (dRes.data ?? []) as Departamento[];
		if (!mRes.error) membresias = (mRes.data ?? []) as Membresia[];
	}

	async function cargarArchivados() {
		const { data: filas, error: e } = await supabase
			.from('tareas')
			.select('*')
			.not('archivado_en', 'is', null)
			.order('archivado_en', { ascending: false });
		if (e) {
			errorAccion = mensajeError(e);
			return;
		}
		archivados = (filas ?? []).map((f: unknown) => normalizarProyecto(f));
		archivadosCargados = true;
	}

	async function cargar() {
		const [pRes, cRes, mRes, dRes, memRes] = await Promise.all([
			supabase.from('tareas').select('*').is('archivado_en', null).order('orden', { ascending: true }),
			supabase.from('competencias').select('*').order('orden', { ascending: true }),
			supabase.from('admins').select('email, user, es_superadmin').order('user', { ascending: true }),
			supabase.from('departamentos').select('*').order('orden', { ascending: true }),
			supabase.from('departamento_miembros').select('departamento_id, email, rol')
		]);

		const fallo = pRes.error ?? cRes.error ?? mRes.error ?? dRes.error ?? memRes.error;
		if (fallo) {
			errorCarga = fallo.message;
		} else {
			proyectos = (pRes.data ?? []).map((fila: unknown) => normalizarProyecto(fila));
			competencias = (cRes.data ?? []) as Competencia[];
			miembros = (mRes.data ?? []) as Miembro[];
			departamentos = (dRes.data ?? []) as Departamento[];
			membresias = (memRes.data ?? []) as Membresia[];
		}
		cargando = false;
	}

	onMount(() => {
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
	<header
		class="grid grid-cols-1 items-end gap-x-4 gap-y-3 border-b-[2.5px] border-black pb-2 lg:grid-cols-[1fr_auto_1fr]"
	>
		<h1 class="titulo-tablero text-4xl font-bold tracking-tight uppercase sm:text-5xl">Proyectos</h1>

		<!-- Lista / Calendario, centrado -->
		<div class="flex justify-center pb-1">
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
		</div>

		{#if esMesa}
			<div class="flex flex-wrap items-center gap-2 pb-1 lg:justify-end">
				<button
					type="button"
					onclick={() => (gestionando = true)}
					class="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
				>
					Equipos
				</button>
				<button
					type="button"
					onclick={() => (creando = true)}
					class="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700"
				>
					+ Nuevo proyecto
				</button>
			</div>
		{/if}
	</header>

	{#if cargando}
		<p class="py-20 text-center text-sm text-slate-500">Cargando proyectos...</p>
	{:else if errorCarga}
		<div class="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
			<p class="font-bold">No se pudo cargar el tablero</p>
			<p class="mt-1">{errorCarga}</p>
		</div>
	{:else}
		<!-- Vistas (Todos · Mis proyectos · Cumplidos) y los tres filtros desplegables -->
		<div class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
			<div class="flex flex-wrap items-center gap-2" role="group" aria-label="Vistas">
				{#each VISTAS as v (v.id)}
					<button
						type="button"
						onclick={() => seleccionarTab(v.id)}
						aria-pressed={tab === v.id}
						class="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition {tab === v.id
							? v.activo
							: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}"
					>
						<span class={v.tinte}>{@render icono(v.icono)}</span>
						{v.label}
						{#if contar(v.id) !== null}
							<span class="font-mono text-xs {tab === v.id ? 'opacity-70' : 'text-slate-400'}">{contar(v.id)}</span>
						{/if}
					</button>
				{/each}
			</div>

			<span class="hidden h-6 w-px bg-slate-300 md:block" aria-hidden="true"></span>

			<div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filtros">
				<select
					bind:value={filtroComp}
					aria-label="Filtrar por competencia"
					class="{selBase} {filtroComp !== null ? selActivo : selInactivo}"
				>
					<option value={null}>Competencia: todas</option>
					{#each competenciasActivas as c (c.id)}
						<option value={c.id}>{c.nombre}</option>
					{/each}
					<option value="ninguna">Sin competencia</option>
				</select>

				<select
					bind:value={filtroDepto}
					aria-label="Filtrar por departamento"
					class="{selBase} {filtroDepto !== null ? selActivo : selInactivo}"
				>
					<option value={null}>Departamento: todos</option>
					{#each deptosEquipo as d (d.id)}
						<option value={d.id}>{d.nombre}</option>
					{/each}
				</select>

				<select
					bind:value={filtroArea}
					aria-label="Filtrar por área de la mesa"
					class="{selBase} {filtroArea !== null ? selActivo : selInactivo}"
				>
					<option value={null}>Área: todas</option>
					{#each areasMesa as d (d.id)}
						<option value={d.id}>{d.nombre}</option>
					{/each}
				</select>
			</div>
		</div>

		{#if errorAccion}
			<p class="mt-3 text-sm font-medium text-red-600">{errorAccion}</p>
		{/if}

		<!-- ============ CUMPLIDOS ============ -->
		{#if tab === 'cumplidos'}
			<section class="mt-6">
				<p class="mb-3 text-sm text-slate-500">
					Todo lo que ya se completó, incluido lo archivado. La mesa puede restaurar un proyecto para devolverlo al tablero.
				</p>
				{#if !archivadosCargados}
					<p class="py-10 text-center text-sm text-slate-400">Cargando...</p>
				{:else if cumplidos.length === 0}
					<div class="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
						<p class="font-bold text-slate-700">Todavía no hay proyectos cumplidos</p>
					</div>
				{:else}
					<div class="space-y-2">
						{#each cumplidos as p (p.id)}
							{@render fila(p)}
						{/each}
					</div>
				{/if}
			</section>

			<!-- ============ TABLERO (Todos o Mis proyectos) ============ -->
		{:else if vista === 'lista'}
			{#if enTab.length === 0}
				<div class="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
					<p class="font-bold text-slate-700">No hay proyectos que mostrar aquí</p>
					<p class="mt-1 text-sm text-slate-500">
						{hayFiltros
							? 'Prueba cambiando los filtros.'
							: tab === 'mios'
								? 'Todavía no estás en ningún proyecto.'
								: 'La mesa crea los proyectos y los asigna a cada departamento.'}
					</p>
				</div>
			{/if}

			<!-- En progreso -->
			{#if enProgreso.length > 0}
				<section class="mt-6">
					<h2 class="mb-3 text-sm font-bold text-purple-700">En progreso · {enProgreso.length}</h2>
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
						{#each enProgreso as p (p.id)}
							<ProyectoCard
								proyecto={p}
								competencia={competenciaDe(p)}
								departamentos={deptosDe(p)}
								{nombreDe}
								onabrir={() => (abiertoId = p.id)}
							/>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Completados (aparte, colapsado) -->
			{#if hechos.length > 0}
				<section class="mt-8">
					<button
						type="button"
						onclick={() => (hechoAbierto = !hechoAbierto)}
						aria-expanded={hechoAbierto}
						class="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"
					>
						<span aria-hidden="true">{hechoAbierto ? '▾' : '▸'}</span>
						Completados · {hechosRecientes.length}
						<span class="font-normal text-slate-400">últimos {DIAS_HECHO_VISIBLE} días</span>
					</button>

					{#if hechoAbierto}
						<div class="mt-3 space-y-2">
							{#each hechosMostrados as p (p.id)}
								{@render fila(p)}
							{:else}
								<p class="text-sm text-slate-400">Nada completado en este periodo.</p>
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
			{#if sinFecha > 0}
				<p class="mt-4 text-xs text-slate-500">
					{sinFecha}
					{sinFecha === 1 ? 'proyecto no tiene' : 'proyectos no tienen'} fecha de entrega, por eso no aparecen en el calendario.
				</p>
			{/if}
			<!-- AQUÍ SE RENDERIZA EL CALENDARIO -->
			<Calendario proyectos={enTab.filter((p) => p.fecha_limite)} />
		{/if}
	{/if}
</div>

<!-- Íconos de las vistas (trazo simple, toman el color del texto) -->
{#snippet icono(nombre: string)}
	<svg
		viewBox="0 0 24 24"
		class="h-4 w-4"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if nombre === 'todos'}
			<rect x="3" y="3" width="7" height="7" rx="1.5" />
			<rect x="14" y="3" width="7" height="7" rx="1.5" />
			<rect x="14" y="14" width="7" height="7" rx="1.5" />
			<rect x="3" y="14" width="7" height="7" rx="1.5" />
		{:else if nombre === 'mios'}
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		{:else}
			<circle cx="12" cy="12" r="10" />
			<path d="m9 12 2 2 4-4" />
		{/if}
	</svg>
{/snippet}

<!-- Fila compacta para "Completados" y "Cumplidos" -->
{#snippet fila(p: Proyecto)}
	<button
		type="button"
		onclick={() => (abiertoId = p.id)}
		class="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-purple-400"
	>
		<span class="min-w-0 flex-1">
			<span class="block text-sm font-semibold text-slate-500">{p.titulo}</span>
			<span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
				{#if deptosDe(p).length === 0}
					<span class="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">Todo el grupo</span>
				{:else}
					{#each deptosDe(p).slice(0, 3) as d (d.id)}
						<span class="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">{d.nombre}</span>
					{/each}
				{/if}
				{#if competenciaDe(p)}
					<span>{competenciaDe(p)?.nombre}</span>
				{/if}
			</span>
		</span>
		{#if p.archivado_en}
			<span class="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-white">Archivado</span>
		{/if}
		{#if p.encargado_email}
			<span
				title="Encargado: {nombreDe(p.encargado_email)}"
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-purple-600 bg-purple-100 text-[10px] font-bold text-purple-800"
			>
				{iniciales(nombreDe(p.encargado_email))}
			</span>
		{/if}
	</button>
{/snippet}

{#if proyectoAbierto}
	{#key proyectoAbierto.id}
		<ProyectoPanel
			proyecto={proyectoAbierto}
			{competencias}
			{departamentos}
			{membresias}
			miembros={miembrosVisibles}
			{esMesa}
			{miEmail}
			{nombreDe}
			oncambio={aplicar}
			oneliminado={quitar}
			oncerrar={() => (abiertoId = null)}
		/>
	{/key}
{/if}

{#if creando}
	<NuevoProyecto
		competencias={competenciasActivas}
		departamentos={deptosActivos}
		{membresias}
		miembros={miembrosVisibles}
		{siguienteOrden}
		deptoInicial={filtroDepto ?? filtroArea}
		oncreado={(p) => {
			aplicar(p);
			creando = false;
			abiertoId = p.id;
		}}
		oncerrar={() => (creando = false)}
	/>
{/if}

{#if gestionando}
	<GestionDepartamentos
		{departamentos}
		{membresias}
		miembros={miembrosVisibles}
		{miEmail}
		{esMesa}
		inicial={filtroDepto ?? filtroArea}
		onrefrescar={cargarDeptos}
		oncerrar={() => (gestionando = false)}
	/>
{/if}

<style>
	@import url('https://fonts.cdnfonts.com/css/sansation');

	.titulo-tablero {
		font-family: 'Sansation', sans-serif;
	}
</style>