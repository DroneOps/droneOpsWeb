<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import {
		normalizarProyecto,
		type Categoria,
		type Miembro,
		type Proyecto
	} from './tipos';

	let {
		categorias,
		miembros,
		esMesa,
		siguienteOrden,
		oncreado,
		oncerrar
	}: {
		categorias: Categoria[];
		miembros: Miembro[];
		esMesa: boolean;
		siguienteOrden: number;
		oncreado: (p: Proyecto) => void;
		oncerrar: () => void;
	} = $props();

	let titulo = $state('');
	let comentarios = $state('');
	let categoriaId = $state<number | null>(null);
	let liderEmail = $state('');
	let supervisorEmail = $state('');
	let fecha = $state('');
	let guardando = $state(false);
	let error = $state('');

	const supervisores = $derived(miembros.filter((m) => m.es_superadmin));

	const campo =
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 text-sm focus:border-purple-500 focus:outline-none';

	async function crear() {
		if (!titulo.trim()) {
			error = 'Escribe un título.';
			return;
		}
		guardando = true;
		error = '';

		// Cualquier admin puede proponer una idea (sin líder ni supervisor).
		// Solo la mesa puede dejar el proyecto ya con líder y supervisor.
		const { data, error: e } = await supabase
			.from('tareas')
			.insert([
				{
					titulo: titulo.trim(),
					comentarios: comentarios.trim() || null,
					estado: 'not_started',
					prioridad: 'media',
					categoria_id: categoriaId,
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
			error = e.message;
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
		class="relative w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
	>
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-extrabold text-slate-900">
				{esMesa ? 'Nuevo proyecto' : 'Proponer una idea'}
			</h2>
			<button type="button" onclick={oncerrar} aria-label="Cerrar" class="text-slate-400 hover:text-slate-900">✕</button>
		</div>

		{#if !esMesa}
			<p class="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
				Tu idea queda en “Por iniciar”. La mesa le asigna líder y supervisor para arrancarla.
			</p>
		{/if}

		<label class="block space-y-1">
			<span class="text-xs font-bold tracking-wide text-slate-500 uppercase">Título</span>
			<input type="text" bind:value={titulo} placeholder="Ej. Detectar bebés en estructuras" class={campo} />
		</label>

		<label class="block space-y-1">
			<span class="text-xs font-bold tracking-wide text-slate-500 uppercase">Categoría</span>
			<select bind:value={categoriaId} class={campo}>
				<option value={null}>Sin categoría</option>
				{#each categorias as c (c.id)}
					<option value={c.id}>{c.nombre}</option>
				{/each}
			</select>
		</label>

		{#if esMesa}
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<label class="block space-y-1">
					<span class="text-xs font-bold tracking-wide text-slate-500 uppercase">Líder</span>
					<select bind:value={liderEmail} class={campo}>
						<option value="">Sin líder</option>
						{#each miembros as m (m.email)}
							<option value={m.email}>{m.user}</option>
						{/each}
					</select>
				</label>
				<label class="block space-y-1">
					<span class="text-xs font-bold tracking-wide text-slate-500 uppercase">Supervisor</span>
					<select bind:value={supervisorEmail} class={campo}>
						<option value="">Sin supervisor</option>
						{#each supervisores as m (m.email)}
							<option value={m.email}>{m.user}</option>
						{/each}
					</select>
				</label>
			</div>
		{/if}

		<label class="block space-y-1">
			<span class="text-xs font-bold tracking-wide text-slate-500 uppercase">Fecha límite (opcional)</span>
			<input type="date" bind:value={fecha} class={campo} />
		</label>

		<label class="block space-y-1">
			<span class="text-xs font-bold tracking-wide text-slate-500 uppercase">Descripción (opcional)</span>
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
				{guardando ? 'Creando...' : esMesa ? 'Crear proyecto' : 'Proponer idea'}
			</button>
		</div>
	</div>
</div>