<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';

	// Variables reactivas para guardar los datos
	let tareas = $state<any[]>([]);
	let cargando = $state(true);

	onMount(async () => {
		// Consulta
		const { data, error } = await supabase.from('tareas').select('*');

		if (error) {
			console.error('Error al cargar tareas de Supabase:', error);
		} else {
			tareas = data || [];
		}
		cargando = false;
	});
</script>

<div style="padding: 40px; color: white;">
	<h1>Tablero Kanban (Prueba de conexión)</h1>

	{#if cargando}
		<p>Cargando tareas desde Supabase...</p>
	{:else if tareas.length === 0}
		<p>No hay tareas registradas en la base de datos.</p>
	{:else}
		<ul style="list-style: none; padding: 0;">
			{#each tareas as tarea}
				<li style="background: #2a2a2a; margin-bottom: 12px; padding: 16px; border-radius: 8px;">
					<h3>{tarea.titulo}</h3>
					<p style="color: #aaa;">{tarea.comentarios || 'Sin comentarios'}</p>
					<p><strong>Estado:</strong> <code>{tarea.estado}</code></p>
					<p><strong>Asignado a:</strong> {tarea.asignado_a ? tarea.asignado_a.join(', ') : 'Nadie'}</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>

