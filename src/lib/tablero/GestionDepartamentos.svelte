<script lang="ts">
	import { untrack } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import {
		COLORES,
		mensajeError,
		iniciales,
		miembrosDeDepto,
		type Departamento,
		type Membresia,
		type Miembro
	} from './tipos';

	let {
		departamentos,
		membresias,
		miembros,
		miEmail,
		esMesa,
		inicial = null,
		onrefrescar,
		oncerrar
	}: {
		departamentos: Departamento[];
		membresias: Membresia[];
		miembros: Miembro[]; // sin cuentas de prueba
		miEmail: string;
		esMesa: boolean;
		inicial?: number | null;
		onrefrescar: () => Promise<void>;
		oncerrar: () => void;
	} = $props();

	// Departamento que se muestra al abrir: se decide una sola vez (a propósito)
	let seleccionadoId = $state<number | null>(
		untrack(() => inicial ?? departamentos[0]?.id ?? null)
	);
	let nuevoNombre = $state('');
	let nuevoTipo = $state<'equipo' | 'mesa'>('equipo');
	let nuevoColor = $state(COLORES[0]);
	let ocupado = $state(false);
	let error = $state('');

	const sel = $derived(departamentos.find((d) => d.id === seleccionadoId) ?? null);
	const integrantes = $derived(sel ? miembrosDeDepto(sel.id, membresias) : []);
	// Solo la mesa asigna los departamentos
	const puedeAdministrar = $derived(esMesa);
	const candidatos = $derived(
		miembros.filter((m) => !integrantes.some((i) => i.email === m.email))
	);

	const grupos = $derived([
		{ titulo: 'Departamentos', lista: departamentos.filter((d) => d.tipo === 'equipo') },
		{ titulo: 'Áreas de la mesa', lista: departamentos.filter((d) => d.tipo === 'mesa') }
	]);

	const campo =
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500';
	const etiqueta = 'text-xs font-bold tracking-wide text-slate-500 uppercase';

	function conteo(depId: number): number {
		return membresias.filter((m) => m.departamento_id === depId).length;
	}

	// Ejecuta una operación, muestra el error si lo hay y refresca los datos
	async function ejecutar(operacion: () => PromiseLike<{ error: any }>) {
		ocupado = true;
		error = '';
		const { error: e } = await operacion();
		if (e) error = mensajeError(e);
		else await onrefrescar();
		ocupado = false;
	}

	async function crearDepartamento() {
		const nombre = nuevoNombre.trim();
		if (!nombre) return;
		ocupado = true;
		error = '';
		const orden = Math.max(0, ...departamentos.map((d) => d.orden)) + 10;
		const { data, error: e } = await supabase
			.from('departamentos')
			.insert([{ nombre, tipo: nuevoTipo, color: nuevoColor, orden }])
			.select()
			.single();
		if (e) {
			error = mensajeError(e);
		} else {
			nuevoNombre = '';
			await onrefrescar();
			seleccionadoId = data.id;
		}
		ocupado = false;
	}

	function editarDepartamento(cambios: Record<string, unknown>) {
		if (!sel) return;
		const depId = sel.id;
		ejecutar(() => supabase.from('departamentos').update(cambios).eq('id', depId));
	}

	function agregarMiembro(email: string) {
		if (!sel || !email) return;
		const depId = sel.id;
		ejecutar(() =>
			supabase.from('departamento_miembros').insert([{ departamento_id: depId, email, rol: 'miembro' }])
		);
	}

	async function quitarMiembro(email: string) {
		if (!sel) return;
		const depId = sel.id;
		ocupado = true;
		error = '';
		const { data, error: e } = await supabase
			.from('departamento_miembros')
			.delete()
			.eq('departamento_id', depId)
			.eq('email', email)
			.select('email');
		if (e) error = mensajeError(e);
		else if (!data || data.length === 0) error = 'No tienes permiso para quitar a esta persona.';
		else await onrefrescar();
		ocupado = false;
	}

	// Solo la mesa. Primero se baja al jefe actual (solo puede haber uno) y luego se sube al nuevo.
	async function hacerLider(email: string) {
		if (!sel || !esMesa) return;
		const depId = sel.id;
		ocupado = true;
		error = '';
		const baja = await supabase
			.from('departamento_miembros')
			.update({ rol: 'miembro' })
			.eq('departamento_id', depId)
			.eq('rol', 'lider');
		if (baja.error) {
			error = mensajeError(baja.error);
			ocupado = false;
			return;
		}
		const sube = await supabase
			.from('departamento_miembros')
			.update({ rol: 'lider' })
			.eq('departamento_id', depId)
			.eq('email', email);
		if (sube.error) error = mensajeError(sube.error);
		await onrefrescar();
		ocupado = false;
	}

	function nombreDe(email: string): string {
		return miembros.find((m) => m.email === email)?.user ?? email.split('@')[0];
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
		aria-label="Departamentos y áreas de la mesa"
		class="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
	>
		<header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
			<div>
				<h2 class="text-lg font-extrabold text-slate-900">Departamentos y áreas de la mesa</h2>
				<p class="text-xs text-slate-500">
					Una persona puede estar en varios departamentos. Solo la mesa asigna los departamentos.
				</p>
			</div>
			<button type="button" onclick={oncerrar} aria-label="Cerrar" class="text-slate-400 hover:text-slate-900">✕</button>
		</header>

		<div class="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[240px_1fr]">
			<!-- Lista -->
			<nav class="space-y-4 overflow-y-auto border-b border-slate-200 p-4 md:border-r md:border-b-0">
				{#each grupos as g (g.titulo)}
					{#if g.lista.length > 0}
						<div class="space-y-1">
							<p class={etiqueta}>{g.titulo}</p>
							{#each g.lista as d (d.id)}
								<button
									type="button"
									onclick={() => (seleccionadoId = d.id)}
									class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition {seleccionadoId === d.id
										? 'bg-purple-50 font-bold text-purple-800'
										: 'text-slate-700 hover:bg-slate-50'} {d.activo ? '' : 'opacity-50'}"
								>
									<span class="h-2.5 w-2.5 shrink-0 rounded-full" style="background-color: {d.color}"></span>
									<span class="flex-1 truncate">{d.nombre}</span>
									<span class="font-mono text-xs text-slate-400">{conteo(d.id)}</span>
								</button>
							{/each}
						</div>
					{/if}
				{/each}

				{#if esMesa}
					<div class="space-y-2 border-t border-slate-200 pt-4">
						<p class={etiqueta}>Nuevo departamento</p>
						<input type="text" bind:value={nuevoNombre} placeholder="Nombre" class={campo} aria-label="Nombre del departamento" />
						<select bind:value={nuevoTipo} class={campo} aria-label="Tipo de departamento">
							<option value="equipo">Departamento del grupo</option>
							<option value="mesa">Área de la mesa</option>
						</select>
						<div class="flex flex-wrap gap-1.5">
							{#each COLORES as c (c)}
								<button
									type="button"
									onclick={() => (nuevoColor = c)}
									aria-label="Color {c}"
									aria-pressed={nuevoColor === c}
									class="h-6 w-6 rounded-full ring-offset-2 {nuevoColor === c ? 'ring-2 ring-slate-900' : ''}"
									style="background-color: {c}"
								></button>
							{/each}
						</div>
						<button
							type="button"
							onclick={crearDepartamento}
							disabled={ocupado || !nuevoNombre.trim()}
							class="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-40"
						>
							Crear departamento
						</button>
					</div>
				{/if}
			</nav>

			<!-- Detalle -->
			<section class="space-y-5 overflow-y-auto p-6">
				{#if !sel}
					<p class="text-sm text-slate-500">Elige un departamento de la lista.</p>
				{:else}
					<div class="flex flex-wrap items-center gap-3">
						<span class="h-4 w-4 rounded-full" style="background-color: {sel.color}"></span>
						{#if esMesa}
							<input
								type="text"
								value={sel.nombre}
								aria-label="Nombre del departamento"
								onchange={(e) => {
									const v = e.currentTarget.value.trim();
									if (v && v !== sel.nombre) editarDepartamento({ nombre: v });
								}}
								class="min-w-0 flex-1 border-b-2 border-transparent bg-transparent text-xl font-extrabold text-slate-900 focus:border-purple-500 focus:outline-none"
							/>
						{:else}
							<h3 class="flex-1 text-xl font-extrabold text-slate-900">{sel.nombre}</h3>
						{/if}
					</div>

					{#if esMesa}
						<div class="flex flex-wrap items-center gap-4">
							<div class="flex gap-1.5">
								{#each COLORES as c (c)}
									<button
										type="button"
										onclick={() => editarDepartamento({ color: c })}
										aria-label="Color {c}"
										aria-pressed={sel.color === c}
										class="h-5 w-5 rounded-full ring-offset-2 {sel.color === c ? 'ring-2 ring-slate-900' : ''}"
										style="background-color: {c}"
									></button>
								{/each}
							</div>
							<select
								value={sel.tipo}
								onchange={(e) => editarDepartamento({ tipo: e.currentTarget.value })}
								class="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900"
								aria-label="Tipo"
							>
								<option value="equipo">Departamento del grupo</option>
								<option value="mesa">Área de la mesa</option>
							</select>
							<label class="flex items-center gap-2 text-xs font-semibold text-slate-600">
								<input
									type="checkbox"
									checked={sel.activo}
									onchange={(e) => editarDepartamento({ activo: e.currentTarget.checked })}
									class="h-4 w-4 accent-purple-600"
								/>
								Activo
							</label>
						</div>
					{/if}

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class={etiqueta}>Integrantes · {integrantes.length}</span>
						</div>

						<ul class="space-y-1.5">
							{#each integrantes as m (m.email)}
								<li class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
									<span
										class="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold {m.rol === 'lider'
											? 'border-2 border-purple-600 bg-purple-100 text-purple-800'
											: 'bg-slate-200 text-slate-700'}"
									>
										{iniciales(nombreDe(m.email))}
									</span>
									<span class="flex-1 text-sm font-semibold text-slate-800">{nombreDe(m.email)}</span>
									{#if m.rol === 'lider'}
										<span class="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">Jefe</span>
									{:else if esMesa}
										<button
											type="button"
											onclick={() => hacerLider(m.email)}
											disabled={ocupado}
											class="text-xs font-bold text-purple-700 hover:underline disabled:opacity-40"
										>
											Hacer jefe
										</button>
									{/if}
									{#if puedeAdministrar}
										<button
											type="button"
											onclick={() => quitarMiembro(m.email)}
											disabled={ocupado}
											aria-label={`Quitar a ${nombreDe(m.email)}`}
											title="Quitar"
											class="text-slate-300 hover:text-red-600 disabled:opacity-40"
										>
											✕
										</button>
									{/if}
								</li>
							{:else}
								<li class="text-xs text-slate-400">Este departamento todavía no tiene integrantes.</li>
							{/each}
						</ul>

						{#if puedeAdministrar && candidatos.length > 0}
							<select
								value=""
								onchange={(e) => {
									agregarMiembro(e.currentTarget.value);
									e.currentTarget.value = '';
								}}
								class="{campo} max-w-xs"
								aria-label="Agregar integrante"
								disabled={ocupado}
							>
								<option value="">+ Agregar integrante...</option>
								{#each candidatos as m (m.email)}
									<option value={m.email}>{m.user}</option>
								{/each}
							</select>
						{:else if !puedeAdministrar}
							<p class="text-xs text-slate-400">
								Solo la mesa puede agregar o quitar integrantes.
							</p>
						{/if}
					</div>
				{/if}

				{#if error}
					<p class="text-sm font-medium text-red-600">{error}</p>
				{/if}
			</section>
		</div>
	</div>
</div>