<script lang="ts">
    import { SvelteSet } from 'svelte/reactivity';
    import { invalidateAll } from '$app/navigation';

    // Recibir datos reales cargados desde +page.server.ts
    let { data } = $props();

    // ----- Tipos ----
    type Categoria = 'Drones' | 'Electrónica' | 'Visión' | 'Herramientas' | 'Piezas';
    type Estado = 'libre' | 'en_uso';
    type FiltroEstado = 'todos' | 'en_uso' | 'libre';
    type Orden = 'nombre' | 'categoria' | 'cantidad';

    interface Item {
        id: string; // Adaptado a UUID de PostgreSQL
        codigo: string;
        nombre: string;
        descripcion: string;
        categoria: Categoria;
        estado: Estado;
        cantidad: number;
        ubicacion: string;
        foto_url: string | null;
    }

    interface Uso {
        id: string; // Adaptado a UUID
        item_id: string;
        usuario: string;
        motivo: string;
        fecha: string;
    }

    // ---- Reactividad de datos cargados de Supabase ----
    let items = $derived<Item[]>(data.items);
    let usos = $derived<Uso[]>(data.usos);

    // ---- Filtros ----
    const categorias: Categoria[] = ['Herramientas', 'Electrónica', 'Drones', 'Visión', 'Piezas'];
    const categoriasActivas = new SvelteSet<Categoria>(categorias);
    let filtroEstado = $state<FiltroEstado>('todos');
    let busqueda = $state('');
    let orden = $state<Orden>('nombre');

    function alternarCategoria(cat: Categoria) {
        if (categoriasActivas.has(cat)) {
            categoriasActivas.delete(cat);
        } else {
            categoriasActivas.add(cat);
        }
    }

    let itemsFiltrados = $derived.by(() => {
        const texto = busqueda.trim().toLowerCase();

        const filtrados = items.filter(item =>
            categoriasActivas.has(item.categoria) &&
            (filtroEstado === 'todos' || item.estado === filtroEstado) &&
            (item.nombre.toLowerCase().includes(texto) ||
             item.codigo.toLowerCase().includes(texto))
        );

        return filtrados.toSorted((a, b) => {
            if (orden === 'cantidad') return b.cantidad - a.cantidad;
            if (orden === 'categoria') return a.categoria.localeCompare(b.categoria);
            return a.nombre.localeCompare(b.nombre);
        });
    });

    // ---- Contadores ----
    let totalLibres = $derived(items.filter(i => i.estado === 'libre').length);
    let totalEnUso = $derived(items.filter(i => i.estado === 'en_uso').length);

    // ---- Panel de detalle ----
    let itemSeleccionado = $state<Item | null>(null);

    function seleccionar(item: Item) {
        if (itemSeleccionado?.id === item.id) {
            itemSeleccionado = null;
        } else {
            itemSeleccionado = item;
        }
    }

    // ---- Historial ----
    let usosSeleccionado = $derived.by(() => {
        const seleccionado = itemSeleccionado;
        if (!seleccionado) return [];

        return usos
            .filter(u => u.item_id === seleccionado.id)
            .toSorted((a, b) => b.fecha.localeCompare(a.fecha));
    });

    function formatearFecha(fecha: string) {
        return new Date(fecha).toLocaleString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function iniciales(nombre: string) {
        return nombre
            .split(' ')
            .map(palabra => palabra[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }

    const coloresAvatar = ['#7c3aed', '#2563eb', '#047857', '#c2410c'];

    // ===== Modales y Estado de Acciones =====
    let mostrarModalAgregar = $state(false);
    let mostrarModalPrestar = $state(false);
    let cargandoAccion = $state(false);

    // Formulario Crear Ítem
    let nuevoNombre = $state('');
    let nuevaDescripcion = $state('');
    let nuevaUbicacion = $state('');
    let nuevaCategoria = $state<Categoria>('Herramientas');
    let nuevaCantidad = $state(1);
    let archivoImagen = $state<FileList | null>(null);

    // Formulario Prestar Ítem
    let miembroSeleccionadoEmail = $state('');
    let motivoUso = $state('');
    let fechaLimite = $state('');

    // ===== Funciones de Backend API =====
    async function agregarItem(e: SubmitEvent) {
        e.preventDefault();
        cargandoAccion = true;

        const formData = new FormData();
        formData.append('nombre', nuevoNombre);
        formData.append('descripcion', nuevaDescripcion);
        formData.append('ubicacion', nuevaUbicacion);
        formData.append('categoria', nuevaCategoria === 'Piezas' ? 'Piezas de servicio' : nuevaCategoria);
        formData.append('cantidad', nuevaCantidad.toString());
        
        if (archivoImagen && archivoImagen[0]) {
            formData.append('imagen', archivoImagen[0]);
        }

        const res = await fetch('/api/inventario/crear', {
            method: 'POST',
            body: formData
        });

        cargandoAccion = false;

        if (res.ok) {
            mostrarModalAgregar = false;
            nuevoNombre = '';
            nuevaDescripcion = '';
            nuevaUbicacion = '';
            archivoImagen = null;
            await invalidateAll();
        } else {
            const err = await res.json();
            alert(err.error || 'Error al agregar ítem');
        }
    }

    async function prestarItem(e: SubmitEvent) {
        e.preventDefault();
        if (!itemSeleccionado) return;
        cargandoAccion = true;

        const res = await fetch('/api/inventario/prestar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                item_id: itemSeleccionado.id,
                miembro_email: miembroSeleccionadoEmail,
                motivo_uso: motivoUso,
                fecha_limite: fechaLimite || null
            })
        });

        cargandoAccion = false;

        if (res.ok) {
            mostrarModalPrestar = false;
            miembroSeleccionadoEmail = '';
            motivoUso = '';
            fechaLimite = '';
            itemSeleccionado = null;
            await invalidateAll();
        } else {
            const err = await res.json();
            alert(err.error || 'Error al registrar préstamo');
        }
    }

    async function devolverItem() {
        if (!itemSeleccionado) return;
        const prestamoActivo = usosSeleccionado[0];
        if (!prestamoActivo) return;

        if (!confirm(`¿Confirmas la devolución de ${itemSeleccionado.nombre}?`)) return;

        cargandoAccion = true;
        const res = await fetch('/api/inventario/devolver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prestamo_id: prestamoActivo.id,
                item_id: itemSeleccionado.id
            })
        });

        cargandoAccion = false;

        if (res.ok) {
            itemSeleccionado = null;
            await invalidateAll();
        } else {
            const err = await res.json();
            alert(err.error || 'Error al devolver ítem');
        }
    }

    async function eliminarItem() {
        if (!itemSeleccionado) return;
        if (!confirm(`¿Estás seguro de eliminar "${itemSeleccionado.nombre}"? Esta acción no se puede deshacer.`)) return;

        cargandoAccion = true;
        const res = await fetch('/api/inventario/eliminar', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: itemSeleccionado.id })
        });

        cargandoAccion = false;

        if (res.ok) {
            itemSeleccionado = null;
            await invalidateAll();
        } else {
            const err = await res.json();
            alert(err.error || 'Error al eliminar ítem');
        }
    }
</script>

<!-- Snippet: la imagen con etiqueta y estado (se usa en la tarjeta y en el panel) -->
{#snippet imagenItem(item: Item)}
    <div class="imagen">
        <span class="etiqueta"
            class:drones={item.categoria === 'Drones'}
            class:electronica={item.categoria === 'Electrónica'}
            class:vision={item.categoria === 'Visión'}
            class:herramientas={item.categoria === 'Herramientas'}
            class:piezas={item.categoria === 'Piezas'}>
            {item.categoria}
        </span>

        {#if item.foto_url}
            <img src={item.foto_url} alt={item.nombre} />
        {:else}
            <span class="sin-imagen">Sin imagen</span>
        {/if}

        <span class="estado" class:libre={item.estado === 'libre'}>
            ● {item.estado === 'libre' ? 'Libre' : 'En uso'}
        </span>
    </div>
{/snippet}

<div class="pagina-inventario">
    <!-- --- Barra lateral ---- -->
    <aside class="sidebar">
        <p class="titulo-seccion">ITEMS</p>
        {#each categorias as cat}
            <label class="filtro">
                <input
                    type="checkbox"
                    checked={categoriasActivas.has(cat)}
                    onchange={() => alternarCategoria(cat)}
                />
                {cat}
            </label>
        {/each}

        <hr class="separador" />

        <p class="titulo-seccion">DISPONIBILIDAD</p>
        <label class="opcion">
            <input type="radio" name="estado" value="todos" bind:group={filtroEstado} />
            Todos
        </label>
        <label class="opcion">
            <input type="radio" name="estado" value="en_uso" bind:group={filtroEstado} />
            En uso
        </label>
        <label class="opcion">
            <input type="radio" name="estado" value="libre" bind:group={filtroEstado} />
            Libre
        </label>

        <hr class="separador" />

        <div class="resumen">
            <p>Total de items: {items.length}</p>
            <p><span class="punto verde"></span>Libres: {totalLibres}</p>
            <p><span class="punto naranja"></span>En uso: {totalEnUso}</p>
        </div>
    </aside>

    <!-- ---- Contenido principal ---- -->
    <div class="inventario">
        <!-- Panel de detalle -->
        {#if itemSeleccionado}
            <section class="detalle">
                <div class="detalle-izq">
                    {@render imagenItem(itemSeleccionado)}
                    <h3>{itemSeleccionado.nombre}</h3>
                    <p class="descripcion">{itemSeleccionado.descripcion}</p>
                    <div class="pie">
                        <span>ID: {itemSeleccionado.codigo}</span>
                        <span>Cant: {itemSeleccionado.cantidad}</span>
                    </div>
                </div>

                <div class="detalle-der">
                    <button class="cerrar" onclick={() => itemSeleccionado = null}>✕</button>

                    <p class="titulo-seccion">DETALLE DEL ARTÍCULO</p>
                    <h2>{itemSeleccionado.nombre}</h2>
                    <p class="descripcion">{itemSeleccionado.descripcion}</p>

                    <div class="datos">
                        <div class="dato">
                            <p class="titulo-seccion">UBICACIÓN</p>
                            <p>{itemSeleccionado.ubicacion}</p>
                        </div>
                        <div class="dato">
                            <p class="titulo-seccion">ÚLTIMO USO</p>
                            <p>
                                {usosSeleccionado.length > 0
                                    ? formatearFecha(usosSeleccionado[0].fecha)
                                    : 'Sin registros'}
                            </p>
                        </div>
                    </div>

                    <!-- Botones de Acción sobre Ítem Seleccionado (Solo visilbes para SuperAdmin) -->
                    {#if data.esSuperAdmin}
                        <div class="acciones-detalle">
                            {#if itemSeleccionado.estado === 'libre'}
                                <button class="btn-accion prestar" onclick={() => mostrarModalPrestar = true}>
                                    Prestar Ítem
                                </button>
                            {:else}
                                <button class="btn-accion devolver" disabled={cargandoAccion} onclick={devolverItem}>
                                    Marcar Devolución
                                </button>
                            {/if}

                            <button class="btn-accion eliminar" disabled={cargandoAccion} onclick={eliminarItem}>
                                Eliminar
                            </button>
                        </div>
                    {/if}

                    <p class="titulo-seccion" style="margin-top: 1rem;">ÚLTIMOS USUARIOS</p>
                    <ul class="usuarios">
                        {#each usosSeleccionado.slice(0, 3) as uso, i (uso.id)}
                            <li class="usuario">
                                <span class="avatar" style:background={coloresAvatar[i % coloresAvatar.length]}>
                                    {iniciales(uso.usuario)}
                                </span>
                                <div>
                                    <p class="usuario-nombre">{uso.usuario}</p>
                                    <p class="usuario-fecha">{formatearFecha(uso.fecha)}</p>
                                </div>
                                <span class="usuario-motivo">{uso.motivo}</span>
                            </li>
                        {:else}
                            <li class="descripcion">Este item aún no tiene registros de uso.</li>
                        {/each}
                    </ul>
                </div>
            </section>
        {/if}

        <!-- Encabezado: título + buscador + ordenar -->
        <div class="encabezado">
            <h1>INVENTARIO</h1>

            {#if data.esSuperAdmin}
                <button class="btn-agregar" onclick={() => mostrarModalAgregar = true}>
                    + AGREGAR ÍTEM
                </button>
            {/if}

            <input
                class="buscador"
                type="text"
                placeholder="Buscar ítem"
                bind:value={busqueda}
            />

            <label class="ordenar">
                Ordenar por:
                <select bind:value={orden}>
                    <option value="nombre">Nombre</option>
                    <option value="categoria">Categoría</option>
                    <option value="cantidad">Cantidad</option>
                </select>
            </label>
        </div>

        <!-- Tarjetas -->
        <div class="grid">
            {#each itemsFiltrados as item (item.id)}
                <div
                    class="tarjeta"
                    class:seleccionada={itemSeleccionado?.id === item.id}
                    role="button"
                    tabindex="0"
                    onclick={() => seleccionar(item)}
                    onkeydown={(e) => e.key === 'Enter' && seleccionar(item)}
                >
                    {@render imagenItem(item)}

                    <div class="info">
                        <h3>{item.nombre}</h3>
                        <p class="descripcion">{item.descripcion}</p>
                        <div class="pie">
                            <span>ID: {item.codigo}</span>
                            <span>Cant: {item.cantidad}</span>
                        </div>
                    </div>
                </div>
            {:else}
                <p class="vacio">No se encontraron items con esos filtros.</p>
            {/each}
        </div>
    </div>
</div>

<!-- ===== Modal Agregar Ítem ===== -->
{#if mostrarModalAgregar && data.esSuperAdmin}
    <div class="modal-overlay">
        <div class="modal">
            <h2>Agregar Nuevo Artículo</h2>
            <form onsubmit={agregarItem}>
                <label>Nombre del Ítem *
                    <input type="text" bind:value={nuevoNombre} required placeholder="Ej. DJI Mavic 3 Pro" />
                </label>

                <label>Descripción
                    <textarea bind:value={nuevaDescripcion} placeholder="Ej. Drone de inspección con cámara Hasselblad"></textarea>
                </label>

                <div class="fila">
                    <label>Categoría
                        <select bind:value={nuevaCategoria}>
                            {#each categorias as cat}
                                <option value={cat}>{cat}</option>
                            {/each}
                        </select>
                    </label>

                    <label>Cantidad
                        <input type="number" min="1" bind:value={nuevaCantidad} required />
                    </label>
                </div>

                <label>Ubicación en Laboratorio
                    <input type="text" bind:value={nuevaUbicacion} placeholder="Ej. Laboratorio 2 · Estantería A-04" />
                </label>

                <label>Imagen del dispositivo
                    <input type="file" accept="image/*" bind:files={archivoImagen} />
                </label>

                <div class="modal-acciones">
                    <button type="button" class="btn-cancelar" onclick={() => mostrarModalAgregar = false}>Cancelar</button>
                    <button type="submit" class="btn-guardar" disabled={cargandoAccion}>
                        {cargandoAccion ? 'Guardando...' : 'Guardar Ítem'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- ===== Modal Prestar Ítem ===== -->
{#if mostrarModalPrestar && itemSeleccionado && data.esSuperAdmin}
    <div class="modal-overlay">
        <div class="modal">
            <h2>Registrar Préstamo</h2>
            <p class="subtitulo">Ítem: <strong>{itemSeleccionado.nombre}</strong></p>

            <form onsubmit={prestarItem}>
                <label>Miembro Solicitante *
                    <select bind:value={miembroSeleccionadoEmail} required>
                        <option value="" disabled selected>Selecciona un miembro...</option>
                        {#each data.miembros as m}
                            <option value={m.email}>{m.user} ({m.area})</option>
                        {/each}
                    </select>
                </label>

                <label>Motivo de Uso
                    <input type="text" bind:value={motivoUso} placeholder="Ej. Pruebas de vuelo, Inspección..." />
                </label>

                <label>Fecha Límite de Entrega
                    <input type="datetime-local" bind:value={fechaLimite} />
                </label>

                <div class="modal-acciones">
                    <button type="button" class="btn-cancelar" onclick={() => mostrarModalPrestar = false}>Cancelar</button>
                    <button type="submit" class="btn-guardar" disabled={cargandoAccion}>
                        {cargandoAccion ? 'Registrando...' : 'Confirmar Préstamo'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    /* ---- Estructura general ---- */
    .pagina-inventario {
        display: flex;
        min-height: 100vh;
    }

    .inventario {
        flex: 1;
        color: #12151e;
        padding: 2rem;
    }

    h1 {
        font-size: 3rem;
        font-weight: 800;
        margin: 0;
    }

    h3 {
        font-size: 0.95rem;
        font-weight: 700;
    }

    /* ----- Barra lateral ---- */
    .sidebar {
        width: 220px;
        flex-shrink: 0;
        background: #0b0f19;
        color: white;
        padding: 1.5rem 1rem;
    }

    .titulo-seccion {
        font-size: 0.7rem;
        color: #6b7280;
        letter-spacing: 0.1em;
        margin-bottom: 0.75rem;
    }

    .filtro {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #1c2230;
        padding: 0.4rem 0.6rem;
        border-radius: 6px;
        margin-bottom: 0.4rem;
        font-size: 0.85rem;
        cursor: pointer;
    }

    .filtro input,
    .opcion input {
        accent-color: #7c3aed;
    }

    .separador {
        border: none;
        border-top: 1px solid #1f2937;
        margin: 1.25rem 0;
    }

    .opcion {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.6rem;
        border-radius: 6px;
        font-size: 0.85rem;
        cursor: pointer;
        margin-bottom: 0.25rem;
    }

    .opcion:has(input:checked) {
        background: #1c2230;
    }

    .resumen {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-size: 0.75rem;
        color: #9aa3b2;
    }

    .punto {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 0.4rem;
    }

    .punto.verde {
        background: #22c55e;
    }

    .punto.naranja {
        background: #f59e0b;
    }

    /* ----- Encabezado ---- */
    .encabezado {
        display: flex;
        align-items: center;
        gap: 1rem;
        border-bottom: 2px solid #12151e;
        padding-bottom: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .btn-agregar {
        background: #7c3aed;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-agregar:hover {
        background: #6d28d9;
    }

    .buscador {
        flex: 1;
        max-width: 400px;
        background: #1c2230;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 0.5rem 0.8rem;
        font-size: 0.85rem;
    }

    .buscador::placeholder {
        color: #6b7280;
    }

    .ordenar {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #4b5563;
    }

    .ordenar select {
        background: #12151e;
        color: white;
        border-radius: 6px;
        padding: 0.3rem 0.6rem;
        font-size: 0.8rem;
    }

    /* ===== Tarjetas ===== */
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.25rem;
    }

    .tarjeta {
        background: #12151e;
        color: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        cursor: pointer;
        transition: transform 0.15s;
    }

    .tarjeta:hover {
        transform: translateY(-3px);
    }

    .tarjeta.seleccionada {
        outline: 2px solid #7c3aed;
    }

    .imagen {
        position: relative;
        height: 140px;
        background: #1c2230;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .imagen img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .sin-imagen {
        color: #5b6475;
        font-size: 0.8rem;
    }

    .etiqueta {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        background: #7c3aed;
        color: white;
        font-size: 0.7rem;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
    }

    .etiqueta.drones {
        background: #7c3aed;
    }

    .etiqueta.electronica {
        background: #2563eb;
    }

    .etiqueta.vision {
        background: #047857;
    }

    .etiqueta.herramientas {
        background: #27064b;
    }

    .etiqueta.piezas {
        background: #c2410c;
    }

    .estado {
        position: absolute;
        bottom: 0.5rem;
        left: 0.5rem;
        font-size: 0.7rem;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        background: #7c2d12;
        color: #fdba74;
    }

    .estado.libre {
        background: #14532d;
        color: #86efac;
    }

    .info {
        padding: 0.75rem;
    }

    .descripcion {
        color: #9aa3b2;
        font-size: 0.75rem;
    }

    .pie {
        display: flex;
        justify-content: space-between;
        color: #6b7280;
        font-size: 0.7rem;
        margin-top: 0.5rem;
    }

    .vacio {
        color: #6b7280;
        grid-column: 1 / -1;
    }

    /* ---- Panel de detalle ----- */
    .detalle {
        display: flex;
        background: #12151e;
        color: white;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 2rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .detalle-izq {
        width: 300px;
        flex-shrink: 0;
        background: #0b0f19;
        padding: 1rem;
    }

    .detalle-izq .imagen {
        height: 220px;
        border-radius: 8px;
        margin-bottom: 0.75rem;
    }

    .detalle-der {
        flex: 1;
        position: relative;
        padding: 1.25rem 1.5rem;
    }

    .detalle-der h2 {
        font-size: 1.5rem;
        font-weight: 800;
    }

    .datos {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin: 1rem 0;
    }

    .dato {
        background: #1c2230;
        border-radius: 8px;
        padding: 0.6rem 0.8rem;
        font-size: 0.85rem;
    }

    .acciones-detalle {
        display: flex;
        gap: 0.75rem;
        margin: 1rem 0;
    }

    .btn-accion {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: pointer;
    }

    .btn-accion.prestar { background: #2563eb; color: white; }
    .btn-accion.devolver { background: #16a34a; color: white; }
    .btn-accion.eliminar { background: #dc2626; color: white; }

    .cerrar {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: none;
        border: none;
        color: #9aa3b2;
        font-size: 1.1rem;
        cursor: pointer;
    }

    .cerrar:hover {
        color: white;
    }

    /* ---- Historial ----- */
    .usuarios {
        background: #0b0f19;
        border-radius: 8px;
        padding: 0.25rem 0.75rem;
        list-style: none;
    }

    .usuario {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 0;
        border-bottom: 1px solid #1f2937;
    }

    .usuario:last-child {
        border-bottom: none;
    }

    .avatar {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 700;
        color: white;
    }

    .usuario-nombre {
        font-size: 0.85rem;
        font-weight: 600;
    }

    .usuario-fecha {
        font-size: 0.7rem;
        color: #6b7280;
    }

    .usuario-motivo {
        margin-left: auto;
        font-size: 0.75rem;
        color: #9aa3b2;
    }

    /* ===== Modales ===== */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
    }

    .modal {
        background: #12151e;
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }

    .modal h2 { margin-top: 0; font-size: 1.25rem; }
    .modal .subtitulo { color: #9aa3b2; font-size: 0.85rem; margin-bottom: 1rem; }

    .modal form { display: flex; flex-direction: column; gap: 0.85rem; }

    .modal label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.8rem;
        color: #9aa3b2;
    }

    .modal input, .modal select, .modal textarea {
        background: #1c2230;
        border: 1px solid #2d3748;
        color: white;
        padding: 0.5rem;
        border-radius: 6px;
        font-size: 0.85rem;
    }

    .modal .fila { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

    .modal-acciones {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    .btn-cancelar { background: #374151; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
    .btn-guardar { background: #7c3aed; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 700; }

    /* ===== RESPONSIVE (celular y tablets chicas) ===== */
    @media (max-width: 768px) {
        .pagina-inventario {
            flex-direction: column;
        }

        .sidebar {
            width: 100%;
            box-sizing: border-box;
        }

        .sidebar > .filtro {
            display: inline-flex;
        }

        .inventario {
            padding: 1.25rem;
        }

        h1 {
            font-size: 2rem;
        }

        .encabezado {
            flex-wrap: wrap;
            gap: 0.75rem;
        }

        .buscador {
            max-width: 100%;
            flex: 1 1 100%;
            order: 3;
        }

        .ordenar {
            margin-left: 0;
            order: 4;
        }

        .btn-agregar {
            order: 2;
        }

        .detalle {
            flex-direction: column;
        }

        .detalle-izq {
            width: 100%;
            box-sizing: border-box;
        }

        .datos {
            grid-template-columns: 1fr;
        }

        .acciones-detalle {
            flex-direction: column;
        }

        .btn-accion {
            width: 100%;
        }

        .usuario-motivo {
            margin-left: 0;
            width: 100%;
        }

        .grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.85rem;
        }

        .modal {
            max-width: 100%;
            margin: 0 1rem;
        }

        .modal .fila {
            grid-template-columns: 1fr;
        }
    }
</style>