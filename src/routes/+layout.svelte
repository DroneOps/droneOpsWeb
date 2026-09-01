<script lang="ts">
	import droneops from '$lib/assets/logo.png';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={droneops} />
</svelte:head>

<nav class="navbar">
	<Navbar />
</nav>

<main class="contenido-principal">
	{@render children()}
</main>

<nav class="footer">
	<Footer />
</nav>

<style>
	:global(body) {
		margin: 0;
		background-color: #ffffff; 
		color: white;
	}

	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 1000;
	}

	.contenido-principal {
		padding-top: 70px; 
		margin-bottom: 0px; /*No se nota*/
	}
</style>
