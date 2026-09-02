<script lang="ts">
	import { enhance } from '$app/forms';
	import logoDO from '$lib/assets/logoDO.png';

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
				<input
					type="password"
					id="password"
					name="password"
					required
					autocomplete="current-password"
				/>
			</div>

			<button type="submit" class="btn-login">Iniciar sesión</button>

			<p class="welcome-text">
				Bienvenido al acceso <span class="admin-tag">admin</span>
			</p>
		</form>
	</div>
</main>

<style>
	/* Contenedor principal ajustado sin Header */
	.login-container {
		display: flex;
		width: 100%;
		height: calc(100vh - 60px);
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