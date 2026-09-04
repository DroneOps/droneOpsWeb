<script lang="ts">
	import { enhance } from '$app/forms';
	import logoDO from '$lib/assets/logoDO.png';

	let mostrarPassword = $state(false);

	type LoginForm = {
		message?: string;
		email?: string;
	};

	let { form }: { form?: LoginForm } = $props();
</script>

<main class="login-container">
	<!-- Columna Izquierda: Imagen Banner -->
	<div class="banner-section">
		<img src={logoDO} alt="DroneOps Logo Ilustración" />
	</div>

	<!-- Columna Derecha: Formulario con lógica Supabase -->
	<div class="form-section">
		<h1>Iniciar sesión en<br />DroneOps</h1>

		<!-- Mensaje de error cuando falle la autenticación -->
		{#if form?.message}
			<div class="error-box">
				<span>{form.message}</span>
			</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="input-group">
				<label for="email">Correo electrónico:</label>
				<input
					type="email"
					id="email"
					name="email"
					value={form?.email ?? ''}
					required
					autocomplete="email"
				/>
			</div>

			<div class="input-group">
				<label for="password">Contraseña:</label>
				<div class="password-container">
					<input
						type={mostrarPassword ? 'text' : 'password'}
						id="password"
						name="password"
						required
						autocomplete="current-password"
					/>
					<button
						type="button"
						class="btn-toggle-password"
						onclick={() => (mostrarPassword = !mostrarPassword)}
						aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
						aria-pressed={mostrarPassword}
					>
						{#if mostrarPassword}
							<!-- ojo tachado: la contraseña está visible -->
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
								<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.4 20.4 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.5 20.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
								<line x1="1" y1="1" x2="23" y2="23" />
							</svg>
						{:else}
							<!-- ojo abierto: la contraseña está oculta -->
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<button type="submit" class="btn-login">Iniciar sesión</button>

			<p class="welcome-text">
				Bienvenido al acceso exclusivo para <span class="admin-tag">miembros</span>
			</p>
		</form>
	</div>
</main>

<style>
	/* Contenedor principal ajustado sin Header */
	.login-container {
		display: flex;
		width: 100%;
		height: calc(100vh - 70px);
	}

	/* Banner Izquierdo */
	.banner-section {
		width: 50%;
		height: 100%;
		background-color: #11052c;
	}

	.banner-section img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Sección de Formulario Derecha */
	.form-section {
		width: 50%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-left: 100px;
		background-color: #ffffff;
		color: #000000;
	}

	.form-section h1 {
		font-size: 38px;
		font-weight: 500;
		margin-bottom: 25px;
		line-height: 1.15;
		color: #000000;
		font-family: Arial, Helvetica, sans-serif;
	}

	/* Alerta de Error de Autenticación */
	.error-box {
		width: 380px;
		background-color: #fef2f2;
		border: 1px solid #f87171;
		color: #dc2626;
		padding: 10px 14px;
		border-radius: 4px;
		margin-bottom: 15px;
		font-size: 13px;
		font-family: Arial, Helvetica, sans-serif;
	}

	/* Campos de Entrada */
	.input-group {
		margin-bottom: 20px;
	}

	.input-group label {
		display: block;
		font-size: 14px;
		margin-bottom: 8px;
		color: #222222;
		font-family: Arial, Helvetica, sans-serif;
	}

	.input-group input {
		width: 380px;
		height: 38px;
		background-color: #d9d9d9;
		border: none;
		outline: none;
		padding: 0 12px;
		font-size: 14px;
		border-radius: 2px;
		color: #000000;
		box-sizing: border-box;
	}

	/* Contenedor de la contraseña + botón de mostrar/ocultar */
	.password-container {
		position: relative;
		width: 380px;
	}

	.password-container input {
		width: 100%;
		padding-right: 42px;
	}

	.btn-toggle-password {
		position: absolute;
		top: 50%;
		right: 10px;
		transform: translateY(-50%);
		background: none;
		border: none;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #555555;
		cursor: pointer;
	}

	.btn-toggle-password:hover {
		color: #8a2be2;
	}

	/* Botón de Submit Morado */
	.btn-login {
		width: 380px;
		height: 42px;
		background-color: #8a2be2;
		color: #ffffff;
		font-size: 15px;
		font-weight: bold;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		margin-top: 10px;
		margin-bottom: 16px;
		transition: background-color 0.2s ease;
		font-family: Arial, Helvetica, sans-serif;
	}

	.btn-login:hover {
		background-color: #7322c2;
	}

	/* Texto de bienvenida estilizado */
	.welcome-text {
		font-size: 13px;
		color: #555555;
		font-family: Arial, Helvetica, sans-serif;
	}

	.admin-tag {
		color: #8a2be2;
		font-weight: 800;
		letter-spacing: 0.5px;
	}
</style>