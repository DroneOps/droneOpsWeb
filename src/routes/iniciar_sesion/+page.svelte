<script lang="ts">
	import { enhance } from '$app/forms';

	type LoginForm = {
		message?: string;
		email?: string;
	};

	// Recibir la respuesta de la acción (+page.server.ts)
	let { form }: { form?: LoginForm } = $props(); // En Svelte 5
</script>

<div class="login-container">
	<div class="login-card">
		<h1>Iniciar Sesión</h1>

		<!-- Mostrar mensaje de error si las credenciales fallan -->
		{#if form?.message}
			<div class="error-message">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
				<span>{form.message}</span>
			</div>
		{/if}

		<form method="POST" use:enhance class="login-form">
			<div class="form-group">
				<label for="email">Correo electrónico</label>
				<input 
					type="email" // type email para validación automática
					id="email" // id necesario para asociar el label con el input
					name="email" // name necesario para que SvelteKit capture el valor del input
					value={form?.email ?? ''} // Value para mantener el correo ingresado si hay un error
					required 
					placeholder="usuario@mail.com" // ejemplo si no hay nada puesto
				/>
			</div>

			<div class="form-group">
				<label for="password">Contraseña</label>
				<input 
					type="password" 
					id="password" 
					name="password" 
					required 
					placeholder="••••••••" 
				/>
			</div>

			<button type="submit" class="btn-submit">Entrar</button>
		</form>
	</div>
</div>

<style>
	/* Contenedor principal para centrar la tarjeta en la pantalla */
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 160px); /* Ajusta según el alto de tu navbar y footer */
		padding: 2rem;
		background-color: #0d0f17; 
	}

	/* Estilos de la tarjeta de inicio de sesión */
	.login-card {
		background-color: #12151e;
		border: 1px solid #1e2230;
		border-radius: 12px;
		padding: 2.5rem;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
	}

	h1 {
		color: #ffffff;
		font-family: sans-serif;
		font-size: 1.75rem;
		margin-top: 0;
		margin-bottom: 1.5rem;
		text-align: center;
		font-weight: 600;
	}

	/* Estilo amigable para los mensajes de error */
	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 1px solid #ef4444;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
		font-family: sans-serif;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		color: #94a3b8;
		font-family: sans-serif;
		font-size: 0.9rem;
	}

	/* Estilo de los inputs para contrastar correctamente con el fondo oscuro */
	input {
		background-color: #0a0d14;
		border: 1px solid #2e3548;
		color: #ffffff;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		font-family: sans-serif;
		transition: border-color 0.2s, box-shadow 0.2s;
		outline: none;
	}

	input::placeholder {
		color: #475569;
	}

	input:focus {
		border-color: #7c3aed;
		box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
	}

	/* Botón principal siguiendo la paleta morada de DroneOps */
	.btn-submit {
		background-color: #7c3aed;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		padding: 0.75rem;
		font-size: 1rem;
		font-family: sans-serif;
		font-weight: 600;
		cursor: pointer;
		margin-top: 0.5rem;
		transition: background-color 0.2s;
	}

	.btn-submit:hover {
		background-color: #6d28d9;
	}
</style>