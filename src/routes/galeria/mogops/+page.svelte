<script lang="ts">
	// Autor: Miguel Tovar
	import { onDestroy, onMount, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { scale } from 'svelte/transition';
	import gigachadImg from '$lib/assets/gigachad.png';
	import theRockImg from '$lib/assets/the-rock.png';
	import { EMPTY, ENGINE_LABEL, FaceAnalyzer, headlineScore, MOG_THRESHOLD, type Analysis, type Engine } from '$lib/mogops/analysis';
	import { colorPuntuacion, Competencia } from '$lib/mogops/competencia.svelte';
	import { percentileOf, pslFromScore, pslTier } from '$lib/mogops/display';
	import { countsInOverall, GEOMETRY_ACCURACY, METRIC_KEYS, TRAITS, traitWeight } from '$lib/mogops/geometry';
	import { PSL_ACCURACY, PSL_IDEALS, PSL_LABELS } from '$lib/mogops/psl';
	import { createSounds, type Sounds } from '$lib/mogops/sounds';

	// Lee y guarda un ajuste en este navegador (puede estar bloqueado en modo privado)
	function leerAjuste(clave: string, inicial: boolean): boolean {
		try {
			const valor = localStorage.getItem(clave);
			return valor === null ? inicial : valor === '1';
		} catch {
			return inicial;
		}
	}
	function guardarAjuste(clave: string, valor: boolean) {
		try {
			localStorage.setItem(clave, valor ? '1' : '0');
		} catch {
			// El ajuste solo no se recuerda
		}
	}

	// Estado del juego
	let analysis = $state<Analysis>(EMPTY);
	let motor = $state<Engine>('geometry');
	let mostrarPuntos = $state(false);
	let modelosListos = $state(false);
	let errorModelos = $state<string | null>(null);
	let errorCamara = $state<string | null>(null);
	let camaraActiva = $state(false);
	let camaras = $state<MediaDeviceInfo[]>([]);
	let camaraId = $state('');
	let cejaFlash = $state(false);

	// Modo competencia
	const competencia = new Competencia();
	const TROFEO_PX = 256; // lado mayor de la foto del trofeo
	const MARGEN_TROFEO = 0.16; // 16% alrededor de la cara
	let lienzoTrofeo: HTMLCanvasElement | null = null;
	let fotoTrofeo = $state<string | null>(null);

	// Ranking semanal
	type FilaRanking = { nombre: string; puntuacion: number; foto: string; registradoEn: string; esMio: boolean };
	type Ranking = { ranking: FilaRanking[]; mio: { nombre: string; puntuacion: number } | null };
	let ranking = $state<Ranking | null>(null);
	let errorRanking = $state<string | null>(null);
	let expandido = $state(false);
	let nombre = $state('');
	let enviando = $state(false);
	let errorRegistro = $state<string | null>(null);
	let registrado = $state(false);

	// Elementos del DOM
	let video = $state<HTMLVideoElement>();
	let lienzo = $state<HTMLCanvasElement>();

	// El analizador se crea solo en el navegador (MediaPipe no corre en el servidor)
	let analizador = $state<FaceAnalyzer | null>(null);
	let sonidos: Sounds | null = null;
	let timerCeja = 0;
	let raf = 0;
	let reloj = 0;

	const titular = $derived(headlineScore(analysis, motor, true));
	const bono = $derived(analysis[motor] !== null ? analysis.bonus : null);
	const enJuego = $derived(competencia.fase === 'calentamiento' || competencia.fase === 'batalla');
	const conPromedio = $derived(competencia.fase === 'batalla' || competencia.fase === 'final');

	// El número grande: en la batalla y al final es el promedio; antes, la calificación en vivo
	const numero = $derived(conPromedio ? competencia.promedio : titular);
	// Los efectos meme usan el promedio de la batalla, no la calificación del momento
	const puntajeMeme = $derived(conPromedio ? competencia.promedio : null);
	const gigachad = $derived(puntajeMeme !== null && puntajeMeme >= MOG_THRESHOLD);

	// Puntuación final redondeada como la guarda el servidor
	const final = $derived(
		competencia.fase === 'final' && competencia.promedio !== null ? Math.round(competencia.promedio * 100) / 100 : null
	);
	const puedeRegistrar = $derived(
		final !== null &&
			fotoTrofeo !== null &&
			ranking !== null &&
			!registrado &&
			(ranking.mio === null || final > ranking.mio.puntuacion)
	);

	onMount(() => {
		mostrarPuntos = leerAjuste('mogops.puntos', false);
		sonidos = createSounds();
		lienzoTrofeo = document.createElement('canvas');

		const nuevo = new FaceAnalyzer(
			(a) => {
				analysis = a;
				// Cada calificación válida de la batalla entra al promedio; la más alta se guarda como trofeo
				const valida = a.status === 'ready' ? headlineScore(a, motor, true) : null;
				if (competencia.registrar(valida, performance.now())) capturarTrofeo();
			},
			() => {
				sonidos?.boom();
				cejaFlash = true;
				clearTimeout(timerCeja);
				timerCeja = window.setTimeout(() => (cejaFlash = false), 1000);
			}
		);
		analizador = nuevo;
		nuevo
			.preload()
			.then(() => (modelosListos = true))
			.catch((e: unknown) => (errorModelos = e instanceof Error ? e.message : String(e)));

		// Avanza las fases aunque no lleguen cuadros (por ejemplo, si no hay cara)
		reloj = window.setInterval(() => competencia.avanzar(performance.now()), 100);

		// Dibuja los puntos faciales encima de la vista previa
		const dibujar = () => {
			const { landmarks, width, height } = nuevo.overlay;
			if (lienzo && width && height) {
				if (lienzo.width !== width || lienzo.height !== height) {
					lienzo.width = width;
					lienzo.height = height;
				}
				const ctx = lienzo.getContext('2d')!;
				ctx.clearRect(0, 0, width, height);
				if (mostrarPuntos && landmarks) {
					const r = Math.max(1.5, width / 600);
					ctx.fillStyle = 'rgba(196, 181, 253, 0.75)';
					for (const p of landmarks) ctx.fillRect(p.x * width - r / 2, p.y * height - r / 2, r, r);
				}
			}
			raf = requestAnimationFrame(dibujar);
		};
		raf = requestAnimationFrame(dibujar);

		cargarRanking();
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		cancelAnimationFrame(raf);
		clearInterval(reloj);
		clearTimeout(timerCeja);
		sonidos?.stop();
		analizador?.stopCamera();
	});

	// La canción de Gigachad suena mientras el promedio esté en 8 o más; al bajar se pausa y luego continúa
	$effect(() => {
		sonidos?.setMusic(gigachad);
	});

	// Al terminar la batalla, la mejor captura se convierte en la foto del trofeo
	$effect(() => {
		if (competencia.fase === 'final' && competencia.mejor !== null && lienzoTrofeo && !fotoTrofeo) {
			fotoTrofeo = lienzoTrofeo.toDataURL('image/jpeg', 0.85);
		}
	});

	// Enciende la cámara cuando el modelo está listo, y otra vez al cambiar de cámara.
	// Solo depende de esos cuatro valores: startCamera ya hace una actualización al arrancar,
	// y si el efecto también siguiera la fase de la competencia, "Iniciar" reiniciaría la cámara.
	$effect(() => {
		const [listo, a, v, id] = [modelosListos, analizador, video, camaraId];
		if (!listo || !a || !v) return;
		untrack(() => {
			errorCamara = null;
			a.startCamera(v, id || undefined)
				.then(() => {
					camaraActiva = true;
					return navigator.mediaDevices.enumerateDevices();
				})
				.then((todas) => (camaras = todas.filter((d) => d.kind === 'videoinput')))
				.catch((e: unknown) => {
					camaraActiva = false;
					errorCamara = e instanceof Error ? e.message : String(e);
				});
		});
		return () =>
			untrack(() => {
				a.stopCamera();
				camaraActiva = false;
				reiniciarCompetencia();
			});
	});

	// Copia la cara del cuadro actual (más un 16% alrededor), en espejo como la vista previa
	function capturarTrofeo() {
		const landmarks = analizador?.overlay.landmarks;
		if (!video || !landmarks || !lienzoTrofeo) return;
		const w = video.videoWidth;
		const h = video.videoHeight;
		const xs = landmarks.map((p) => p.x * w);
		const ys = landmarks.map((p) => p.y * h);
		let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
		const [mx, my] = [(x1 - x0) * MARGEN_TROFEO, (y1 - y0) * MARGEN_TROFEO];
		[x0, x1, y0, y1] = [Math.max(0, x0 - mx), Math.min(w, x1 + mx), Math.max(0, y0 - my), Math.min(h, y1 + my)];
		const escala = Math.min(1, TROFEO_PX / Math.max(x1 - x0, y1 - y0));
		lienzoTrofeo.width = Math.round((x1 - x0) * escala);
		lienzoTrofeo.height = Math.round((y1 - y0) * escala);
		const ctx = lienzoTrofeo.getContext('2d')!;
		ctx.setTransform(-1, 0, 0, 1, lienzoTrofeo.width, 0);
		ctx.drawImage(video, x0, y0, x1 - x0, y1 - y0, 0, 0, lienzoTrofeo.width, lienzoTrofeo.height);
	}

	function iniciarCompetencia() {
		reiniciarCompetencia();
		competencia.iniciar(performance.now());
	}

	function reiniciarCompetencia() {
		competencia.reiniciar();
		fotoTrofeo = null;
		registrado = false;
		errorRegistro = null;
	}

	async function cargarRanking() {
		try {
			const res = await fetch('/api/mogops/ranking');
			const datos = await res.json();
			if (!res.ok) throw new Error(datos.error || 'No se pudo cargar el ranking');
			ranking = datos;
			errorRanking = null;
			if (datos.mio && !nombre) nombre = datos.mio.nombre;
		} catch (e) {
			errorRanking = e instanceof Error ? e.message : String(e);
		}
	}

	async function registrarPuntuacion(e: Event) {
		e.preventDefault();
		if (!puedeRegistrar || final === null || !fotoTrofeo) return;
		enviando = true;
		errorRegistro = null;
		try {
			const res = await fetch('/api/mogops/ranking', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nombre, puntuacion: final, foto: fotoTrofeo })
			});
			const datos = await res.json();
			if (!res.ok) throw new Error(datos.error || 'No se pudo registrar la puntuación');
			ranking = datos;
			registrado = true;
		} catch (err) {
			errorRegistro = err instanceof Error ? err.message : String(err);
		}
		enviando = false;
	}

	function alternar(clave: string, valor: boolean): boolean {
		guardarAjuste(clave, valor);
		return valor;
	}

	const fmt = (v: number | null) => (v === null ? '–' : v.toFixed(1));
	const conSigno = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`;

	// Cuándo se registró, en días del calendario local: "Hoy", "Ayer", "Hace 3 días"
	function cuando(iso: string): string {
		const dia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
		const dias = Math.round((dia(new Date()) - dia(new Date(iso))) / 86_400_000);
		if (dias <= 0) return 'Hoy';
		if (dias === 1) return 'Ayer';
		return `Hace ${dias} días`;
	}

	const ESTADO: Record<Analysis['status'], string> = {
		idle: 'border-slate-300 bg-slate-100 text-slate-600',
		loading: 'border-slate-300 bg-slate-100 text-slate-600',
		analyzing: 'border-sky-300 bg-sky-50 text-sky-700',
		ready: 'border-emerald-300 bg-emerald-50 text-emerald-700',
		adjust: 'border-amber-300 bg-amber-50 text-amber-700',
		noface: 'border-amber-300 bg-amber-50 text-amber-700',
		error: 'border-red-300 bg-red-50 text-red-700'
	};

	// Acordeón de "¿Cómo funciona?", igual que en la página de inicio
	let abiertas = $state(new SvelteSet<number>());
	function toggle(id: number) {
		if (abiertas.has(id)) abiertas.delete(id);
		else abiertas.add(id);
	}
</script>

<svelte:head>
	<title>MogOps · Galería · DroneOps</title>
</svelte:head>

<div class="mx-auto max-w-[1440px] px-6 sm:px-12 py-6 sm:py-10 space-y-8 sm:space-y-12 text-slate-900">
	<!-- 1. ENCABEZADO -->
	<section class="space-y-4 pt-2 sm:pt-4">
		<a href="/galeria" class="text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors">← Galería</a>
		<div>
			<span class="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600">Juego · Visión computacional</span>
			<h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mt-1">MogOps</h1>
		</div>
		<p class="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
			Todo se corre en tu dispositivo, a menos que elijas registrar tu puntuación en el ranking.
		</p>
	</section>

	<!-- 2. JUEGO -->
	<section class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
		<!-- Entrada: foto o cámara -->
		<div class="lg:col-span-7 rounded-2xl sm:rounded-[32px] border border-slate-200 bg-white p-5 sm:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)] space-y-5">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<label class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider text-slate-500">Calificación principal</span>
					<select
						bind:value={motor}
						disabled={enJuego}
						class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-purple-600 focus:outline-none disabled:opacity-50"
					>
						<option value="geometry">Geometría (aprendida de humanos)</option>
						<option value="psl">Ratios PSL (lore de looksmaxxing)</option>
					</select>
				</label>
				<label class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider text-slate-500">Cámara</span>
					<select
						bind:value={camaraId}
						disabled={enJuego}
						class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-purple-600 focus:outline-none disabled:opacity-50"
					>
						<option value="">Cámara predeterminada</option>
						{#each camaras as c, i (c.deviceId)}
							<option value={c.deviceId}>{c.label || `Cámara ${i + 1}`}</option>
						{/each}
					</select>
				</label>
			</div>

			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					role="switch"
					aria-checked={mostrarPuntos}
					onclick={() => (mostrarPuntos = alternar('mogops.puntos', !mostrarPuntos))}
					class={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors ${mostrarPuntos ? 'border-purple-300 bg-purple-50 text-purple-800' : 'border-slate-300 text-slate-500 hover:bg-slate-100'}`}
				>
					<span class={`h-2 w-2 rounded-full ${mostrarPuntos ? 'bg-purple-600' : 'bg-slate-300'}`}></span>
					Puntos faciales
				</button>
			</div>


			<div class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
				<video bind:this={video} playsinline muted class="h-full w-full object-contain -scale-x-100"></video>
				<canvas
					bind:this={lienzo}
					class="pointer-events-none absolute inset-0 h-full w-full object-contain -scale-x-100"
				></canvas>

				{#if errorModelos}
					<p class="absolute inset-x-6 text-center text-sm text-slate-400">No se pudieron cargar los modelos: {errorModelos}</p>
				{:else if !modelosListos}
					<p class="absolute inset-x-6 text-center text-sm text-slate-400">Cargando modelo facial (4 MB)…</p>
				{:else if !camaraActiva}
					<div class="absolute inset-x-6 text-center">
						<p class="text-base sm:text-lg font-bold text-white">Permite el uso de la cámara para jugar.</p>
						{#if errorCamara}
							<p class="mt-1 text-xs text-slate-400">No se pudo usar la cámara: {errorCamara}</p>
						{/if}
					</div>
				{/if}

				<!-- Controles de la competencia sobre la cámara -->
				{#if camaraActiva}
					{#if competencia.fase === 'listo'}
						<button
							type="button"
							onclick={iniciarCompetencia}
							class="absolute rounded-xl bg-purple-600 px-10 py-3.5 text-lg font-extrabold text-white shadow-lg hover:bg-purple-700 transition-colors"
						>
							Iniciar
						</button>
					{:else if competencia.fase === 'calentamiento'}
						<span class="absolute bottom-3 rounded-full bg-slate-950/75 px-4 py-1.5 text-sm font-bold text-white">
							La batalla empieza en <span class="font-mono tabular-nums">{competencia.restante}</span>
						</span>
					{:else if competencia.fase === 'batalla'}
						<span class="absolute bottom-3 flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white shadow-md">
							<span class="h-2 w-2 animate-pulse rounded-full bg-white"></span>
							Batalla · <span class="font-mono tabular-nums">{competencia.restante} s</span>
						</span>
					{:else}
						<button
							type="button"
							onclick={reiniciarCompetencia}
							class="absolute bottom-3 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-100 transition-colors"
						>
							Reiniciar
						</button>
					{/if}
				{/if}

				<!-- The Rock durante un segundo cada vez que se levanta una ceja -->
				{#if cejaFlash}
					<img
						src={theRockImg}
						alt="The Rock levantando una ceja"
						transition:scale={{ duration: 150, start: 0.6 }}
						class="pointer-events-none absolute left-2 top-2 w-1/4 max-w-[160px] rounded-xl border-2 border-white shadow-lg sm:left-4 sm:top-4"
					/>
				{/if}

				<!-- Sello de Gigachad sobre la vista previa mientras el promedio esté en 8 o más -->
				{#if gigachad}
					<img
						src={gigachadImg}
						alt="Gigachad"
						transition:scale={{ duration: 250, start: 0.5 }}
						class="pointer-events-none absolute right-2 top-2 w-1/3 max-w-[220px] drop-shadow-lg sm:right-4 sm:top-4"
					/>
				{/if}
			</div>

			{#if analysis.reasons.length > 0}
				<ul class="flex flex-wrap gap-2">
					{#each analysis.reasons as razon (razon)}
						<li class="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{razon}</li>
					{/each}
				</ul>
			{/if}

			<!-- Registro de la puntuación al terminar la batalla -->
			{#if final !== null}
				{#if puedeRegistrar}
					<form onsubmit={registrarPuntuacion} class="flex flex-col items-center gap-4 rounded-2xl border border-purple-200 bg-purple-50/60 p-5 sm:p-6">
						<span class="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600">Tu trofeo</span>
						<div class="rounded-2xl border-4 border-purple-300 bg-white p-1.5 shadow-md">
							<img src={fotoTrofeo} alt="Tu cara en el mejor momento de la batalla" class="h-36 w-36 rounded-xl object-cover" />
						</div>
						<p class="font-mono text-3xl font-extrabold tabular-nums {colorPuntuacion(final)}">{final.toFixed(1)}</p>
						<label class="flex w-full max-w-sm flex-col gap-1.5">
							<span class="text-xs font-bold uppercase tracking-wider text-slate-500">Tu nombre</span>
							<input
								type="text"
								bind:value={nombre}
								required
								maxlength="24"
								placeholder="Ej. Gigachad"
								class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
							/>
						</label>
						{#if errorRegistro}
							<p class="text-sm font-semibold text-red-600">{errorRegistro}</p>
						{/if}
						<button
							type="submit"
							disabled={enviando || !nombre.trim()}
							class="rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
						>
							{enviando ? 'Registrando…' : 'Registrar puntuación'}
						</button>
						<p class="max-w-sm text-center text-xs leading-relaxed text-slate-500">
							<strong class="text-slate-700">Privacidad:</strong> la foto de arriba solo se guarda si decides registrar tu puntuación.
							Si no la registras, nunca sale de tu dispositivo. Al registrarla, tu nombre y esta foto se publican en el ranking durante
							7 días y luego se borran. Solo se guarda la mejor puntuación de este dispositivo.
						</p>
					</form>
				{:else if registrado}
					<p class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
						¡Puntuación registrada! Ya apareces en el ranking semanal.
					</p>
				{:else if ranking?.mio && final <= ranking.mio.puntuacion}
					<p class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
						Tu récord de esta semana es <span class="font-mono font-bold">{ranking.mio.puntuacion.toFixed(1)}</span>. Supéralo para
						volver a registrarte.
					</p>
				{/if}
			{:else if competencia.fase === 'final'}
				<p class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
					No se detectó tu cara durante la batalla. Pulsa Reiniciar para intentarlo de nuevo.
				</p>
			{/if}
		</div>

		<!-- Calificación -->
		<div class="lg:col-span-5 rounded-2xl sm:rounded-[32px] border border-purple-200 bg-purple-50/60 p-5 sm:p-8 space-y-6">
			<div class="flex items-center justify-between gap-3">
				<span class="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600">Calificación</span>
				<span class={`rounded-full border px-3 py-0.5 text-[10px] sm:text-xs font-bold uppercase ${ESTADO[analysis.status]}`}>
					{analysis.message}
				</span>
			</div>

			<div class="flex flex-col items-center gap-2 text-center">
				<!-- Gris y pequeño antes de la batalla; grande y con color al empezar el promedio -->
				<div
					class="font-mono font-extrabold tabular-nums tracking-tight transition-all duration-500 {conPromedio
						? `text-8xl ${colorPuntuacion(numero)}`
						: 'text-5xl text-slate-400'}"
				>
					{numero === null ? '0.0' : numero.toFixed(1)}
				</div>
				<p class="text-xs font-bold uppercase tracking-wider text-slate-500">
					{#if competencia.fase === 'listo'}
						En vivo · pulsa Iniciar
					{:else if competencia.fase === 'calentamiento'}
						Calentando
					{:else if competencia.fase === 'batalla'}
						Promedio de la batalla · ahora {fmt(titular)}
					{:else}
						Puntuación final
					{/if}
				</p>
				{#if numero !== null}
					{@const psl = pslFromScore(numero)}
					{@const top = Math.max(0.1, (1 - percentileOf(numero)) * 100)}
					<p class="text-sm font-semibold text-slate-800">PSL {psl.toFixed(1)} · {pslTier(psl)}</p>
					<p class="text-xs text-slate-500">Top {top < 1 ? top.toFixed(1) : Math.round(top)}% de las caras</p>
				{/if}
				<div class="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-1 text-sm text-slate-500">
					{#each ['geometry', 'psl'] as const as e (e)}
						<span class={motor === e ? 'font-semibold text-slate-900' : ''}>
							{ENGINE_LABEL[e]} <span class="font-mono tabular-nums">{fmt(analysis[e])}</span>
						</span>
					{/each}
					{#if bono}
						<span class="font-semibold text-purple-700">Bono <span class="font-mono tabular-nums">{conSigno(bono.total)}</span></span>
					{/if}
				</div>
			</div>

			{#if bono}
				<div class="rounded-2xl border border-purple-200 bg-white/70 p-4 space-y-3">
					<p class="text-xs font-bold uppercase tracking-wider text-purple-600">Modo meme: haz estas caras</p>
					<ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{#each bono.items as b (b.id)}
							{@const castigo = b.max < 0}
							{@const activo = b.level > 0}
							<li class="space-y-1" title={b.hint}>
								<div class="flex items-baseline justify-between gap-2 text-xs">
									<span class={activo ? (castigo ? 'font-semibold text-rose-700' : 'font-semibold text-purple-900') : 'text-slate-600'}>
										{b.label}
										<span class="block text-[11px] font-normal text-slate-400">{b.hint}</span>
									</span>
									<span class={`font-mono tabular-nums ${activo ? (castigo ? 'text-rose-600' : 'text-purple-700') : 'text-slate-400'}`}>
										{conSigno(activo ? b.points : b.max)}
									</span>
								</div>
								<div class="h-1 overflow-hidden rounded-full bg-purple-100">
									<div
										class={`h-full rounded-full transition-[width] duration-150 ${castigo ? 'bg-rose-500' : 'bg-purple-600'}`}
										style="width: {b.level * 100}%"
									></div>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if motor === 'geometry'}
				{#if analysis.strength && analysis.flaw}
					<div class="grid grid-cols-2 gap-2 text-sm">
						<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
							<p class="text-xs font-semibold text-emerald-700">Lo más fuerte</p>
							<p class="text-emerald-950">{analysis.strength}</p>
						</div>
						<div class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
							<p class="text-xs font-semibold text-rose-700">Lo más débil</p>
							<p class="text-rose-950">{analysis.flaw}</p>
						</div>
					</div>
				{/if}
				<ul class="space-y-3">
					{#each METRIC_KEYS as clave (clave)}
						{@const valor = analysis.subs?.[clave] ?? null}
						<li class="space-y-1.5">
							<div class="flex items-baseline justify-between gap-2 text-sm">
								<span class="text-slate-800">
									{TRAITS[clave].label}
									<span class="ml-1.5 text-xs text-slate-400">
										{countsInOverall(clave) ? `${Math.round(traitWeight(clave) * 100)}% del total` : 'no cuenta'}
									</span>
								</span>
								<span class="font-mono tabular-nums text-slate-600">{valor === null ? '0.0' : valor.toFixed(1)}</span>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-purple-100">
								<div class="h-full rounded-full bg-purple-600 transition-[width] duration-300" style="width: {(valor ?? 0) * 10}%"></div>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<ul class="space-y-3">
					{#each PSL_IDEALS as { key, lo, hi } (key)}
						{@const { label, unit = '' } = PSL_LABELS[key]}
						{@const medido = analysis.pslRatios?.[key]}
						{@const digitos = unit ? 1 : 2}
						{@const valor = analysis.pslSubs?.[key] ?? 0}
						<li class="space-y-1.5">
							<div class="flex items-baseline justify-between gap-2 text-sm">
								<span class="text-slate-800">
									{label}
									<span class="ml-1.5 text-xs text-slate-400">ideal {lo.toFixed(digitos)}–{hi.toFixed(digitos)}{unit}</span>
								</span>
								<span class="font-mono tabular-nums text-slate-600">{medido === undefined ? '–' : `${medido.toFixed(digitos)}${unit}`}</span>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-purple-100">
								<div class="h-full rounded-full bg-purple-600 transition-[width] duration-300" style="width: {valor * 10}%"></div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}

			<p class="border-t border-purple-200 pt-4 text-xs leading-relaxed text-slate-500">
				Coincidencia con calificaciones humanas en caras no vistas (r de Pearson): geometría {GEOMETRY_ACCURACY.pc5fold.toFixed(2)},
				ratios PSL {PSL_ACCURACY.pc5fold.toFixed(2)} (lore de foros, sin relación real). La escala está estirada para que la
				mitad de las caras lleguen a 6 y una cuarta parte a 8.
				{#if analysis.frames > 1}Promediando {analysis.frames} cuadros.{/if}
			</p>
		</div>
	</section>

	<!-- 3. RANKING SEMANAL -->
	<section class="space-y-4 sm:space-y-6">
		<div>
			<span class="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600">Competencia</span>
			<h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1">Ranking semanal</h2>
			<p class="text-slate-600 mt-2 max-w-3xl text-sm sm:text-base">
				Las mejores puntuaciones de los últimos 7 días. Cada dispositivo aparece una sola vez, con su mejor batalla, y cada registro
				se borra 7 días después de guardarse.
			</p>
		</div>

		<div class="rounded-2xl sm:rounded-[32px] border border-purple-200 bg-purple-50/60 p-5 sm:p-8">
			{#if errorRanking}
				<p class="text-sm text-slate-500">{errorRanking}</p>
			{:else if !ranking}
				<p class="text-sm text-slate-500">Cargando ranking…</p>
			{:else if ranking.ranking.length === 0}
				<p class="text-sm text-slate-500">Todavía nadie se ha registrado esta semana. ¡Sé el primero!</p>
			{:else}
				<ol class="space-y-2 sm:space-y-3">
					{#each ranking.ranking.slice(0, expandido ? 15 : 5) as fila, i (i)}
						<li
							class={`flex items-center gap-3 sm:gap-4 rounded-2xl border bg-white px-3 py-2.5 sm:px-4 sm:py-3 ${fila.esMio ? 'border-purple-400 shadow-sm' : 'border-purple-100'}`}
						>
							<span class="w-7 shrink-0 text-center font-mono text-lg font-extrabold text-purple-950">{i + 1}</span>
							<img src={fila.foto} alt={`Trofeo de ${fila.nombre}`} class="h-12 w-12 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14" />
							<div class="min-w-0 flex-1">
								<p class="flex items-center gap-2 truncate font-bold text-slate-900">
									<span class="truncate">{fila.nombre}</span>
									{#if fila.esMio}
										<span class="shrink-0 rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700">Tú</span>
									{/if}
								</p>
								<p class="text-xs text-slate-500">{cuando(fila.registradoEn)}</p>
							</div>
							<span class="shrink-0 font-mono text-2xl sm:text-3xl font-extrabold tabular-nums {colorPuntuacion(fila.puntuacion)}">
								{fila.puntuacion.toFixed(1)}
							</span>
						</li>
					{/each}
				</ol>
				{#if ranking.ranking.length > 5}
					<button
						type="button"
						onclick={() => (expandido = !expandido)}
						class="mt-4 rounded-xl border border-slate-400 bg-transparent px-5 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors"
					>
						{expandido ? 'Contraer' : 'Expandir'}
					</button>
				{/if}
			{/if}
		</div>
	</section>

	<!-- 4. CÓMO FUNCIONA -->
	<section class="space-y-3 sm:space-y-4">
		<div class="rounded-2xl sm:rounded-3xl bg-stone-200/80 overflow-hidden shadow-sm transition-all">
			<button
				type="button"
				onclick={() => toggle(1)}
				class="w-full p-5 sm:p-8 text-left font-bold text-lg sm:text-2xl text-slate-900 flex items-center gap-3 sm:gap-4 hover:bg-stone-300/80 transition-colors"
			>
				<span class={`transform transition-transform duration-200 text-slate-700 text-xs sm:text-sm ${abiertas.has(1) ? 'rotate-180' : ''}`}>▼</span>
				¿Cómo funciona?
			</button>
			{#if abiertas.has(1)}
				<div class="p-5 sm:p-8 pt-0 text-xs sm:text-base text-slate-700 space-y-3 max-w-4xl">
					<p>
						<strong>Competencia.</strong> Pulsa Iniciar: durante 5 segundos solo ves tu calificación en vivo. Luego empieza la batalla
						de 8 segundos, en la que se calcula el promedio de tu calificación ponderado por tiempo. Al terminar, la puntuación queda
						congelada y puedes registrarla con tu nombre y la foto de tu mejor momento.
					</p>
					<p>
						<strong>Puntos faciales.</strong> MediaPipe Face Landmarker encuentra 478 puntos de la cara directamente en tu navegador
						(WebAssembly). El modelo pesa unos 4 MB y se descarga una sola vez de esta misma página.
					</p>
					<p>
						<strong>Geometría.</strong> Con esos puntos se miden 8 proporciones (simetría, inclinación de ojos, ancho de mandíbula…).
						Cada una se califica con una curva aprendida de las 5,500 caras de SCUT-FBP5500, calificadas por personas.
					</p>
					<p>
						<strong>Ratios PSL.</strong> Las proporciones "ideales" que se citan en los foros de looksmaxxing. Las probamos contra los
						datos y no predicen nada, así que aquí son puro meme.
					</p>
					<p>
						<strong>Modo meme.</strong> MediaPipe también estima la fuerza de 52 expresiones. Levantar una ceja, entrecerrar los ojos
						o hundir las mejillas da puntos extra; sonreír los quita.
					</p>
					<p>
						La versión completa, con la red neuronal MogNet (89 MB), está en el
						<a href="https://github.com/DroneOps/MogOps" target="_blank" rel="noopener noreferrer" class="font-semibold text-purple-700 underline hover:text-purple-900">repositorio de MogOps</a>.
					</p>
				</div>
			{/if}
		</div>
		<p class="text-xs text-slate-500 max-w-3xl leading-relaxed">
			Solo para entretenerse: no es una medida objetiva del valor de nadie. Las calificaciones imitan la opinión promedio de las
			personas que calificaron SCUT-FBP5500, así que son menos confiables para caras distintas a las de ese conjunto de datos.
		</p>
	</section>
</div>

<style>
	/* Amarillo legible sobre fondo claro */
	:global(.puntuacion-contorno) {
		text-shadow: 0 1px 0 rgba(120, 53, 15, 0.35);
	}

	/* Plata brillante para 9.3 o más */
	:global(.puntuacion-plata) {
		background: linear-gradient(110deg, #94a3b8 0%, #f8fafc 22%, #cbd5e1 40%, #ffffff 50%, #94a3b8 68%, #e2e8f0 100%);
		background-size: 200% auto;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 1px 1px rgba(51, 65, 85, 0.55)) drop-shadow(0 0 10px rgba(226, 232, 240, 0.95));
		animation: brillo-plata 2.2s linear infinite;
	}

	@keyframes brillo-plata {
		to {
			background-position: -200% center;
		}
	}
</style>
