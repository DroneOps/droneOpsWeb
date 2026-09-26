<script lang="ts">
    import { SvelteSet } from 'svelte/reactivity';

    type Categoria = 'Drones' | 'Electrónica' | 'Visión' | 'Herramientas' | 'Piezas';
    type Estado = 'libre' | 'en_uso';

    interface Item {
        id: number;
        codigo: string;
        nombre: string;
        descripcion: string;
        categoria: Categoria;
        estado: Estado;
        cantidad: number;
        ubicacion: string;
        foto_url: string | null;
    }
        let items = $state<Item[]>([
        { id: 1, codigo: 'DRN-001', nombre: 'DJI Mavic 3 Pro', descripcion: 'Drone de inspección',
          categoria: 'Drones', estado: 'libre', cantidad: 2, ubicacion: 'Laboratorio 2 · Estantería A-04', foto_url: null },
        { id: 2, codigo: 'ELC-012', nombre: 'Batería LiPo 6S', descripcion: '22000mAh, 44.4V',
          categoria: 'Electrónica', estado: 'en_uso', cantidad: 8, ubicacion: 'Laboratorio 2 · Cajón B-01', foto_url: null },
        { id: 3, codigo: 'HRR-003', nombre: 'Llave de Torque', descripcion: 'Calibrada 0.5-5 Nm',
          categoria: 'Herramientas', estado: 'libre', cantidad: 3, ubicacion: 'Taller · Caja roja', foto_url: null },
        { id: 4, codigo: 'VIS-007', nombre: 'Cámara Térmica', descripcion: 'FLIR Vue Pro 640',
          categoria: 'Visión', estado: 'libre', cantidad: 1, ubicacion: 'Laboratorio 2 · Estantería A-02', foto_url: null },
        { id: 5, codigo: 'PZA-021', nombre: 'Kit Hélices 9.4"', descripcion: 'Repuesto original DJI',
          categoria: 'Piezas', estado: 'en_uso', cantidad: 12, ubicacion: 'Taller · Cajón C-03', foto_url: null }
    ]);

    const categorias: Categoria[] = ['Herramientas', 'Electrónica', 'Drones', 'Visión', 'Piezas']
    const categoriasActivas = new SvelteSet<Categoria>(categorias);
    type FiltroEstado = 'todos' | 'en_uso' | 'libre';
    let filtroEstado = $state<FiltroEstado>('todos');

    function alternarCategoria(cat: Categoria) {
        if (categoriasActivas.has(cat)) {
            categoriasActivas.delete(cat);
        } else {
            categoriasActivas.add(cat);
        }
    }

    let itemsFiltrados = $derived(
        items.filter(item =>
            categoriasActivas.has(item.categoria) &&
            (filtroEstado === 'todos' || item.estado === filtroEstado)
        )
    );

    let totalLibres = $derived(items.filter(i => i.estado === 'libre').length);
    let totalEnUso = $derived(items.filter(i => i.estado === 'en_uso').length);
    
</script>

<div class="pagina-inventario">
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

<div class="inventario">
    <h1>INVENTARIO PRUEBA</h1>

    <div class="grid">
        {#each itemsFiltrados as item (item.id)}
            <article class="tarjeta">
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

                <div class="info">
                    <h3>{item.nombre}</h3>
                    <p class="descripcion">{item.descripcion}</p>
                    <div class="pie">
                        <span>ID: {item.codigo}</span>
                        <span>Cant: {item.cantidad}</span>
                    </div>
                </div>
            </article>
        {/each}
    </div>
</div>
</div>
<style>
    .inventario {
        color: #12151e;
        padding: 2rem;
    }

    h1 {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
    }

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
        font-size: 0.7rem;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
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

    h3 {
        font-size: 0.95rem;
        font-weight: 700;
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
        .inventario {
        flex: 1;
        color: #12151e;
        padding: 2rem;
    }
        .pagina-inventario {
        display: flex;
        min-height: 100vh;
    }

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

    .filtro input {
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

    .opcion input {
        accent-color: #7c3aed;
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
</style>