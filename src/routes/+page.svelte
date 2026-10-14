<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import logoAncho from '$lib/assets/logo-prueba-colores.png';
	import logoEmblema from '$lib/assets/logo-prueba-emblema.png';
	import droneImg from '$lib/assets/Drone.jpeg';

	// Logos de la franja bajo el hero (DE PRUEBA: reemplazar por los patrocinadores reales)
	const logos = [
		{ src: logoAncho, alt: 'Logo de prueba 1', clase: 'h-14 sm:h-[72px]' },
		{ src: logoEmblema, alt: 'Logo de prueba 2', clase: 'h-24 sm:h-[140px]' },
		{ src: logoAncho, alt: 'Logo de prueba 3', clase: 'h-14 sm:h-[72px]' },
		{ src: logoEmblema, alt: 'Logo de prueba 4', clase: 'h-24 sm:h-[140px]' },
		{ src: logoAncho, alt: 'Logo de prueba 5', clase: 'h-14 sm:h-[72px]' },
		{ src: logoEmblema, alt: 'Logo de prueba 6', clase: 'h-24 sm:h-[140px]' }
	];

	// Carrusel de "¿Qué hacemos?" (Fotos de prueba con gatos B))
	const slides = [
		{ src: 'https://cataas.com/cat?width=1200&height=900&v=1', alt: 'Gato de prueba 1' },
		{ src: 'https://cataas.com/cat?width=1200&height=900&v=2', alt: 'Gato de prueba 2' },
		{ src: 'https://cataas.com/cat?width=1200&height=900&v=3', alt: 'Gato de prueba 3' },
		{ src: 'https://cataas.com/cat?width=1200&height=900&v=4', alt: 'Gato de prueba 4' }
	];
	const SEGUNDOS_POR_FOTO = 4;
	let slideActual = $state(0);

	// Cambia de foto sola. Como lee slideActual, el temporizador se reinicia
	// cada vez que cambia (también cuando alguien da clic en una franja).
	$effect(() => {
		const actual = slideActual;
		const id = setTimeout(() => {
			slideActual = (actual + 1) % slides.length;
		}, SEGUNDOS_POR_FOTO * 1000);
		return () => clearTimeout(id);
	});

	// Usamos SvelteSet para permitir múltiples secciones principales abiertas a la vez
	let openSections = $state(new SvelteSet<number>());

	function toggle(id: number) {
		if (openSections.has(id)) {
			openSections.delete(id);
		} else {
			openSections.add(id);
		}
	}

	// Set para subsecciones
	let openSubSections = $state(new SvelteSet<string | number>());

	function toggleSub(id: string | number) {
		if (openSubSections.has(id)) {
			openSubSections.delete(id);
		} else {
			openSubSections.add(id);
		}
	}
</script>

<!-- Espaciado entre secciones reducido en celular (space-y-12) y amplio en desktop (lg:space-y-32) -->
<div class="mx-auto max-w-[1440px] px-6 sm:px-12 py-6 sm:py-10 space-y-12 sm:space-y-20 lg:space-y-32 text-slate-900">
	<!-- HERO + FRANJA DE LOGOS (agrupados para que queden juntos y se vean sin hacer scroll) -->
	<div class="space-y-4 sm:space-y-8">
		<!-- 1. SECCIÓN HERO -->
		<section class="relative xl:flex xl:min-h-[420px] xl:items-center">
			<!-- Texto (columna izquierda, por encima de las imágenes) -->
			<div class="relative z-10 space-y-4 sm:space-y-6 xl:w-[60%]">
				<!-- Badge Superior -->
				<div class="inline-flex items-center gap-2 rounded-full border border-purple-400 bg-white px-4 py-1.5 font-mono text-xs font-semibold tracking-wider text-purple-700 uppercase">
					<span class="h-2 w-2 rounded-full bg-purple-600"></span>
					Competidores internacionales 2026
				</div>

				<!-- Título Principal -->
				<h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
					¡Bienvenido a la central de <br class="hidden sm:inline" /> DroneOps!
				</h1>

				<!-- Descripción -->
				<p class="text-base sm:text-lg text-slate-600 max-w-xl xl:max-w-[60%] leading-relaxed">
					Somos un equipo apasionado por la tecnología robótica, la innovación y la captura de datos desde las alturas. Diseñamos, operamos y optimizamos soluciones con drones para llevar cualquier proyecto al siguiente nivel.
				</p>

				<!-- Botones -->
				<div class="flex items-center gap-4 pt-2">
					<a href="/unete" class="rounded-xl bg-purple-600 px-6 sm:px-7 py-3 font-bold text-white shadow-md hover:bg-purple-700 transition-colors">
						Únete
					</a>
					<a href="/comunidad" class="rounded-xl border border-slate-400 bg-transparent px-6 sm:px-7 py-3 font-bold text-slate-800 hover:bg-slate-100 transition-colors">
						Conócenos
					</a>
				</div>
			</div>

			<!-- Imágenes encimadas (por ahora bloques de color; luego se cambian por fotos) -->
			<div class="relative mt-8 aspect-[1048/603] w-full xl:absolute xl:right-0 xl:top-1/2 xl:mt-0 xl:w-[52%] xl:-translate-y-[45%]">
				<div class="absolute right-0 top-0 h-[68%] w-[64%] bg-[#1f1f1f]"></div>
				<div class="absolute bottom-0 left-0 h-[68%] w-[64%] bg-[#777777] xl:-left-[10%]"></div>
			</div>
		</section>

		<!-- 1.1 FRANJA DE LOGOS (de prueba; reemplazar por patrocinadores reales) -->
		<section class="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
			{#each logos as logo}
				<img src={logo.src} alt={logo.alt} class="w-auto object-contain {logo.clase}" />
			{/each}
		</section>
	</div>

	<!-- 1.2 SECCIÓN QUÉ HACEMOS (carrusel + texto) -->
	<section class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
		<!-- Carrusel (izquierda): las fotos cambian solas y las franjas indican cuál se ve -->
		<div
			class="relative lg:col-span-7 aspect-[4/3] w-full overflow-hidden bg-[#1f1f1f]"
			aria-roledescription="carrusel"
			aria-label="Fotos de lo que hacemos en DroneOps"
		>
			{#each slides as slide, i}
				<img
					src={slide.src}
					alt={slide.alt}
					class={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === slideActual ? 'opacity-100' : 'opacity-0'}`}
				/>
			{/each}

			<!-- Degradado oscuro abajo para que las franjas se vean sobre cualquier foto -->
			<div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent)]"></div>

			<!-- Franjas: una por foto; la de la foto actual se ilumina -->
			<div class="absolute inset-x-0 bottom-0 flex gap-3 px-6 pb-4 sm:gap-4 sm:px-8 sm:pb-6">
				{#each slides as _, i}
					<button
						type="button"
						onclick={() => (slideActual = i)}
						aria-label={`Ver foto ${i + 1}`}
						aria-current={i === slideActual}
						class="group flex-1 py-2"
					>
						<span
							class={`block h-0.5 w-full transition-colors duration-300 ${i === slideActual ? 'bg-white' : 'bg-white/30 group-hover:bg-white/60'}`}
						></span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Texto (derecha) -->
		<div class="lg:col-span-5 space-y-4 sm:space-y-6">
			<h2 class="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight lg:text-right">
				¿Qué hacemos en <br class="hidden sm:inline" /> DroneOps?
			</h2>
			<p class="text-sm sm:text-base text-slate-600 leading-relaxed">
				Lorem veritatis cursus, ambientia stellarum nocte tranquilla refulget. Tempestates antique per silvas resonabant, et silentium profundum omnia tegebat. Nullus metus, nulla cura, sed cursus perpetuus fluminum ad mare festinans. Architectura mentis verba nova creat, paginas implet et spatium graphicum format, ut oculus lectoris formam potius quam sententiam intueatur.
			</p>
			<p class="text-sm sm:text-base text-slate-600 leading-relaxed">
				Lorem veritatis cursus, ambientia stellarum nocte tranquilla refulget. Tempestates antique per silvas resonabant, et silentium profundum omnia tegebat. Nullus metus, nulla cura, sed cursus perpetuus fluminum ad mare festinans. Architectura mentis verba nova creat, paginas implet et spatium graphicum format, ut oculus lectoris formam potius quam sententiam intueatur.
			</p>
		</div>
	</section>

	<!-- 2. SECCIÓN NUESTRO OBJETIVO -->
	<section id="objetivo" class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center scroll-mt-28 lg:scroll-mt-36">
		<div class="lg:col-span-7 space-y-4 sm:space-y-6">
			<div>
				<span class="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600">Nuestro Objetivo</span>
				<h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">Competencias internacionales</h2>
			</div>

			<p class="text-slate-600 leading-relaxed max-w-2xl text-sm sm:text-base">
				En DroneOps, nos proyectamos hacia el futuro de la industria aérea no tripulada. Transformamos la perspectiva de los proyectos mediante tecnología de vanguardia, precisión técnica y máxima seguridad operativa.
			</p>

			<div class="space-y-3 sm:space-y-4 pt-1 sm:pt-2 max-w-2xl">
				<div class="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 sm:p-6 relative">
					<div class="flex items-center justify-between">
						<h3 class="text-lg sm:text-xl font-extrabold text-purple-950">TMR</h3>
						<span class="rounded-full border border-purple-300 bg-purple-100 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-purple-700 uppercase">
							En Progreso
						</span>
					</div>
					<p class="text-xs text-slate-500 mt-1">Torneo Mexicano de Robótica (TMR)</p>
					<p class="text-xs sm:text-sm text-slate-700 mt-2 sm:mt-3">
						La competencia de robótica aérea más grande de México, organizada por la federación mexicana de robótica.
					</p>
				</div>

				<div class="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 sm:p-6 relative">
					<div class="flex items-center justify-between">
						<h3 class="text-lg sm:text-xl font-extrabold text-purple-950">IMAV 2026</h3>
						<span class="rounded-full border border-purple-300 bg-purple-100 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-purple-700 uppercase">
							En Progreso
						</span>
					</div>
					<p class="text-xs text-slate-500 mt-1">International Micro Air Vehicle Competition</p>
					<p class="text-xs sm:text-sm text-slate-700 mt-2 sm:mt-3">
						Navegación autónoma de enjambres en entornos outdoor complejos sin soporte de GPS externo.
					</p>
				</div>
			</div>
		</div>

		<div class="lg:col-span-5 flex justify-center lg:justify-end">
			<img
				src={droneImg}
				alt="Drone DroneOps"
				class="w-full max-w-md rounded-2xl sm:rounded-[32px] object-cover shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100"
			/>
		</div>
	</section>

	<!-- 3. RECURSOS Y DOCUMENTACIÓN -->
	<section class="space-y-4 sm:space-y-6">
		<div>
			<span class="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600">Aprendizaje y Medios</span>
			<h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">Recursos y documentación</h2>
			<p class="text-slate-600 mt-2 max-w-3xl text-sm sm:text-base">
				En DroneOps fundamentamos nuestras operaciones en ingeniería de control, visión artificial y simulación avanzada. Compartimos nuestra base de conocimiento y guías de desarrollo para el equipo y la comunidad.
			</p>
		</div>

		<div class="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
			<!-- BOTÓN DESPLEGABLE 1: TUTORIALES -->
			<div class="rounded-2xl sm:rounded-3xl bg-stone-200/80 overflow-hidden shadow-sm transition-all">
				<button
					type="button"
					onclick={() => toggle(1)}
					class="w-full p-5 sm:p-8 text-left font-bold text-lg sm:text-2xl text-slate-900 flex items-center gap-3 sm:gap-4 hover:bg-stone-300/80 transition-colors"
				>
					<span class={`transform transition-transform duration-200 text-slate-700 text-xs sm:text-sm ${openSections.has(1) ? 'rotate-180' : ''}`}>
						▼
					</span>
					Tutoriales
				</button>

				{#if openSections.has(1)}
					<div class="p-5 sm:p-8 pt-0 text-xs sm:text-base text-slate-700 flex flex-col gap-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- TARJETA VIDEO 1 -->
							<div class="flex flex-col gap-2">
								<p class="font-semibold text-slate-900 text-sm sm:text-base">
									Instalar Ubuntu en Dual Boot
								</p>
								<div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
									<iframe
										class="absolute top-0 left-0 w-full h-full"
										src="https://www.youtube.com/embed/wIj7sHK0SkQ?si=X7sqnuJ-42Fdixnt" 
										title="Instalar Ubuntu" 
										frameborder="0" 
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
										referrerpolicy="strict-origin-when-cross-origin" 
										allowfullscreen>
									</iframe>
								</div>
							</div>

							<!-- TARJETA VIDEO 2 -->
							<div class="flex flex-col gap-2">
								<p class="font-semibold text-slate-900 text-sm sm:text-base">
									Simulación de drone dinámico
								</p>
								<div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
									<iframe 
										class="absolute top-0 left-0 w-full h-full"
										src="https://www.youtube.com/embed/2BhyKyzKAbM?si=AFIvXKjpyQt2Uc21" 
										title="YouTube video player" 
										frameborder="0" 
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
										referrerpolicy="strict-origin-when-cross-origin" 
										allowfullscreen>
									</iframe>
								</div>
							</div>

							<!-- TARJETA VIDEO 3 -->
							<div class="flex flex-col gap-2">
								<p class="font-semibold text-slate-900 text-sm sm:text-base">
									OptiTrack - Motive 3.0 | Quick Start Guide
								</p>
								<div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
									<iframe 
										class="absolute top-0 left-0 w-full h-full"
										src="https://www.youtube.com/embed/HyrHhaRVOaM?si=YCb2xZwZioIkRyBS" 
										title="YouTube video player" 
										frameborder="0" 
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
										referrerpolicy="strict-origin-when-cross-origin" 
										allowfullscreen>
									</iframe>
								</div>
							</div>

							<!-- TARJETA VIDEO 4 -->
							<div class="flex flex-col gap-2">
								<p class="font-semibold text-slate-900 text-sm sm:text-base">
									OptiTrack Mo-Cap System Setup, Calibration and ROS Integration Tutorial
								</p>
								<div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
									<iframe 
										class="absolute top-0 left-0 w-full h-full"
										src="https://www.youtube.com/embed/JvpxLf8VFvs?si=xirgSxEdHIUekpN8" 
										title="YouTube video player" 
										frameborder="0" 
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
										referrerpolicy="strict-origin-when-cross-origin" 
										allowfullscreen>
									</iframe>
								</div>
							</div>

							<!-- TARJETA VIDEO 5 -->
							<div class="flex flex-col gap-2">
								<p class="font-semibold text-slate-900 text-sm sm:text-base">
									Filtros de Kalman
								</p>
								<div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
									<iframe 
										class="absolute top-0 left-0 w-full h-full"
										src="https://www.youtube.com/embed/mwn8xhgNpFY?si=MZBN3BQGxreNElQj" 
										title="YouTube video player" 
										frameborder="0" 
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
										referrerpolicy="strict-origin-when-cross-origin" 
										allowfullscreen>
									</iframe>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- BOTÓN DESPLEGABLE 2: DOCUMENTACIÓN -->
			<div class="rounded-2xl sm:rounded-3xl bg-stone-200/80 overflow-hidden shadow-sm transition-all">
				<button
					type="button"
					onclick={() => toggle(2)}
					class="w-full p-5 sm:p-8 text-left font-bold text-lg sm:text-2xl text-slate-900 flex items-center gap-3 sm:gap-4 hover:bg-stone-300/80 transition-colors"
				>
					<span class={`transform transition-transform duration-200 text-slate-700 text-xs sm:text-sm ${openSections.has(2) ? 'rotate-180' : ''}`}>
						▼
					</span>
					Documentación
				</button>

				{#if openSections.has(2)}
					<div class="p-5 sm:p-8 pt-0 flex flex-col gap-3">
						<!-- SUB-SECCIÓN 1: TELLO -->
						<div class="rounded-xl bg-stone-300/50 overflow-hidden">
							<button
								type="button"
								onclick={() => toggleSub('tello')}
								class="w-full px-4 py-3 text-left font-semibold text-sm sm:text-base text-slate-800 flex items-center gap-2 hover:bg-stone-300 transition-colors"
							>
								<span class={`transform transition-transform duration-200 text-xs ${openSubSections.has('tello') ? 'rotate-180' : ''}`}>
									▼
								</span>
								Tello
							</button>

							{#if openSubSections.has('tello')}
								<div class="p-4 pt-2 flex flex-col gap-2 text-xs sm:text-sm">
									<a 
										href="https://dl-cdn.ryzerobotics.com/downloads/Tello/201806mul/Tello%20User%20Manual%20V1.0_ES.pdf" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🔗</span>
										<span class="font-medium underline">MANUAL DEL TELLO</span>
									</a>

									<a 
										href="https://github.com/damiafuentes/DJITelloPy" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🐙</span>
										<span class="font-medium">GitHub - damiafuentes/DJITelloPy</span>
									</a>
								</div>
							{/if}
						</div>

						<!-- SUB-SECCIÓN 2: ROS2 -->
						<div class="rounded-xl bg-stone-300/50 overflow-hidden">
							<button
								type="button"
								onclick={() => toggleSub('ros2')}
								class="w-full px-4 py-3 text-left font-semibold text-sm sm:text-base text-slate-800 flex items-center gap-2 hover:bg-stone-300 transition-colors"
							>
								<span class={`transform transition-transform duration-200 text-xs ${openSubSections.has('ros2') ? 'rotate-180' : ''}`}>
									▼
								</span>
								ROS2
							</button>

							{#if openSubSections.has('ros2')}
								<div class="p-4 pt-2 flex flex-col gap-2 text-xs sm:text-sm">
									<a 
										href="https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🔗</span> 
										<span class="font-medium">Ubuntu (deb packages) — ROS 2 Documentation</span>
									</a>
									<a 
										href="https://ardupilot.org/dev/docs/ros2-gazebo.html" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🌐</span> 
										<span class="font-medium">ROS 2 with Gazebo — Dev documentation</span>
									</a>
									
								</div>
							{/if}
						</div>
						<!-- SUB-SECCIÓN 3: OptiTrack -->
						<div class="rounded-xl bg-stone-300/50 overflow-hidden">
							<button
								type="button"
								onclick={() => toggleSub('OptiTrack')}
								class="w-full px-4 py-3 text-left font-semibold text-sm sm:text-base text-slate-800 flex items-center gap-2 hover:bg-stone-300 transition-colors"
							>
								<span class={`transform transition-transform duration-200 text-xs ${openSubSections.has('OptiTrack') ? 'rotate-180' : ''}`}>
									▼
								</span>
								OptiTrack
							</button>

							{#if openSubSections.has('OptiTrack')}
								<div class="p-4 pt-2 flex flex-col gap-2 text-xs sm:text-sm">
									<a 
										href="https://docs.optitrack.com" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🌐</span> 
										<span class="font-medium">OptiTrack Documentation | EXTERNAL OptiTrack Documentation</span>
									</a>
									<a 
										href="https://docs.optitrack.com/developer-tools/natnet-sdk" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🌐</span> 
										<span class="font-medium">NatNet SDK | EXTERNAL OptiTrack Documentation</span>
									</a>
									<a 
										href="https://github.com/L2S-lab/natnet_ros2/tree/main" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🐙</span> 
										<span class="font-medium">GitHub - ROS2 Driver for the NatNet</span>
									</a>
								</div>
							{/if}
						</div>
						<!-- SUB-SECCIÓN 4: Visión Computacional -->
						<div class="rounded-xl bg-stone-300/50 overflow-hidden">
							<button
								type="button"
								onclick={() => toggleSub('vision-computacional')}
								class="w-full px-4 py-3 text-left font-semibold text-sm sm:text-base text-slate-800 flex items-center gap-2 hover:bg-stone-300 transition-colors"
							>
								<span class={`transform transition-transform duration-200 text-xs ${openSubSections.has('vision-computacional') ? 'rotate-180' : ''}`}>
									▼
								</span>
								Visión Computacional
							</button>

							{#if openSubSections.has('vision-computacional')}
								<div class="p-4 pt-2 flex flex-col gap-2 text-xs sm:text-sm">
									<a 
										href="https://docs.opencv.org/4.13.0/dc/dbb/tutorial_py_calibration.html" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🔗</span> 
										<span class="font-medium">Calibración de Camara</span>
									</a>
								</div>
							{/if}
						</div>
												<!-- SUB-SECCIÓN 5: REPOS -->
						<div class="rounded-xl bg-stone-300/50 overflow-hidden">
							<button
								type="button"
								onclick={() => toggleSub('repos')}
								class="w-full px-4 py-3 text-left font-semibold text-sm sm:text-base text-slate-800 flex items-center gap-2 hover:bg-stone-300 transition-colors"
							>
								<span class={`transform transition-transform duration-200 text-xs ${openSubSections.has('repos') ? 'rotate-180' : ''}`}>
									▼
								</span>
								REPOS
							</button>

							{#if openSubSections.has('repos')}
								<div class="p-4 pt-2 flex flex-col gap-2 text-xs sm:text-sm">
									<a 
										href="https://github.com/rshum19/Crazyflie-CAD" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🐙</span> 
										<span class="font-medium">Crazyflie-CAD</span>
									</a>
									<a 
										href="https://github.com/L2S-lab/natnet_ros2" 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:underline transition-colors"
									>
										<span>🐙</span> 
										<span class="font-medium">NatNet ROS2</span>
									</a>
									
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		<!-- BOTÓN DESPLEGABLE 3: Drones -->
			<div class="rounded-2xl sm:rounded-3xl bg-stone-200/80 overflow-hidden shadow-sm transition-all">
				<button
					type="button"
					onclick={() => toggle(3)}
					class="w-full p-5 sm:p-8 text-left font-bold text-lg sm:text-2xl text-slate-900 flex items-center gap-3 sm:gap-4 hover:bg-stone-300/80 transition-colors"
				>
					<span class={`transform transition-transform duration-200 text-slate-700 text-xs sm:text-sm ${openSections.has(3) ? 'rotate-180' : ''}`}>
						▼
					</span>
					Drones
				</button>

				{#if openSections.has(3)}
					<div class="p-5 sm:p-8 pt-0 text-xs sm:text-base text-slate-700 flex flex-col gap-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- TARJETA VIDEO 1 -->
							<div class="flex flex-col gap-2">
								<p class="font-semibold text-slate-900 text-sm sm:text-base">	
								DJI TELLO - Tutorial and Quick Review
								</p>
								<div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
								 <iframe 
								    class="absolute top-0 left-0 w-full h-full"
									src="https://www.youtube.com/embed/pn84aprnqkA?si=kLnWcO_sCkZIUMKh" 
									title="YouTube video player" 
									frameborder="0" 
									allow="accelerometer; 
									autoplay; clipboard-write; 
									encrypted-media; gyroscope; 
									picture-in-picture; 
									web-share" 
									referrerpolicy="strict-origin-when-cross-origin" 
									allowfullscreen>
								 </iframe>
								</div>
							</div>

							<!-- TARJETA VIDEO 2 -->
							<div class="flex flex-col gap-2">
								<p class="font-semibold text-slate-900 text-sm sm:text-base">
									Air Series | Full guide & Test Flight
								</p>
								<div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
								 <iframe 
									class="absolute top-0 left-0 w-full h-full"
									src="https://www.youtube.com/embed/A3IiKlwFtwk?si=cIZyHvGwH5a0Pgm5" 
									title="YouTube video player" 
									frameborder="0" 
									allow="accelerometer; 
									autoplay; 
									clipboard-write; 
									encrypted-media; 
									gyroscope; 
									picture-in-picture; 
									web-share" 
									referrerpolicy="strict-origin-when-cross-origin" 
									allowfullscreen>
								 </iframe>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</section>
</div>