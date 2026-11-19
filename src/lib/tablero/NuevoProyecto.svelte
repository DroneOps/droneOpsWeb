<script lang="ts">
	import { untrack } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import {
		normalizarProyecto,
		mensajeError,
		type Categoria,
		type Departamento,
		type Membresia,
		type Miembro,
		type Proyecto
	} from './tipos';

	let {
		categorias,
		departamentos,
		membresias,
		miembros,
		esMesa,
		siguienteOrden,
		deptoInicial = null,
		oncreado,
		oncerrar
	}: {
		categorias: Categoria[]; // solo las activas
		departamentos: Departamento[]; // solo los activos
		membresias: Membresia[];
		miembros: Miembro[];
		esMesa: boolean;
		siguienteOrden: number;
		deptoInicial?: number | null;
		oncreado: (p: Proyecto) => void;
		oncerrar: () => void;
	} = $props();

	let titulo = $state('');
	let comentarios = $state('');
	// Valores iniciales del formulario: se toman una sola vez al abrir el modal (a propósito)
	let categoriaId = $state<number | null>(
		untrack(() => categorias.find((c) => c.nombre === 'General')?.id ?? null)
	);
	let deptosElegidos = $state<number[]>(untrack(() => (deptoInicial !== null ? [deptoInicial] : [])));
	let liderEmail = $state('');
	let supervisorEmail = $state('');
	let fecha = $state('');
	let guardando = $state(false);
	let error = $state('');

	const competencias = $derived(categorias.filter((c) => c.tipo === 'competencia'));
	const delGrupo = $derived(categorias.filter((c) => c.tipo === 'grupo'));

	// Quienes ya trabajan en el proyecto por sus departamentos no pueden supervisarlo
	const enDeptos = $derived(
		new Set(membresias.filter((m) => deptosElegidos.includes(m.departamento_id)).map((m) => m.email))
	);
	const supervisores = $derived(
		miembros.filter((m) => m.es_superadmin && m.email !== liderEmail && !enDeptos.has(m.email))
	);
	const lideres = $derived(miembros.filter((m) => m.email !== supervisorEmail));

	// La mesa que define líder y supervisor deja el proyecto listo para iniciar;
	// en cualquier otro caso queda como idea.
	const listoParaIniciar = $derived(esMesa && !!liderEmail && !!supervisorEmail);

	const campo =
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 text-sm focus:border-purple-500 focus:outline-none';
	const etiqueta = 'text-xs font-bold tracking-wide text-slate-500 uppercase';

	function alternarDepto(id: number) {
		deptosElegidos = deptosElegidos.includes(id)
			? deptosElegidos.filter((d) => d !== id)
			: [...deptosElegidos, id];
		// Si el supervisor elegido ya no es válido con estos departamentos, se limpia
		if (supervisorEmail && enDeptos.has(supervisorEmail)) supervisorEmail = '';
	}

	async function crear() {
		if (!titulo.trim()) {
			error = 'Escribe un título.';
			return;
		}
		guardando = true;
		error = '';

		const { data, error: e } = await supabase
			.from('tareas')
			.insert([
				{
					titulo: titulo.trim(),
					comentarios: comentarios.trim() || null,
					estado: listoParaIniciar ? 'not_started' : 'idea',
					prioridad: 'media',
					categoria_id: categoriaId,
					departamentos_ids: deptosElegidos,
					orden: siguienteOrden,
					subtareas: [],
					equipo_emails: [],
					lider_email: esMesa && liderEmail ? liderEmail : null,
					supervisor_email: esMesa && supervisorEmail ? supervisorEmail : null,
					fecha_limite: fecha ? new Date(fecha).toISOString() : null
				}
			])
			.select()
			.single();

		guardando = false;
		if (e) {
			error = mensajeError(e);
			return;
		}
		oncreado(normalizarProyecto(data));
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && oncerrar()} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<button
		type="button"
		aria-label="Cerrar"
		class="absolute inset-0 cursor-default bg-slate-900/40"
		onclick={oncerrar}
	></button>

	<div
		role="dialog"
		aria-modal="true"
		aria-label="Nuevo proyecto"
		class="relative max-h-[92vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
	>
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-extrabold text-slate-900">
				{esMesa ? 'Nuevo proyecto' : 'Proponer una idea'}
			</h2>
			<button type="button" onclick={oncerrar} aria-label="Cerrar" class="text-slate-400 hover:text-slate-900">✕</button>
		</div>

		<p class="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
			{#if esMesa}
				{listoParaIniciar
					? 'Con líder y supervisor, el proyecto queda en “Por iniciar”.'
					: 'Sin líder y supervisor queda como idea hasta que lo aprueben.'}
			{:else}
				Tu idea va al área de Ideas. La mesa la revisa y, si la aprueba, le asigna líder y supervisor.
			{/if}
		</p>

		<label class="block space-y-1">
			<span class={etiqueta}>Título</span>
			<input type="text" bind:value={titulo} placeholder="Ej. Drones asesinos" class={campo} />
		</label>

		<label class="block space-y-1">
			<span class={etiqueta}>CATEGORIA</span>
			<select bind:value={categoriaId} class={campo}>
				<option value={null}>Sin categoría</option>
				{#if competencias.length > 0}
					<optgroup label="Competencias">
						{#each competencias as c (c.id)}
							<option value={c.id}>{c.nombre}</option>
						{/each}
					</optgroup>
				{/if}
				{#if delGrupo.length > 0}
					<optgroup label="Del grupo">
						{#each delGrupo as c (c.id)}
							<option value={c.id}>{c.nombre}</option>
						{/each}
					</optgroup>
				{/if}
			</select>
		</label>

		<div class="space-y-2">
			<span class={etiqueta}>DEPARTAMENTO</span>
			<div class="flex flex-wrap gap-2">
				{#each departamentos as d (d.id)}
					<button
						type="button"
						onclick={() => alternarDepto(d.id)}
						aria-pressed={deptosElegidos.includes(d.id)}
						class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition {deptosElegidos.includes(d.id)
							? 'border-slate-900 bg-slate-900 text-white'
							: 'border-slate-200 text-slate-600 hover:border-slate-400'}"
					>
						<span class="h-2 w-2 rounded-full" style="background-color: {d.color}"></span>
						{d.nombre}
					</button>
				{/each}
			</div>
			<p class="text-xs text-slate-400">
				{deptosElegidos.length === 0
					? 'Ninguno seleccionado: es un proyecto de todo el grupo.'
					: deptosElegidos.length === 1
						? 'Proyecto de un solo departamento.'
						: 'Proyecto que depende de varios departamentos.'}
			</p>
		</div>

		{#if esMesa}
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<label class="block space-y-1">
					<span class={etiqueta}>Líder</span>
					<select bind:value={liderEmail} class={campo}>
						<option value="">Sin líder</option>
						{#each lideres as m (m.email)}
							<option value={m.email}>{m.user}</option>
						{/each}
					</select>
				</label>
				<label class="block space-y-1">
					<span class={etiqueta}>Supervisor</span>
					<select bind:value={supervisorEmail} class={campo}>
						<option value="">Sin supervisor</option>
						{#each supervisores as m (m.email)}
							<option value={m.email}>{m.user}</option>
						{/each}
					</select>
				</label>
			</div>
			<p class="-mt-2 text-xs text-slate-400">
				El supervisor no puede ser el líder ni pertenecer a un departamento del proyecto.
			</p>
		{/if}

		<label class="block space-y-1">
			<span class={etiqueta}>Fecha límite (opcional)</span>
			<input type="date" bind:value={fecha} class={campo} />
		</label>

		<label class="block space-y-1">
			<span class={etiqueta}>Descripción (opcional)</span>
			<textarea bind:value={comentarios} rows="3" class={campo} placeholder="¿Qué se busca lograr?"></textarea>
		</label>

		{#if error}
			<p class="text-sm font-medium text-red-600">{error}</p>
		{/if}

		<div class="flex justify-end gap-2 pt-1">
			<button type="button" onclick={oncerrar} class="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">
				Cancelar
			</button>
			<button
				type="button"
				onclick={crear}
				disabled={guardando || !titulo.trim()}
				class="rounded-xl bg-purple-600 px-5 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{guardando ? 'Creando...' : esMesa && listoParaIniciar ? 'Crear proyecto' : esMesa ? 'Crear idea' : 'Proponer idea'}
			</button>
		</div>
	</div>
</div>