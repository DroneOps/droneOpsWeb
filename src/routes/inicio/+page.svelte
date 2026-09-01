<script lang="ts">
	import insanosImg from '$lib/assets/Insanos.jpg';
	import droneImg from '$lib/assets/Drone.jpg';

	let openSection = $state<number | null>(null);

	function toggle(id: number) {
		openSection = openSection === id ? null : id;
	}
</script>

<!-- Contenedor estirado a 1440px de ancho -->
<div class="mx-auto max-w-[1440px] px-8 sm:px-12 py-10 space-y-32 text-slate-900">
	<!-- 1. SECCIÓN HERO -->
	<section class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
		<!-- Texto (Ocupa 7 columnas para extender el título como Figma) -->
		<div class="lg:col-span-7 space-y-6">
			<!-- Badge Superior -->
			<div class="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-purple-700 uppercase">
				<span class="h-2 w-2 rounded-full bg-purple-600"></span>
				Competidores Internacionales 2026
			</div>

			<!-- Título Principal en 2 líneas -->
			<h1 class="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-950 leading-[1.15]">
				¡Bienvenido a la central de <br class="hidden sm:inline" /> DroneOps!
			</h1>

			<!-- Descripción -->
			<p class="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
				Somos un equipo apasionado por la tecnología robótica, la innovación y la captura de datos desde las alturas. Diseñamos, operamos y optimizamos soluciones con drones para llevar cualquier proyecto al siguiente nivel.
			</p>

			<!-- Botones -->
			<div class="flex items-center gap-4 pt-2">
				<a href="/crear_cuenta" class="rounded-xl bg-purple-600 px-7 py-3 font-bold text-white shadow-md hover:bg-purple-700 transition-colors">
					Únete
				</a>
				<a href="/por-hacer" class="rounded-xl border border-slate-400 bg-transparent px-7 py-3 font-bold text-slate-800 hover:bg-slate-100 transition-colors">
					Por hacer
				</a>
			</div>
		</div>

		<!-- Imagen sin marco blanco flotante (5 columnas) -->
		<div class="lg:col-span-5 flex justify-center lg:justify-end">
			<img
				src={insanosImg}
				alt="Equipo DroneOps"
				class="w-full max-w-xl rounded-[32px] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100"
			/>
		</div>
	</section>

	<!-- 2. SECCIÓN NUESTRO OBJETIVO -->
	<section class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
		<div class="lg:col-span-7 space-y-6">
			<div>
				<span class="text-sm font-bold uppercase tracking-wider text-purple-600">Nuestro Objetivo</span>
				<h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Competencias internacionales</h2>
			</div>

			<p class="text-slate-600 leading-relaxed max-w-2xl">
				En DroneOps, nos proyectamos hacia el futuro de la industria aérea no tripulada. Transformamos la perspectiva de los proyectos mediante tecnología de vanguardia, precisión técnica y máxima seguridad operativa.
			</p>

			<div class="space-y-4 pt-2 max-w-2xl">
				<div class="rounded-2xl border border-purple-200 bg-purple-50/60 p-6 relative">
					<div class="flex items-center justify-between">
						<h3 class="text-xl font-extrabold text-purple-950">TMR</h3>
						<span class="rounded-full border border-purple-300 bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-700 uppercase">
							En Progreso
						</span>
					</div>
					<p class="text-xs text-slate-500 mt-1">Torneo Mexicano de Robótica (TMR)</p>
					<p class="text-sm text-slate-700 mt-3">
						La competencia de robótica aérea más grande de México, organizada por la federación mexicana de robótica.
					</p>
				</div>

				<div class="rounded-2xl border border-purple-200 bg-purple-50/60 p-6 relative">
					<div class="flex items-center justify-between">
						<h3 class="text-xl font-extrabold text-purple-950">IMAV 2026</h3>
						<span class="rounded-full border border-purple-300 bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-700 uppercase">
							En Progreso
						</span>
					</div>
					<p class="text-xs text-slate-500 mt-1">International Micro Air Vehicle Competition</p>
					<p class="text-sm text-slate-700 mt-3">
						Navegación autónoma de enjambres en entornos outdoor complejos sin soporte de GPS externo.
					</p>
				</div>
			</div>
		</div>

		<div class="lg:col-span-5 flex justify-center lg:justify-end">
			<img
				src={droneImg}
				alt="Drone DroneOps"
				class="w-full max-w-md rounded-[32px] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100"
			/>
		</div>
	</section>

	<!-- 3. RECURSOS Y DOCUMENTACIÓN -->
	<section class="space-y-6">
		<div>
			<span class="text-sm font-bold uppercase tracking-wider text-purple-600">Aprendizaje y Medios</span>
			<h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Recursos y documentación</h2>
			<p class="text-slate-600 mt-2 max-w-3xl">
				En DroneOps fundamentamos nuestras operaciones en ingeniería de control, visión artificial y simulación avanzada. Compartimos nuestra base de conocimiento y guías de desarrollo para el equipo y la comunidad.
			</p>
		</div>

		<div class="space-y-4 pt-4">
			<div class="rounded-3xl bg-stone-200/80 overflow-hidden shadow-sm transition-all">
				<button
					type="button"
					onclick={() => toggle(1)}
					class="w-full p-6 sm:p-8 text-left font-bold text-xl sm:text-2xl text-slate-900 flex items-center gap-4 hover:bg-stone-300/80 transition-colors"
				>
					<span class={`transform transition-transform duration-200 text-slate-700 text-sm ${openSection === 1 ? 'rotate-180' : ''}`}>
						▼
					</span>
					Software Base y Simulación
				</button>
				{#if openSection === 1}
					<div class="p-6 sm:p-8 pt-0 text-slate-700">
						Entornos de desarrollo, guías de simulación con ROS2, Gazebo, PX4 y herramientas de software base para el control de enjambres.
					</div>
				{/if}
			</div>

			<div class="rounded-3xl bg-stone-200/80 overflow-hidden shadow-sm transition-all">
				<button
					type="button"
					onclick={() => toggle(2)}
					class="w-full p-6 sm:p-8 text-left font-bold text-xl sm:text-2xl text-slate-900 flex items-center gap-4 hover:bg-stone-300/80 transition-colors"
				>
					<span class={`transform transition-transform duration-200 text-slate-700 text-sm ${openSection === 2 ? 'rotate-180' : ''}`}>
						▼
					</span>
					Control, Estimación y Posicionamiento
				</button>
				{#if openSection === 2}
					<div class="p-6 sm:p-8 pt-0 text-slate-700">
						Documentación sobre algoritmos de control PID, filtros de Kalman, Odometría Visual Inercial (VIO) y navegación sin GPS.
					</div>
				{/if}
			</div>

			<div class="rounded-3xl bg-stone-200/80 overflow-hidden shadow-sm transition-all">
				<button
					type="button"
					onclick={() => toggle(3)}
					class="w-full p-6 sm:p-8 text-left font-bold text-xl sm:text-2xl text-slate-900 flex items-center gap-4 hover:bg-stone-300/80 transition-colors"
				>
					<span class={`transform transition-transform duration-200 text-slate-700 text-sm ${openSection === 3 ? 'rotate-180' : ''}`}>
						▼
					</span>
					Documentación Oficial y Librerías
				</button>
				{#if openSection === 3}
					<div class="p-6 sm:p-8 pt-0 text-slate-700">
						Acceso a repositorios oficiales de GitHub, diagramas esquemáticos de hardware y manuales de usuario.
					</div>
				{/if}
			</div>
		</div>
	</section>
</div>