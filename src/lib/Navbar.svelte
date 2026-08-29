<script>
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
		<a href="/objetivo" on:click={() => menuAbierto = false}>Objetivo</a>
		<a href="/por-hacer" on:click={() => menuAbierto = false}>Por hacer</a>
		<a href="/comunidad" on:click={() => menuAbierto = false}>Comunidad</a>

		<!-- este boton solo se ve en cel-->
		<button class="btn-miembros btn-miembros-movil">
			Acceso Miembros
		</button>
	</div>

	<div class="actions">
		<button class="btn-miembros">
			Acceso Miembros
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<circle cx="12" cy="7" r="4"/>
				<path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
			</svg>
		</button>
	</div>

	<!-- boton hamburguesa, solo visible en cel -->
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

	.btn-miembros {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: 1px solid #2e3548;
		border-radius: 6px;
		color: #ffffff;
		padding: 0.5rem 1.2rem;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.btn-miembros:hover {
		border-color: #7c3aed; 
	}

	.btn-miembros-movil {
		display: none;
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

		.btn-miembros-movil {
			display: flex;
			justify-content: center;
			width: 100%;
		}
	}
</style>