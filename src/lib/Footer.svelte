<script lang="ts">
    // Obtiene la informacion de la sesion desde el store de SvelteKit, extrae el usuario y su nombre
    import { page } from '$app/stores';
    $: user = $page.data.user;
    $: nombre = $page.data.nombreUsuario;
    $: esSuperAdmin = $page.data.esSuperAdmin; //Extrae la propiedad de superadmin cargada desde +layout.server.ts

    // Enlaces de las columnas. Para agregar uno, copia un bloque { ... } y cambia sus datos.
    const GITHUB = 'https://github.com/DroneOps';

    const enlacesSitio = [
        { texto: 'Inicio', href: '/' },
        { texto: 'Competencias', href: '/#objetivo' },
        { texto: 'Investigación', href: '/#investigacion' },
        { texto: 'Comunidad', href: '/comunidad' },
        { texto: 'Únete', href: '/unete' }
    ];

    const proyectos = [
        { texto: 'Navegación con filtro de Kalman', repo: 'Kalman-Navigation' },
        { texto: 'Detección de sonido', repo: 'Sound_Localization' },
        { texto: 'Control con OptiTrack', repo: 'Tello-Optitrack' },
        { texto: 'Detección con cámara', repo: 'Gate_tmr_color' }
    ];
</script>
<footer class="footer">
    <!--Seccion superior: descripcion y tres columnas de enlaces-->
    <div class="footer-top">
        <!--Columna 1: Logo y descripcion de DroneOps-->
        <div class="footer-info">
            <div class="logo">
                <img src="/logo.svg" alt="DRONE OPS" />
            </div>
            <p class="descripcion">
                Grupo estudiantil de drones autónomos del Tecnológico de Monterrey, Campus Guadalajara.
                Diseñamos, programamos y probamos drones para competencias nacionales e internacionales.
            </p>
        </div>

        <!--Columna 2: Secciones y paginas del sitio-->
        <nav class="footer-columna" aria-label="Sitio">
            <h3>SITIO</h3>
            {#each enlacesSitio as enlace}
                <a href={enlace.href}>{enlace.texto}</a>
            {/each}
        </nav>

        <!--Columna 3: Proyectos de investigacion, cada uno enlaza a su repositorio-->
        <div class="footer-columna">
            <h3>PROYECTOS</h3>
            {#each proyectos as proyecto}
                <a href="{GITHUB}/{proyecto.repo}" target="_blank" rel="noopener noreferrer">{proyecto.texto}</a>
            {/each}
        </div>

        <!--Columna 4: Redes y plataformas (Discord solo para miembros con sesion)-->
        <div class="footer-columna">
            <h3>CONTACTO</h3>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2-.2 4.5-1 4.5-5 0-1.1-.4-2-1-2.7.1-.3.5-1.5-.1-3 0 0-1-.3-3 1.2a10 10 0 0 0-5.4 0C7.5 4.5 6.5 4.8 6.5 4.8c-.6 1.5-.2 2.7-.1 3-.6.7-1 1.6-1 2.7 0 4 2.5 4.8 4.5 5-.3.3-.5.9-.5 1.7V21" />
                </svg>
                GitHub
            </a>
            <a href="https://www.instagram.com/droneops.gdl/" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
                @droneops.gdl
            </a>
            {#if user}
                <a href="https://discord.gg/9Nhx4X7ud" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
                    </svg>
                    Discord
                </a>
            {/if}
            <a href="mailto:droneops@servicios.tec.mx">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                </svg>
                droneops@servicios.tec.mx
            </a>
        </div>
    </div>

    <!--Linea divisoria horizontal-->
    <div class="footer-divider"></div>

    <!--Seccion inferior: Derechos de autor y afiliacion institucional-->
    <div class="footer-bottom">
        <p>© 2026 DroneOps · Tecnológico de Monterrey, Campus Guadalajara</p>
    </div>
</footer>

<style>
    /*Estilos base del pie de pagina*/
    .footer {
        background-color: #0a0d14;
        color: #94a3b8;
        padding: 3.5rem 3rem 1.5rem;
        font-family: sans-serif;
    }

    /*Cuatro columnas: la descripcion es mas ancha que las de enlaces*/
    .footer-top {
        display: grid;
        grid-template-columns: 1.6fr 1fr 1.3fr 1fr;
        gap: 3rem;
        align-items: start;
    }

    /*Ancho maximo para la columna del logo y texto*/
    .footer-info {
        max-width: 420px;
    }

    /*Tamaño y margen del logo*/
    .logo img {
        height: 28px;
        margin-bottom: 1rem;
    }

    /*Estilo del texto descriptivo del grupo*/
    .descripcion {
        font-size: 0.9rem;
        line-height: 1.6;
        margin: 0;
    }

    /*Columnas de enlaces en lista vertical*/
    .footer-columna {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        align-items: flex-start;
    }

    /*Titulo de cada columna*/
    .footer-columna h3 {
        color: #ffffff;
        font-family: monospace;
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        margin: 0 0 0.25rem;
    }

    /*Enlaces de las columnas (con icono cuando lo tienen)*/
    .footer-columna a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.2s ease;
    }

    /*Cambia a blanco el color de los enlaces al pasar el cursor */
    .footer-columna a:hover {
        color: #ffffff;
    }

    /*Linea gris tenue para separar el contenido superior de los derechos*/
    .footer-divider {
        border-top: 1px solid #1e2230;
        margin: 2.5rem 0 1.5rem;
    }

    /*Texto del copyright*/
    .footer-bottom {
        font-size: 0.8rem;
    }

    .footer-bottom p {
        margin: 0;
    }

    /* RESPONSIVE para tablet: descripcion arriba y las tres columnas de enlaces debajo */
    @media (max-width: 1024px) {
        .footer-top {
            grid-template-columns: repeat(3, 1fr);
            gap: 2.5rem 2rem;
        }

        .footer-info {
            grid-column: 1 / -1;
            max-width: 560px;
        }
    }

    /* RESPONSIVE para el celular */
    @media (max-width: 768px) {
        /*Reduce el espacio interno general*/
        .footer {
            padding: 2.5rem 1.5rem 1.5rem;
        }

        /*Una sola columna: todo apilado*/
        .footer-top {
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        /*Permite que la informacion ocupe todo el ancho disponible*/
        .footer-info {
            max-width: 100%;
        }
    }
</style>
