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
    
</script>

<div class="inventario">
    <h1>INVENTARIO PRUEBA</h1>

    <div class="grid">
        {#each items as item (item.id)}
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
</style>