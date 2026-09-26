<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient';

    let { data } = $props();

    interface Subtarea {
        id: string;
        texto: string;
        hecho: boolean;
    }

    interface Tarea {
        id: number;
        titulo: string;
        comentarios: string | null;
        estado: string;
        categoria: string;
        asignado_a: string[] | null;
        creado_en: string;
        prioridad: 'baja' | 'media' | 'alta' | 'urgente';
        fecha_limite: string | null;
        orden: number;
        subtareas: Subtarea[];
    }

    interface Admin {
        email: string;
        user: string;
        ve_todo: boolean;
        area: string;
    }

    let tareas = $state<Tarea[]>([]);
    let admins = $state<Admin[]>([]);
    let cargando = $state(true);
    let tareaSeleccionada = $state<Tarea | null>(null);

    let adminActual = $state<Admin | null>(null);
    let guardandoVeTodo = $state(false);

    let filtroTexto = $state('');
    let filtroMiembro = $state('todos');
    let filtroCategoria = $state('todas');
    let filtroPrioridad = $state('todas');

    $effect(() => {
        const emailUsuario = data.user?.email;
        if (emailUsuario && admins.length > 0) {
            adminActual = admins.find(a => a.email === emailUsuario) || null;
        }
    });

    // Modal detalle
    let editandoTitulo = $state('');
    let editandoComentarios = $state('');
    let editandoEstado = $state('');
    let editandoAsignados = $state<string[]>([]);
    let editandoCategoria = $state('General');
    let editandoPrioridad = $state<'baja' | 'media' | 'alta' | 'urgente'>('media');
    let editandoFechaLimite = $state('');
    let editandoSubtareas = $state<Subtarea[]>([]);
    let nuevaSubtareaTexto = $state('');
    let guardandoModal = $state(false);

    // Modal nueva tarea
    let mostrandoNuevaTarea = $state(false);
    let nuevaTareaEstado = $state('not_started');
    let nuevaTareaTitulo = $state('');
    let nuevaTareaComentarios = $state('');
    let nuevaTareaAsignados = $state<string[]>([]);
    let nuevaTareaCategoria = $state('General');
    let nuevaTareaPrioridad = $state<'baja' | 'media' | 'alta' | 'urgente'>('media');
    let nuevaTareaFechaLimite = $state('');
    let nuevaTareaSubtareas = $state<Subtarea[]>([]);
    let nuevaTareaSubtareaInput = $state('');
    let guardandoNueva = $state(false);

    let estadoMenuAbierto = $state(false);
    let asignadosMenuAbierto = $state(false);
    let categoriaMenuAbierto = $state(false);
    let prioridadMenuAbierto = $state(false);

    const columnas = [
        { id: 'not_started', label: 'NOT STARTED', key: 'not-started' },
        { id: 'in_progress', label: 'IN PROGRESS', key: 'in-progress' },
        { id: 'done', label: 'DONE', key: 'done' }
    ];

    const categorias = [
        { id: 'General', label: 'GENERAL', key: 'general' },
        { id: 'Finanzas', label: 'FINANZAS', key: 'finanzas' },
        { id: 'Imagen', label: 'IMAGEN', key: 'imagen' },
        { id: 'Responsabilidad social', label: 'RESP. SOCIAL', key: 'social' },
        { id: 'Logistica', label: 'LOGÍSTICA', key: 'logistica' }
    ];

    const prioridades = [
        { id: 'baja', label: 'BAJA', color: '#81c784' },
        { id: 'media', label: 'MEDIA', color: '#64b5f6' },
        { id: 'alta', label: 'ALTA', color: '#ffb74d' },
        { id: 'urgente', label: 'URGENTE', color: '#e57373' }
    ];

    function columnaDe(estadoId: string) {
        return columnas.find(c => c.id === estadoId) ?? columnas[0];
    }

    function categoriaDe(categoriaId: string) {
        return categorias.find(c => c.id === categoriaId) ?? categorias[0];
    }

    function prioridadDe(prioId: string) {
        return prioridades.find(p => p.id === prioId) ?? prioridades[1];
    }

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

    function evaluarFechaLimite(fechaIso: string | null) {
        if (!fechaIso) return null;
        const fecha = new Date(fechaIso);
        const hoy = new Date();
        const diffHoras = (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60);

        if (diffHoras < 0) return { label: 'VENCIDA', clase: 'date-tag-vencida' };
        if (diffHoras <= 48) return { label: 'PRÓXIMA', clase: 'date-tag-proxima' };
        return { label: fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }), clase: 'date-tag-normal' };
    }

    // LÓGICA DE CAMBIO EN DROPDOWN DE CATEGORÍA
    function cambiarFiltroCategoria(nuevaCat: string) {
        filtroCategoria = nuevaCat;
        // Si el usuario selecciona un área específica diferente a la suya (y diferente de 'todas'), forzamos activar el ojito
        if (nuevaCat !== 'todas' && adminActual && !adminActual.ve_todo) {
            if (nuevaCat !== adminActual.area && nuevaCat !== 'General') {
                toggleVeTodo();
            }
        }
    }

	// Helper para garantizar que subtareas siempre sea un Array limpio
	function parsearSubtareas(raw: any): Subtarea[] {
		if (!raw) return [];
		let data = raw;
		
		// Si viene como string JSON, lo parseamos (incluso si viene doblemente escapado)
		while (typeof data === 'string') {
			try {
				data = JSON.parse(data);
			} catch {
				return [];
			}
		}
		
		if (!Array.isArray(data)) return [];

		// Mapeamos para asegurar que cada elemento cumpla con la estructura Subtarea
		return data.map((item: any) => ({
			id: String(item.id || crypto.randomUUID()),
			texto: String(item.texto || item.titulo || ''),
			hecho: Boolean(item.hecho || item.completado || false)
		}));
	}

	// Normalizar cualquier tarea que venga de la base de datos
	function normalizarTarea(t: any): Tarea {
		return {
			...t,
			subtareas: parsearSubtareas(t.subtareas)
		};
	}

    // Tareas filtradas computadas
    let tareasFiltradas = $derived(
        tareas.filter(t => {
            // 1. Filtro por Búsqueda (Solo Título)
            if (filtroTexto.trim()) {
                const query = filtroTexto.toLowerCase();
                const matchTitulo = t.titulo.toLowerCase().includes(query);
                if (!matchTitulo) return false;
            }

            // 2. Filtro por Miembro Asignado
            if (filtroMiembro !== 'todos' && (!t.asignado_a || !t.asignado_a.includes(filtroMiembro))) {
                return false;
            }

            // 3. Lógica de Áreas y Ojito (Mi Área + General)
            const viendoSoloMiArea = adminActual && !adminActual.ve_todo;
            
            if (filtroCategoria === 'todas') {
                if (viendoSoloMiArea) {
                    // Muestra el área del admin O las tareas marcadas como "General"
                    const esMiArea = adminActual ? t.categoria === adminActual.area : false;
                    const esGeneral = t.categoria === 'General';
                    if (!esMiArea && !esGeneral) return false;
                }
            } else {
                // Si seleccionó una categoría específica en el dropdown
                if (t.categoria !== filtroCategoria) return false;
            }

            // 4. Filtro por Prioridad
            if (filtroPrioridad !== 'todas' && (t.prioridad || 'media') !== filtroPrioridad) {
                return false;
            }

            return true;
        })
    );

    async function toggleVeTodo() {
        if (!adminActual) return;
        guardandoVeTodo = true;

        const nuevoValor = !adminActual.ve_todo;
        const { error } = await supabase
            .from('admins')
            .update({ ve_todo: nuevoValor })
            .eq('email', adminActual.email);

        if (error) {
            console.error('Error al cambiar modo de vista:', error);
            alert('No se pudo cambiar la vista');
        } else {
            adminActual.ve_todo = nuevoValor;
            const { data: nuevasTareas, error: errorTareas } = await supabase
                .from('tareas')
                .select('*')
                .order('orden', { ascending: true });

            if (!errorTareas && nuevasTareas) {
                tareas = nuevasTareas;
            }
        }
        guardandoVeTodo = false;
    }

	onMount(() => {
		let canal: ReturnType<typeof supabase.channel> | null = null;

		(async () => {
			const [tareasRes, adminsRes] = await Promise.all([
				supabase.from('tareas').select('*').order('orden', { ascending: true }),
				supabase.from('admins').select('email, user, area, ve_todo').order('user', { ascending: true })
			]);

			if (tareasRes.error) {
				console.error('Error al cargar tareas de Supabase:', tareasRes.error);
			} else {
				// Normalizar subtareas al cargar
				tareas = (tareasRes.data || []).map(normalizarTarea);
			}

			if (adminsRes.error) {
				console.error('Error al cargar admins de Supabase:', adminsRes.error);
			} else {
				admins = adminsRes.data || [];
			}

			cargando = false;

			canal = supabase
				.channel('tareas-realtime')
				.on(
					'postgres_changes',
					{ event: '*', schema: 'public', table: 'tareas' },
					(payload) => {
						if (payload.eventType === 'INSERT') {
							const nueva = normalizarTarea(payload.new);
							tareas = tareas.some(t => t.id === nueva.id) ? tareas : [...tareas, nueva];
						} else if (payload.eventType === 'UPDATE') {
							const actualizada = normalizarTarea(payload.new);
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
		// Normalizamos la tarea completa por si acaso venía raw de Supabase
		const t = normalizarTarea(tarea);

		tareaSeleccionada = t;
		editandoTitulo = t.titulo;
		editandoComentarios = t.comentarios || '';
		editandoEstado = t.estado;
		editandoCategoria = t.categoria || 'General';
		editandoPrioridad = t.prioridad || 'media';
		editandoFechaLimite = t.fecha_limite ? t.fecha_limite.split('T')[0] : '';
		editandoAsignados = [...(t.asignado_a || [])];
		
		// Asignación directa garantizando un nuevo Array limpio para la reactividad de Svelte 5
		editandoSubtareas = parsearSubtareas(t.subtareas);
		
		nuevaSubtareaTexto = '';
		estadoMenuAbierto = false;
		categoriaMenuAbierto = false;
		asignadosMenuAbierto = false;
		prioridadMenuAbierto = false;
	}

    function cerrarDetalle() {
        tareaSeleccionada = null;
        estadoMenuAbierto = false;
        categoriaMenuAbierto = false;
        asignadosMenuAbierto = false;
        prioridadMenuAbierto = false;
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
        nuevaTareaCategoria = 'General';
        nuevaTareaTitulo = '';
        nuevaTareaComentarios = '';
        nuevaTareaPrioridad = 'media';
        nuevaTareaFechaLimite = '';
        nuevaTareaAsignados = [];
        nuevaTareaSubtareas = [];
        nuevaTareaSubtareaInput = '';
        mostrandoNuevaTarea = true;
        estadoMenuAbierto = false;
        categoriaMenuAbierto = false;
        asignadosMenuAbierto = false;
        prioridadMenuAbierto = false;
    }

    function cerrarModalNueva() {
        mostrandoNuevaTarea = false;
        estadoMenuAbierto = false;
        categoriaMenuAbierto = false;
        asignadosMenuAbierto = false;
        prioridadMenuAbierto = false;
    }

    function agregarSubtarea(esEdicion: boolean) {
        if (esEdicion) {
            if (!nuevaSubtareaTexto.trim()) return;
            editandoSubtareas = [...editandoSubtareas, { id: crypto.randomUUID(), texto: nuevaSubtareaTexto.trim(), hecho: false }];
            nuevaSubtareaTexto = '';
        } else {
            if (!nuevaTareaSubtareaInput.trim()) return;
            nuevaTareaSubtareas = [...nuevaTareaSubtareas, { id: crypto.randomUUID(), texto: nuevaTareaSubtareaInput.trim(), hecho: false }];
            nuevaTareaSubtareaInput = '';
        }
    }

    function eliminarSubtarea(id: string, esEdicion: boolean) {
        if (esEdicion) {
            editandoSubtareas = editandoSubtareas.filter(s => s.id !== id);
        } else {
            nuevaTareaSubtareas = nuevaTareaSubtareas.filter(s => s.id !== id);
        }
    }

    function toggleSubtareaCheck(id: string, esEdicion: boolean) {
        if (esEdicion) {
            editandoSubtareas = editandoSubtareas.map(s => s.id === id ? { ...s, hecho: !s.hecho } : s);
        } else {
            nuevaTareaSubtareas = nuevaTareaSubtareas.map(s => s.id === id ? { ...s, hecho: !s.hecho } : s);
        }
    }

    async function crearTarea() {
		if (!nuevaTareaTitulo.trim()) return;
		guardandoNueva = true;

		const maxOrden = tareas.length > 0 ? Math.max(...tareas.map(t => t.orden || 0)) : 0;

		const { data: creada, error } = await supabase
			.from('tareas')
			.insert([{
				titulo: nuevaTareaTitulo.trim(),
				estado: nuevaTareaEstado,
				categoria: nuevaTareaCategoria,  
				comentarios: nuevaTareaComentarios.trim() || null,
				asignado_a: nuevaTareaAsignados,
				prioridad: nuevaTareaPrioridad,
				fecha_limite: nuevaTareaFechaLimite ? new Date(nuevaTareaFechaLimite).toISOString() : null,
				orden: maxOrden + 1000,
				subtareas: nuevaTareaSubtareas
			}])
			.select()
			.single();

		if (error) {
			console.error('Error al crear la tarea:', error);
			alert('No se pudo crear la tarea');
		} else if (creada) {
			const tareaNorm = normalizarTarea(creada);
			tareas = [...tareas, tareaNorm];
			
			// RESETEAR FORMULARIO DE NUEVA TAREA
			nuevaTareaTitulo = '';
			nuevaTareaComentarios = '';
			nuevaTareaAsignados = [];
			nuevaTareaFechaLimite = '';
			nuevaTareaSubtareas = [];
			nuevaTareaSubtareaInput = '';

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
		if (!tareaSeleccionada || !editandoTitulo.trim()) return;
		guardandoModal = true;

		const { error } = await supabase
			.from('tareas')
			.update({
				titulo: editandoTitulo.trim(),
				comentarios: editandoComentarios.trim() || null,
				estado: editandoEstado,
				categoria: editandoCategoria,  
				asignado_a: editandoAsignados,
				prioridad: editandoPrioridad,
				fecha_limite: editandoFechaLimite ? new Date(editandoFechaLimite).toISOString() : null,
				subtareas: editandoSubtareas
			})
			.eq('id', tareaSeleccionada.id);

		if (error) {
			console.error('Error al guardar cambios:', error);
			alert('No se pudieron actualizar los datos');
		} else {
			const subtareasLimpias = parsearSubtareas(editandoSubtareas);

			tareas = tareas.map(t =>
				t.id === tareaSeleccionada!.id
					? {
						...t,
						titulo: editandoTitulo.trim(),
						comentarios: editandoComentarios.trim() || null,
						estado: editandoEstado,
						categoria: editandoCategoria,
						asignado_a: editandoAsignados,
						prioridad: editandoPrioridad,
						fecha_limite: editandoFechaLimite ? new Date(editandoFechaLimite).toISOString() : null,
						subtareas: subtareasLimpias
					}
					: t
			);
			cerrarDetalle();
		}
		guardandoModal = false;
	}

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

{#snippet categoriaPropiedad(valorActual: string, alCambiar: (nuevo: string) => void)}
    {@const cat = categoriaDe(valorActual)}
    <div class="prop-row">
        <span class="prop-label">Categoría</span>
        <div class="prop-value">
            <div class="popover-wrapper" use:clickOutside={() => (categoriaMenuAbierto = false)}>
                <button
                    type="button"
                    class="status-pill cat-pill-{cat.key}"
                    onclick={() => (categoriaMenuAbierto = !categoriaMenuAbierto)}
                >
                    <span class="dot cat-dot-{cat.key}"></span>
                    {cat.label}
                </button>

                {#if categoriaMenuAbierto}
                    <div class="popover-menu">
                        {#each categorias as opcion}
                            <button
                                type="button"
                                class="popover-item"
                                onclick={() => {
                                    alCambiar(opcion.id);
                                    categoriaMenuAbierto = false;
                                }}
                            >
                                <span class="dot cat-dot-{opcion.key}"></span>
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

{#snippet prioridadPropiedad(valorActual: string, alCambiar: (nuevo: any) => void)}
    {@const prio = prioridadDe(valorActual)}
    <div class="prop-row">
        <span class="prop-label">Prioridad</span>
        <div class="prop-value">
            <div class="popover-wrapper" use:clickOutside={() => (prioridadMenuAbierto = false)}>
                <button
                    type="button"
                    class="status-pill prio-pill-{prio.id}"
                    onclick={() => (prioridadMenuAbierto = !prioridadMenuAbierto)}
                >
                    <span class="prio-indicator" style="background-color: {prio.color}"></span>
                    {prio.label}
                </button>

                {#if prioridadMenuAbierto}
                    <div class="popover-menu">
                        {#each prioridades as opcion}
                            <button
                                type="button"
                                class="popover-item"
                                onclick={() => {
                                    alCambiar(opcion.id);
                                    prioridadMenuAbierto = false;
                                }}
                            >
                                <span class="prio-indicator" style="background-color: {opcion.color}"></span>
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
        <div class="header-left">
            <h1 class="header-title">TAREAS</h1>

            {#if adminActual}
                <button 
                    type="button" 
                    class="btn-toggle-eye" 
                    class:active={adminActual.ve_todo}
                    onclick={toggleVeTodo}
                    disabled={guardandoVeTodo}
                    title={adminActual.ve_todo ? "Viendo todas las áreas" : "Viendo mi área"}
                >
                    {#if adminActual.ve_todo}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span class="eye-label">TODAS LAS ÁREAS</span>
                    {:else}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.4 20.4 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.5 20.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        <span class="eye-label">MI ÁREA</span>
                    {/if}
                </button>
            {/if}
        </div>
    </header>

    <!-- BARRA DE FILTROS EN DROPDOWNS -->
    <section class="filters-bar">
        <div class="filter-group">
            <input 
                type="text" 
                placeholder="🔍 Buscar tarea..." 
                bind:value={filtroTexto} 
                class="search-input" 
            />
        </div>

        <div class="filter-group">
            <label for="filter-member" class="filter-label">Encargado:</label>
            <select id="filter-member" bind:value={filtroMiembro} class="filter-select">
                <option value="todos">Todos los miembros</option>
                {#each admins as admin}
                    <option value={admin.user}>{admin.user}</option>
                {/each}
            </select>
        </div>

        <div class="filter-group">
            <label for="filter-category" class="filter-label">Área:</label>
            <select 
                id="filter-category" 
                value={filtroCategoria} 
                onchange={(e) => cambiarFiltroCategoria(e.currentTarget.value)}
                class="filter-select"
            >
                <option value="todas">Todas las áreas</option>
                {#each categorias as cat}
                    <option value={cat.id}>{cat.label}</option>
                {/each}
            </select>
        </div>

        <div class="filter-group">
            <label for="filter-priority" class="filter-label">Prioridad:</label>
            <select id="filter-priority" bind:value={filtroPrioridad} class="filter-select">
                <option value="todas">Todas las prioridades</option>
                {#each prioridades as prio}
                    <option value={prio.id}>{prio.label}</option>
                {/each}
            </select>
        </div>

        {#if filtroTexto || filtroMiembro !== 'todos' || filtroCategoria !== 'todas' || filtroPrioridad !== 'todas'}
            <button 
                type="button"
                class="btn-clear-filters" 
                onclick={() => { filtroTexto = ''; filtroMiembro = 'todos'; filtroCategoria = 'todas'; filtroPrioridad = 'todas'; }}
            >
                ✕ Limpiar
            </button>
        {/if}
    </section>

    <main class="main-content">
        {#if cargando}
            <div class="loading-container">
                <div class="spinner"></div>
                <span>Cargando tablero...</span>
            </div>
        {:else}
            <div class="kanban-grid">
                {#each columnas as col}
                    {@const tareasColumna = tareasFiltradas.filter(t => t.estado === col.id)}

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
                                <span class="badge-label">{col.label} ({tareasColumna.length})</span>
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

                        <!-- LISTA CON SCROLL INTERNO INDEPENDIENTE -->
                        <div class="task-list">
                            {#each tareasColumna as tarea}
                                {@const infoFecha = evaluarFechaLimite(tarea.fecha_limite)}
                                {@const subtareasTotales = tarea.subtareas?.length || 0}
                                {@const subtareasHechas = tarea.subtareas?.filter(s => s.hecho).length || 0}

                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <div
                                    role="button"
                                    tabindex="0"
                                    draggable="true"
                                    ondragstart={(e) => handleDragStart(e, tarea.id)}
                                    onclick={() => abrirDetalle(tarea)}
                                    class="task-card task-card-{col.key}"
                                >       
                                    <div class="card-header-actions">
                                        <div>
                                            <h3 class="task-title">{tarea.titulo}</h3>
                                            <div class="tags-row">
                                                <span class="cat-tag cat-tag-{categoriaDe(tarea.categoria).key}">
                                                    {categoriaDe(tarea.categoria).label}
                                                </span>

                                                {#if tarea.prioridad}
                                                    <span class="prio-tag prio-tag-{tarea.prioridad}">
                                                        {tarea.prioridad.toUpperCase()}
                                                    </span>
                                                {/if}

                                                {#if infoFecha}
                                                    <span class="date-tag {infoFecha.clase}">
                                                        📅 {infoFecha.label}
                                                    </span>
                                                {/if}
                                            </div>
                                        </div>
                                        <button type="button" class="btn-delete" onclick={(e) => eliminarTarea(tarea.id, e)} title="Eliminar tarea">
                                            ✕
                                        </button>
                                    </div>

                                    {#if subtareasTotales > 0}
                                        <div class="progress-row">
                                            <div class="progress-bar-bg">
                                                <div class="progress-bar-fill" style="width: {(subtareasHechas / subtareasTotales) * 100}%"></div>
                                            </div>
                                            <span class="progress-text">{subtareasHechas}/{subtareasTotales}</span>
                                        </div>
                                    {/if}

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

    <!-- MODAL DETALLE TAREA -->
    {#if tareaSeleccionada}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
            class="modal-backdrop"
            onclick={cerrarDetalle}
            role="button"
            tabindex="0"
        >
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <div
                class="modal-card"
                onclick={(e) => e.stopPropagation()}
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
                    {@render categoriaPropiedad(editandoCategoria, (v) => (editandoCategoria = v))}
                    {@render prioridadPropiedad(editandoPrioridad, (v) => (editandoPrioridad = v))}
                    {@render asignadosPropiedad(editandoAsignados, (v) => (editandoAsignados = v))}

                    <div>
                        <label for="modal-date-input" class="field-label">Fecha Límite:</label>
                        <input
                            id="modal-date-input"
                            type="date"
                            bind:value={editandoFechaLimite}
                            class="modal-input date-input-custom"
                        />
                    </div>

                    <!-- Subtareas / Checklists -->
                    <div class="subtareas-container">
                        <span class="field-label">Subtareas / Checklists:</span>
                        <div class="subtareas-list">
                            {#each editandoSubtareas as subtarea, i (subtarea.id || i)}
                                <div class="subtarea-item">
                                    <input 
                                        type="checkbox" 
                                        checked={subtarea.hecho} 
                                        onchange={() => toggleSubtareaCheck(subtarea.id, true)} 
                                        class="checkbox-custom" 
                                    />
                                    <span class="subtarea-text" class:subtarea-completed={subtarea.hecho}>{subtarea.texto}</span>
                                    <button type="button" class="btn-remove-sub" onclick={() => eliminarSubtarea(subtarea.id, true)}>✕</button>
                                </div>
                            {/each}
                        </div>
                        <div class="subtarea-input-wrapper">
                            <input
                                type="text"
                                placeholder="Agregar subtarea..."
                                bind:value={nuevaSubtareaTexto}
                                class="modal-input"
                                onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarSubtarea(true))}
                            />
                            <button type="button" class="btn-add-sub" onclick={() => agregarSubtarea(true)}>+</button>
                        </div>
                    </div>

                    <div>
                        <label for="modal-comments-input" class="field-label">Descripción / Comentarios:</label>
                        <textarea
                            id="modal-comments-input"
                            bind:value={editandoComentarios}
                            class="comments-box-input"
                            rows="3"
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

    <!-- MODAL NUEVA TAREA -->
    {#if mostrandoNuevaTarea}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
            class="modal-backdrop"
            onclick={cerrarModalNueva}
            role="button"
            tabindex="0"
        >
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <div
                class="modal-card"
                onclick={(e) => e.stopPropagation()}
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
                    {@render categoriaPropiedad(nuevaTareaCategoria, (v) => (nuevaTareaCategoria = v))}
                    {@render prioridadPropiedad(nuevaTareaPrioridad, (v) => (nuevaTareaPrioridad = v))}
                    {@render asignadosPropiedad(nuevaTareaAsignados, (v) => (nuevaTareaAsignados = v))}

                    <div>
                        <label for="nueva-date-input" class="field-label">Fecha Límite:</label>
                        <input
                            id="nueva-date-input"
                            type="date"
                            bind:value={nuevaTareaFechaLimite}
                            class="modal-input date-input-custom"
                        />
                    </div>

                    <div class="subtareas-container">
                        <span class="field-label">Subtareas:</span>
                        <div class="subtareas-list">
                            {#each nuevaTareaSubtareas as subtarea (subtarea.id)}
                                <div class="subtarea-item">
                                    <input 
                                        type="checkbox" 
                                        checked={subtarea.hecho} 
                                        onchange={() => toggleSubtareaCheck(subtarea.id, false)} 
                                        class="checkbox-custom" 
                                    />
                                    <span class="subtarea-text" class:subtarea-completed={subtarea.hecho}>{subtarea.texto}</span>
                                    <button type="button" class="btn-remove-sub" onclick={() => eliminarSubtarea(subtarea.id, false)}>✕</button>
                                </div>
                            {/each}
                        </div>
                        <div class="subtarea-input-wrapper">
                            <input
                                type="text"
                                placeholder="Agregar subtarea..."
                                bind:value={nuevaTareaSubtareaInput}
                                class="modal-input"
                                onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarSubtarea(false))}
                            />
                            <button type="button" class="btn-add-sub" onclick={() => agregarSubtarea(false)}>+</button>
                        </div>
                    </div>

                    <div>
                        <label for="nueva-comments-input" class="field-label">Descripción / Comentarios:</label>
                        <textarea
                            id="nueva-comments-input"
                            bind:value={nuevaTareaComentarios}
                            class="comments-box-input"
                            rows="3"
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
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        border-bottom: 2.5px solid #000000;
        padding-bottom: 0.5rem;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;
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

    .btn-toggle-eye {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background-color: #f1f5f9;
        border: 1px solid #cbd5e1;
        color: #64748b;
        padding: 0.4rem 0.85rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-toggle-eye:hover {
        background-color: #e2e8f0;
        color: #0f172a;
    }

    .btn-toggle-eye.active {
        background-color: #f3eefc;
        border-color: #7c3aed;
        color: #7c3aed;
    }

    .eye-label {
        font-family: monospace;
        letter-spacing: 0.05em;
    }

    .filters-bar {
        max-width: 90rem;
        margin: 0 auto 1.5rem auto;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
        background-color: #f8fafc;
        padding: 0.75rem 1.25rem;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .filter-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
    }

    .search-input {
        padding: 0.45rem 0.85rem;
        border-radius: 0.6rem;
        border: 1px solid #cbd5e1;
        font-size: 0.85rem;
        width: 14rem;
        background-color: #ffffff;
    }

    .filter-select {
        padding: 0.45rem 0.85rem;
        border-radius: 0.6rem;
        border: 1px solid #cbd5e1;
        font-size: 0.85rem;
        background-color: #ffffff;
        color: #0f172a;
        cursor: pointer;
    }

    .btn-clear-filters {
        background: none;
        border: none;
        color: #ef4444;
        font-weight: 700;
        font-size: 0.75rem;
        cursor: pointer;
        margin-left: auto;
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
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 12rem);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    .column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding: 0 0.25rem;
        flex-shrink: 0;
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

    .badge-not-started { background-color: #3b1c1d; color: #e57373; }
    .badge-in-progress { background-color: #383519; color: #d4e157; }
    .badge-done { background-color: #173822; color: #81c784; }

    .dot { width: 0.45rem; height: 0.45rem; border-radius: 9999px; }
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
    }

    .btn-add-task:hover {
        background-color: rgba(255, 255, 255, 0.2);
        color: #ffffff;
    }

    .task-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        overflow-y: auto;
        padding-right: 0.25rem;
        flex: 1;
    }

    .task-list::-webkit-scrollbar {
        width: 6px;
    }

    .task-list::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 9999px;
    }

    .task-card {
        width: 100%;
        text-align: left;
        border-radius: 1.1rem;
        padding: 1.1rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: grab;
        border: 1px solid transparent;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
        flex-shrink: 0;
    }

    .task-card:hover {
        transform: translateY(-0.15rem);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    }

    .task-card-not-started { background-color: #2a1617; border-color: #3d1f21; }
    .task-card-in-progress { background-color: #282613; border-color: #3b371b; }
    .task-card-done { background-color: #13271b; border-color: #1b3a27; }

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
        margin: 0 0 0.4rem 0;
        line-height: 1.3;
    }

    .tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
        align-items: center;
    }

    .prio-tag {
        font-size: 0.55rem;
        font-weight: 700;
        padding: 0.15rem 0.45rem;
        border-radius: 9999px;
        font-family: monospace;
    }

    .prio-tag-baja { background-color: #173822; color: #81c784; }
    .prio-tag-media { background-color: #16293b; color: #64b5f6; }
    .prio-tag-alta { background-color: #3d2b13; color: #f0a84e; }
    .prio-tag-urgente { background-color: #3b1c1d; color: #e57373; }

    .date-tag {
        font-size: 0.55rem;
        font-weight: 700;
        padding: 0.15rem 0.45rem;
        border-radius: 9999px;
    }

    .date-tag-vencida { background-color: #7f1d1d; color: #fca5a5; }
    .date-tag-proxima { background-color: #78350f; color: #fde047; }
    .date-tag-normal { background-color: rgba(255, 255, 255, 0.08); color: #cbd5e1; }

    .progress-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.6rem;
    }

    .progress-bar-bg {
        flex: 1;
        height: 0.3rem;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 9999px;
        overflow: hidden;
    }

    .progress-bar-fill {
        height: 100%;
        background-color: #38bdf8;
        border-radius: 9999px;
    }

    .progress-text {
        font-size: 0.65rem;
        color: #94a3b8;
        font-family: monospace;
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

    .task-card:hover .btn-delete { opacity: 1; }
    .btn-delete:hover { color: #ef4444; }

    .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.85rem;
        font-size: 0.75rem;
        color: #94a3b8;
    }

    .avatars { display: flex; gap: 0.25rem; }
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

    .unassigned { font-size: 11px; color: #64748b; font-style: italic; }

    .empty-state {
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 2rem;
        text-align: center;
        font-size: 0.75rem;
        color: #475569;
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
        font-size: 0.9rem;
        box-sizing: border-box;
    }

    .date-input-custom::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
    }

    .subtareas-container {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .subtareas-list {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .subtarea-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background-color: #0d1117;
        padding: 0.35rem 0.6rem;
        border-radius: 0.4rem;
        border: 1px solid #1e293b;
    }

    .checkbox-custom {
        accent-color: #38bdf8;
        cursor: pointer;
    }

    .subtarea-text {
        flex: 1;
        font-size: 0.8rem;
        color: #cbd5e1;
    }

    .subtarea-completed {
        text-decoration: line-through;
        color: #64748b;
    }

    .btn-remove-sub {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        font-size: 0.75rem;
    }

    .subtarea-input-wrapper {
        display: flex;
        gap: 0.5rem;
    }

    .btn-add-sub {
        background-color: #334155;
        color: #ffffff;
        border: none;
        border-radius: 0.5rem;
        padding: 0 0.85rem;
        cursor: pointer;
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

    .prop-value { flex: 1; min-width: 0; }

    .popover-wrapper {
        position: relative;
        display: inline-block;
        width: 100%;
    }

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

    .status-pill-not-started { background-color: #3b1c1d; color: #e57373; }
    .status-pill-in-progress { background-color: #383519; color: #d4e157; }
    .status-pill-done { background-color: #173822; color: #81c784; }

    .prio-pill-baja { background-color: #173822; color: #81c784; }
    .prio-pill-media { background-color: #16293b; color: #64b5f6; }
    .prio-pill-alta { background-color: #3d2b13; color: #f0a84e; }
    .prio-pill-urgente { background-color: #3b1c1d; color: #e57373; }

    .prio-indicator {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 9999px;
    }

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

    .popover-item:hover { background-color: rgba(255, 255, 255, 0.06); }
    .popover-item-active { color: #ffffff; }
    .popover-item-text { flex: 1; }
    .popover-check { color: #38bdf8; font-size: 0.75rem; }

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

    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

    .cat-pill-general    { background-color: #2a2e38; color: #94a3b8; }
    .cat-pill-finanzas   { background-color: #173822; color: #81c784; }
    .cat-pill-imagen     { background-color: #3a1d38; color: #d891e0; }
    .cat-pill-social     { background-color: #3d2b13; color: #f0a84e; }
    .cat-pill-logistica  { background-color: #16293b; color: #64b5f6; }

    .cat-dot-general    { background-color: #94a3b8; }
    .cat-dot-finanzas   { background-color: #4caf50; }
    .cat-dot-imagen     { background-color: #d891e0; }
    .cat-dot-social     { background-color: #f0a84e; }
    .cat-dot-logistica  { background-color: #64b5f6; }

    .cat-tag {
        display: inline-block;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        padding: 0.15rem 0.5rem;
        border-radius: 9999px;
        font-family: monospace;
    }

    .cat-tag-general    { background-color: #2a2e38; color: #94a3b8; }
    .cat-tag-finanzas   { background-color: #173822; color: #81c784; }
    .cat-tag-imagen     { background-color: #3a1d38; color: #d891e0; }
    .cat-tag-social     { background-color: #3d2b13; color: #f0a84e; }
    .cat-tag-logistica  { background-color: #16293b; color: #64b5f6; }

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
</style>