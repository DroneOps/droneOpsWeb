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

	let tareas = $state<Tarea[]>([]);
	let cargando = $state(true);
	let tareaSeleccionada = $state<Tarea | null>(null);

	const columnas = [
		{ id: 'not_started', label: 'NOT STARTED', key: 'not-started' },
		{ id: 'in_progress', label: 'IN PROGRESS', key: 'in-progress' },
		{ id: 'done', label: 'DONE', key: 'done' }
	];

	onMount(async () => {
		const { data, error } = await supabase.from('tareas').select('*').order('id', { ascending: true });

		if (error) {
			console.error('Error al cargar tareas de Supabase:', error);
		} else {
			tareas = data || [];
		}
		cargando = false;
	});

	function abrirDetalle(tarea: Tarea) {
		tareaSeleccionada = tarea;
	}

	function cerrarDetalle() {
		tareaSeleccionada = null;
	}

	function obtenerIniciales(nombre: string): string {
		return nombre
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function crearTareaRapida(estadoId: string) {
		const nuevoTitulo = prompt('Título de la nueva tarea:');
		if (!nuevoTitulo) return;
		
		const nuevaTarea: Tarea = {
			id: Date.now(),
			titulo: nuevoTitulo,
			comentarios: '',
			estado: estadoId,
			asignado_a: [],
			creado_en: new Date().toISOString()
		};
		tareas = [...tareas, nuevaTarea];
	}

	function eliminarTarea(id: number, e: Event) {
		e.stopPropagation();
		if (confirm('¿Eliminar esta tarea?')) {
			tareas = tareas.filter(t => t.id !== id);
		}
	}
</script>

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
					
					<div class="column">
						<div class="column-header">
							<div class="badge badge-{col.key}">
								<span class="dot dot-{col.key}"></span>
								<span class="badge-label">{col.label}</span>
							</div>
							
							<button 
								type="button" 
								class="btn-add-task" 
								onclick={() => crearTareaRapida(col.id)}
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
									No hay tareas aquí
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
						<h2 class="modal-title">{tareaSeleccionada.titulo}</h2>
					</div>
					<button onclick={cerrarDetalle} class="btn-close-icon">✕</button>
				</div>

				<div class="modal-body">
					<div>
						<span class="field-label">Estado:</span>
						<span class="status-pill">{tareaSeleccionada.estado.replace('_', ' ')}</span>
					</div>

					<div>
						<span class="field-label">Asignados:</span>
						<div class="assigned-list">
							{#if tareaSeleccionada.asignado_a && tareaSeleccionada.asignado_a.length > 0}
								{#each tareaSeleccionada.asignado_a as persona}
									<span class="assigned-pill">{persona}</span>
								{/each}
							{:else}
								<span class="unassigned-text">Nadie asignado</span>
							{/if}
						</div>
					</div>

					<div>
						<span class="field-label">Descripción / Comentarios:</span>
						<p class="comments-box">
							{tareaSeleccionada.comentarios || 'Sin descripción o comentarios adjuntos.'}
						</p>
					</div>
				</div>

				<div class="modal-footer">
					<button onclick={cerrarDetalle} class="btn-close">Cerrar</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@import url('https://fonts.cdnfonts.com/css/sansation');

	/* Configuración Global y Fondo Principal */
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

	/* Tablero y Columnas */
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
	}

	.task-card {
		width: 100%;
		text-align: left;
		border-radius: 1.1rem;
		padding: 1.25rem;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		cursor: pointer;
		border: 1px solid transparent;
		min-height: 110px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-sizing: border-box;
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

	.modal-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #ffffff;
		margin-top: 0.5rem;
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
		gap: 0.75rem;
	}

	.field-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #94a3b8;
		display: block;
		margin-bottom: 0.25rem;
	}

	.status-pill {
		text-transform: capitalize;
		font-size: 0.75rem;
		font-weight: 700;
		color: #e2e8f0;
		background-color: #1e293b;
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
	}

	.assigned-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.assigned-pill {
		font-size: 0.75rem;
		background-color: rgba(255, 255, 255, 0.1);
		color: #e2e8f0;
		padding: 0.25rem 0.625rem;
		border-radius: 0.375rem;
	}

	.unassigned-text {
		font-size: 0.75rem;
		color: #64748b;
		font-style: italic;
	}

	.comments-box {
		font-size: 0.875rem;
		color: #cbd5e1;
		background-color: #0d1117;
		padding: 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid #1e293b;
		white-space: pre-wrap;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
	}

	.btn-close {
		background-color: #334155;
		color: #ffffff;
		font-weight: 500;
		font-size: 0.75rem;
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
	}

	.btn-close:hover {
		background-color: #475569;
	}
</style>