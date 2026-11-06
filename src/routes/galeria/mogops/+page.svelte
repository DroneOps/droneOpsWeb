<script lang="ts">
	// Autor: Miguel Tovar
	import { onDestroy, onMount, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { scale } from 'svelte/transition';
	import gigachadImg from '$lib/assets/gigachad.png';
	import theRockImg from '$lib/assets/the-rock.png';
	import { EMPTY, FaceAnalyzer, headlineScore, MOG_THRESHOLD, type Analysis, type Engine } from '$lib/mogops/analysis';
	import { colorPuntuacion, Competencia } from '$lib/mogops/competencia.svelte';
	import { aplicarCurva, DIFICULTAD_MAX, DIFICULTAD_MIN, quitarCurva } from '$lib/mogops/curva';
	import { percentileOf, pslFromScore, pslTier } from '$lib/mogops/display';
	import { countsInOverall, GEOMETRY_ACCURACY, METRIC_KEYS, TRAITS, traitWeight, type Landmark } from '$lib/mogops/geometry';
	import { createSounds, type Sounds } from '$lib/mogops/sounds';
	import { poseTarjeta, type PoseTarjeta } from '$lib/mogops/tarjeta3d';

	// Lee y guarda un ajuste en este navegador (puede estar bloqueado en modo privado)
	function leerAjuste(clave: string, inicial: boolean): boolean {
		try {
			const valor = localStorage.getItem(clave);
			return valor === null ? inicial : valor === '1';
		} catch {
			return inicial;
		}
	}
	function guardarAjuste(clave: string, valor: boolean | number) {
		try {
			localStorage.setItem(clave, String(Number(valor)));
		} catch {
			// El ajuste solo no se recuerda
		}
	}
	function leerDificultad(): number {
		try {
			const valor = Number(localStorage.getItem('mogops.dificultad'));
			return valor >= DIFICULTAD_MIN && valor <= DIFICULTAD_MAX ? valor : DIFICULTAD_MIN;
		} catch {
			return DIFICULTAD_MIN;
		}
	}

	// Estado del juego
	let analysis = $state<Analysis>(EMPTY);
	const motor: Engine = 'geometry'; // Los Ratios PSL siguen en $lib/mogops/psl, ocultos por ahora
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
	const PANTALLA_FINAL_MS = 25_000; // tiempo de la cámara congelada en el mejor momento
	const PLAZO_ARCADE_MS = 15_000; // tiempo para escribir el nombre en Modo Arcade
	const SONIDO_FINAL_MS = PLAZO_ARCADE_MS; // lo más que siguen los sonidos al terminar la batalla
	const FIJOS_ARCADE = 3; // primeros lugares que no se mueven en Modo Arcade
	const MAX_ARCADE = 15; // último lugar que muestra el carrusel
	const SEGUNDOS_POR_FILA = 3; // velocidad del carrusel
	const TROFEO_PX = 256; // lado mayor de la foto del trofeo
	const MARGEN_TROFEO = 0.16; // 16% alrededor de la cara
	let lienzoMejor: HTMLCanvasElement | null = null; // cuadro completo de la mejor calificación; no sale del navegador
	let recorteMejor = { x: 0, y: 0, ancho: 0, alto: 0 }; // dónde está la cara en ese cuadro
	let puntosMejor: Landmark[] | null = null; // los puntos de la cara en ese cuadro
	let fotoMejor = $state<string | null>(null);
	let fotoTrofeo = $state<string | null>(null);
	let pantallaFinal = $state(false);
	let silencio = $state(false);

	// Ranking semanal
	type FilaRanking = { nombre: string; puntuacion: number; foto: string; registradoEn: string; esMio: boolean };
	type Ranking = { ranking: FilaRanking[]; mio: { nombre: string; puntuacion: number } | null };
	let ranking = $state<Ranking | null>(null);
	let errorRanking = $state<string | null>(null);
	let avisoRanking = $state<string | null>(null);
	let altoCarrusel = $state(0);
	let altoLista = $state(0);
	let nombre = $state('');
	let enviando = $state(false);
	let errorRegistro = $state<string | null>(null);
	let registrado = $state(false);
	let partida = 0; // cuenta las partidas: una respuesta tardía no debe tocar la siguiente

	// Ajustes protegidos con contraseña: Modo Arcade y dificultad
	let desbloqueado = $state(false);
	let ajustesAbiertos = $state(false); // cada vez que se abren hay que escribir la contraseña
	let pidiendoClave = $state(false);
	let clave = $state('');
	let errorClave = $state<string | null>(null);
	let verificando = $state(false);
	let arcade = $state(false);
	let dificultad = $state(DIFICULTAD_MIN);

	// Elementos del DOM
	let video = $state<HTMLVideoElement>();
	let lienzo = $state<HTMLCanvasElement>();
	let cajaCamara = $state<HTMLDivElement>();
	let tarjeta = $state<HTMLDivElement>();
	let poseSuave: PoseTarjeta | null = null;

	// El analizador se crea solo en el navegador (MediaPipe no corre en el servidor)
	let analizador = $state<FaceAnalyzer | null>(null);
	let sonidos: Sounds | null = null;
	let timerCeja = 0;
	let raf = 0;
	let reloj = 0;

	const titular = $derived(headlineScore(analysis, motor, true, dificultad));
	const geometria = $derived(analysis.geometry === null ? null : aplicarCurva(analysis.geometry, dificultad));
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
			!registrado &&
			(arcade || (ranking !== null && (ranking.mio === null || final > ranking.mio.puntuacion)))
	);
	const esperandoNombre = $derived(arcade && puedeRegistrar && !enviando);
	// El carrusel solo se mueve si las filas no caben en su caja
	const carruselActivo = $derived(altoLista > altoCarrusel);

	onMount(() => {
		mostrarPuntos = leerAjuste('mogops.puntos', false);
		sonidos = createSounds();
		lienzoMejor = document.createElement('canvas');

		const nuevo = new FaceAnalyzer(
			(a) => {
				analysis = a;
				// Cada calificación válida de la batalla entra al promedio; la más alta se guarda como trofeo
				const valida = a.status === 'ready' ? headlineScore(a, motor, true, dificultad) : null;
				if (competencia.registrar(valida, performance.now())) capturarTrofeo();
			},
			() => {
				if (!silencio) sonidos?.boom();
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
			moverTarjeta(landmarks, width, height);
			raf = requestAnimationFrame(dibujar);
		};
		raf = requestAnimationFrame(dibujar);

		comprobarArcade().then(cargarRanking);
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
		sonidos?.setMusic(gigachad && !silencio);
	});

	// Al terminar la batalla los sonidos siguen lo mismo que el plazo del nombre, hasta la siguiente partida
	$effect(() => {
		if (competencia.fase !== 'final') {
			silencio = false;
			return;
		}
		const espera = setTimeout(() => (silencio = true), SONIDO_FINAL_MS);
		return () => clearTimeout(espera);
	});

	// En Modo Arcade la puntuación se registra sola al acabarse el plazo. Si falla, el plazo vuelve a empezar.
	$effect(() => {
		if (!esperandoNombre) return;
		const espera = setTimeout(() => untrack(enviarPuntuacion), PLAZO_ARCADE_MS);
		return () => clearTimeout(espera);
	});

	// Al terminar la batalla, la mejor captura se convierte en la pantalla final y en la foto del trofeo
	$effect(() => {
		if (competencia.fase === 'final' && competencia.mejor !== null && lienzoMejor && !fotoTrofeo) {
			fotoMejor = lienzoMejor.toDataURL('image/jpeg', 0.9);
			fotoTrofeo = recortarTrofeo(lienzoMejor).toDataURL('image/jpeg', 0.85);
		}
	});

	// La pantalla final dura 25 segundos o hasta la siguiente partida
	$effect(() => {
		if (!fotoMejor) {
			pantallaFinal = false;
			return;
		}
		pantallaFinal = true;
		const espera = setTimeout(() => (pantallaFinal = false), PANTALLA_FINAL_MS);
		return () => clearTimeout(espera);
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

	// Guarda el cuadro actual y dónde está la cara (más un 16% alrededor)
	function capturarTrofeo() {
		const landmarks = analizador?.overlay.landmarks;
		if (!video || !landmarks || !lienzoMejor) return;
		const w = video.videoWidth;
		const h = video.videoHeight;
		const xs = landmarks.map((p) => p.x * w);
		const ys = landmarks.map((p) => p.y * h);
		let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
		const [mx, my] = [(x1 - x0) * MARGEN_TROFEO, (y1 - y0) * MARGEN_TROFEO];
		[x0, x1, y0, y1] = [Math.max(0, x0 - mx), Math.min(w, x1 + mx), Math.max(0, y0 - my), Math.min(h, y1 + my)];
		lienzoMejor.width = w;
		lienzoMejor.height = h;
		lienzoMejor.getContext('2d')!.drawImage(video, 0, 0, w, h);
		recorteMejor = { x: x0, y: y0, ancho: x1 - x0, alto: y1 - y0 };
		puntosMejor = landmarks;
	}

	// Lleva la tarjeta 3D sobre la cabeza; en la pantalla final se queda sobre la cara congelada.
	// Se escribe directo en el estilo porque corre en cada cuadro.
	function moverTarjeta(landmarks: Landmark[] | null, width: number, height: number) {
		if (!tarjeta || !cajaCamara) return;
		const puntos = pantallaFinal ? puntosMejor : landmarks;
		if (!puntos || !width || !height) {
			tarjeta.style.opacity = '0';
			poseSuave = null;
			return;
		}
		const nueva = poseTarjeta(puntos, width, height, cajaCamara.clientWidth, cajaCamara.clientHeight);
		const anterior = poseSuave ?? nueva;
		const mezclar = (a: number, b: number) => a + (b - a) * 0.35;
		const pose: PoseTarjeta = {
			x: mezclar(anterior.x, nueva.x),
			y: mezclar(anterior.y, nueva.y),
			roll: mezclar(anterior.roll, nueva.roll),
			yaw: mezclar(anterior.yaw, nueva.yaw),
			pitch: mezclar(anterior.pitch, nueva.pitch),
			escala: mezclar(anterior.escala, nueva.escala)
		};
		poseSuave = pose;
		const escala = Math.min(1.5, Math.max(0.7, pose.escala / 300));
		const y = Math.max(tarjeta.offsetHeight * escala + 12, pose.y); // que no se salga por arriba
		tarjeta.style.opacity = '1';
		tarjeta.style.transform = `translate(${pose.x}px, ${y}px) translate(-50%, -100%) rotateZ(${pose.roll}deg) rotateY(${pose.yaw}deg) rotateX(${pose.pitch}deg) scale(${escala})`;
	}

	// Recorta la cara y la reduce a lo que se publica, en espejo como la vista previa
	function recortarTrofeo(origen: HTMLCanvasElement): HTMLCanvasElement {
		const { x, y, ancho, alto } = recorteMejor;
		const escala = Math.min(1, TROFEO_PX / Math.max(ancho, alto));
		const trofeo = document.createElement('canvas');
		trofeo.width = Math.round(ancho * escala);
		trofeo.height = Math.round(alto * escala);
		const ctx = trofeo.getContext('2d')!;
		ctx.setTransform(-1, 0, 0, 1, trofeo.width, 0);
		ctx.drawImage(origen, x, y, ancho, alto, 0, 0, trofeo.width, trofeo.height);
		return trofeo;
	}

	function iniciarCompetencia() {
		reiniciarCompetencia();
		competencia.iniciar(performance.now());
	}

	function reiniciarCompetencia() {
		if (arcade && puedeRegistrar && !enviando) enviarPuntuacion(); // en Arcade todo intento se guarda
		partida++;
		competencia.reiniciar();
		fotoMejor = null;
		fotoTrofeo = null;
		registrado = false;
		errorRegistro = null;
		if (arcade) nombre = '';
	}

	// Enter inicia o reinicia la partida, salvo que se esté usando un campo o un botón con el teclado.
	// En Modo Arcade el equipo puede tener Enter como único control, así que en el campo del nombre
	// también inicia la siguiente partida (reiniciarCompetencia guarda antes la puntuación pendiente).
	function teclaEnter(e: KeyboardEvent) {
		if (e.key !== 'Enter' || e.repeat || !camaraActiva) return;
		const destino = e.target as HTMLElement;
		const enNombreArcade = arcade && destino.matches('[data-nombre]');
		if (!enNombreArcade && destino.closest('input:not([type="range"]), select, textarea, a')) return;
		if (destino.closest('button') && destino.matches(':focus-visible')) return;
		e.preventDefault();
		iniciarCompetencia();
	}

	// En Modo Arcade el nombre se escribe sin tocar el mouse
	function enfocarEnArcade(campo: HTMLInputElement) {
		if (arcade) campo.focus({ preventScroll: true });
	}

	async function cargarRanking() {
		try {
			const res = await fetch('/api/mogops/ranking');
			const datos = await res.json();
			if (!res.ok) throw new Error(datos.error || 'No se pudo cargar el ranking');
			ranking = datos;
			errorRanking = null;
			if (datos.mio && !nombre && !arcade) nombre = datos.mio.nombre;
		} catch (e) {
			errorRanking = e instanceof Error ? e.message : String(e);
		}
	}

	async function enviarPuntuacion() {
		if (!puedeRegistrar || final === null || !fotoTrofeo) return;
		const enviada = partida;
		enviando = true;
		errorRegistro = null;
		avisoRanking = null;
		try {
			const res = await fetch('/api/mogops/ranking', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nombre, puntuacion: final, foto: fotoTrofeo, arcade })
			});
			const datos = await res.json();
			if (!res.ok) throw new Error(datos.error || 'No se pudo registrar la puntuación');
			ranking = datos;
			if (enviada === partida) registrado = true;
		} catch (err) {
			const mensaje = err instanceof Error ? err.message : String(err);
			if (enviada === partida) errorRegistro = mensaje;
			else avisoRanking = `Una puntuación no se guardó: ${mensaje}`;
		}
		enviando = false;
	}

	function registrarPuntuacion(e: Event) {
		e.preventDefault();
		enviarPuntuacion();
	}

	async function comprobarArcade() {
		try {
			const res = await fetch('/api/mogops/arcade');
			desbloqueado = (await res.json()).desbloqueado === true;
			if (desbloqueado) {
				arcade = leerAjuste('mogops.arcade', false);
				dificultad = leerDificultad();
			}
		} catch {
			// Sin respuesta, se queda bloqueado
		}
	}

	async function desbloquear(e: Event) {
		e.preventDefault();
		verificando = true;
		errorClave = null;
		try {
			const res = await fetch('/api/mogops/arcade', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clave })
			});
			const datos = await res.json();
			if (!res.ok) throw new Error(datos.error || 'No se pudo comprobar la contraseña');
			desbloqueado = true;
			ajustesAbiertos = true;
			pidiendoClave = false;
			clave = '';
			if (!arcade) cambiarArcade(true);
		} catch (err) {
			errorClave = err instanceof Error ? err.message : String(err);
		}
		verificando = false;
	}

	function cambiarArcade(valor: boolean) {
		arcade = alternar('mogops.arcade', valor);
		nombre = '';
		if (!arcade) cargarRanking();
	}

	async function bloquear() {
		await fetch('/api/mogops/arcade', { method: 'DELETE' }).catch(() => undefined);
		desbloqueado = false;
		ajustesAbiertos = false;
		cambiarArcade(false);
		dificultad = DIFICULTAD_MIN;
		guardarAjuste('mogops.dificultad', dificultad);
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

<svelte:window onkeydown={teclaEnter} />

<!-- El número grande: va en el panel en escritorio y sobre la cámara en el celular -->
{#snippet marcador(grande: string, chico: string)}
	<!-- Gris y pequeño antes de la batalla; grande y con color al empezar el promedio -->
	<div
		class="font-mono font-extrabold leading-none tabular-nums tracking-tight transition-all duration-500 {pantallaFinal ? 'numero-final' : ''} {conPromedio
			? `${grande} ${colorPuntuacion(numero)}`
			: `${chico} text-slate-400`}"
		style={pantallaFinal ? `animation-duration: ${PANTALLA_FINAL_MS}ms` : undefined}
	>
		{numero === null ? '0.0' : numero.toFixed(1)}
	</div>
	<p class="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
		{#if competencia.fase === 'listo'}
			En vivo · pulsa Iniciar
		{:else if competencia.fase === 'calentamiento'}
			Calentando
		{:else if competencia.fase === 'batalla'}
			Promedio · ahora {fmt(titular)}
		{:else}
			Puntuación final
		{/if}
	</p>
{/snippet}

{#snippet filaRanking(fila: FilaRanking, puesto: number)}
	<li class={`flex items-center gap-2.5 rounded-xl border bg-white px-2.5 py-1.5 ${fila.esMio ? 'border-purple-400 shadow-sm' : 'border-purple-100'}`}>
		<span class="w-6 shrink-0 text-center font-mono text-sm font-extrabold text-purple-950">{puesto}</span>
		<img src={fila.foto} alt={`Trofeo de ${fila.nombre}`} class="h-10 w-10 shrink-0 rounded-lg object-cover" />
		<div class="min-w-0 flex-1">
			<p class="flex items-center gap-2 truncate text-sm font-bold text-slate-900">
				<span class="truncate">{fila.nombre}</span>
				{#if fila.esMio}
					<span class="shrink-0 rounded-full border border-purple-300 bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-purple-700">Tú</span>
				{/if}
			</p>
			<p class="text-[11px] text-slate-500">{cuando(fila.registradoEn)}</p>
		</div>
		<span class="shrink-0 font-mono text-xl font-extrabold tabular-nums {colorPuntuacion(fila.puntuacion)}">
			{fila.puntuacion.toFixed(1)}
		</span>
	</li>
{/snippet}

<div class="px-3 py-3 text-slate-900">
	<!--
		Escritorio: cámara a la izquierda, calificación arriba a la derecha y ranking abajo a la derecha,
		ocupando toda la pantalla. Celular: cámara con el número encima, y debajo métricas, ranking y ajustes.
	-->
	<section
		class="grid grid-cols-1 gap-3 lg:h-[calc(100dvh-65px-1.5rem)] lg:min-h-[480px] lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,11fr)_minmax(0,10fr)]"
	>
		<div class="contents lg:row-span-2 lg:flex lg:min-h-0 lg:flex-col lg:gap-3">
			<!-- Cámara -->
			<div
				bind:this={cajaCamara}
				class="relative order-1 flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 [perspective:900px] sm:aspect-[4/3] lg:order-none lg:aspect-auto lg:min-h-0 lg:flex-1"
			>
				<video bind:this={video} playsinline muted class="absolute inset-0 h-full w-full object-cover -scale-x-100"></video>
				<canvas
					bind:this={lienzo}
					class="pointer-events-none absolute inset-0 h-full w-full object-cover -scale-x-100"
				></canvas>

				<!-- Pantalla final: la cámara se queda congelada en el cuadro de la mejor calificación -->
				{#if pantallaFinal}
					<img src={fotoMejor} alt="" class="absolute inset-0 h-full w-full object-cover -scale-x-100" />
				{/if}

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

				{#if camaraActiva && competencia.fase === 'listo'}
					<button
						type="button"
						onclick={iniciarCompetencia}
						class="absolute rounded-xl bg-purple-600 px-10 py-3.5 text-lg font-extrabold text-white shadow-lg hover:bg-purple-700 transition-colors"
					>
						Iniciar
					</button>
				{/if}

				<!-- Tarjeta 3D sobre la cabeza, solo en escritorio -->
				{#if camaraActiva}
					<div bind:this={tarjeta} class="tarjeta3d pointer-events-none absolute left-0 top-0 hidden lg:block" style="opacity: 0">
						<div class="tarjeta-flota">
							{#each [5, 4, 3, 2, 1] as capa (capa)}
								<div class="tarjeta-capa" style="transform: translateZ({-capa * 2.5}px)"></div>
							{/each}
							<div class="tarjeta-cara">
								<span class="font-mono text-5xl font-extrabold leading-none tabular-nums tracking-tight {conPromedio ? colorPuntuacion(numero) : 'text-slate-400'}">
									{numero === null ? '0.0' : numero.toFixed(1)}
								</span>
								{#if numero !== null}
									<span class="mt-1 text-[10px] font-bold uppercase tracking-wider text-purple-700">{pslTier(pslFromScore(quitarCurva(numero, dificultad)))}</span>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Calificación sobre la cámara, solo en el celular -->
				{#if camaraActiva}
					<div class="pointer-events-none absolute inset-x-0 top-2 flex justify-center lg:hidden">
						<div class="rounded-2xl bg-white/85 px-4 py-2 text-center shadow-md backdrop-blur-sm">
							{@render marcador('text-5xl', 'text-3xl')}
						</div>
					</div>
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
						class="pointer-events-none absolute right-2 top-2 w-1/4 max-w-[220px] drop-shadow-lg sm:right-4 sm:top-4 lg:w-1/3"
					/>
				{/if}

				<!-- Mensajes, registro y controles, apilados sobre la parte baja de la cámara -->
				<div class="pointer-events-none absolute inset-x-2 bottom-2 flex flex-col items-center gap-2 sm:inset-x-3 sm:bottom-3">
					{#if analysis.reasons.length > 0 && competencia.fase !== 'final'}
						<ul class="flex flex-wrap justify-center gap-2">
							{#each analysis.reasons as razon (razon)}
								<li class="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 shadow-md">{razon}</li>
							{/each}
						</ul>
					{/if}

					<!-- Registro de la puntuación al terminar la batalla -->
					{#if final !== null}
						{#if puedeRegistrar}
							<form
								onsubmit={registrarPuntuacion}
								class="pointer-events-auto w-full max-w-lg space-y-2 rounded-2xl border border-purple-200 bg-white/95 p-3 shadow-xl backdrop-blur-sm"
							>
								{#if esperandoNombre}
									<div class="h-1.5 overflow-hidden rounded-full bg-purple-100" role="progressbar" aria-label="Tiempo para escribir tu nombre">
										<div class="barra-plazo h-full rounded-full bg-purple-600" style="animation-duration: {PLAZO_ARCADE_MS}ms"></div>
									</div>
								{/if}
								<div class="flex items-center gap-3">
									<img src={fotoTrofeo} alt="Tu cara en el mejor momento de la batalla" class="h-20 w-20 shrink-0 rounded-xl border-2 border-purple-300 object-cover" />
									<div class="min-w-0 flex-1 space-y-1.5">
										<div class="flex items-baseline justify-between gap-2">
											<span class="text-xs font-bold uppercase tracking-wider text-purple-600">Tu trofeo</span>
											<span class="font-mono text-2xl font-extrabold leading-none tabular-nums {colorPuntuacion(final)}">{final.toFixed(1)}</span>
										</div>
										<div class="flex gap-2">
											<input
												type="text"
												bind:value={nombre}
												data-nombre
												use:enfocarEnArcade
												required={!arcade}
												maxlength="24"
												aria-label="Tu nombre"
												placeholder={arcade ? 'Nombre (opcional)' : 'Tu nombre'}
												class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
											/>
											<button
												type="submit"
												disabled={enviando || (!arcade && !nombre.trim())}
												class="shrink-0 rounded-xl bg-purple-600 px-3 py-2 text-sm font-bold text-white shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
											>
												{enviando ? 'Registrando…' : 'Registrar'}
											</button>
										</div>
									</div>
								</div>
								{#if errorRegistro}
									<p class="text-xs font-semibold text-red-600">{errorRegistro}</p>
								{/if}
								<p class="text-[11px] leading-snug text-slate-500">
									{#if arcade}
										<strong class="text-slate-700">Privacidad:</strong> esta puntuación y la foto de arriba se publican en el ranking durante 7
										días, aunque no escribas tu nombre, y luego se borran.
									{:else}
										<strong class="text-slate-700">Privacidad:</strong> la foto de arriba solo se guarda si decides registrar tu puntuación. Si no
										la registras, nunca sale de tu dispositivo. Al registrarla, tu nombre y esta foto se publican en el ranking durante 7 días y
										luego se borran. Solo se guarda la mejor puntuación de este dispositivo.
									{/if}
								</p>
							</form>
						{:else if registrado}
							<p class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-sm font-semibold text-emerald-800 shadow-md">
								¡Puntuación registrada! Ya apareces en el ranking semanal.
							</p>
						{:else if !arcade && ranking?.mio && final <= ranking.mio.puntuacion}
							<p class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm text-slate-600 shadow-md">
								Tu récord de esta semana es <span class="font-mono font-bold">{ranking.mio.puntuacion.toFixed(1)}</span>. Supéralo para
								volver a registrarte.
							</p>
						{/if}
					{:else if competencia.fase === 'final'}
						<p class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800 shadow-md">
							No se detectó tu cara durante la batalla. Pulsa Reiniciar para intentarlo de nuevo.
						</p>
					{/if}

					<!-- Controles de la competencia -->
					{#if camaraActiva}
						{#if competencia.fase === 'calentamiento'}
							<span class="rounded-full bg-slate-950/75 px-4 py-1.5 text-sm font-bold text-white">
								La batalla empieza en <span class="font-mono tabular-nums">{competencia.restante}</span>
							</span>
						{:else if competencia.fase === 'batalla'}
							<span class="flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white shadow-md">
								<span class="h-2 w-2 animate-pulse rounded-full bg-white"></span>
								Batalla · <span class="font-mono tabular-nums">{competencia.restante} s</span>
							</span>
						{:else if competencia.fase === 'final'}
							<button
								type="button"
								onclick={reiniciarCompetencia}
								class="pointer-events-auto rounded-xl bg-white px-6 py-2 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-100 transition-colors"
							>
								Reiniciar
							</button>
						{/if}
					{/if}
				</div>
			</div>

			<!-- Ajustes y detalles -->
			<div class="order-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm lg:order-none">
				<div class="min-w-0 flex-1 basis-56">
					<p class="flex items-baseline gap-2">
						<a href="/galeria" class="text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors">← Galería</a>
						<span class="text-lg font-extrabold tracking-tight text-slate-950"><span class="sr-only">Juego </span>MogOps</span>
					</p>
					<p class="text-xs leading-snug text-slate-500">
						{#if arcade}
							Modo Arcade: cada puntuación y su foto se publican en el ranking.
						{:else}
							Todo se corre en tu dispositivo, a menos que elijas registrar tu puntuación en el ranking.
						{/if}
					</p>
				</div>

				<label class="flex items-center gap-2">
					<span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cámara</span>
					<select
						bind:value={camaraId}
						disabled={enJuego}
						onchange={(e) => e.currentTarget.blur()}
						class="max-w-44 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-purple-600 focus:outline-none disabled:opacity-50"
					>
						<option value="">Predeterminada</option>
						{#each camaras as c, i (c.deviceId)}
							<option value={c.deviceId}>{c.label || `Cámara ${i + 1}`}</option>
						{/each}
					</select>
				</label>

				<button
					type="button"
					role="switch"
					aria-checked={mostrarPuntos}
					onclick={() => (mostrarPuntos = alternar('mogops.puntos', !mostrarPuntos))}
					class={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${mostrarPuntos ? 'border-purple-300 bg-purple-50 text-purple-800' : 'border-slate-300 text-slate-500 hover:bg-slate-100'}`}
				>
					<span class={`h-2 w-2 rounded-full ${mostrarPuntos ? 'bg-purple-600' : 'bg-slate-300'}`}></span>
					Puntos faciales
				</button>

				<button
					type="button"
					role="switch"
					aria-checked={arcade}
					disabled={enJuego}
					onclick={() => (ajustesAbiertos ? cambiarArcade(!arcade) : (pidiendoClave = !pidiendoClave))}
					class={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${arcade ? 'border-purple-300 bg-purple-50 text-purple-800' : 'border-slate-300 text-slate-500 hover:bg-slate-100'}`}
				>
					<span class={`h-2 w-2 rounded-full ${arcade ? 'bg-purple-600' : 'bg-slate-300'}`}></span>
					Modo Arcade
				</button>

				{#if pidiendoClave && !ajustesAbiertos}
					<form onsubmit={desbloquear} class="flex w-full flex-wrap items-center justify-end gap-2">
						{#if errorClave}
							<span class="text-xs font-semibold text-red-600">{errorClave}</span>
						{/if}
						<input
							type="password"
							bind:value={clave}
							required
							autocomplete="off"
							aria-label="Contraseña del Modo Arcade"
							placeholder="Contraseña"
							class="w-40 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-purple-600 focus:outline-none"
						/>
						<button type="submit" disabled={verificando} class="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors disabled:opacity-50">
							Entrar
						</button>
					</form>
				{/if}

				{#if ajustesAbiertos}
					<div class="flex w-full flex-wrap items-center justify-end gap-3">
						<label class="flex items-center gap-2">
							<span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dificultad</span>
							<input
								type="range"
								min={DIFICULTAD_MIN}
								max={DIFICULTAD_MAX}
								step="1"
								bind:value={dificultad}
								disabled={enJuego}
								onchange={() => guardarAjuste('mogops.dificultad', dificultad)}
								class="w-32 accent-purple-600 disabled:opacity-50"
							/>
							<span class="w-4 font-mono text-xs font-bold tabular-nums text-slate-700">{dificultad}</span>
						</label>
						<button type="button" onclick={bloquear} class="text-xs font-semibold text-slate-500 underline hover:text-slate-800">Bloquear</button>
						<button
							type="button"
							onclick={() => (ajustesAbiertos = false)}
							class="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
						>
							Confirmar
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Calificación y métricas -->
		<div class="order-2 flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain rounded-2xl border border-purple-200 bg-purple-50/60 p-3 lg:order-none lg:[@media(max-height:700px)]:gap-1.5 lg:[@media(max-height:700px)]:p-2">
			<div class="flex items-center justify-between gap-3">
				<h1 class="text-xs font-bold uppercase tracking-wider text-purple-600">Calificación</h1>
				<span class={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${ESTADO[analysis.status]}`}>
					{analysis.message}
				</span>
			</div>

			<div class="flex items-center gap-4">
				<div class="hidden min-w-32 shrink-0 text-center lg:block">
					{@render marcador(
						'text-8xl min-[1800px]:text-9xl lg:[@media(max-height:820px)]:text-7xl lg:[@media(max-height:700px)]:text-6xl',
						'text-7xl min-[1800px]:text-8xl lg:[@media(max-height:820px)]:text-6xl lg:[@media(max-height:700px)]:text-5xl'
					)}
				</div>
				<div class="min-w-0 flex-1 space-y-0.5 text-center lg:text-left">
					{#if numero !== null}
						{@const psl = pslFromScore(quitarCurva(numero, dificultad))}
						{@const top = Math.max(0.1, (1 - percentileOf(quitarCurva(numero, dificultad))) * 100)}
						<p class="text-sm font-semibold text-slate-800">PSL {psl.toFixed(1)} · {pslTier(psl)}</p>
						<p class="text-xs text-slate-500">Top {top < 1 ? top.toFixed(1) : Math.round(top)}% de las caras</p>
					{/if}
					<p class="flex flex-wrap justify-center gap-x-3 text-xs text-slate-600 lg:justify-start">
						<span>Geometría <span class="font-mono font-semibold tabular-nums">{fmt(geometria)}</span></span>
						{#if bono}
							<span class="font-semibold text-purple-700">Bono <span class="font-mono tabular-nums">{conSigno(bono.total)}</span></span>
						{/if}
					</p>
				</div>
			</div>

			{#if analysis.strength && analysis.flaw}
				<div class="grid grid-cols-2 gap-2 text-xs lg:[@media(max-height:775px)]:hidden">
					<p class="truncate rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-950" title={`Lo más fuerte: ${analysis.strength}`}>
						<span class="font-semibold text-emerald-700">+</span> {analysis.strength}
					</p>
					<p class="truncate rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-rose-950" title={`Lo más débil: ${analysis.flaw}`}>
						<span class="font-semibold text-rose-700">−</span> {analysis.flaw}
					</p>
				</div>
			{/if}

			<!-- Gestos que suman o restan puntos, seguidos de las proporciones de la cara -->
			<ul class="grid grid-cols-2 gap-x-3 gap-y-1 px-1">
				{#if bono}
					{#each bono.items as b (b.id)}
						{@const castigo = b.max < 0}
						{@const activo = b.level > 0}
						<li>
							<div class="flex items-baseline justify-between gap-1 text-[11px] leading-tight">
								<span class={`truncate ${activo ? (castigo ? 'font-semibold text-rose-700' : 'font-semibold text-purple-900') : 'text-slate-700'}`}>{b.label}</span>
								<span class={`font-mono tabular-nums ${activo ? (castigo ? 'text-rose-600' : 'text-purple-700') : 'text-slate-400'}`}>
									{conSigno(activo ? b.points : b.max)}
								</span>
							</div>
							<div class="mt-0.5 h-1 overflow-hidden rounded-full bg-purple-100">
								<div
									class={`h-full rounded-full transition-[width] duration-150 ${castigo ? 'bg-rose-500' : 'bg-purple-600'}`}
									style="width: {b.level * 100}%"
								></div>
							</div>
						</li>
					{/each}
				{/if}
				{#each METRIC_KEYS as rasgo (rasgo)}
					{@const valor = analysis.subs?.[rasgo] ?? null}
					<li class="lg:[@media(max-height:610px)]:hidden">
						<div class="flex items-baseline justify-between gap-1 text-[11px] leading-tight">
							<span class="truncate text-slate-700">
								{TRAITS[rasgo].label}
								<span class="text-[10px] text-slate-400">
									{countsInOverall(rasgo) ? `${Math.round(traitWeight(rasgo) * 100)}%` : ''}
								</span>
							</span>
							<span class="font-mono tabular-nums text-slate-600">{valor === null ? '0.0' : valor.toFixed(1)}</span>
						</div>
						<div class="mt-0.5 h-1 overflow-hidden rounded-full bg-purple-100 lg:[@media(max-height:700px)]:hidden">
							<div class="h-full rounded-full bg-purple-600 transition-[width] duration-300" style="width: {(valor ?? 0) * 10}%"></div>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Ranking semanal -->
		<div class="order-3 flex min-h-0 flex-col gap-2 rounded-2xl border border-purple-200 bg-purple-50/60 p-3 lg:order-none">
			<div>
				<h2 class="text-base font-extrabold leading-tight text-slate-900">Ranking semanal</h2>
				<p class="text-xs text-slate-600">Las mejores puntuaciones de los últimos 7 días.</p>
				{#if avisoRanking}
					<p class="text-xs font-semibold text-red-600">{avisoRanking}</p>
				{/if}
			</div>

			{#if errorRanking}
				<p class="text-sm text-slate-500">{errorRanking}</p>
			{:else if !ranking}
				<p class="text-sm text-slate-500">Cargando ranking…</p>
			{:else if ranking.ranking.length === 0}
				<p class="text-sm text-slate-500">Todavía nadie se ha registrado esta semana. ¡Sé el primero!</p>
			{:else if arcade}
				<!-- Modo Arcade: los primeros lugares fijos y el resto en un carrusel sin fin -->
				{@const resto = ranking.ranking.slice(FIJOS_ARCADE, MAX_ARCADE)}
				<ol class="space-y-1.5">
					{#each ranking.ranking.slice(0, FIJOS_ARCADE) as fila, i (i)}
						{@render filaRanking(fila, i + 1)}
					{/each}
				</ol>
				{#if resto.length > 0}
					<div bind:clientHeight={altoCarrusel} class="h-48 min-h-0 flex-1 overflow-hidden lg:h-auto">
						<div class={carruselActivo ? 'carrusel' : ''} style="animation-duration: {resto.length * SEGUNDOS_POR_FILA}s">
							<ol bind:clientHeight={altoLista} class="space-y-1.5 pb-1.5">
								{#each resto as fila, i (i)}
									{@render filaRanking(fila, i + FIJOS_ARCADE + 1)}
								{/each}
							</ol>
							{#if carruselActivo}
								<ol aria-hidden="true" class="space-y-1.5 pb-1.5">
									{#each resto as fila, i (i)}
										{@render filaRanking(fila, i + FIJOS_ARCADE + 1)}
									{/each}
								</ol>
							{/if}
						</div>
					</div>
				{/if}
			{:else}
				<ol class="max-h-96 min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1 lg:max-h-none">
					{#each ranking.ranking as fila, i (i)}
						{@render filaRanking(fila, i + 1)}
					{/each}
				</ol>
			{/if}
		</div>
	</section>

	<!-- CÓMO FUNCIONA -->
	<section class="mx-auto mt-6 max-w-[1440px] space-y-3 sm:mt-10 sm:space-y-4">
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
						<strong>Competencia.</strong> Pulsa Iniciar o Enter: durante 8 segundos solo ves tu calificación en vivo. Luego empieza la
						batalla de 15 segundos, en la que se calcula el promedio de tu calificación ponderado por tiempo. Al terminar, la puntuación
						queda congelada y puedes registrarla con tu nombre y la foto de tu mejor momento.
					</p>
					<p>
						<strong>Puntos faciales.</strong> MediaPipe Face Landmarker encuentra 478 puntos de la cara directamente en tu navegador
						(WebAssembly). El modelo pesa unos 4 MB y se descarga una sola vez de esta misma página.
					</p>
					<p>
						<strong>Geometría.</strong> Con esos puntos se miden 8 proporciones (simetría, inclinación de ojos, ancho de mandíbula…).
						Cada una se califica con una curva aprendida de las 5,500 caras de SCUT-FBP5500, calificadas por personas. Coincide con
						calificaciones humanas en caras no vistas con r de Pearson de {GEOMETRY_ACCURACY.pc5fold.toFixed(2)}. La escala está estirada
						para que la mitad de las caras lleguen a 6 y una cuarta parte a 8. Arriba de 8, cada punto cuesta cada vez más.
					</p>
					<p>
						<strong>Gestos.</strong> MediaPipe también estima la fuerza de 52 expresiones. Levantar una ceja, entrecerrar los ojos
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

	/* Barra del plazo para escribir el nombre en Modo Arcade */
	.barra-plazo {
		animation: plazo linear forwards;
	}

	@keyframes plazo {
		from {
			width: 100%;
		}
		to {
			width: 0;
		}
	}

	/* La puntuación crece durante toda la pantalla final */
	.numero-final {
		animation: crecer cubic-bezier(0.2, 0.6, 0.4, 1) forwards;
	}

	@keyframes crecer {
		from {
			transform: scale(0.45);
		}
		to {
			transform: scale(1);
		}
	}

	/* Tarjeta 3D: la cara va al frente y las capas de atrás le dan grosor */
	.tarjeta3d {
		transform-origin: bottom center;
		transform-style: preserve-3d;
		will-change: transform;
	}

	.tarjeta-flota {
		position: relative;
		transform-style: preserve-3d;
		animation: flotar 3s ease-in-out infinite;
	}

	.tarjeta-cara,
	.tarjeta-capa {
		border-radius: 18px;
	}

	.tarjeta-cara {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 150px;
		padding: 14px 22px 12px;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.97), rgba(243, 232, 255, 0.92));
		border: 2px solid #c084fc;
		box-shadow: 0 18px 30px rgba(15, 23, 42, 0.45);
		transform: translateZ(0);
	}

	.tarjeta-capa {
		position: absolute;
		inset: 0;
		background: #7c3aed;
	}

	@keyframes flotar {
		0%,
		100% {
			transform: translateY(0) rotateX(4deg);
		}
		50% {
			transform: translateY(-10px) rotateX(-4deg);
		}
	}

	/* Carrusel del ranking en Modo Arcade: la lista va duplicada, así que moverla media altura cierra el ciclo */
	.carrusel {
		animation: carrusel linear infinite;
	}

	@keyframes carrusel {
		to {
			transform: translateY(-50%);
		}
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
