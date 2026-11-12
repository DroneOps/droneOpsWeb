<script lang="ts">
	import type { Proyecto } from './tipos';
	
	let { proyectos }: { proyectos: Proyecto[] } = $props();
</script>

<div class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-bold text-slate-800">Calendario en construcción 🚧</h2>
	<p class="text-sm text-slate-500">Aquí recibimos {proyectos.length} proyectos.</p>
</div>