<script lang="ts">
	import logoAncho from '$lib/assets/logo-prueba-colores.png';
	import logoEmblema from '$lib/assets/logo-prueba-emblema.png';

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

	// Competencias de "Nuestro Objetivo" (fotos DE PRUEBA con gatos: reemplazar por fotos reales del TMR e IMAV)
	// Para agregar otra competencia, copia un bloque { ... } y cambia sus datos: las líneas y las fotos se ajustan solas.
	const competencias = [
		{
			nombre: 'TMR',
			subtitulo: 'Torneo Mexicano de Robótica (TMR)',
			descripcion: 'La competencia de robótica aérea más grande de México, organizada por la federación mexicana de robótica.',
			estado: 'En Progreso',
			fotos: [
				{ src: 'https://cataas.com/cat?width=600&height=600&v=5', alt: 'Foto de prueba del TMR 1' },
				{ src: 'https://cataas.com/cat?width=600&height=600&v=6', alt: 'Foto de prueba del TMR 2' }
			]
		},
		{
			nombre: 'IMAV 2026',
			subtitulo: 'International Micro Air Vehicle Competition',
			descripcion: 'Navegación autónoma de enjambres en entornos outdoor complejos sin soporte de GPS externo.',
			estado: 'En Progreso',
			fotos: [
				{ src: 'https://cataas.com/cat?width=600&height=600&v=7', alt: 'Foto de prueba del IMAV 1' },
				{ src: 'https://cataas.com/cat?width=600&height=600&v=8', alt: 'Foto de prueba del IMAV 2' }
			]
		}
	];
	let competenciaActual = $state(0);

	// Sección "Investigación" del inicio: muestra que, además de competir, el grupo investiga.
	// Los proyectos salen de los repositorios de github.com/DroneOps. Para agregar uno,
	// copia un bloque { ... } en `proyectos` y cambia sus datos.

	const GITHUB = 'https://github.com/DroneOps';

	const principal = {
		periodo: '2026',
		titulo: 'Navegación con filtro de Kalman bajo oclusiones visuales',
		descripcion:
			'Sistema de estimación de estado y vuelo autónomo para micro drones. Combina la detección de marcadores ArUco en tiempo real con un filtro de Kalman que sigue prediciendo la posición del dron cuando pierde de vista el marcador, y un control PID en lazo cerrado que mantiene la posición y la trayectoria.',
		etiquetas: ['Python', 'OpenCV', 'ArUco', 'Filtro de Kalman'],
		repo: 'Kalman-Navigation'
	};

	const proyectos = [
		{
			anio: '2026',
			titulo: 'Detección de sonido',
			descripcion:
				'Localización acústica para el TMR 2026: el dron sobrevuela cada caja candidata en las mismas condiciones y compara la energía del sonido en la banda de voz (300–3000 Hz) para encontrar la que pide auxilio, aunque haya ruido de los rotores.',
			etiquetas: ['ROS 2', 'ArduPilot', 'Audio'],
			repo: 'Sound_Localization',
			icono: 'sonido'
		},
		{
			anio: '2026',
			titulo: 'Control de posición con OptiTrack',
			descripcion:
				'Control PI de posición y orientación para un DJI Tello, retroalimentado por captura de movimiento OptiTrack en ROS 2. Incluye rutinas autónomas y diagnóstico por eje.',
			etiquetas: ['ROS 2', 'Python', 'OptiTrack'],
			repo: 'Tello-Optitrack',
			icono: 'camara'
		},
		{
			anio: '2026',
			titulo: 'Detección con cámara',
			descripcion:
				'Visión por computadora para que un DJI Tello detecte compuertas verdes, estime su posición en 3D con PnP y las cruce de forma autónoma, con filtros de Kalman y control PID.',
			etiquetas: ['Python', 'OpenCV', 'PnP'],
			repo: 'Gate_tmr_color',
			icono: 'foto'
		}
	];

	// Trazos de los íconos (estilo Lucide, 24x24)
	const iconos: Record<string, string> = {
		sonido: 'M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3',
		camara: 'm22 8-6 4 6 4V8ZM4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z',
		foto: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3ZM12 10a3 3 0 1 0 0 6a3 3 0 1 0 0-6'
	};

	// Gráfica del filtro de Kalman (ilustrativa): mediciones ArUco con ruido, estimación del filtro
	// y su banda de incertidumbre, que crece mientras el marcador está oculto.
	const OCLUSION = { inicio: 220, fin: 340 };
	const posicionReal = (x: number) => 160 - 60 * Math.sin(((x - 30) / 460) * Math.PI * 1.6);
	const incertidumbre = (x: number) =>
		x < OCLUSION.inicio
			? 7
			: x <= OCLUSION.fin
				? 7 + ((x - OCLUSION.inicio) / (OCLUSION.fin - OCLUSION.inicio)) * 28
				: Math.max(7, 35 - (x - OCLUSION.fin) * 0.6);
	const puntosX = Array.from({ length: 47 }, (_, i) => 30 + i * 10);
	const desvio = (x: number) => (x > OCLUSION.inicio && x < OCLUSION.fin + 40 ? 6 : 0);
	const estimacion = puntosX
		.map((x, i) => `${i === 0 ? 'M' : 'L'}${x} ${(posicionReal(x) + desvio(x)).toFixed(1)}`)
		.join(' ');
	const bandaKalman =
		puntosX.map((x, i) => `${i === 0 ? 'M' : 'L'}${x} ${(posicionReal(x) - incertidumbre(x)).toFixed(1)}`).join(' ') +
		' ' +
		[...puntosX].reverse().map((x) => `L${x} ${(posicionReal(x) + incertidumbre(x)).toFixed(1)}`).join(' ') +
		' Z';
	const mediciones = Array.from({ length: 24 }, (_, i) => 36 + i * 19)
		.filter((x) => x < OCLUSION.inicio || x > OCLUSION.fin)
		.map((x) => ({ x, y: posicionReal(x) + Math.sin(x * 12.9898) * 11 }));

	// Trayectoria medida de la rutina cuadrada (ilustrativa): recorta un poco las esquinas de la referencia
	const trayectoria =
		'M128 252 C122 200 126 110 132 64 C136 46 150 44 170 46 C240 50 320 44 372 48 C392 50 398 58 398 80 C396 150 402 200 396 238 C394 254 384 256 364 254 C300 250 220 258 150 256 C136 256 130 256 128 252 Z';
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
					Grupo Estudiantil
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

	<!-- 2. SECCIÓN NUESTRO OBJETIVO (competencias con líneas para cambiar entre ellas) -->
	<section id="objetivo" class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center scroll-mt-28 lg:scroll-mt-36">
		<!-- Texto y tarjeta de la competencia (izquierda) -->
		<div class="lg:col-span-6 space-y-4 sm:space-y-6">
			<div>
				<span class="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600">Nuestro Objetivo</span>
				<h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">Competencias internacionales</h2>
			</div>

			<p class="text-slate-600 leading-relaxed max-w-2xl text-sm sm:text-base">
				En DroneOps, nos proyectamos hacia el futuro de la industria aérea no tripulada. Transformamos la perspectiva de los proyectos mediante tecnología de vanguardia, precisión técnica y máxima seguridad operativa.
			</p>

			<!-- Tarjetas apiladas en la misma celda: la altura es la de la más grande, así nada "brinca" al cambiar -->
			<div class="grid max-w-2xl">
				{#each competencias as comp, i}
					<div
						aria-hidden={i !== competenciaActual}
						class={`col-start-1 row-start-1 rounded-2xl border border-purple-300 bg-purple-50/60 p-5 sm:p-6 transition-opacity duration-300 ${i === competenciaActual ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
					>
						<div class="flex items-center justify-between gap-3">
							<h3 class="text-lg sm:text-xl font-extrabold text-purple-950">{comp.nombre}</h3>
							<span class="rounded-full border border-purple-300 bg-purple-100 px-3 py-0.5 font-mono text-[10px] sm:text-xs font-bold text-purple-700 uppercase">
								{comp.estado}
							</span>
						</div>
						<p class="text-xs text-slate-500 mt-1">{comp.subtitulo}</p>
						<p class="text-xs sm:text-sm text-slate-700 mt-2 sm:mt-3">{comp.descripcion}</p>
					</div>
				{/each}
			</div>

			<!-- Líneas para cambiar de competencia: una por competencia, la activa se ilumina -->
			<div class="flex max-w-2xl justify-center gap-4">
				{#each competencias as comp, i}
					<button
						type="button"
						onclick={() => (competenciaActual = i)}
						aria-label={`Ver ${comp.nombre}`}
						aria-current={i === competenciaActual}
						title={comp.nombre}
						class="group w-24 py-3 sm:w-28"
					>
						<span
							class={`block h-0.5 w-full transition-colors duration-300 ${i === competenciaActual ? 'bg-purple-600' : 'bg-slate-300 group-hover:bg-slate-400'}`}
						></span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Fotos (derecha): dos cuadros iguales; cambian según la competencia elegida -->
		<div class="relative lg:col-span-6 aspect-[2/1] w-full">
			{#each competencias as comp, i}
				<div
					class={`absolute inset-0 grid grid-cols-2 gap-4 sm:gap-6 transition-opacity duration-500 ${i === competenciaActual ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
				>
					{#each comp.fotos as foto}
						<img src={foto.src} alt={foto.alt} class="h-full w-full bg-[#1f1f1f] object-cover" />
					{/each}
				</div>
			{/each}
		</div>
	</section>

	<!-- 2.1 SECCIÓN INVESTIGACIÓN (debajo de "Competencias internacionales") -->
	<section id="investigacion" class="space-y-12 sm:space-y-16 scroll-mt-28 lg:scroll-mt-36">
		<!-- Intro: fondo oscuro con brillo morado; texto (izquierda) y gráfica de trayectoria (derecha).
		     El margen calc(50% - 50vw) estira el fondo a todo el ancho de la pantalla, aunque el contenedor
		     de la página mida 1440px; el contenido de adentro se vuelve a centrar con el mismo ancho. -->
		<div class="relative mx-[calc(50%-50vw)] overflow-hidden bg-[#0b0f17] py-16 sm:py-24">
		<div class="mx-auto max-w-[1440px] px-6 sm:px-12">
			<!-- Cuadrícula de fondo -->
			<div class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

			<div class="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
				<div class="lg:col-span-6 space-y-4 sm:space-y-6">
					<div class="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-600/20 px-4 py-1.5 font-mono text-xs font-semibold tracking-wider text-purple-200 uppercase">
						<span class="h-2 w-2 rounded-full bg-purple-300"></span>
						Investigación y desarrollo
					</div>
					<h2 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
						Investigación
					</h2>
					<p class="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
						En DroneOps desarrollamos control no lineal, estimación de estado y visión por computadora para drones autónomos. Nuestro código es abierto y lo validamos en vuelo real con captura de movimiento.
					</p>
					<div class="flex flex-wrap items-center gap-4 pt-2">
						<a href="#investigacion-proyectos" class="rounded-xl bg-purple-600 px-6 sm:px-7 py-3 font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-colors">
							Ver proyectos
						</a>
						<a href={GITHUB} target="_blank" rel="noopener noreferrer" class="rounded-xl border border-white/20 bg-white/5 px-6 sm:px-7 py-3 font-bold text-white hover:bg-white/10 transition-colors">
							Nuestro GitHub
						</a>
					</div>
				</div>

				<!-- Panel con la rutina cuadrada del proyecto Tello + OptiTrack -->
				<figure class="lg:col-span-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1623] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.6)]">
					<div class="flex items-center gap-2 border-b border-white/5 px-4 sm:px-5 py-3">
						<span class="h-2.5 w-2.5 rounded-full bg-red-500/85"></span>
						<span class="h-2.5 w-2.5 rounded-full bg-amber-500/85"></span>
						<span class="h-2.5 w-2.5 rounded-full bg-green-500/85"></span>
						<span class="ml-1 truncate font-mono text-xs text-slate-400">tello_control · rutina_cuadrada</span>
						<span class="ml-auto rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-slate-300">ROS 2</span>
					</div>
					<svg viewBox="0 0 520 300" class="w-full" role="img" aria-label="Trayectoria del dron siguiendo una rutina cuadrada">
						<g stroke="#ffffff" stroke-opacity="0.05" stroke-width="1">
							{#each Array.from({ length: 13 }, (_, i) => 20 + i * 40) as x}<line x1={x} y1="10" x2={x} y2="290" />{/each}
							{#each Array.from({ length: 7 }, (_, i) => 30 + i * 40) as y}<line x1="20" y1={y} x2="500" y2={y} />{/each}
						</g>
						<rect x="120" y="40" width="280" height="220" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 6" />
						<path d={trayectoria} fill="none" stroke="#8b5cf6" stroke-opacity="0.35" stroke-width="10" stroke-linejoin="round" />
						<path d={trayectoria} fill="none" stroke="#c4b5fd" stroke-width="2.5" stroke-linejoin="round" />
						{#each [[120, 40], [400, 40], [400, 260], [120, 260]] as [cx, cy]}
							<circle {cx} {cy} r="5" fill="#0f1623" stroke="#94a3b8" stroke-width="1.5" />
						{/each}
						<circle cx="300" cy="46" r="15" fill="#a78bfa" fill-opacity="0.25" />
						<circle cx="300" cy="46" r="6" fill="#ede9fe" />
					</svg>
					<figcaption class="space-y-3 border-t border-white/5 bg-white/[0.03] px-4 sm:px-5 py-4">
						<div class="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-slate-400">
							<span class="flex items-center gap-2"><span class="w-5 border-t-2 border-dashed border-slate-500"></span>Referencia</span>
							<span class="flex items-center gap-2"><span class="w-5 border-t-2 border-purple-300"></span>Posición medida (OptiTrack)</span>
						</div>
						<div class="flex flex-wrap items-center justify-between gap-2">
							<code class="font-mono text-sm text-purple-200">v[k] = Kp·e[k] + Ki·Σ e[j]·Δt</code>
							<span class="font-mono text-xs text-slate-500">Control PI · Tello + OptiTrack</span>
						</div>
					</figcaption>
				</figure>
			</div>
		</div>
		</div>

		<!-- Proyectos destacados -->
		<div id="investigacion-proyectos" class="space-y-6 sm:space-y-8 scroll-mt-28 lg:scroll-mt-36">
			<div class="flex items-center justify-between gap-4">
				<span class="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600">Proyectos destacados</span>
				<a href={GITHUB} target="_blank" rel="noopener noreferrer" class="shrink-0 rounded-xl border border-slate-300 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors">
					Ver todo en GitHub →
				</a>
			</div>

			<!-- Proyecto principal -->
			<article class="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl border border-slate-900 bg-white shadow-sm transition hover:border-purple-600 hover:shadow-md">
				<div class="lg:col-span-6 space-y-4 sm:space-y-5 p-6 sm:p-10">
					<span class="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-3 py-1 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-700">
						<span class="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
						Investigación principal · {principal.periodo}
					</span>
					<h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">{principal.titulo}</h3>
					<p class="text-sm sm:text-base text-slate-600 leading-relaxed">{principal.descripcion}</p>
					<div class="flex flex-wrap gap-2">
						{#each principal.etiquetas as etiqueta}
							<span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700">{etiqueta}</span>
						{/each}
					</div>
					<a href="{GITHUB}/{principal.repo}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 font-mono text-sm font-semibold text-purple-700 hover:underline">
						DroneOps/{principal.repo} →
					</a>
				</div>

				<!-- Gráfica del filtro de Kalman durante una oclusión -->
			<figure class="lg:col-span-6 flex flex-col items-center justify-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/70 p-6 sm:p-10">
				<svg viewBox="0 0 520 300" class="w-full max-w-[520px]" role="img" aria-label="Estimación del filtro de Kalman mientras el marcador está oculto">
					<g stroke="#e2e8f0">
						{#each [30, 70, 110, 150, 190, 230, 270] as y}<line x1="20" y1={y} x2="500" y2={y} />{/each}
					</g>
					<rect x={OCLUSION.inicio} y="10" width={OCLUSION.fin - OCLUSION.inicio} height="270" fill="#db2777" fill-opacity="0.06" />
					<line x1={OCLUSION.inicio} y1="10" x2={OCLUSION.inicio} y2="280" stroke="#db2777" stroke-width="1.5" stroke-dasharray="6 6" />
					<line x1={OCLUSION.fin} y1="10" x2={OCLUSION.fin} y2="280" stroke="#db2777" stroke-width="1.5" stroke-dasharray="6 6" />
					<text x={(OCLUSION.inicio + OCLUSION.fin) / 2} y="30" text-anchor="middle" fill="#db2777" font-size="13" font-family="ui-monospace, monospace">marcador oculto</text>
					<path d={bandaKalman} fill="#7c3aed" fill-opacity="0.12" />
					{#each mediciones as m}
						<circle cx={m.x} cy={m.y} r="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5" />
					{/each}
					<path d={estimacion} fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<div class="flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-xs text-slate-500">
					<span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full border-[1.5px] border-slate-500 bg-white"></span>Medición ArUco</span>
					<span class="flex items-center gap-2"><span class="w-5 border-t-2 border-purple-600"></span>Estimación de Kalman</span>
					<span class="flex items-center gap-2"><span class="h-2.5 w-5 rounded-sm bg-purple-600/15"></span>Incertidumbre</span>
				</div>
				<code class="font-mono text-sm sm:text-base text-purple-700">x̂ₖ = x̂ₖ⁻ + Kₖ (zₖ − H x̂ₖ⁻)</code>
				<figcaption class="max-w-md text-center text-xs sm:text-sm text-slate-500 leading-relaxed">
					Cuando el marcador sale de la vista no hay mediciones: el filtro sigue prediciendo la posición del dron y su incertidumbre crece hasta que lo vuelve a ver.
				</figcaption>
			</figure>
			</article>

			<!-- Otros proyectos -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
				{#each proyectos as p}
					<a
						href="{GITHUB}/{p.repo}"
						target="_blank"
						rel="noopener noreferrer"
						class="group flex flex-col overflow-hidden rounded-2xl border border-slate-900 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-purple-600 hover:shadow-md"
					>
						<div class="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4">
							<span class="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
								<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d={iconos[p.icono]} />
								</svg>
							</span>
							<span class="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-mono text-xs text-slate-600">{p.anio}</span>
						</div>
						<div class="flex flex-1 flex-col gap-3 p-5 sm:p-6">
							<span class="font-mono text-xs text-slate-400">DroneOps/{p.repo}</span>
							<h3 class="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">{p.titulo}</h3>
							<p class="text-sm text-slate-600 leading-relaxed">{p.descripcion}</p>
							<div class="flex flex-wrap gap-2 pt-1">
								{#each p.etiquetas as etiqueta}
									<span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700">{etiqueta}</span>
								{/each}
							</div>
							<span class="mt-auto border-t border-slate-200 pt-4 font-mono text-sm font-semibold text-purple-700 group-hover:underline">Ver en GitHub →</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
</div>

<style>
	/* 100vw incluye la barra de scroll: esto evita que el fondo de ancho completo cause scroll horizontal */
	:global(html) {
		overflow-x: clip;
	}
</style>
