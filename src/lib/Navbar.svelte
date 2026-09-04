<script>
    import { page } from '$app/stores';
    $: user = $page.data.user;
    $: nombre = $page.data.nombreUsuario;
    let menuAbierto = false;

    function toggleMenu() {
        menuAbierto = !menuAbierto;
    }
</script>

<nav class="navbar">
    <div class="logo">
        <a href="/">
            <img src="/logo.svg" alt="DRONE OPS" />
        </a>
    </div>

    <div class="nav-links" class:abierto={menuAbierto}>
        <a href="/" on:click={() => menuAbierto = false}>Inicio</a>
        <a href="/#objetivo" on:click={() => menuAbierto = false}>Objetivo</a>
        <a href="/unete" on:click={() => menuAbierto = false}>Unirse</a>
        
        <!-- Muestra 'Por hacer' solo si el usuario inició sesión -->
        {#if user}
            <a href="/por-hacer" on:click={() => menuAbierto = false}>Por hacer</a>
        {/if}
        
        <a href="/comunidad" on:click={() => menuAbierto = false}>Comunidad</a>

        <!-- Botón móvil: Cambia entre Acceso Miembros o Nombre de Usuario -->
        {#if user}
            <span class="user-display user-display-movil">
                {nombre || user.email}
            </span>
            <form action="/cerrar_sesion" method="POST" class="btn-miembros-movil" style="margin-top: 10px;">
                <button type="submit" class="btn-salir-movil" on:click={() => menuAbierto = false}>Cerrar Sesión</button>
            </form>
        {:else}
            <a href="/iniciar_sesion" class="btn-miembros btn-miembros-movil" on:click={() => menuAbierto = false}>
                Iniciar sesión
            </a>
        {/if}
    </div>

    <!-- Botón Escritorio: Cambia entre Acceso Miembros o Nombre de Usuario -->
    <div class="actions">
        {#if user}
            <div class="user-badge-container">
                <div class="user-badge">
                    <span class="user-email">{nombre || user.email}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="7" r="4"/>
                        <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
                    </svg>
                </div>
                <!-- Formulario para cerrar sesión -->
                <form action="/cerrar_sesion" method="POST">
                    <button type="submit" class="btn-salir">Salir</button>
                </form>
            </div>
        {:else}
            <a href="/iniciar_sesion" class="btn-miembros">
                Iniciar sesión
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
                </svg>
            </a>
        {/if}
    </div>

    <!-- Botón hamburguesa -->
    <button class="hamburguesa" on:click={toggleMenu} aria-label="Abrir menú">
        <span class:activa={menuAbierto}></span>
        <span class:activa={menuAbierto}></span>
        <span class:activa={menuAbierto}></span>
    </button>
</nav>

<style>
    .navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 3rem;
        background-color: #12151e; 
        border-bottom: 1px solid #1e2230;
        position: relative;
    }

    .logo img {
        height: 32px;
    }

    .nav-links {
        display: flex;
        align-items: center;
        gap: 2.5rem;
    }

    .nav-links a {
        color: #94a3b8;
        text-decoration: none;
        font-family: sans-serif;
        font-size: 0.95rem;
        transition: color 0.2s;
    }

    .nav-links a:hover {
        color: #ffffff;
    }

    .btn-miembros, .user-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: transparent;
        border: 1px solid #2e3548;
        border-radius: 6px;
        color: #ffffff;
        padding: 0.5rem 1.2rem;
        font-size: 0.9rem;
        text-decoration: none;
    }

    .btn-miembros {
        cursor: pointer;
    }

    .btn-miembros:hover {
        border-color: #7c3aed; 
    }

    .user-badge {
        border-color: #7c3aed;
        background-color: rgba(124, 58, 237, 0.1);
    }

    .user-email {
        font-size: 0.85rem;
        color: #e2e8f0;
        font-weight: 500;
    }

    .btn-miembros-movil, .user-display-movil {
        display: none;
    }

    .user-display-movil {
        color: #a78bfa;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .hamburguesa {
        display: none;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 8px;
    }

    .hamburguesa span {
        width: 24px;
        height: 2px;
        background-color: #ffffff;
        transition: transform 0.3s, opacity 0.3s;
    }

    .hamburguesa span.activa:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
    }
    .hamburguesa span.activa:nth-child(2) {
        opacity: 0;
    }
    .hamburguesa span.activa:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
    }

    @media (max-width: 768px) {
        .navbar {
            padding: 1rem 1.5rem;
        }

        .hamburguesa {
            display: flex;
        }

        .actions {
            display: none;
        }

        .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background-color: #12151e;
            border-bottom: 1px solid #1e2230;
            padding: 1.5rem;
            gap: 1.5rem;
        }

        .nav-links.abierto {
            display: flex;
        }

        .btn-miembros-movil, .user-display-movil {
            display: flex;
            justify-content: center;
            width: 100%;
        }
    }
    .user-badge-container {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .btn-salir {
        background: transparent;
        border: 1px solid #ef4444; /* Rojo para denotar salida */
        border-radius: 6px;
        color: #ef4444;
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-salir:hover {
        background-color: rgba(239, 68, 68, 0.1);
    }

    .btn-salir-movil {
        background: transparent;
        border: 1px solid #ef4444;
        color: #ef4444;
        width: 100%;
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
    }
</style>