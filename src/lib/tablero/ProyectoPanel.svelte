<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import {
		ESTADOS,
		SALUD,
		PRIORIDADES,
		TIPOS_AVANCE,
		normalizarProyecto,
		iniciales,
		haceCuanto,
		type Proyecto,
		type Categoria,
		type Miembro,
		type Avance,
		type Subtarea,
		type Estado,
		type Prioridad,
		type Salud,
		type TipoAvance
	} from './tipos';

	let {
		proyecto,
		categorias,
		miembros,
		miEmail,
		esMesa,
		nombreDe,
		oncambio,
		oneliminado,
		oncerrar
	}: {
		proyecto: Proyecto;
		categorias: Categoria[];
		miembros: Miembro[];
		miEmail: string;
		esMesa: boolean;
		nombreDe: (email: string) => string;
		oncambio: (p: Proyecto) => void;
		oneliminado: (id: number) => void;
		oncerrar: () => void;
	} = $props();

	// El padre usa {#key id}, así que estos valores iniciales se toman una sola vez
	const ini = untrack(() => proyecto);
	let titulo = $state(ini.titulo);
	let comentarios = $state(ini.comentarios ?? '');
	let categoriaId = $state<number | null>(ini.categoria_id);
	let prioridad = $state<Prioridad>(ini.prioridad);
	let fecha = $state(ini.fecha_limite ? ini.fecha_limite.slice(0, 10) : '');
	let subtareas = $state<Subtarea[]>(ini.subtareas.map((s) => ({ ...s })));

	let nuevaSub = $state('');
	let nota = $state('');
	let textoAvance = $state('');
	let tipoAvance = $state<'avance' | 'bloqueo' | 'nota'>('avance');
	let avances = $state<Avance[]>([]);
	let cargandoAvances = $state(true);
	let ocupado = $state(false);
	let error = $state('');

	const campo =
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500';
	const etiqueta = 'text-xs font-bold tracking-wide text-slate-500 uppercase';

	// ---- Roles (la base de datos hace cumplir las mismas reglas) ----
	const esResp = $derived(
		esMesa ||
			proyecto.lider_email === miEmail ||
			(proyecto.lider_email === null && proyecto.creado_por === miEmail)
	);
	const puedeParticipar = $derived(esResp || proyecto.equipo_emails.includes(miEmail));
	const estadoInfo = $derived(ESTADOS.find((e) => e.id === proyecto.estado) ?? ESTADOS[0]);
	const supervisores = $derived(miembros.filter((m) => m.es_superadmin));
	const disponibles = $derived(
		miembros.filter((m) => !proyecto.equipo_emails.includes(m.email) && m.email !== proyecto.lider_email)
	);
	// Líder + equipo, sin repetidos: son a quienes se les puede asignar una subtarea
	const integrantes = $derived([
		...new Set([...(proyecto.lider_email ? [proyecto.lider_email] : []), ...proyecto.equipo_emails])
	]);

	const hayCambios = $derived(
		titulo.trim() !== proyecto.titulo ||
			(comentarios.trim() || null) !== (proyecto.comentarios?.trim() || null) ||
			categoriaId !== proyecto.categoria_id ||
			prioridad !== proyecto.prioridad ||
			fecha !== (proyecto.fecha_limite ? proyecto.fecha_limite.slice(0, 10) : '')
	);

	// Si alguien más cambia las subtareas (tiempo real), se refleja aquí
	$effect(() => {
		const remotas = proyecto.subtareas;
		untrack(() => {
			subtareas = remotas.map((s) => ({ ...s }));
		});
	});

	onMount(async () => {
		const { data, error: e } = await supabase
			.from('avances')
			.select('*')
			.eq('tarea_id', proyecto.id)
			.order('creado_en', { ascending: false });
		if (!e && data) avances = data as Avance[];
		cargandoAvances = false;
	});

	// ---- Escritura ----
	async function guardarCampo(cambios: Record<string, unknown>): Promise<boolean> {
		error = '';
		const { data, error: e } = await supabase
			.from('tareas')
			.update(cambios)
			.eq('id', proyecto.id)
			.select()
			.single();
		if (e) {
			error = e.message;
			return false;
		}
		oncambio(normalizarProyecto(data));
		return true;
	}

	async function guardar() {
		if (!titulo.trim()) return;
		ocupado = true;
		await guardarCampo({
			titulo: titulo.trim(),
			comentarios: comentarios.trim() || null,
			categoria_id: categoriaId,
			prioridad,
			fecha_limite: fecha ? new Date(fecha).toISOString() : null
		});
		ocupado = false;
	}

	async function persistirSubtareas(nuevas: Subtarea[]) {
		const previas = subtareas;
		subtareas = nuevas;
		const ok = await guardarCampo({ subtareas: nuevas });
		if (!ok) subtareas = previas;
	}

	function alternarSub(id: string) {
		persistirSubtareas(subtareas.map((s) => (s.id === id ? { ...s, hecho: !s.hecho } : s)));
	}

	function agregarSub() {
		const texto = nuevaSub.trim();
		if (!texto) return;
		nuevaSub = '';
		persistirSubtareas([
			...subtareas,
			{ id: crypto.randomUUID(), texto, hecho: false, asignado: null }
		]);
	}

	function quitarSub(id: string) {
		persistirSubtareas(subtareas.filter((s) => s.id !== id));
	}

	function asignarSub(id: string, correo: string) {
		persistirSubtareas(subtareas.map((s) => (s.id === id ? { ...s, asignado: correo || null } : s)));
	}

	function quitarIntegrante(correo: string) {
		guardarCampo({ equipo_emails: proyecto.equipo_emails.filter((e) => e !== correo) });
	}

	function agregarIntegrante(correo: string) {
		if (!correo) return;
		guardarCampo({ equipo_emails: [...proyecto.equipo_emails, correo] });
	}

	// ---- Avances ----
	async function publicar(tipo: TipoAvance, texto: string): Promise<boolean> {
		const { data, error: e } = await supabase
			.from('avances')
			.insert([{ tarea_id: proyecto.id, tipo, texto: texto.trim() }])
			.select()
			.single();
		if (e) {
			error = e.message;
			return false;
		}
		avances = [data as Avance, ...avances];
		return true;
	}

	async function publicarDesdeFormulario() {
		if (!textoAvance.trim()) return;
		ocupado = true;
		error = '';
		if (await publicar(tipoAvance, textoAvance)) textoAvance = '';
		ocupado = false;
	}

	// ---- Flujo de estados ----
	async function cambiarEstado(nuevo: Estado, avance?: { tipo: TipoAvance; texto: string }) {
		ocupado = true;
		const ok = await guardarCampo({ estado: nuevo });
		if (ok && avance) await publicar(avance.tipo, avance.texto);
		if (ok) nota = '';
		ocupado = false;
	}

	async function archivar() {
		ocupado = true;
		const ok = await guardarCampo({ archivado_en: new Date().toISOString() });
		ocupado = false;
		if (ok) oncerrar();
	}

	async function eliminar() {
		if (!confirm(`¿Eliminar el proyecto "${proyecto.titulo}"? Esta acción no se puede deshacer.`)) return;
		ocupado = true;
		const { error: e } = await supabase.from('tareas').delete().eq('id', proyecto.id);
		ocupado = false;
		if (e) {
			error = e.message;
			return;
		}
		oneliminado(proyecto.id);
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && oncerrar()} />

<button
	type="button"
	aria-label="Cerrar panel"
	class="fixed inset-0 z-40 cursor-default bg-slate-900/40"
	onclick={oncerrar}
></button>

<div
	role="dialog"
	aria-modal="true"
	aria-label="Detalle del proyecto"
	class="fixed top-0 right-0 z-50 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
>
	<header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
		<div class="flex items-center gap-3">
			<span class="font-mono text-xs text-slate-400">#{proyecto.id}</span>
			<span class="rounded-full px-2.5 py-0.5 text-xs font-bold {estadoInfo.clase}">{estadoInfo.label}</span>
		</div>
		<button type="button" onclick={oncerrar} aria-label="Cerrar" class="text-slate-400 hover:text-slate-900">✕</button>
	</header>

	<div class="flex-1 space-y-6 overflow-y-auto px-6 py-5">
		<!-- Título -->
		<input
			type="text"
			bind:value={titulo}
			disabled={!esResp}
			aria-label="Título del proyecto"
			class="w-full border-b-2 border-transparent bg-transparent pb-1 text-2xl font-extrabold text-slate-900 focus:border-purple-500 focus:outline-none disabled:opacity-100"
		/>

		<!-- Categoría / prioridad / fecha -->
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<label class="block space-y-1">
				<span class={etiqueta}>Categoría</span>
				<select bind:value={categoriaId} disabled={!esResp} class={campo}>
					<option value={null}>Sin categoría</option>
					{#each categorias as c (c.id)}
						<option value={c.id}>{c.nombre}</option>
					{/each}
				</select>
			</label>
			<label class="block space-y-1">
				<span class={etiqueta}>Prioridad</span>
				<select bind:value={prioridad} disabled={!esResp} class={campo}>
					{#each PRIORIDADES as p (p.id)}
						<option value={p.id}>{p.label}</option>
					{/each}
				</select>
			</label>
			<label class="block space-y-1">
				<span class={etiqueta}>Fecha límite</span>
				<input type="date" bind:value={fecha} disabled={!esResp} class={campo} />
			</label>
		</div>

		<!-- Personas -->
		<section class="space-y-3 rounded-2xl bg-slate-50 p-4">
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="block space-y-1">
					<span class={etiqueta}>Líder</span>
					{#if esMesa}
						<select
							class={campo}
							value={proyecto.lider_email ?? ''}
							onchange={(e) => guardarCampo({ lider_email: e.currentTarget.value || null })}
						>
							<option value="">Sin líder</option>
							{#each miembros as m (m.email)}
								<option value={m.email}>{m.user}</option>
							{/each}
						</select>
					{:else}
						<p class="py-2 text-sm font-semibold text-slate-800">
							{proyecto.lider_email ? nombreDe(proyecto.lider_email) : 'Sin asignar'}
						</p>
					{/if}
				</div>
				<div class="block space-y-1">
					<span class={etiqueta}>Supervisor</span>
					{#if esMesa}
						<select
							class={campo}
							value={proyecto.supervisor_email ?? ''}
							onchange={(e) => guardarCampo({ supervisor_email: e.currentTarget.value || null })}
						>
							<option value="">Sin supervisor</option>
							{#each supervisores as m (m.email)}
								<option value={m.email}>{m.user}</option>
							{/each}
						</select>
					{:else}
						<p class="py-2 text-sm font-semibold text-slate-800">
							{proyecto.supervisor_email ? nombreDe(proyecto.supervisor_email) : 'Sin asignar'}
						</p>
					{/if}
				</div>
			</div>

			<div class="space-y-2">
				<span class={etiqueta}>Equipo</span>
				<div class="flex flex-wrap items-center gap-2">
					{#each proyecto.equipo_emails as correo (correo)}
						<span class="flex items-center gap-1.5 rounded-full bg-white py-1 pr-2 pl-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
							<span class="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold">
								{iniciales(nombreDe(correo))}
							</span>
							{nombreDe(correo)}
							{#if esResp}
								<button
									type="button"
									onclick={() => quitarIntegrante(correo)}
									aria-label="Quitar a {nombreDe(correo)}"
									class="text-slate-400 hover:text-red-600"
								>
									✕
								</button>
							{/if}
						</span>
					{:else}
						<span class="text-xs text-slate-400">Sin integrantes todavía</span>
					{/each}

					{#if esResp && disponibles.length > 0}
						<select
							class="rounded-full border border-dashed border-slate-300 bg-transparent px-2 py-1 text-xs text-slate-600"
							value=""
							aria-label="Agregar integrante"
							onchange={(e) => {
								agregarIntegrante(e.currentTarget.value);
								e.currentTarget.value = '';
							}}
						>
							<option value="">+ Agregar</option>
							{#each disponibles as m (m.email)}
								<option value={m.email}>{m.user}</option>
							{/each}
						</select>
					{/if}
				</div>
			</div>

			{#if esMesa && (proyecto.estado === 'in_progress' || proyecto.estado === 'in_review')}
				<div class="space-y-1.5">
					<span class={etiqueta}>Semáforo (lo define la mesa)</span>
					<div class="flex gap-2">
						{#each Object.entries(SALUD) as [id, info] (id)}
							<button
								type="button"
								onclick={() => guardarCampo({ salud: id as Salud })}
								class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition {proyecto.salud === id
									? 'border-slate-900 bg-white text-slate-900'
									: 'border-slate-200 text-slate-500 hover:border-slate-400'}"
							>
								<span class="h-2 w-2 rounded-full {info.punto}"></span>
								{info.label}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</section>

		<!-- Flujo -->
		<section class="space-y-3 rounded-2xl border border-slate-200 p-4">
			<span class={etiqueta}>Flujo del proyecto</span>

			{#if proyecto.estado === 'not_started'}
				{#if esResp}
					<button
						type="button"
						disabled={ocupado || !proyecto.lider_email}
						onclick={() => cambiarEstado('in_progress', { tipo: 'avance', texto: 'Proyecto iniciado.' })}
						class="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Iniciar proyecto
					</button>
				{/if}
				{#if !proyecto.lider_email}
					<p class="text-xs text-slate-500">
						{esMesa
							? 'Elige un líder arriba para poder iniciar el proyecto.'
							: 'La mesa debe asignarle un líder a esta idea para que pueda arrancar.'}
					</p>
				{/if}
			{:else if proyecto.estado === 'in_progress'}
				{#if esResp}
					<textarea
						bind:value={nota}
						rows="2"
						placeholder="Nota para la mesa: qué se logró (opcional)"
						class={campo}
					></textarea>
					<button
						type="button"
						disabled={ocupado}
						onclick={() =>
							cambiarEstado('in_review', { tipo: 'avance', texto: nota.trim() || 'Enviado a revisión.' })}
						class="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50"
					>
						Enviar a revisión
					</button>
				{:else}
					<p class="text-xs text-slate-500">Solo el líder puede enviar el proyecto a revisión.</p>
				{/if}
			{:else if proyecto.estado === 'in_review'}
				{#if esMesa}
					<textarea
						bind:value={nota}
						rows="2"
						placeholder="Decisión de la mesa (obligatoria para devolver)"
						class={campo}
					></textarea>
					<div class="flex gap-2">
						<button
							type="button"
							disabled={ocupado}
							onclick={() => cambiarEstado('done', { tipo: 'aprobado', texto: nota.trim() || 'Proyecto aprobado.' })}
							class="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
						>
							Aprobar
						</button>
						<button
							type="button"
							disabled={ocupado || !nota.trim()}
							onclick={() => cambiarEstado('in_progress', { tipo: 'devuelto', texto: nota.trim() })}
							class="flex-1 rounded-xl border border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Devolver
						</button>
					</div>
				{:else}
					<p class="text-xs text-slate-500">Esperando la decisión de la mesa.</p>
					{#if esResp}
						<button
							type="button"
							disabled={ocupado}
							onclick={() => cambiarEstado('in_progress')}
							class="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
						>
							Retirar de revisión
						</button>
					{/if}
				{/if}
			{:else if proyecto.estado === 'done'}
				{#if esMesa}
					<div class="flex gap-2">
						<button
							type="button"
							disabled={ocupado}
							onclick={() => cambiarEstado('in_progress', { tipo: 'nota', texto: 'Proyecto reabierto.' })}
							class="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
						>
							Reabrir
						</button>
						<button
							type="button"
							disabled={ocupado}
							onclick={archivar}
							class="flex-1 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-50"
						>
							Archivar
						</button>
					</div>
				{:else}
					<p class="text-xs text-slate-500">Proyecto terminado y aprobado por la mesa.</p>
				{/if}
			{/if}
		</section>

		<!-- Subtareas -->
		<section class="space-y-3">
			<div class="flex items-center justify-between">
				<span class={etiqueta}>Subtareas</span>
				<span class="font-mono text-xs text-slate-400">
					{subtareas.filter((s) => s.hecho).length}/{subtareas.length}
				</span>
			</div>

			<ul class="space-y-1.5">
				{#each subtareas as s (s.id)}
					<li class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
						<input
							type="checkbox"
							checked={s.hecho}
							disabled={!puedeParticipar}
							onchange={() => alternarSub(s.id)}
							class="h-4 w-4 accent-purple-600"
						/>
						<span class="flex-1 text-sm {s.hecho ? 'text-slate-400 line-through' : 'text-slate-800'}">
							{s.texto}
						</span>
						{#if esResp && integrantes.length > 0}
							<select
								value={s.asignado ?? ''}
								onchange={(e) => asignarSub(s.id, e.currentTarget.value)}
								aria-label="Asignar subtarea"
								class="max-w-28 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600"
							>
								<option value="">Sin asignar</option>
								{#each integrantes as correo (correo)}
									<option value={correo}>{nombreDe(correo)}</option>
								{/each}
							</select>
						{:else if s.asignado}
							<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
								{nombreDe(s.asignado)}
							</span>
						{/if}
						{#if esResp}
							<button
								type="button"
								onclick={() => quitarSub(s.id)}
								aria-label="Quitar subtarea"
								class="text-slate-300 hover:text-red-600"
							>
								✕
							</button>
						{/if}
					</li>
				{:else}
					<li class="text-xs text-slate-400">Todavía no hay subtareas.</li>
				{/each}
			</ul>

			{#if esResp}
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={nuevaSub}
						placeholder="Agregar subtarea..."
						class={campo}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								agregarSub();
							}
						}}
					/>
					<button
						type="button"
						onclick={agregarSub}
						class="rounded-lg bg-slate-900 px-4 text-lg font-bold text-white hover:bg-slate-700"
						aria-label="Agregar subtarea"
					>
						+
					</button>
				</div>
			{/if}
		</section>

		<!-- Descripción -->
		<label class="block space-y-1.5">
			<span class={etiqueta}>Descripción</span>
			<textarea
				bind:value={comentarios}
				rows="3"
				disabled={!esResp}
				class={campo}
				placeholder="Detalles del proyecto..."
			></textarea>
		</label>

		<!-- Avances -->
		<section class="space-y-3">
			<span class={etiqueta}>Avances y decisiones</span>

			{#if puedeParticipar}
				<div class="space-y-2 rounded-2xl bg-slate-50 p-3">
					<textarea
						bind:value={textoAvance}
						rows="2"
						class={campo}
						placeholder="¿Qué se hizo, qué sigue, qué los frena?"
					></textarea>
					<div class="flex items-center justify-between gap-2">
						<select bind:value={tipoAvance} class="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900" aria-label="Tipo de avance">
							<option value="avance">Avance</option>
							<option value="bloqueo">Bloqueo</option>
							<option value="nota">Nota</option>
						</select>
						<button
							type="button"
							onclick={publicarDesdeFormulario}
							disabled={ocupado || !textoAvance.trim()}
							class="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Publicar
						</button>
					</div>
				</div>
			{/if}

			{#if cargandoAvances}
				<p class="text-xs text-slate-400">Cargando historial...</p>
			{:else}
				<ol class="space-y-3">
					{#each avances as a (a.id)}
						<li class="space-y-1 border-l-2 border-slate-200 pl-3">
							<div class="flex flex-wrap items-center gap-2 text-xs">
								<span class="rounded-full px-2 py-0.5 font-bold {TIPOS_AVANCE[a.tipo].clase}">
									{TIPOS_AVANCE[a.tipo].label}
								</span>
								<span class="font-semibold text-slate-700">{nombreDe(a.autor_email)}</span>
								<span class="text-slate-400">{haceCuanto(a.creado_en)}</span>
							</div>
							<p class="text-sm whitespace-pre-wrap text-slate-700">{a.texto}</p>
						</li>
					{:else}
						<li class="text-xs text-slate-400">Aún no hay avances registrados.</li>
					{/each}
				</ol>
			{/if}
		</section>
	</div>

	<footer class="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-3">
		<div class="min-w-0 flex-1">
			{#if error}
				<p class="text-sm font-medium text-red-600">{error}</p>
			{:else if esMesa}
				<button
					type="button"
					onclick={eliminar}
					disabled={ocupado}
					class="text-xs font-bold text-slate-400 hover:text-red-600"
				>
					Eliminar proyecto
				</button>
			{/if}
		</div>
		{#if esResp}
			<button
				type="button"
				onclick={guardar}
				disabled={ocupado || !hayCambios || !titulo.trim()}
				class="rounded-xl bg-purple-600 px-5 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
			>
				{ocupado ? 'Guardando...' : 'Guardar cambios'}
			</button>
		{/if}
	</footer>
</div>