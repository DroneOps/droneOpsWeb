<script lang="ts">
	// Autor: Miguel Tovar
	// Proyectos del equipo que se muestran en la galería. Para agregar uno, añade un objeto a la lista.

	// Barras de muestra para la tarjeta de MogOps (solo decorativas)
	const muestra = [
		{ nombre: 'Simetría', valor: 8.4 },
		{ nombre: 'Inclinación cantal', valor: 9.1 },
		{ nombre: 'Ancho de mandíbula', valor: 7.6 }
	];
</script>

<svelte:head>
	<title>Juegos · DroneOps</title>
</svelte:head>

<div class="mx-auto max-w-[1440px] px-6 sm:px-12 py-6 sm:py-10 space-y-12 sm:space-y-20 text-slate-900">
	<!-- 1. ENCABEZADO -->
	<section class="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
		<div class="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-purple-700 uppercase">
			<span class="h-2 w-2 rounded-full bg-purple-600"></span>
			Zona de juegos
		</div>
		<h1 class="text-3xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-950 leading-tight lg:leading-[1.15]">
			Juegos
		</h1>
		<p class="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
			Lo que construimos entre tiempos libres para desarrollar nuestras habilidades computacionales mediante proyectos divertidos. Algunos proyectos se pueden probar aquí mismo.
		</p>
	</section>

	<!-- 2. PROYECTO DESTACADO: MOGOPS -->
	<section class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
		<div class="lg:col-span-7 space-y-4 sm:space-y-6">
			<div>
				<span class="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600">Destacado · Juego</span>
				<h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">MogOps</h2>
			</div>
			<p class="text-slate-600 leading-relaxed max-w-2xl text-sm sm:text-base">
				Un modelo de visión que califica tu cara del 0 al 10 en tiempo real, con 478 puntos faciales y proporciones aprendidas de miles de calificaciones humanas. Tiene modo meme: levanta una ceja o pon cara de "hunter eyes" para subir puntos.
			</p>
			<div class="flex flex-wrap gap-2">
				{#each ['MediaPipe', 'Visión', 'En tu dispositivo'] as etiqueta (etiqueta)}
					<span class="rounded-full border border-purple-300 bg-purple-100 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-purple-700 uppercase">
						{etiqueta}
					</span>
				{/each}
			</div>
			<div class="flex items-center gap-4 pt-2">
				<a href="/juegos/mogops" class="rounded-xl bg-purple-600 px-6 sm:px-7 py-3 font-bold text-white shadow-md hover:bg-purple-700 transition-colors">
					Jugar
				</a>
				<a
					href="https://github.com/DroneOps/MogOps"
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-xl border border-slate-400 bg-transparent px-6 sm:px-7 py-3 font-bold text-slate-800 hover:bg-slate-100 transition-colors"
				>
					Ver código
				</a>
			</div>
		</div>

		<!-- Vista previa de la tarjeta de calificación -->
		<div class="lg:col-span-5 flex justify-center lg:justify-end">
			<a
				href="/juegos/mogops"
				class="w-full max-w-md rounded-2xl sm:rounded-[32px] border border-purple-200 bg-purple-50/60 p-6 sm:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:border-purple-400 transition-colors"
			>
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold uppercase tracking-wider text-purple-600">Calificación</span>
					<span class="rounded-full border border-purple-300 bg-purple-100 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-purple-700 uppercase">
						En vivo
					</span>
				</div>
				<div class="mt-4 text-center">
					<div class="font-mono text-6xl sm:text-7xl font-extrabold tabular-nums tracking-tight text-purple-950">9.1</div>
					<p class="mt-1 text-sm font-semibold text-slate-700">PSL 5.5 · Chadlite</p>
				</div>
				<ul class="mt-6 space-y-3">
					{#each muestra as barra (barra.nombre)}
						<li class="space-y-1.5">
							<div class="flex justify-between text-xs sm:text-sm">
								<span class="text-slate-700">{barra.nombre}</span>
								<span class="font-mono tabular-nums text-slate-500">{barra.valor.toFixed(1)}</span>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-purple-100">
								<div class="h-full rounded-full bg-purple-600" style="width: {barra.valor * 10}%"></div>
							</div>
						</li>
					{/each}
				</ul>
			</a>
		</div>
	</section>

	<p class="text-sm text-slate-600">
		¿Buscas nuestro código y proyectos de competencia?
		<a href="/proyectos" class="font-bold text-purple-700 hover:underline">Míralos en Proyectos →</a>
	</p>
</div>
