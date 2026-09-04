<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';

	interface Tarea {
		id: number;
		titulo: string;
		comentarios: string | null;
		estado: string;
		asignado_a: string[] | null;
		creado_en: string;
	}

	interface Admin {
		email: string;
		user: string;
	}

	let tareas = $state<Tarea[]>([]);
	let admins = $state<Admin[]>([]);
	let cargando = $state(true);
	let tareaSeleccionada = $state<Tarea | null>(null);

	// Estado reactivo para la edición en el modal de detalle
	let editandoTitulo = $state('');
	let editandoComentarios = $state('');
	let editandoEstado = $state('');
	let editandoAsignados = $state<string[]>([]);
	let guardandoModal = $state(false);

	// Estado reactivo para el modal de nueva tarea
	let mostrandoNuevaTarea = $state(false);
	let nuevaTareaEstado = $state('not_started');
	let nuevaTareaTitulo = $state('');
	let nuevaTareaComentarios = $state('');
	let nuevaTareaAsignados = $state<string[]>([]);
	let guardandoNueva = $state(false);

	// Popovers estilo Notion para los campos Estado y Asignados.
	// Se comparten entre el modal de detalle y el de nueva tarea porque
	// nunca están abiertos los dos modales a la vez.
	let estadoMenuAbierto = $state(false);
	let asignadosMenuAbierto = $state(false);

	const columnas = [
		{ id: 'not_started', label: 'NOT STARTED', key: 'not-started' },
		{ id: 'in_progress', label: 'IN PROGRESS', key: 'in-progress' },
		{ id: 'done', label: 'DONE', key: 'done' }
	];

	function columnaDe(estadoId: string) {
		return columnas.find(c => c.id === estadoId) ?? columnas[0];
	}

	// Acción de Svelte para cerrar un popover al hacer clic fuera de él.
	// Se registra en fase de captura para que el clic que ABRE el menú
	// no lo cierre de inmediato en el mismo evento (el target del clic
	// que abre está DENTRO del nodo, así que node.contains(...) es true
	// y no se dispara el callback).
	function clickOutside(node: HTMLElement, callback: () => void) {
		function handleClick(event: MouseEvent) {
			if (node && !node.contains(event.target as Node)) {
				callback();
			}
		}
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	onMount(() => {
		let canal: ReturnType<typeof supabase.channel> | null = null;

		(async () => {
			const [tareasRes, adminsRes] = await Promise.all([
				supabase.from('tareas').select('*').order('id', { ascending: true }),
				supabase.from('admins').select('email, user').order('user', { ascending: true })
			]);

			if (tareasRes.error) {
				console.error('Error al cargar tareas de Supabase:', tareasRes.error);
			} else {
				tareas = tareasRes.data || [];
			}

			if (adminsRes.error) {
				console.error('Error al cargar admins de Supabase:', adminsRes.error);
			} else {
				admins = adminsRes.data || [];
			}

			cargando = false;

			// Suscripción en tiempo real: si otro admin agrega, mueve o borra
			// una tarea desde su propia sesión, este tablero se actualiza solo.
			canal = supabase
				.channel('tareas-realtime')
				.on(
					'postgres_changes',
					{ event: '*', schema: 'public', table: 'tareas' },
					(payload) => {
						if (payload.eventType === 'INSERT') {
							const nueva = payload.new as Tarea;
							tareas = tareas.some(t => t.id === nueva.id) ? tareas : [...tareas, nueva];
						} else if (payload.eventType === 'UPDATE') {
							const actualizada = payload.new as Tarea;
							tareas = tareas.map(t => (t.id === actualizada.id ? actualizada : t));
							if (tareaSeleccionada?.id === actualizada.id) {
								tareaSeleccionada = actualizada;
							}
						} else if (payload.eventType === 'DELETE') {
							const eliminadaId = (payload.old as Partial<Tarea>).id;
							if (eliminadaId === undefined) return;
							tareas = tareas.filter(t => t.id !== eliminadaId);
							if (tareaSeleccionada?.id === eliminadaId) {
								cerrarDetalle();
							}
						}
					}
				)
				.subscribe();
		})();

		return () => {
			if (canal) supabase.removeChannel(canal);
		};
	});

	function abrirDetalle(tarea: Tarea) {
		tareaSeleccionada = tarea;
		editandoTitulo = tarea.titulo;
		editandoComentarios = tarea.comentarios || '';
		editandoEstado = tarea.estado;
		editandoAsignados = [...(tarea.asignado_a || [])];
		estadoMenuAbierto = false;
		asignadosMenuAbierto = false;
	}

	function cerrarDetalle() {
		tareaSeleccionada = null;
		estadoMenuAbierto = false;
		asignadosMenuAbierto = false;
	}

	function obtenerIniciales(nombre: string): string {
		return nombre
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function abrirModalNueva(estadoId: string) {
		nuevaTareaEstado = estadoId;
		nuevaTareaTitulo = '';
		nuevaTareaComentarios = '';
		nuevaTareaAsignados = [];
		mostrandoNuevaTarea = true;
		estadoMenuAbierto = false;
		asignadosMenuAbierto = false;
	}

	function cerrarModalNueva() {
		mostrandoNuevaTarea = false;
		estadoMenuAbierto = false;
		asignadosMenuAbierto = false;
	}

	async function crearTarea() {
		if (!nuevaTareaTitulo.trim()) return;
		guardandoNueva = true;

		const { data, error } = await supabase
			.from('tareas')
			.insert([{
				titulo: nuevaTareaTitulo.trim(),
				estado: nuevaTareaEstado,
				comentarios: nuevaTareaComentarios.trim() || null,
				asignado_a: nuevaTareaAsignados
			}])
			.select()
			.single();

		if (error) {
			console.error('Error al crear la tarea:', error);
			alert('No se pudo crear la tarea');
		} else if (data) {
			tareas = tareas.some(t => t.id === data.id) ? tareas : [...tareas, data];
			mostrandoNuevaTarea = false;
		}
		guardandoNueva = false;
	}

	async function eliminarTarea(id: number, e: Event) {
		e.stopPropagation();
		if (!confirm('¿Eliminar esta tarea?')) return;

		const { error } = await supabase.from('tareas').delete().eq('id', id);

		if (error) {
			console.error('Error al eliminar tarea:', error);
			alert('No se pudo eliminar la tarea');
		} else {
			tareas = tareas.filter(t => t.id !== id);
			if (tareaSeleccionada?.id === id) {
				cerrarDetalle();
			}
		}
	}

	async function guardarCambiosModal() {
		if (!tareaSeleccionada) return;
		if (!editandoTitulo.trim()) return;
		guardandoModal = true;

		const { error } = await supabase
			.from('tareas')
			.update({
				titulo: editandoTitulo.trim(),
				comentarios: editandoComentarios.trim() || null,
				estado: editandoEstado,
				asignado_a: editandoAsignados
			})
			.eq('id', tareaSeleccionada.id);

		if (error) {
			console.error('Error al guardar cambios:', error);
			alert('No se pudieron actualizar los datos');
		} else {
			tareas = tareas.map(t =>
				t.id === tareaSeleccionada!.id
					? {
							...t,
							titulo: editandoTitulo.trim(),
							comentarios: editandoComentarios.trim() || null,
							estado: editandoEstado,
							asignado_a: editandoAsignados
						}
					: t
			);
			cerrarDetalle();
		}
		guardandoModal = false;
	}

	// Lógica para Drag & Drop NATIVO
	function handleDragStart(e: DragEvent, id: number) {
		if (e.dataTransfer) {
			e.dataTransfer.setData('text/plain', id.toString());
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	async function handleDrop(e: DragEvent, nuevoEstado: string) {
		e.preventDefault();
		const idStr = e.dataTransfer?.getData('text/plain');
		if (!idStr) return;

		const id = parseInt(idStr, 10);
		const tarea = tareas.find(t => t.id === id);
		if (!tarea || tarea.estado === nuevoEstado) return;

		const estadoAnterior = tarea.estado;
		tareas = tareas.map(t => (t.id === id ? { ...t, estado: nuevoEstado } : t));

		const { error } = await supabase
			.from('tareas')
			.update({ estado: nuevoEstado })
			.eq('id', id);

		if (error) {
			console.error('Error al mover tarea:', error);
			tareas = tareas.map(t => (t.id === id ? { ...t, estado: estadoAnterior } : t));
		}
	}
</script>

{#snippet estadoPropiedad(valorActual: string, alCambiar: (nuevo: string) => void)}
	{@const col = columnaDe(valorActual)}
	<div class="prop-row">
		<span class="prop-label">Estado</span>
		<div class="prop-value">
			<div class="popover-wrapper" use:clickOutside={() => (estadoMenuAbierto = false)}>
				<button
					type="button"
					class="status-pill status-pill-{col.key}"
					onclick={() => (estadoMenuAbierto = !estadoMenuAbierto)}
				>
					<span class="dot dot-{col.key}"></span>
					{col.label}
				</button>

				{#if estadoMenuAbierto}
					<div class="popover-menu">
						{#each columnas as opcion}
							<button
								type="button"
								class="popover-item"
								onclick={() => {
									alCambiar(opcion.id);
									estadoMenuAbierto = false;
								}}
							>
								<span class="dot dot-{opcion.key}"></span>
								<span class="popover-item-text">{opcion.label}</span>
								{#if opcion.id === valorActual}
									<span class="popover-check">✓</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

{#snippet asignadosPropiedad(lista: string[], alCambiar: (nueva: string[]) => void)}
	<div class="prop-row">
		<span class="prop-label">Asignados</span>
		<div class="prop-value">
			<div class="popover-wrapper" use:clickOutside={() => (asignadosMenuAbierto = false)}>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="asignados-trigger"
					onclick={() => (asignadosMenuAbierto = !asignadosMenuAbierto)}
				>
					{#each lista as nombre}
						<span class="asignado-chip">
							<span class="asignado-chip-avatar">{obtenerIniciales(nombre)}</span>
							{nombre}
							<button
								type="button"
								class="asignado-chip-remove"
								title="Quitar a {nombre}"
								onclick={(e) => {
									e.stopPropagation();
									alCambiar(lista.filter(n => n !== nombre));
								}}
							>
								✕
							</button>
						</span>
					{/each}

					<button
						type="button"
						class="btn-add-asignado"
						title="Agregar asignado"
						onclick={(e) => {
							e.stopPropagation();
							asignadosMenuAbierto = !asignadosMenuAbierto;
						}}
					>
						+
					</button>
				</div>

				{#if asignadosMenuAbierto}
					<div class="popover-menu">
						{#each admins as admin}
							{@const yaAsignado = lista.includes(admin.user)}
							<button
								type="button"
								class="popover-item"
								class:popover-item-active={yaAsignado}
								onclick={() =>
									alCambiar(
										yaAsignado
											? lista.filter(n => n !== admin.user)
											: [...lista, admin.user]
									)}
							>
								<span class="asignado-chip-avatar">{obtenerIniciales(admin.user)}</span>
								<span class="popover-item-text">{admin.user}</span>
								{#if yaAsignado}
									<span class="popover-check">✓</span>
								{/if}
							</button>
						{/each}
						{#if admins.length === 0}
							<span class="unassigned-text">No hay admins registrados</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<div class="page-container">
	<header class="header">
		<h1 class="header-title">TAREAS</h1>
	</header>

	<main class="main-content">
		{#if cargando}
			<div class="loading-container">
				<div class="spinner"></div>
				<span>Cargando tablero...</span>
			</div>
		{:else}
			<div class="kanban-grid">
				{#each columnas as col}
					{@const tareasColumna = tareas.filter(t => t.estado === col.id)}

					<div
						class="column"
						role="group"
						aria-label="Columna {col.label}"
						ondragover={handleDragOver}
						ondrop={(e) => handleDrop(e, col.id)}
					>
						<div class="column-header">
							<div class="badge badge-{col.key}">
								<span class="dot dot-{col.key}"></span>
								<span class="badge-label">{col.label}</span>
							</div>

							<button
								type="button"
								class="btn-add-task"
								onclick={() => abrirModalNueva(col.id)}
								title="Agregar tarea en {col.label}"
							>
								+
							</button>
						</div>

						<div class="task-list">
							{#each tareasColumna as tarea}
								<div
									role="button"
									tabindex="0"
									draggable="true"
									ondragstart={(e) => handleDragStart(e, tarea.id)}
									onclick={() => abrirDetalle(tarea)}
									onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && abrirDetalle(tarea)}
									class="task-card task-card-{col.key}"
								>
									<div class="card-header-actions">
										<h3 class="task-title">{tarea.titulo}</h3>
										<button
											type="button"
											class="btn-delete"
											onclick={(e) => eliminarTarea(tarea.id, e)}
											title="Eliminar tarea"
										>
											✕
										</button>
									</div>

									<div class="card-footer">
										<div class="avatars">
											{#if tarea.asignado_a && tarea.asignado_a.length > 0}
												{#each tarea.asignado_a as persona}
													<div title={persona} class="avatar">
														{obtenerIniciales(persona)}
													</div>
												{/each}
											{:else}
												<span class="unassigned">Sin asignar</span>
											{/if}
										</div>

										{#if tarea.comentarios}
											<div class="comments-icon">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
												</svg>
											</div>
										{/if}
									</div>
								</div>
							{/each}

							{#if tareasColumna.length === 0}
								<div class="empty-state">
									Arrastra tareas aquí o crea una nueva
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>

	{#if tareaSeleccionada}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="modal-backdrop"
			onclick={cerrarDetalle}
			onkeydown={(e) => e.key === 'Escape' && cerrarDetalle()}
			role="button"
			tabindex="0"
		>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="modal-card"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="document"
			>
				<div class="modal-header">
					<div>
						<span class="modal-id-tag">ID #{tareaSeleccionada.id}</span>
					</div>
					<button onclick={cerrarDetalle} class="btn-close-icon">✕</button>
				</div>

				<div class="modal-body">
					<div>
						<label for="modal-title-input" class="field-label">Título:</label>
						<input
							id="modal-title-input"
							type="text"
							bind:value={editandoTitulo}
							class="modal-input"
						/>
					</div>

					{@render estadoPropiedad(editandoEstado, (v) => (editandoEstado = v))}

					{@render asignadosPropiedad(editandoAsignados, (v) => (editandoAsignados = v))}

					<div>
						<label for="modal-comments-input" class="field-label">Descripción / Comentarios:</label>
						<textarea
							id="modal-comments-input"
							bind:value={editandoComentarios}
							class="comments-box-input"
							rows="4"
							placeholder="Escribe detalles o comentarios..."
						></textarea>
					</div>
				</div>

				<div class="modal-footer">
					<button onclick={cerrarDetalle} class="btn-cancel">Cancelar</button>
					<button onclick={guardarCambiosModal} class="btn-save" disabled={guardandoModal || !editandoTitulo.trim()}>
						{guardandoModal ? 'Guardando...' : 'Guardar Cambios'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if mostrandoNuevaTarea}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="modal-backdrop"
			onclick={cerrarModalNueva}
			onkeydown={(e) => e.key === 'Escape' && cerrarModalNueva()}
			role="button"
			tabindex="0"
		>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="modal-card"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="document"
			>
				<div class="modal-header">
					<div>
						<span class="modal-id-tag">NUEVA TAREA</span>
					</div>
					<button onclick={cerrarModalNueva} class="btn-close-icon">✕</button>
				</div>

				<div class="modal-body">
					<div>
						<label for="nueva-title-input" class="field-label">Título:</label>
						<input
							id="nueva-title-input"
							type="text"
							bind:value={nuevaTareaTitulo}
							class="modal-input"
							placeholder="Ej. Calibrar sensores"
						/>
					</div>

					{@render estadoPropiedad(nuevaTareaEstado, (v) => (nuevaTareaEstado = v))}

					{@render asignadosPropiedad(nuevaTareaAsignados, (v) => (nuevaTareaAsignados = v))}

					<div>
						<label for="nueva-comments-input" class="field-label">Descripción / Comentarios:</label>
						<textarea
							id="nueva-comments-input"
							bind:value={nuevaTareaComentarios}
							class="comments-box-input"
							rows="4"
							placeholder="Escribe detalles o comentarios..."
						></textarea>
					</div>
				</div>

				<div class="modal-footer">
					<button onclick={cerrarModalNueva} class="btn-cancel">Cancelar</button>
					<button onclick={crearTarea} class="btn-save" disabled={guardandoNueva || !nuevaTareaTitulo.trim()}>
						{guardandoNueva ? 'Creando...' : 'Crear Tarea'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@import url('https://fonts.cdnfonts.com/css/sansation');

	.page-container {
		min-height: 100vh;
		background-color: #ffffff;
		color: #000000;
		padding: 2rem 3rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.header, .main-content {
		max-width: 90rem;
		margin-left: auto;
		margin-right: auto;
	}

	.header {
		margin-bottom: 2.5rem;
		border-bottom: 2.5px solid #000000;
		padding-bottom: 0.5rem;
	}

	.header-title {
		font-family: 'Sansation', sans-serif;
		font-size: 3rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		text-transform: uppercase;
		color: #000000;
		margin: 0;
	}

	.kanban-grid {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 1.5rem;
		align-items: start;
	}

	@media (min-width: 768px) {
		.kanban-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.column {
		border-radius: 1.5rem;
		background-color: #12151c;
		padding: 1.25rem;
		min-height: 500px;
		height: fit-content;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
	}

	.column-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
		padding: 0 0.25rem;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.85rem;
		border-radius: 9999px;
		font-size: 0.7rem;
		font-weight: 700;
		font-family: monospace;
		letter-spacing: 0.05em;
	}

	.badge-not-started {
		background-color: #3b1c1d;
		color: #e57373;
	}

	.badge-in-progress {
		background-color: #383519;
		color: #d4e157;
	}

	.badge-done {
		background-color: #173822;
		color: #81c784;
	}

	.dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 9999px;
	}

	.dot-not-started { background-color: #ef5350; }
	.dot-in-progress { background-color: #cddc39; }
	.dot-done { background-color: #4caf50; }

	.btn-add-task {
		background-color: rgba(255, 255, 255, 0.08);
		color: #94a3b8;
		border: none;
		border-radius: 0.5rem;
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-add-task:hover {
		background-color: rgba(255, 255, 255, 0.2);
		color: #ffffff;
	}

	.task-list {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		min-height: 200px;
	}

	.task-card {
		width: 100%;
		text-align: left;
		border-radius: 1.1rem;
		padding: 1.25rem;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		cursor: grab;
		border: 1px solid transparent;
		min-height: 110px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.task-card:active {
		cursor: grabbing;
	}

	.task-card:hover {
		transform: translateY(-0.2rem);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
	}

	.task-card-not-started {
		background-color: #2a1617;
		border-color: #3d1f21;
	}

	.task-card-in-progress {
		background-color: #282613;
		border-color: #3b371b;
	}

	.task-card-done {
		background-color: #13271b;
		border-color: #1b3a27;
	}

	.card-header-actions {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.task-title {
		font-weight: 600;
		font-size: 0.95rem;
		color: #e2e8f0;
		margin: 0;
		line-height: 1.3;
	}

	.btn-delete {
		background: none;
		border: none;
		color: #64748b;
		cursor: pointer;
		font-size: 0.85rem;
		opacity: 0;
		transition: opacity 0.2s, color 0.2s;
	}

	.task-card:hover .btn-delete {
		opacity: 1;
	}

	.btn-delete:hover {
		color: #ef4444;
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 1rem;
		font-size: 0.75rem;
		color: #94a3b8;
	}

	.avatars {
		display: flex;
		gap: 0.25rem;
	}

	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 9999px;
		background-color: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		font-size: 10px;
		font-weight: 700;
		color: #ffffff;
	}

	.unassigned {
		font-size: 11px;
		color: #64748b;
		font-style: italic;
	}

	.empty-state {
		border: 1px dashed rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 2rem;
		text-align: center;
		font-size: 0.75rem;
		color: #475569;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 5rem 0;
		color: #64748b;
	}

	.spinner {
		animation: spin 1s linear infinite;
		border-radius: 9999px;
		height: 2rem;
		width: 2rem;
		border: 2px solid #cbd5e1;
		border-top-color: transparent;
		margin-right: 0.75rem;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal-card {
		background-color: #161b22;
		border: 1px solid #334155;
		width: 100%;
		max-width: 32rem;
		border-radius: 1rem;
		padding: 1.5rem;
		color: #ffffff;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.modal-id-tag {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #94a3b8;
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
	}

	.btn-close-icon {
		color: #94a3b8;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 0.5rem;
		padding: 0.375rem;
		border: none;
		cursor: pointer;
	}

	.modal-body {
		margin: 1.25rem 0;
		border-top: 1px solid #1e293b;
		border-bottom: 1px solid #1e293b;
		padding: 1rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.field-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #94a3b8;
		display: block;
		margin-bottom: 0.25rem;
	}

	.modal-input {
		width: 100%;
		background-color: #0d1117;
		border: 1px solid #334155;
		border-radius: 0.5rem;
		color: #ffffff;
		padding: 0.5rem 0.75rem;
		font-size: 1rem;
		box-sizing: border-box;
	}

	.modal-select {
		width: 100%;
		background-color: #0d1117;
		border: 1px solid #334155;
		border-radius: 0.5rem;
		color: #ffffff;
		padding: 0.5rem 0.75rem;
		font-size: 0.9rem;
		box-sizing: border-box;
	}

	.comments-box-input {
		width: 100%;
		background-color: #0d1117;
		border: 1px solid #334155;
		border-radius: 0.5rem;
		color: #cbd5e1;
		padding: 0.75rem;
		font-size: 0.875rem;
		box-sizing: border-box;
		resize: vertical;
		font-family: inherit;
	}

	.modal-input:focus, .modal-select:focus, .comments-box-input:focus {
		outline: none;
		border-color: #38bdf8;
	}

	.unassigned-text {
		font-size: 0.75rem;
		color: #64748b;
		font-style: italic;
	}

	/* Filas de propiedad estilo Notion (etiqueta a la izquierda, valor
	   interactivo a la derecha), usadas por Estado y Asignados. */
	.prop-row {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		min-height: 2rem;
	}

	.prop-label {
		width: 6rem;
		flex-shrink: 0;
		font-size: 0.8rem;
		color: #64748b;
		padding-top: 0.35rem;
	}

	.prop-value {
		flex: 1;
		min-width: 0;
	}

	.popover-wrapper {
		position: relative;
		display: inline-block;
		width: 100%;
	}

	/* Pill de Estado, coloreado dinámicamente según el estado actual */
	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.7rem;
		font-weight: 700;
		font-family: monospace;
		letter-spacing: 0.05em;
		border: none;
		cursor: pointer;
	}

	.status-pill-not-started {
		background-color: #3b1c1d;
		color: #e57373;
	}

	.status-pill-in-progress {
		background-color: #383519;
		color: #d4e157;
	}

	.status-pill-done {
		background-color: #173822;
		color: #81c784;
	}

	/* Menú flotante compartido por el pill de Estado y el picker de
	   Asignados */
	.popover-menu {
		position: absolute;
		top: calc(100% + 0.35rem);
		left: 0;
		min-width: 12rem;
		max-height: 14rem;
		overflow-y: auto;
		background-color: #0d1117;
		border: 1px solid #334155;
		border-radius: 0.6rem;
		padding: 0.35rem;
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.popover-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-radius: 0.4rem;
		padding: 0.4rem 0.5rem;
		font-size: 0.8rem;
		color: #cbd5e1;
		cursor: pointer;
	}

	.popover-item:hover {
		background-color: rgba(255, 255, 255, 0.06);
	}

	.popover-item-active {
		color: #ffffff;
	}

	.popover-item-text {
		flex: 1;
	}

	.popover-check {
		color: #38bdf8;
		font-size: 0.75rem;
	}

	/* Caja de asignados: chips removibles + botón para abrir el menú */
	.asignados-trigger {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		min-height: 2.1rem;
		width: 100%;
		background-color: #0d1117;
		border: 1px solid #334155;
		border-radius: 0.5rem;
		padding: 0.35rem 0.5rem;
		cursor: pointer;
		box-sizing: border-box;
	}

	.asignado-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background-color: rgba(255, 255, 255, 0.08);
		border: 1px solid #334155;
		border-radius: 9999px;
		padding: 0.2rem 0.5rem 0.2rem 0.25rem;
		font-size: 0.75rem;
		color: #e2e8f0;
	}

	.asignado-chip-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.15rem;
		height: 1.15rem;
		border-radius: 9999px;
		background-color: rgba(255, 255, 255, 0.12);
		font-size: 9px;
		font-weight: 700;
		color: #ffffff;
	}

	.asignado-chip-remove {
		background: none;
		border: none;
		color: #64748b;
		font-size: 0.65rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.asignado-chip-remove:hover {
		color: #ef4444;
	}

	.btn-add-asignado {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.4rem;
		height: 1.4rem;
		border-radius: 9999px;
		background-color: rgba(255, 255, 255, 0.06);
		border: 1px dashed #334155;
		color: #94a3b8;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.btn-add-asignado:hover {
		color: #ffffff;
		border-color: #38bdf8;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.btn-cancel {
		background-color: transparent;
		color: #94a3b8;
		font-weight: 500;
		font-size: 0.75rem;
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		border: 1px solid #334155;
		cursor: pointer;
	}

	.btn-cancel:hover {
		background-color: rgba(255, 255, 255, 0.05);
		color: #ffffff;
	}

	.btn-save {
		background-color: #2563eb;
		color: #ffffff;
		font-weight: 600;
		font-size: 0.75rem;
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
	}

	.btn-save:hover {
		background-color: #1d4ed8;
	}

	.btn-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>