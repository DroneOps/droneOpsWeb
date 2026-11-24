<script lang="ts">
	import { untrack } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { portal } from './portal';
	import {
		ESTADOS,
		normalizarProyecto,
		mensajeError,
		iniciales,
		fechaLocal,
		type Proyecto,
		type Competencia,
		type Departamento,
		type Membresia,
		type Miembro,
		type Estado
	} from './tipos';

	let {
		proyecto,
		competencias,
		departamentos,
		membresias,
		miembros,
		esMesa,
		miEmail,
		nombreDe,
		oncambio,
		oneliminado,
		oncerrar
	}: {
		proyecto: Proyecto;
		competencias: Competencia[];
		departamentos: Departamento[];
		membresias: Membresia[];
		miembros: Miembro[]; // sin cuentas de prueba
		esMesa: boolean;
		miEmail: string;
		nombreDe: (email: string) => string;
		oncambio: (p: Proyecto) => void;
		oneliminado: (id: number) => void;
		oncerrar: () => void;
	} = $props();

	// El padre usa {#key id}: el id y los valores iniciales se toman una sola vez.
	// Se usa `id` (y no proyecto.id) porque el proyecto puede desaparecer del tablero
	// a media operación (al archivarlo, por ejemplo).
	const ini = untrack(() => proyecto);
	const id = ini.id;
	let titulo = $state(ini.titulo);
	let fecha = $state(ini.fecha_limite ? ini.fecha_limite.slice(0, 10) : '');
	let competenciaId = $state<number | null>(ini.competencia_id);
	let ocupado = $state(false);
	let error = $state('');

	const campo =
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500';
	const etiqueta = 'text-xs font-bold tracking-wide text-slate-500 uppercase';

	// ---- Quién puede qué (la base de datos hace cumplir las mismas reglas) ----
	const archivado = $derived(!!proyecto.archivado_en);
	const esEncargado = $derived(proyecto.encargado_email === miEmail);
	const puedeEditar = $derived(esMesa || esEncargado); // título y fecha de entrega
	const puedeCompletar = $derived(proyecto.estado === 'in_progress' && (esMesa || esEncargado));

	const estadoInfo = $derived(ESTADOS.find((e) => e.id === proyecto.estado) ?? ESTADOS[0]);
	const deptosProyecto = $derived(departamentos.filter((d) => proyecto.departamentos_ids.includes(d.id)));
	const competenciasElegibles = $derived(
		competencias.filter((c) => c.activa || c.id === proyecto.competencia_id)
	);

	// El equipo que sale de los departamentos asignados
	const equipoDepts = $derived([
		...new Set(
			membresias.filter((m) => proyecto.departamentos_ids.includes(m.departamento_id)).map((m) => m.email)
		)
	]);

	// Para elegir encargado: primero quienes ya están en el proyecto por sus departamentos o como miembros
	const enProyecto = $derived(new Set([...equipoDepts, ...proyecto.equipo_emails]));
	const encargadosDepto = $derived(miembros.filter((m) => enProyecto.has(m.email)));
	const encargadosOtros = $derived(miembros.filter((m) => !enProyecto.has(m.email)));

	// Miembros que se pueden agregar al proyecto
	const disponibles = $derived(
		miembros.filter(
			(m) => !proyecto.equipo_emails.includes(m.email) && m.email !== proyecto.encargado_email
		)
	);

	const hayCambios = $derived(
		titulo.trim() !== proyecto.titulo ||
			fecha !== (proyecto.fecha_limite ? proyecto.fecha_limite.slice(0, 10) : '') ||
			competenciaId !== proyecto.competencia_id
	);

	// ---- Escritura ----
	async function guardarCampo(cambios: Record<string, unknown>): Promise<boolean> {
		error = '';
		const { data, error: e } = await supabase
			.from('tareas')
			.update(cambios)
			.eq('id', id)
			.select()
			.single();
		if (e) {
			error = mensajeError(e);
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
			fecha_limite: fecha ? new Date(fecha).toISOString() : null,
			// La competencia solo la cambia la mesa
			...(esMesa ? { competencia_id: competenciaId } : {})
		});
		ocupado = false;
	}

	// Departamentos, encargado y miembros: solo la mesa, se guardan al momento
	function alternarDepto(depId: number) {
		const ids = proyecto.departamentos_ids.includes(depId)
			? proyecto.departamentos_ids.filter((d) => d !== depId)
			: [...proyecto.departamentos_ids, depId];
		guardarCampo({ departamentos_ids: ids });
	}

	function agregarMiembro(correo: string) {
		if (!correo) return;
		guardarCampo({ equipo_emails: [...proyecto.equipo_emails, correo] });
	}

	function quitarMiembro(correo: string) {
		guardarCampo({ equipo_emails: proyecto.equipo_emails.filter((e) => e !== correo) });
	}

	// ---- Estados ----
	async function cambiarEstado(nuevo: Estado) {
		ocupado = true;
		await guardarCampo({ estado: nuevo });
		ocupado = false;
	}

	// Archivar: se guarda la fecha, no se borra nada
	async function archivar() {
		ocupado = true;
		const ok = await guardarCampo({ archivado_en: new Date().toISOString() });
		ocupado = false;
		if (ok) oncerrar();
	}

	async function restaurar() {
		ocupado = true;
		await guardarCampo({ archivado_en: null });
		ocupado = false;
	}

	async function eliminar() {
		if (!confirm(`¿Eliminar "${proyecto.titulo}"? Esta acción no se puede deshacer.`)) return;
		ocupado = true;
		const { error: e } = await supabase.from('tareas').delete().eq('id', id);
		ocupado = false;
		if (e) {
			error = mensajeError(e);
			return;
		}
		oneliminado(id);
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && oncerrar()} />

<!-- use:portal: se dibuja en <body>, por encima del Navbar (que tapaba la parte de arriba) -->
<div use:portal>
	<button
		type="button"
		aria-label="Cerrar panel"
		class="fixed inset-0 z-[1500] cursor-default bg-slate-900/40"
		onclick={oncerrar}
	></button>

	<div
		role="dialog"
		aria-modal="true"
		aria-label="Detalle del proyecto"
		class="fixed top-0 right-0 z-[1501] flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
	>
		<header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
			<div class="flex items-center gap-3">
				<span class="rounded-full px-2.5 py-0.5 text-xs font-bold {estadoInfo.clase}">{estadoInfo.label}</span>
				{#if archivado}
					<span class="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-white">Archivado</span>
				{/if}
			</div>
			<button type="button" onclick={oncerrar} aria-label="Cerrar" class="text-slate-400 hover:text-slate-900">✕</button>
		</header>

		<div class="flex-1 space-y-6 overflow-y-auto px-6 py-5">
			{#if archivado}
				<div class="flex items-center justify-between gap-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
					<span>Archivado el {fechaLocal(proyecto.archivado_en as string)}. No aparece en el tablero.</span>
					{#if esMesa}
						<button
							type="button"
							onclick={restaurar}
							disabled={ocupado}
							class="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50"
						>
							Restaurar
						</button>
					{/if}
				</div>
			{/if}

			<!-- Título -->
			<input
				type="text"
				bind:value={titulo}
				disabled={!puedeEditar}
				aria-label="Título del proyecto"
				class="w-full border-b-2 border-transparent bg-transparent pb-1 text-2xl font-extrabold text-slate-900 focus:border-purple-500 focus:outline-none disabled:opacity-100"
			/>

			<!-- 1. Departamentos (su equipo son los integrantes) -->
			<section class="space-y-2">
				<span class={etiqueta}>Departamentos</span>
				<div class="flex flex-wrap gap-2">
					{#if esMesa}
						{#each departamentos.filter((d) => d.activo || proyecto.departamentos_ids.includes(d.id)) as d (d.id)}
							<button
								type="button"
								onclick={() => alternarDepto(d.id)}
								aria-pressed={proyecto.departamentos_ids.includes(d.id)}
								class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition {proyecto.departamentos_ids.includes(d.id)
									? 'border-slate-900 bg-slate-900 text-white'
									: 'border-slate-200 text-slate-600 hover:border-slate-400'}"
							>
								<span class="h-2 w-2 rounded-full" style="background-color: {d.color}"></span>
								{d.nombre}
							</button>
						{/each}
					{:else}
						{#each deptosProyecto as d (d.id)}
							<span class="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
								<span class="h-2 w-2 rounded-full" style="background-color: {d.color}"></span>
								{d.nombre}
							</span>
						{/each}
					{/if}
				</div>

				{#if proyecto.departamentos_ids.length === 0}
					<p class="text-xs text-slate-400">Proyecto de todo el grupo.</p>
				{:else}
					<div class="flex flex-wrap items-center gap-2 pt-1">
						<span class="text-xs text-slate-500">Equipo de los departamentos ({equipoDepts.length}):</span>
						<div class="flex flex-wrap gap-1">
							{#each equipoDepts.slice(0, 12) as correo (correo)}
								<span
									title={nombreDe(correo)}
									class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700"
								>
									{iniciales(nombreDe(correo))}
								</span>
							{/each}
							{#if equipoDepts.length > 12}
								<span class="flex h-6 items-center text-xs font-semibold text-slate-500">+{equipoDepts.length - 12}</span>
							{/if}
							{#if equipoDepts.length === 0}
								<span class="text-xs text-slate-400">Todavía sin integrantes.</span>
							{/if}
						</div>
					</div>
				{/if}
				{#if esMesa}
					<p class="text-xs text-slate-400">Toca un departamento para agregarlo o quitarlo. Solo la mesa los asigna.</p>
				{/if}
			</section>

			<!-- 2. Fecha de entrega y 3. Competencia -->
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<label class="block space-y-1">
					<span class={etiqueta}>Fecha de entrega</span>
					<input type="date" bind:value={fecha} disabled={!puedeEditar} class={campo} />
				</label>
				<label class="block space-y-1">
					<span class={etiqueta}>Competencia</span>
					<select bind:value={competenciaId} disabled={!esMesa} class={campo}>
						<option value={null}>Ninguna (del grupo)</option>
						{#each competenciasElegibles as c (c.id)}
							<option value={c.id}>{c.nombre}</option>
						{/each}
					</select>
				</label>
			</div>

			<!-- 4. Encargado -->
			<div class="space-y-1">
				<span class={etiqueta}>Encargado del proyecto</span>
				{#if esMesa}
					<select
						class={campo}
						value={proyecto.encargado_email ?? ''}
						onchange={(e) => guardarCampo({ encargado_email: e.currentTarget.value || null })}
					>
						<option value="">Sin encargado</option>
						{#if encargadosDepto.length > 0}
							<optgroup label="Del proyecto">
								{#each encargadosDepto as m (m.email)}
									<option value={m.email}>{m.user}</option>
								{/each}
							</optgroup>
						{/if}
						<optgroup label={encargadosDepto.length > 0 ? 'Otros miembros' : 'Miembros'}>
							{#each encargadosOtros as m (m.email)}
								<option value={m.email}>{m.user}</option>
							{/each}
						</optgroup>
					</select>
				{:else}
					<p class="py-2 text-sm font-semibold text-slate-800">
						{proyecto.encargado_email ? nombreDe(proyecto.encargado_email) : 'Sin asignar'}
					</p>
				{/if}
			</div>

			<!-- 5. Miembros del proyecto: lo verán en "Mis proyectos" -->
			<section class="space-y-2">
				<span class={etiqueta}>Miembros del proyecto</span>
				<div class="flex flex-wrap items-center gap-2">
					{#each proyecto.equipo_emails as correo (correo)}
						<span class="flex items-center gap-1.5 rounded-full bg-slate-50 py-1 pr-2 pl-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
							<span class="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold">
								{iniciales(nombreDe(correo))}
							</span>
							{nombreDe(correo)}
							{#if esMesa}
								<button
									type="button"
									onclick={() => quitarMiembro(correo)}
									aria-label="Quitar a {nombreDe(correo)}"
									class="text-slate-400 hover:text-red-600"
								>
									✕
								</button>
							{/if}
						</span>
					{:else}
						<span class="text-xs text-slate-400">Ninguno agregado.</span>
					{/each}

					{#if esMesa && disponibles.length > 0}
						<select
							class="rounded-full border border-dashed border-slate-300 bg-transparent px-2 py-1 text-xs text-slate-600"
							value=""
							aria-label="Agregar miembro"
							onchange={(e) => {
								agregarMiembro(e.currentTarget.value);
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
				<p class="text-xs text-slate-400">
					Además del equipo de los departamentos, estas personas ven el proyecto en “Mis proyectos”.
				</p>
			</section>

			<!-- Entregable: va a Discord -->
			<div class="flex gap-3 rounded-2xl border-2 border-purple-300 bg-purple-50 p-4">
				<svg
					viewBox="0 0 24 24"
					class="mt-0.5 h-6 w-6 shrink-0 text-purple-700"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" x2="12" y1="3" y2="15" />
				</svg>
				<div>
					<p class="text-sm font-extrabold text-purple-900">El entregable se sube a Discord</p>
					<p class="mt-0.5 text-xs text-purple-800">Súbelo ahí antes de marcar el proyecto como completado.</p>
				</div>
			</div>

			<!-- Acciones -->
			{#if !archivado}
				{#if proyecto.estado === 'in_progress'}
					{#if puedeCompletar}
						<button
							type="button"
							disabled={ocupado}
							onclick={() => cambiarEstado('done')}
							class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
						>
							Marcar como completado
						</button>
					{/if}
				{:else if proyecto.estado === 'done' && esMesa}
					<div class="flex gap-2">
						<button
							type="button"
							disabled={ocupado}
							onclick={() => cambiarEstado('in_progress')}
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
				{/if}
			{/if}
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
						Eliminar
					</button>
				{/if}
			</div>
			{#if puedeEditar}
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
</div>