<script lang="ts">
    // Obtiene la informacion de la sesion desde el store de SvelteKit, extrae el usuario y su nombre
    import { page } from '$app/stores';
    $: user = $page.data.user;
    $: nombre = $page.data.nombreUsuario;
    $: esSuperAdmin = $page.data.esSuperAdmin; //Extrae la propiedad de superadmin cargada desde +layout.server.ts

    // Estado para controlar si el menu movil esta abierto o cerrado
    let menuAbierto = false;

    function toggleMenu() {
        menuAbierto = !menuAbierto;
    }

    // Estado para controlar la apertura y envio del modal de añadir miembros
    let modalAbierto = false;
    let guardando = false;
    let mensajeError = '';
    let mensajeExito = '';

    // Variables para almacenar los campos del formulario de nuevo admin
    let nuevoUser = '';
    let nuevoEmail = '';
    let nuevaPassword = '';
    let nuevaArea = 'General';

    // Lista de categorias de area disponibles para la organizacion
    const categorias = ['General', 'Finanzas', 'Imagen', 'Responsabilidad social', 'Logistica'];

    // Abre el modal flotante y reinicia sus campos
    function abrirModal() {
        nuevoUser = '';
        nuevoEmail = '';
        nuevaPassword = '';
        nuevaArea = 'General';
        mensajeError = '';
        mensajeExito = '';
        modalAbierto = true;
        menuAbierto = false;
    }

    // Cierra el modal flotante
    function cerrarModal() {
        modalAbierto = false;
    }

    // Envia los datos del nuevo admin al endpoint de la API
    async function handleCrearAdmin(e: Event) {
        e.preventDefault();
        guardando = true;
        mensajeError = '';
        mensajeExito = '';

        try {
            const res = await fetch('/api/crear_admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: nuevoUser,
                    email: nuevoEmail,
                    password: nuevaPassword,
                    area: nuevaArea,
                    ve_todo: false // Se asigna false por defecto
                })
            });

            const result = await res.json();

            if (!res.ok) {
                mensajeError = result.error || 'No se pudo crear el usuario';
            } else {
                mensajeExito = result.message;
                //Cierra el modal automaticamente tras un breve retraso
                setTimeout(() => {
                    cerrarModal();
                }, 1500);
            }
        } catch (err) {
            mensajeError = 'Error de conexión con el servidor';
        }

        guardando = false;
    }
</script>

<!--Framework de navegacion principal-->
<nav class="navbar">
    <!--Logo de la organizacion-->
    <div class="logo">
        <a href="/">
            <img src="/logo.svg" alt="DRONE OPS" />
        </a>
    </div>

    <!--Enlaces de navegacion principal-->
    <div class="nav-links" class:abierto={menuAbierto}>
        <a href="/" on:click={() => menuAbierto = false}>Inicio</a>
        <a href="/#objetivo" on:click={() => menuAbierto = false}>Objetivo</a>
        <a href="/unete" on:click={() => menuAbierto = false}>Unirse</a>
        
        <!--Muestra la seccion si el usuario ha iniciado sesion-->
        {#if user}
            <a href="/por-hacer" on:click={() => menuAbierto = false}>Por hacer</a>
            <a href="/inventario" on:click={() => menuAbierto = false}>Inventario</a>
        {/if}
        
        <a href="/comunidad" on:click={() => menuAbierto = false}>Comunidad</a>

        <!--Boton exclusivo para superadmins en vista movil-->
        {#if user && esSuperAdmin}
            <button type="button" class="btn-add-admin-movil" on:click={abrirModal}>
                + Añadir Miembro
            </button>
        {/if}

        <!--Opciones de usuario para la vista movil-->
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

    <!--Opciones de usuario para la vista de escritorio-->
    <div class="actions">
        {#if user}
            <div class="user-badge-container">
                <!--Boton exclusivo para superadmins en vista escritorio-->
                {#if esSuperAdmin}
                    <button type="button" class="btn-add-admin" on:click={abrirModal} title="Añadir nuevo miembro">
                        + MIEMBRO
                    </button>
                {/if}

                <div class="user-badge">
                    <span class="user-email">{nombre || user.email}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="7" r="4"/>
                        <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
                    </svg>
                </div>
                <!--Formulario para cerrar sesion en escritorio-->
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

    <!--Boton tipo hamburguesa para desplegar el menu movil-->
    <button class="hamburguesa" on:click={toggleMenu} aria-label="Abrir menú">
        <span class:activa={menuAbierto}></span>
        <span class:activa={menuAbierto}></span>
        <span class:activa={menuAbierto}></span>
    </button>
</nav>

<!--Modal flotante emergente para registrar un nuevo miembro-->
{#if modalAbierto}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-backdrop" on:click={cerrarModal}>
        <div class="modal-card" on:click|stopPropagation>
            <div class="modal-header">
                <h3>REGISTRAR NUEVO MIEMBRO</h3>
                <button type="button" class="btn-close" on:click={cerrarModal}>✕</button>
            </div>

            <!--Mensajes dinamicos de error o exito-->
            {#if mensajeError}
                <div class="alert alert-error">{mensajeError}</div>
            {/if}
            {#if mensajeExito}
                <div class="alert alert-success">{mensajeExito}</div>
            {/if}

            <!--Formulario de registro de administrador-->
            <form on:submit={handleCrearAdmin} class="modal-form">
                <div class="field">
                    <label for="m-user">Alias / Nombre de usuario:</label>
                    <input type="text" id="m-user" bind:value={nuevoUser} placeholder="Ej. Nombre" required />
                </div>

                <div class="field">
                    <label for="m-email">Correo institucional (Tec):</label>
                    <input type="email" id="m-email" bind:value={nuevoEmail} placeholder="a0123456@tec.mx" required />
                </div>

                <div class="field">
                    <label for="m-password">Contraseña inicial:</label>
                    <input type="password" id="m-password" bind:value={nuevaPassword} placeholder="••••••••" required />
                </div>

                <div class="field">
                    <label for="m-area">Área asignada:</label>
                    <select id="m-area" bind:value={nuevaArea}>
                        {#each categorias as cat}
                            <option value={cat}>{cat}</option>
                        {/each}
                    </select>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-cancel" on:click={cerrarModal}>Cancelar</button>
                    <button type="submit" class="btn-save" disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Crear Administrador'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    /*Contenedor principal de la barra de navegacion*/
    .navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 3rem;
        background-color: #12151e; 
        border-bottom: 1px solid #1e2230;
        position: relative;
    }

    /*Tamaño de la imagen del logo*/
    .logo img {
        height: 32px;
    }

    /*Contenedor de los enlaces de navegacion*/
    .nav-links {
        display: flex;
        align-items: center;
        gap: 2.5rem;
    }

    /*Estilo de los enlaces individuales*/
    .nav-links a {
        color: #94a3b8;
        text-decoration: none;
        font-family: sans-serif;
        font-size: 0.95rem;
        transition: color 0.2s;
    }

    /*Cambia el color del enlace al pasar el cursor*/
    .nav-links a:hover {
        color: #ffffff;
    }

    /*Estilo base para el boton de miembros y la tarjeta de usuario*/
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

    /*Cursor para el boton de inicio de sesion*/
    .btn-miembros {
        cursor: pointer;
    }

    /*Efecto de borde morado al pasar el cursor por el boton de miembros*/
    .btn-miembros:hover {
        border-color: #7c3aed; 
    }

    /*Estilo del boton + MIEMBRO para superadmin en escritorio*/
    .btn-add-admin {
        background-color: #7c3aed;
        border: none;
        color: #ffffff;
        font-weight: bold;
        font-size: 0.75rem;
        padding: 0.55rem 0.9rem;
        border-radius: 6px;
        cursor: pointer;
        letter-spacing: 0.05em;
        transition: background-color 0.2s;
    }

    /*Efecto hover para el boton + MIEMBRO en escritorio*/
    .btn-add-admin:hover {
        background-color: #6d28d9;
    }

    /*Estilo del boton + MIEMBRO para superadmin en movil*/
    .btn-add-admin-movil {
        background-color: #7c3aed;
        border: none;
        color: #ffffff;
        font-weight: bold;
        width: 100%;
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
    }

    /*Diseño de la tarjeta de usuario autenticado*/
    .user-badge {
        border-color: #7c3aed;
        background-color: rgba(124, 58, 237, 0.1);
    }

    /*Texto del correo o nombre en la tarjeta de usuario*/
    .user-email {
        font-size: 0.85rem;
        color: #e2e8f0;
        font-weight: 500;
    }

    /*Oculta en escritorio los elementos exclusivos de movil*/
    .btn-miembros-movil, .user-display-movil, .btn-add-admin-movil {
        display: none;
    }

    /*Estilo del nombre del usuario en la vista movil*/
    .user-display-movil {
        color: #a78bfa;
        font-weight: 600;
        font-size: 0.9rem;
    }

    /*Boton hamburguesa oculto por defecto en escritorio*/
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

    /*Lineas horizontales del boton hamburguesa*/
    .hamburguesa span {
        width: 24px;
        height: 2px;
        background-color: #ffffff;
        transition: transform 0.3s, opacity 0.3s;
    }

    /*Transformacion de la primera linea en una X*/
    .hamburguesa span.activa:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
    }
    /*Oculta la linea central al activar el menu*/
    .hamburguesa span.activa:nth-child(2) {
        opacity: 0;
    }
    /*Transformacion de la tercera linea en una X*/
    .hamburguesa span.activa:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
    }

    /*RESPONSIVE del celular*/
    @media (max-width: 768px) {
        /*Reduce el padding lateral del navbar*/
        .navbar {
            padding: 1rem 1.5rem;
        }

        /*Muestra el boton hamburguesa*/
        .hamburguesa {
            display: flex;
        }

        /*Oculta el bloque de acciones de escritorio*/
        .actions {
            display: none;
        }

        /*Despliega los enlaces en formato de menu vertical movil*/
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

        /*Muestra el menu desplegable en movil al estar abierto*/
        .nav-links.abierto {
            display: flex;
        }

        /*Muestra y centra los elementos de usuario en movil*/
        .btn-miembros-movil, .user-display-movil, .btn-add-admin-movil {
            display: flex;
            justify-content: center;
            width: 100%;
        }
    }
    /*Contenedor de la tarjeta de usuario y el boton salir*/
    .user-badge-container {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    /*Boton para cerrar sesion en escritorio*/
    .btn-salir {
        background: transparent;
        border: 1px solid #ef4444;
        border-radius: 6px;
        color: #ef4444;
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    /*Efecto hover para el boton de salir en escritorio*/
    .btn-salir:hover {
        background-color: rgba(239, 68, 68, 0.1);
    }

    /*Boton para cerrar sesion en la vista movil*/
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

    /*Fondo oscuro con desenfoque para la capa trasera del modal*/
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    /*Tarjeta principal del modal flotante*/
    .modal-card {
        background-color: #161b22;
        border: 1px solid #334155;
        width: 100%;
        max-width: 28rem;
        border-radius: 1rem;
        padding: 1.5rem;
        color: #ffffff;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }

    /*Encabezado del modal flotante*/
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.2rem;
        border-bottom: 1px solid #1e293b;
        padding-bottom: 0.8rem;
    }

    /*Titulo del encabezado del modal*/
    .modal-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: #f1f5f9;
    }

    /*Boton para cerrar el modal*/
    .btn-close {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 1.1rem;
        cursor: pointer;
    }

    /*Disposición de los campos dentro del formulario del modal*/
    .modal-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    /*Contenedor individual de cada campo de texto/seleccion*/
    .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    /*Estilo de las etiquetas de los campos del modal*/
    .field label {
        font-size: 0.75rem;
        color: #94a3b8;
        font-weight: 600;
    }

    /*Estilo de las cajas de entrada y selectores del modal*/
    .field input, .field select {
        background-color: #0d1117;
        border: 1px solid #334155;
        border-radius: 0.5rem;
        color: #ffffff;
        padding: 0.55rem 0.75rem;
        font-size: 0.9rem;
    }

    /*Borde morado al enfocar los inputs del modal*/
    .field input:focus, .field select:focus {
        outline: none;
        border-color: #7c3aed;
    }

    /*Contenedor de los botones de accion del modal*/
    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    /*Boton para cancelar y cerrar el modal*/
    .btn-cancel {
        background: transparent;
        border: 1px solid #334155;
        color: #94a3b8;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.8rem;
        cursor: pointer;
    }

    /*Boton para enviar y guardar el nuevo admin*/
    .btn-save {
        background-color: #7c3aed;
        color: #ffffff;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.8rem;
        font-weight: bold;
        cursor: pointer;
    }

    /*Efecto hover para el boton de guardar*/
    .btn-save:hover {
        background-color: #6d28d9;
    }

    /*Estilo cuando el boton de guardar esta deshabilitado durante la carga*/
    .btn-save:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /*Estilo base para las alertas dentro del modal*/
    .alert {
        padding: 0.6rem 0.8rem;
        border-radius: 0.4rem;
        font-size: 0.8rem;
        margin-bottom: 0.8rem;
    }

    /*Alerta de error al fallar el registro*/
    .alert-error {
        background-color: #421c1c;
        color: #e57373;
        border: 1px solid #c62828;
    }

    /*Alerta de exito al completar el registro*/
    .alert-success {
        background-color: #1c4527;
        color: #81c784;
        border: 1px solid #2e7d32;
    }
</style>