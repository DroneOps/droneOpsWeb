<script lang="ts">
	import { untrack } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { portal } from './portal';
	import {
		normalizarProyecto,
		mensajeError,
		type Competencia,
		type Departamento,
		type Membresia,
		type Miembro,
		type Proyecto
	} from './tipos';

	let {
		competencias,
		departamentos,
		membresias,
		miembros,
		siguienteOrden,
		deptoInicial = null,
		oncreado,
		oncerrar
	}: {
		competencias: Competencia[]; // solo las activas
		departamentos: Departamento[]; // solo los activos
		membresias: Membresia[];
		miembros: Miembro[];
		siguienteOrden: number;
		deptoInicial?: number | null;
		oncreado: (p: Proyecto) => void;
		oncerrar: () => void;
	} = $props();

	let titulo = $state('');
	let deptosElegidos = $state<number[]>(untrack(() => (deptoInicial !== null ? [deptoInicial] : [])));
	let fecha = $state('');
	let competenciaId = $state<number | null>(null);
	let encargadoEmail = $state('');
	let guardando = $state(false);
	let error = $state('');

	// Quienes ya están en los departamentos elegidos van primero al elegir encargado
	const enDeptos = $derived(
		new Set(membresias.filter((m) => deptosElegidos.includes(m.departamento_id)).map((m) => m.email))
	);
	const encargadosDepto = $derived(miembros.filter((m) => enDeptos.has(m.email)));
	const encargadosOtros = $derived(miembros.filter((m) => !enDeptos.has(m.email)));

	const campo =
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 text-sm focus:border-purple-500 focus:outline-none';
	const etiqueta = 'text-xs font-bold tracking-wide text-slate-500 uppercase';

	function alternarDepto(id: number) {
		deptosElegidos = deptosElegidos.includes(id)
			? deptosElegidos.filter((d) => d !== id)
			: [...deptosElegidos, id];
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
					estado: 'in_progress',
					orden: siguienteOrden,
					departamentos_ids: deptosElegidos,
					fecha_limite: fecha ? new Date(fecha).toISOString() : null,
					competencia_id: competenciaId,
					encargado_email: encargadoEmail || null
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

<!-- use:portal: se dibuja en <body>, por encima del Navbar -->
<div use:portal class="fixed inset-0 z-[1500] flex items-center justify-center p-4">
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
			<h2 class="text-lg font-extrabold text-slate-900">Nuevo proyecto</h2>
			<button type="button" onclick={oncerrar} aria-label="Cerrar" class="text-slate-400 hover:text-slate-900">✕</button>
		</div>

		<label class="block space-y-1">
			<span class={etiqueta}>Título</span>
			<input type="text" bind:value={titulo} placeholder="Ej. Drones asesinos" class={campo} />
		</label>

		<div class="space-y-2">
			<span class={etiqueta}>Departamentos</span>
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
					: 'El equipo del proyecto son los integrantes de estos departamentos.'}
			</p>
		</div>

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<label class="block space-y-1">
				<span class={etiqueta}>Fecha de entrega</span>
				<input type="date" bind:value={fecha} class={campo} />
			</label>
			<label class="block space-y-1">
				<span class={etiqueta}>Competencia</span>
				<select bind:value={competenciaId} class={campo}>
					<option value={null}>Ninguna (del grupo)</option>
					{#each competencias as c (c.id)}
						<option value={c.id}>{c.nombre}</option>
					{/each}
				</select>
			</label>
		</div>

		<label class="block space-y-1">
			<span class={etiqueta}>Encargado del proyecto</span>
			<select bind:value={encargadoEmail} class={campo}>
				<option value="">Sin encargado</option>
				{#if encargadosDepto.length > 0}
					<optgroup label="De los departamentos elegidos">
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
		</label>

		<p class="text-xs text-slate-400">Los miembros extra del proyecto se agregan al abrirlo.</p>

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
				{guardando ? 'Creando...' : 'Crear proyecto'}
			</button>
		</div>
	</div>
</div>