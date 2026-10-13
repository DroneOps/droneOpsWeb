<script lang="ts">
    // Obtiene la informacion de la sesion desde el store de SvelteKit, extrae el usuario y su nombre
    import { page } from '$app/stores';
    $: user = $page.data.user;
    $: nombre = $page.data.nombreUsuario;
    $: esSuperAdmin = $page.data.esSuperAdmin; //Extrae la propiedad de superadmin cargada desde +layout.server.ts
</script>
<footer class="footer">
    <!--Seccion superior: Informacion principal y enlaces de comunidad-->
    <div class="footer-top">
        <!--Columna izquierda: Logo y descripcion de DroneOps-->
        <div class="footer-info">
            <div class="logo">
                <img src="/logo.svg" alt="DRONE OPS" />
            </div>
            <p class="descripcion">
                Grupo de tecnología y robótica aérea de vanguardia.<br />
                Diseñando autonomía, rompiendo barreras internacionales.
            </p>
            <p class="link-asociacion">
                Asociación de Robótica de la Universidad
            </p>
        </div>

        <!--Columna derecha: Enlaces a redes y plataformas-->
        <div class="footer-comunidad">
            <h3>COMUNIDAD</h3>
            <a href="https://github.com/DroneOps" target="_blank">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2-.2 4.5-1 4.5-5 0-1.1-.4-2-1-2.7.1-.3.5-1.5-.1-3 0 0-1-.3-3 1.2a10 10 0 0 0-5.4 0C7.5 4.5 6.5 4.8 6.5 4.8c-.6 1.5-.2 2.7-.1 3-.6.7-1 1.6-1 2.7 0 4 2.5 4.8 4.5 5-.3.3-.5.9-.5 1.7V21" />
                </svg>
                GitHub
            </a>
            <a href="https://www.instagram.com/droneops.gdl/" target="_blank">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
                Instagram
            </a>
            {#if user}
                <a href="https://discord.gg/9Nhx4X7ud" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-discord" viewBox="0 0 16 16">
                        <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
                    </svg>
                    Discord
                </a>
            {/if}
        </div>
    </div>

    <!--Linea divisoria horizontal-->
    <div class="footer-divider"></div>

    <!--Seccion inferior: Derechos de autor y afiliacion institucional-->
    <div class="footer-bottom">
        <p>© 2026 DroneOps. Todos los derechos reservados.</p>
        <p>Instituto Tecnológico y de Estudios Superiores de Monterrey, Campus Guadalajara · TEC</p>
    </div>
</footer>

<style>
    /*Estilos base del pie de pagina*/
    .footer {
        background-color: #0a0d14;
        color: #94a3b8;
        padding: 3rem 3rem 1.5rem;
        font-family: sans-serif;
    }

    /*Distribuye el bloque de informacion y el de comunidad a los extremos*/
    .footer-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    /*Ancho maximo para la columna del logo y texto*/
    .footer-info {
        max-width: 500px;
    }

    /*Tamaño y margen del logo*/
    .logo img {
        height: 28px;
        margin-bottom: 1rem;
    }

    /*Estilo del texto descriptivo del grupo*/
    .descripcion {
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 0.75rem;
    }

    /*Estilo del nombre de la asociacion*/
    .link-asociacion {
        color: #7c3aed;
        font-family: monospace;
        font-size: 0.85rem;
        text-decoration: none;
    }

    /*Titulo de la columna de enlaces*/
    .footer-comunidad h3 {
        color: #ffffff;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
        margin-bottom: 1rem;
    }

    /*Organiza los enlaces de redes sociales en una lista vertical*/
    .footer-comunidad {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        align-items: flex-start;
    }

    /*Alineacion de los iconos SVG junto a los nombres de las redes*/
    .footer-comunidad a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.2s ease;
    }

    /*Cambia a blanco el color de los enlaces al pasar el cursor */
    .footer-comunidad a:hover {
        color: #ffffff;
    }

    /*Linea gris tenue para separar el contenido superior de los derechos*/
    .footer-divider {
        border-top: 1px solid #1e2230;
        margin: 2.5rem 0 1.5rem;
    }

    /* Alineacion horizontal del copyright y el texto del Tec */
    .footer-bottom {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
    }

    /* RESPONSIVE para el celular */
    @media (max-width: 768px) {
        /*Reduce el espacio interno general*/
        .footer {
            padding: 2.5rem 1.5rem 1.5rem;
        }

        /*Cambia el diseño de 2 columnas a una lista vertical*/
        .footer-top {
            flex-direction: column;
            gap: 2rem;
        }

        /*Permite que la informacion ocupe todo el ancho disponible*/
        .footer-info {
            max-width: 100%;
        }

        /*Apila los textos del copyright uno debajo del otro*/
        .footer-bottom {
            flex-direction: column;
            gap: 0.5rem;
            text-align: left;
        }
    }
</style>