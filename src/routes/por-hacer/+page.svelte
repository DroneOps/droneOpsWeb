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
</script>

<div class="page-container">
    <header class="header">
        <div>
            <h1 class="header-title">Tareas</h1>
            <p class="header-subtitle">Gestión interna de proyectos DroneOps</p>
        </div>
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
                            <span class="badge badge-{col.key}">
                                <span class="dot dot-{col.key}"></span>
                                {col.label}
                            </span>
                            <span class="task-count">{tareasColumna.length}</span>
                        </div>

                        <div class="task-list">
                            {#each tareasColumna as tarea}
                                <button
                                    type="button"
                                    onclick={() => abrirDetalle(tarea)}
                                    class="task-card"
                                >
                                    <h3 class="task-title">{tarea.titulo}</h3>

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
                                </button>
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
                        <span class="modal-id-tag">
                            ID #{tareaSeleccionada.id}
                        </span>
                        <h2 class="modal-title">{tareaSeleccionada.titulo}</h2>
                    </div>
                    <button onclick={cerrarDetalle} class="btn-close-icon">✕</button>
                </div>

                <div class="modal-body">
                    <div>
                        <span class="field-label">Estado:</span>
                        <span class="status-pill">
                            {tareaSeleccionada.estado.replace('_', ' ')}
                        </span>
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
                    <button onclick={cerrarDetalle} class="btn-close">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Configuración Global y Contenedores */
    .page-container {
        min-height: 100vh;
        background-color: #ffffff;
        color: rgb(0, 0, 0);
        padding: 1.5rem;
        font-family: system-ui, -apple-system, sans-serif;
    }

    @media (min-width: 640px) {
        .page-container {
            padding: 2.5rem;
        }
    }

    .header, .main-content {
        max-width: 80rem;
        margin-left: auto;
        margin-right: auto;
    }

    .header {
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #1e293b;
        padding-bottom: 1.25rem;
    }

    .header-title {
        font-size: 1.875rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        font-style: italic;
        text-transform: uppercase;
        color: #ffffff;
    }

    .header-subtitle {
        font-size: 0.75rem;
        color: #94a3b8;
        margin-top: 0.25rem;
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
        border-radius: 1rem;
        border: 1px solid #1e293b;
        background-color: rgba(15, 23, 42, 0.4);
        padding: 1rem;
        backdrop-filter: blur(4px);
        min-height: 500px;
    }

    .column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    .task-count {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
    }

    /* Badges de Estado */
    .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        border-width: 1px;
        border-style: solid;
    }

    .badge-not-started {
        background-color: rgba(239, 68, 68, 0.1);
        color: #f87171;
        border-color: rgba(239, 68, 68, 0.2);
    }

    .badge-in-progress {
        background-color: rgba(251, 191, 36, 0.1);
        color: #fcd34d;
        border-color: rgba(251, 191, 36, 0.2);
    }

    .badge-done {
        background-color: rgba(16, 185, 129, 0.1);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.2);
    }

    .dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 9999px;
    }

    .dot-not-started { background-color: #ef4444; }
    .dot-in-progress { background-color: #fbbf24; }
    .dot-done { background-color: #10b981; }

    /* Tarjetas de Tarea */
    .task-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .task-card {
        width: 100%;
        text-align: left;
        background-color: #161b22;
        border: 1px solid #1e293b;
        border-radius: 0.75rem;
        padding: 1rem;
        transition: all 0.2s ease;
        cursor: pointer;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .task-card:hover {
        background-color: #1c2128;
        border-color: rgba(168, 85, 247, 0.5);
        transform: translateY(-0.25rem);
        box-shadow: 0 10px 15px -3px rgba(88, 28, 135, 0.2);
    }

    .task-card:active {
        transform: scale(0.98);
    }

    .task-title {
        font-weight: 600;
        font-size: 0.875rem;
        color: #e2e8f0;
        transition: color 0.2s;
    }

    .task-card:hover .task-title {
        color: #d8b4fe;
    }

    .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid rgba(30, 41, 59, 0.6);
        font-size: 0.75rem;
        color: #94a3b8;
    }

    .avatars {
        display: flex;
        margin-left: -0.25rem;
    }

    .avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 9999px;
        background-color: rgba(88, 28, 135, 0.6);
        border: 1px solid rgba(168, 85, 247, 0.3);
        font-size: 10px;
        font-weight: 700;
        color: #e9d5ff;
        margin-left: -0.25rem;
    }

    .unassigned {
        font-size: 11px;
        color: #64748b;
        font-style: italic;
    }

    .empty-state {
        border: 1px dashed #1e293b;
        border-radius: 0.75rem;
        padding: 1.5rem;
        text-align: center;
        font-size: 0.75rem;
        color: #475569;
    }

    /* Loading Indicator */
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 5rem;
        padding-bottom: 5rem;
        color: #94a3b8;
    }

    .spinner {
        animation: spin 1s linear infinite;
        border-radius: 9999px;
        height: 2rem;
        width: 2rem;
        border-bottom-width: 2px;
        border-bottom-style: solid;
        border-bottom-color: #a855f7;
        margin-right: 0.75rem;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    /* Modal */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
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
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
        color: #c084fc;
        background-color: rgba(168, 85, 247, 0.1);
        border: 1px solid rgba(168, 85, 247, 0.2);
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
        background-color: rgba(30, 41, 59, 0.5);
        border-radius: 0.5rem;
        padding: 0.375rem;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s, color 0.2s;
    }

    .btn-close-icon:hover {
        color: #ffffff;
        background-color: #1e293b;
    }

    .modal-body {
        margin-top: 1.25rem;
        margin-bottom: 1.25rem;
        border-top: 1px solid #1e293b;
        border-bottom: 1px solid #1e293b;
        padding-top: 1rem;
        padding-bottom: 1rem;
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
        border: 1px solid #334155;
    }

    .assigned-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .assigned-pill {
        font-size: 0.75rem;
        background-color: rgba(58, 12, 92, 0.8);
        color: #d8b4fe;
        border: 1px solid rgba(107, 33, 168, 0.5);
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
        background-color: #9333ea;
        color: #ffffff;
        font-weight: 500;
        font-size: 0.75rem;
        padding: 0.625rem 1.25rem;
        border-radius: 0.75rem;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-close:hover {
        background-color: #7e22ce;
    }
</style>