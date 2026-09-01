<script lang="ts">
	import { enhance } from '$app/forms';

	type LoginForm = {
		message?: string;
		email?: string;
	};

	// Recibir la respuesta de la acción (+page.server.ts)
	let { form }: { form?: LoginForm } = $props(); // En Svelte 5
</script>

<h1>Iniciar Sesión</h1>

<!-- Mostrar mensaje de error si las credenciales fallan -->
{#if form?.message}
	<p style="color: red; font-weight: bold;">{form.message}</p>
{/if}

<form method="POST" use:enhance>
	<label>
		Correo electrónico:
		<input type="email" name="email" value={form?.email ?? ''} required />
	</label>

	<label>
		Contraseña:
		<input type="password" name="password" required />
	</label>

	<button type="submit">Entrar</button>
</form>
