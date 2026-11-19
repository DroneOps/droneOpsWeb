<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import {
		ESTADOS,
		SALUD,
		PRIORIDADES,
		TIPOS_AVANCE,
		normalizarProyecto,
		mensajeError,
		iniciales,
		haceCuanto,
		puedeBorrarAvance,
		departamentosDe,
		type Proyecto,
		type Categoria,
		type Departamento,
		type Membresia,
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
		departamentos,
		membresias,
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
		departamentos: Departamento[];
		membresias: Membresia[];
		miembros: Miembro[]; // sin cuentas de prueba
		miEmail: string;
		esMesa: boolean;
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
	const chico =
		'rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700';
	const etiqueta = 'text-xs font-bold tracking-wide text-slate-500 uppercase';

	// ---- Roles (la base de datos hace cumplir las mismas reglas) ----
	const misDeptos = $derived(departamentosDe(miEmail, membresias));
	const esIdea = $derived(proyecto.estado === 'idea');
	const archivado = $derived(!!proyecto.archivado_en);
	// Responsable: la mesa, el líder, o quien propuso una idea que aún no tiene líder
	const esResp = $derived(
		esMesa ||
			proyecto.lider_email === miEmail ||
			(proyecto.lider_email === null && proyecto.creado_por === miEmail)
	);
	// Supervisor de ESTE proyecto (si aún no tiene, cualquiera de la mesa hace de tal)
	const esSupervisor = $derived(
		esMesa && (proyecto.supervisor_email === null || proyecto.supervisor_email === miEmail)
	);
	const puedeParticipar = $derived(
		esResp ||
			proyecto.equipo_emails.includes(miEmail) ||
			proyecto.departamentos_ids.some((d) => misDeptos.includes(d))
	);

	const estadoInfo = $derived(ESTADOS.find((e) => e.id === proyecto.estado) ?? ESTADOS[0]);
	const deptosProyecto = $derived(departamentos.filter((d) => proyecto.departamentos_ids.includes(d.id)));
	const emailsDeDeptos = $derived(
		new Set(
			membresias.filter((m) => proyecto.departamentos_ids.includes(m.departamento_id)).map((m) => m.email)
		)
	);
	// Quienes pueden tener subtareas: líder, equipo extra y miembros de los departamentos
	const integrantes = $derived(
		[
			...new Set([
				...(proyecto.lider_email ? [proyecto.lider_email] : []),
				...proyecto.equipo_emails,
				...emailsDeDeptos
			])
		].filter((e) => e !== proyecto.supervisor_email)
	);

	// El supervisor tiene que ser de la mesa y no puede ser líder, equipo ni de los departamentos
	const supervisoresPosibles = $derived.by(() => {
		const validos = miembros.filter(
			(m) =>
				m.es_superadmin &&
				m.email !== proyecto.lider_email &&
				!proyecto.equipo_emails.includes(m.email) &&
				!emailsDeDeptos.has(m.email)
		);
		const actual = proyecto.supervisor_email;
		if (actual && !validos.some((m) => m.email === actual)) {
			const m = miembros.find((x) => x.email === actual);
			if (m) validos.unshift(m);
		}
		return validos;
	});
	const lideresDepto = $derived(
		miembros.filter((m) => emailsDeDeptos.has(m.email) && m.email !== proyecto.supervisor_email)
	);
	const lideresOtros = $derived(
		miembros.filter((m) => !emailsDeDeptos.has(m.email) && m.email !== proyecto.supervisor_email)
	);
	const disponibles = $derived(
		miembros.filter(
			(m) =>
				!proyecto.equipo_emails.includes(m.email) &&
				m.email !== proyecto.lider_email &&
				m.email !== proyecto.supervisor_email &&
				!emailsDeDeptos.has(m.email)
		)
	);
	const categoriasElegibles = $derived(
		categorias.filter((c) => c.activa || c.id === proyecto.categoria_id)
	);
	const puedeEditarCategoria = $derived(esMesa || (esIdea && esResp));

	const hayCambios = $derived(
		titulo.trim() !== proyecto.titulo ||
			(comentarios.trim() || null) !== (proyecto.comentarios?.trim() || null) ||
			categoriaId !== proyecto.categoria_id ||
			prioridad !== proyecto.prioridad ||
			fecha !== (proyecto.fecha_limite ? proyecto.fecha_limite.slice(0, 10) : '')
	);

	function nombreDepto(depId: number | null): string {
		return departamentos.find((d) => d.id === depId)?.nombre ?? '';
	}

	function candidatosSub(s: Subtarea): string[] {
		const base =
			s.departamento_id !== null
				? membresias.filter((m) => m.departamento_id === s.departamento_id).map((m) => m.email)
				: integrantes;
		const lista = new Set(base);
		if (s.asignado) lista.add(s.asignado);
		return [...lista];
	}

	function fechaLocal(iso: string): string {
		return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
	}

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
			.eq('tarea_id', id)
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
			comentarios: comentarios.trim() || null,
			prioridad,
			fecha_limite: fecha ? new Date(fecha).toISOString() : null,
			// La categoría solo la cambia la mesa (o quien propuso la idea)
			...(puedeEditarCategoria ? { categoria_id: categoriaId } : {})
		});
		ocupado = false;
	}

	// Departamentos del proyecto (solo la mesa)
	function alternarDepto(depId: number) {
		const ids = proyecto.departamentos_ids.includes(depId)
			? proyecto.departamentos_ids.filter((d) => d !== depId)
			: [...proyecto.departamentos_ids, depId];
		guardarCampo({ departamentos_ids: ids });
	}

	// ---- Subtareas (se guardan al momento) ----
	async function persistirSubtareas(nuevas: Subtarea[]) {
		const previas = subtareas;
		subtareas = nuevas;
		const ok = await guardarCampo({ subtareas: nuevas });
		if (!ok) subtareas = previas;
	}

	function cambiarSub(subId: string, cambios: Partial<Subtarea>) {
		persistirSubtareas(subtareas.map((s) => (s.id === subId ? { ...s, ...cambios } : s)));
	}

	function agregarSub() {
		const texto = nuevaSub.trim();
		if (!texto) return;
		nuevaSub = '';
		persistirSubtareas([
			...subtareas,
			{ id: crypto.randomUUID(), texto, hecho: false, asignado: null, departamento_id: null }
		]);
	}

	function quitarSub(subId: string) {
		persistirSubtareas(subtareas.filter((s) => s.id !== subId));
	}

	function puedeTomar(s: Subtarea): boolean {
		if (s.asignado || !puedeParticipar) return false;
		return esResp || s.departamento_id === null || misDeptos.includes(s.departamento_id);
	}

	// ---- Equipo extra (fuera de los departamentos) ----
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
			.insert([{ tarea_id: id, tipo, texto: texto.trim() }])
			.select()
			.single();
		if (e) {
			error = mensajeError(e);
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

	// La X: borra el avance y vuelve a leer el proyecto para que el contador
	// "sin avances hace N días" quede con el valor que recalculó la base de datos.
	async function borrarAvance(a: Avance) {
		error = '';
		const { data, error: e } = await supabase.from('avances').delete().eq('id', a.id).select('id');
		if (e) {
			error = mensajeError(e);
			return;
		}
		if (!data || data.length === 0) {
			error = 'No se pudo borrar: no tienes permiso o ya pasaron los 15 minutos.';
			return;
		}
		avances = avances.filter((x) => x.id !== a.id);
		const { data: fila } = await supabase.from('tareas').select('*').eq('id', id).single();
		if (fila) oncambio(normalizarProyecto(fila));
	}

	// ---- Flujo de estados ----
	async function cambiarEstado(nuevo: Estado, avance?: { tipo: TipoAvance; texto: string }) {
		ocupado = true;
		const ok = await guardarCampo({ estado: nuevo });
		if (ok && avance) await publicar(avance.tipo, avance.texto);
		if (ok) nota = '';
		ocupado = false;
	}

	async function aprobarIdea() {
		const texto = nota.trim();
		await cambiarEstado('not_started', {
			tipo: 'nota',
			texto: texto ? `Idea aprobada: ${texto}` : 'Idea aprobada. Pasa a "Por iniciar".'
		});
	}

	async function descartarIdea() {
		const motivo = nota.trim();
		if (!motivo) return;
		ocupado = true;
		const ok = await guardarCampo({ archivado_en: new Date().toISOString() });
		if (ok) {
			await publicar('descartado', motivo);
			oncerrar();
		}
		ocupado = false;
	}

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

	async function alternarInteres() {
		error = '';
		const { data, error: e } = await supabase.rpc('alternar_interes', { p_tarea: id });
		if (e) {
			error = mensajeError(e);
			return;
		}
		oncambio({ ...proyecto, intereses: (data ?? []) as string[] });
	}

	async function eliminar() {
		if (!confirm(`¿Eliminar el proyecto "${proyecto.titulo}"? Esta acción no se puede deshacer.`)) return;
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
			{#if archivado}
				<span class="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-white">
					{esIdea ? 'Descartada' : 'Archivado'}
				</span>
			{/if}
		</div>
		<button type="button" onclick={oncerrar} aria-label="Cerrar" class="text-slate-400 hover:text-slate-900">✕</button>
	</header>

	<div class="flex-1 space-y-6 overflow-y-auto px-6 py-5">
		{#if archivado}
			<div class="flex items-center justify-between gap-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
				<span>
					{esIdea ? 'Idea descartada' : 'Archivado'} el {fechaLocal(proyecto.archivado_en as string)}.
					No aparece en el tablero.
				</span>
				{#if esSupervisor || (esMesa && esIdea)}
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
			disabled={!esResp}
			aria-label="Título del proyecto"
			class="w-full border-b-2 border-transparent bg-transparent pb-1 text-2xl font-extrabold text-slate-900 focus:border-purple-500 focus:outline-none disabled:opacity-100"
		/>

		<!-- Categoría / prioridad / fecha -->
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<label class="block space-y-1">
				<span class={etiqueta}>CATEGORIA</span>
				<select bind:value={categoriaId} disabled={!puedeEditarCategoria} class={campo}>
					<option value={null}>Sin categoría</option>
					{#each categoriasElegibles as c (c.id)}
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

		<!-- Departamentos -->
		<section class="space-y-2">
			<span class={etiqueta}>DEPARTAMENTO</span>
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
			{:else if esMesa}
				<p class="text-xs text-slate-400">Toca un departamento para quitarlo o agregarlo.</p>
			{/if}
		</section>

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
							{#if lideresDepto.length > 0}
								<optgroup label="De los departamentos del proyecto">
									{#each lideresDepto as m (m.email)}
										<option value={m.email}>{m.user}</option>
									{/each}
								</optgroup>
							{/if}
							<optgroup label={lideresDepto.length > 0 ? 'Otros miembros' : 'Miembros'}>
								{#each lideresOtros as m (m.email)}
									<option value={m.email}>{m.user}</option>
								{/each}
							</optgroup>
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
							{#each supervisoresPosibles as m (m.email)}
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
			{#if esMesa}
				<p class="text-xs text-slate-400">
					El supervisor valida el proyecto, por eso no puede ser el líder ni pertenecer a sus departamentos.
				</p>
			{/if}

			<div class="space-y-2">
				<span class={etiqueta}>Integrantes extra</span>
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
						<span class="text-xs text-slate-400">
							Además de los departamentos, aquí puedes sumar a personas de otros equipos.
						</span>
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

			{#if esSupervisor && (proyecto.estado === 'in_progress' || proyecto.estado === 'in_review')}
				<div class="space-y-1.5">
					<span class={etiqueta}>Semáforo (lo define el supervisor)</span>
					<div class="flex gap-2">
						{#each Object.entries(SALUD) as [saludId, info] (saludId)}
							<button
								type="button"
								onclick={() => guardarCampo({ salud: saludId as Salud })}
								class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition {proyecto.salud === saludId
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
			<span class={etiqueta}>{esIdea ? 'Idea' : 'Flujo del proyecto'}</span>

			{#if esIdea}
				<div class="flex items-center justify-between gap-3">
					<button
						type="button"
						onclick={alternarInteres}
						class="rounded-xl border px-4 py-2 text-sm font-bold transition {proyecto.intereses.includes(miEmail)
							? 'border-purple-600 bg-purple-50 text-purple-700'
							: 'border-slate-300 text-slate-700 hover:bg-slate-50'}"
					>
						{proyecto.intereses.includes(miEmail) ? '★ Te interesa' : '☆ Me interesa'}
						<span class="ml-1 font-mono text-xs">{proyecto.intereses.length}</span>
					</button>
					{#if proyecto.intereses.length > 0}
						<span class="text-right text-xs text-slate-500">
							{proyecto.intereses.map((e) => nombreDe(e)).join(', ')}
						</span>
					{/if}
				</div>

				{#if esMesa && !archivado}
					<textarea
						bind:value={nota}
						rows="2"
						placeholder="Nota de la mesa (obligatoria para descartar)"
						class={campo}
					></textarea>
					<div class="flex gap-2">
						<button
							type="button"
							disabled={ocupado || !proyecto.lider_email || !proyecto.supervisor_email}
							onclick={aprobarIdea}
							class="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Aprobar idea
						</button>
						<button
							type="button"
							disabled={ocupado || !nota.trim()}
							onclick={descartarIdea}
							class="flex-1 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Descartar
						</button>
					</div>
					{#if !proyecto.lider_email || !proyecto.supervisor_email}
						<p class="text-xs text-slate-500">
							Para aprobarla, asigna arriba un líder y un supervisor (y los departamentos que correspondan).
						</p>
					{/if}
				{:else if !archivado}
					<p class="text-xs text-slate-500">
						La mesa revisa las ideas. Si la aprueban, le asignan líder, supervisor y departamentos y pasa a “Por iniciar”.
					</p>
				{/if}
			{:else if proyecto.estado === 'not_started'}
				{#if esResp}
					<button
						type="button"
						disabled={ocupado || !proyecto.lider_email}
						onclick={() => cambiarEstado('in_progress', { tipo: 'avance', texto: 'Proyecto iniciado.' })}
						class="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Iniciar proyecto
					</button>
				{:else}
					<p class="text-xs text-slate-500">Solo el líder puede iniciar el proyecto.</p>
				{/if}
			{:else if proyecto.estado === 'in_progress'}
				{#if esResp}
					<textarea
						bind:value={nota}
						rows="2"
						placeholder="Nota para el supervisor: qué se logró (opcional)"
						class={campo}
					></textarea>
					<button
						type="button"
						disabled={ocupado || !proyecto.supervisor_email}
						onclick={() =>
							cambiarEstado('in_review', { tipo: 'avance', texto: nota.trim() || 'Enviado a revisión.' })}
						class="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Enviar a revisión
					</button>
					{#if !proyecto.supervisor_email}
						<p class="text-xs text-slate-500">Hace falta un supervisor para poder enviarlo a revisión.</p>
					{/if}
				{:else}
					<p class="text-xs text-slate-500">Solo el líder puede enviar el proyecto a revisión.</p>
				{/if}
			{:else if proyecto.estado === 'in_review'}
				{#if esSupervisor}
					<textarea
						bind:value={nota}
						rows="2"
						placeholder="Decisión del supervisor (obligatoria para devolver)"
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
					<p class="text-xs text-slate-500">
						Esperando la decisión de {proyecto.supervisor_email ? nombreDe(proyecto.supervisor_email) : 'la mesa'}.
						Solo el supervisor del proyecto puede aprobarlo o devolverlo.
					</p>
					{#if proyecto.lider_email === miEmail}
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
				{#if esSupervisor && !archivado}
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
					<p class="text-xs text-slate-500">Proyecto terminado y aprobado por su supervisor.</p>
				{/if}
			{/if}
		</section>

		<!-- Subtareas -->
		{#if !esIdea}
			<section class="space-y-3">
				<div class="flex items-center justify-between">
					<span class={etiqueta}>Subtareas</span>
					<span class="font-mono text-xs text-slate-400">
						{subtareas.filter((s) => s.hecho).length}/{subtareas.length}
					</span>
				</div>

				<ul class="space-y-1.5">
					{#each subtareas as s (s.id)}
						<li class="space-y-1.5 rounded-lg border border-slate-200 px-3 py-2">
							<div class="flex items-center gap-2">
								<input
									type="checkbox"
									checked={s.hecho}
									disabled={!puedeParticipar}
									onchange={() => cambiarSub(s.id, { hecho: !s.hecho })}
									class="h-4 w-4 accent-purple-600"
								/>
								<span class="flex-1 text-sm {s.hecho ? 'text-slate-400 line-through' : 'text-slate-800'}">
									{s.texto}
								</span>
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
							</div>

							{#if esResp && (deptosProyecto.length > 0 || integrantes.length > 0)}
								<div class="flex flex-wrap items-center gap-2 pl-6">
									{#if deptosProyecto.length > 0}
										<select
											class={chico}
											aria-label="Departamento de la subtarea"
											value={s.departamento_id ?? ''}
											onchange={(e) =>
												cambiarSub(s.id, {
													departamento_id: e.currentTarget.value ? Number(e.currentTarget.value) : null,
													asignado: null
												})}
										>
											<option value="">Cualquier departamento</option>
											{#each deptosProyecto as d (d.id)}
												<option value={d.id}>{d.nombre}</option>
											{/each}
										</select>
									{/if}
									<select
										class={chico}
										aria-label="Persona asignada"
										value={s.asignado ?? ''}
										onchange={(e) => cambiarSub(s.id, { asignado: e.currentTarget.value || null })}
									>
										<option value="">Sin asignar</option>
										{#each candidatosSub(s) as correo (correo)}
											<option value={correo}>{nombreDe(correo)}</option>
										{/each}
									</select>
								</div>
							{:else if s.asignado || s.departamento_id !== null}
								<div class="flex flex-wrap items-center gap-2 pl-6">
									{#if s.departamento_id !== null}
										<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
											{nombreDepto(s.departamento_id)}
										</span>
									{/if}
									{#if s.asignado}
										<span class="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
											{nombreDe(s.asignado)}
										</span>
									{/if}
								</div>
							{/if}

							{#if puedeTomar(s)}
								<div class="pl-6">
									<button
										type="button"
										onclick={() => cambiarSub(s.id, { asignado: miEmail })}
										class="text-xs font-bold text-purple-700 hover:underline"
									>
										Tomar esta subtarea
									</button>
								</div>
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
		{/if}

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

			{#if puedeParticipar && !esIdea}
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
								<span class="flex-1"></span>
								{#if puedeBorrarAvance(a, miEmail, esMesa)}
									<button
										type="button"
										onclick={() => borrarAvance(a)}
										aria-label="Borrar este avance"
										title="Borrar"
										class="rounded px-1.5 text-slate-300 hover:bg-red-50 hover:text-red-600"
									>
										✕
									</button>
								{/if}
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