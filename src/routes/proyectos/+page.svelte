<script lang="ts">
    type Proyecto = {
		nombre: string;
		evento: string;
		descripcion: string;
		etiquetas: string[];
		estado: string;
		repo: string;
	};

    	const proyectos: Proyecto[] = [
		{
			nombre: 'Gate TMR Color',
			evento: 'Torneo Mexicano de Robótica (TMR)',
			descripcion:
				'Un DJI Tello detecta compuertas verdes en tiempo real, estima su posición con PnP y filtro de Kalman, y las cruza de forma autónoma con control PID.',
			etiquetas: ['Visión', 'PnP', 'Kalman', 'PID'],
			estado: 'Competencia',
			repo: 'https://github.com/DroneOps/Gate_tmr_color'
		},
		{
			nombre: 'TMR Landing',
			evento: 'Torneo Mexicano de Robótica (TMR)',
			descripcion:
				'Aterrizaje autónomo sobre una plataforma móvil: un espejo a 45° convierte la cámara frontal del Tello en una cámara inferior que sigue un marcador ArUco.',
			etiquetas: ['ArUco', 'OpenCV', 'PID'],
			estado: 'Competencia',
			repo: 'https://github.com/DroneOps/TMR_Landing'
		},
		{
			nombre: 'Sound Localization',
			evento: 'TMR 2026 · Drones Autónomos',
			descripcion:
				'Subsistema acústico para encontrar, entre cajas idénticas, la que emite un sonido de auxilio y entregarle un med-kit.',
			etiquetas: ['Audio', 'Localización'],
			estado: 'En progreso',
			repo: 'https://github.com/DroneOps/Sound_Localization'
		},
		{
			nombre: 'AprilTag Detection',
			evento: 'Autonomous Mechatronics Grand Prix 2026',
			descripcion:
				'Un Tello recorre una pista, detecta etiquetas AprilTag en el piso y ejecuta la acción de cada una: girar, flip, subir o aterrizar.',
			etiquetas: ['AprilTag', 'Visión', 'Tello'],
			estado: 'En progreso',
			repo: 'https://github.com/DroneOps/AprilTag-Detection'
		},
		{
			nombre: 'Kalman Navigation',
			evento: 'Investigación',
			descripcion:
				'Estimación de estado y seguimiento visual con ArUco para micro UAVs, que sigue prediciendo la posición del objetivo cuando la cámara lo pierde de vista.',
			etiquetas: ['Kalman', 'ArUco', 'Control'],
			estado: 'Investigación',
			repo: 'https://github.com/DroneOps/Kalman-Navigation'
		},
		{
			nombre: 'Quaternion Barrier Control',
			evento: 'Investigación',
			descripcion:
				'Control con restricciones de estado para seguimiento de trayectorias de cuadricópteros, usando cuaterniones y funciones barrera de Lyapunov.',
			etiquetas: ['Control', 'Lyapunov', 'Cuaterniones'],
			estado: 'Investigación',
			repo: 'https://github.com/DroneOps/quaternion-barrier-control'
		},
		{
			nombre: 'Camera Calibration',
			evento: 'Herramientas',
			descripcion:
				'Kit para calibrar cámaras y guardar sus matrices, con módulos para el DJI Tello y webcams de OpenCV.',
			etiquetas: ['OpenCV', 'Calibración'],
			estado: 'Herramienta',
			repo: 'https://github.com/DroneOps/camera-calibration'
		},
		{
			nombre: 'Tello Utils',
			evento: 'Herramientas',
			descripcion:
				'Herramientas rápidas para conectar, revisar batería y temperatura, y hacer pruebas de vuelo seguras con drones DJI Tello.',
			etiquetas: ['Tello', 'Python'],
			estado: 'Herramienta',
			repo: 'https://github.com/DroneOps/Tello-Utils'
		}
	];
</script>

<svelte:head>
	<title>Proyectos · DroneOps</title>
</svelte:head>

<div class="mx-auto max-w-[1440px] px-6 sm:px-12 py-6 sm:py-10 space-y-8 sm:space-y-12 text-slate-900">
	<section class="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
		<div class="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-purple-700 uppercase">
			<span class="h-2 w-2 rounded-full bg-purple-600"></span>
			Repositorios del equipo
		</div>
		<h1 class="text-3xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-950 leading-tight lg:leading-[1.15]">
			Proyectos
		</h1>
		<p class="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
			Competencias, investigación y herramientas: todo nuestro código es abierto.
		</p>
	</section>

	<section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
		{#each proyectos as proyecto (proyecto.repo)}
			<a
                href={proyecto.repo}
                target="_blank"
                rel="noopener noreferrer"
                class="flex flex-col rounded-2xl border border-purple-200 bg-purple-50/60 p-5 sm:p-6 hover:border-purple-400 transition-colors"
            >
                <div class="flex items-center justify-between gap-3">
                    <h3 class="text-lg sm:text-xl font-extrabold text-purple-950">{proyecto.nombre}</h3>
                    <span class="shrink-0 rounded-full border border-purple-300 bg-purple-100 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-purple-700 uppercase">
                        {proyecto.estado}
                    </span>
                </div>
                <p class="text-xs text-slate-500 mt-1">{proyecto.evento}</p>
                <p class="text-xs sm:text-sm text-slate-700 mt-2 sm:mt-3 flex-1">{proyecto.descripcion}</p>
                <div class="mt-4 flex flex-wrap items-center gap-2">
                    {#each proyecto.etiquetas as etiqueta (etiqueta)}
                        <span class="rounded-md bg-stone-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{etiqueta}</span>
                    {/each}
                    <span class="ml-auto text-xs font-semibold text-purple-700">GitHub →</span>
                </div>
            </a>
		{/each}
	</section>
</div>