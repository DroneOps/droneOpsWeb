<script lang="ts">
	// Autor: Miguel Tovar
	import { onDestroy, onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { scale } from 'svelte/transition';
	import gigachadImg from '$lib/assets/gigachad.png';
	import { EMPTY, ENGINE_LABEL, FaceAnalyzer, headlineScore, MOG_THRESHOLD, type Analysis, type Engine } from '$lib/mogops/analysis';
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
	let modo = $state<'foto' | 'camara'>('camara');
	let motor = $state<Engine>('geometry');
	let mostrarPuntos = $state(false);
	let modelosListos = $state(false);
	let errorModelos = $state<string | null>(null);
	let errorCamara = $state<string | null>(null);
	let imagenUrl = $state<string | null>(null);
	let camaras = $state<MediaDeviceInfo[]>([]);
	let camaraId = $state('');
	let cejaFlash = $state(false);

	// Elementos del DOM
	let video = $state<HTMLVideoElement>();
	let lienzo = $state<HTMLCanvasElement>();

	// El analizador se crea solo en el navegador (MediaPipe no corre en el servidor)
	let analizador = $state<FaceAnalyzer | null>(null);
	let sonidos: Sounds | null = null;
	let timerCeja = 0;
	let raf = 0;

	const titular = $derived(headlineScore(analysis, motor, true));
	const calificado = $derived(analysis.status === 'ready' || analysis.status === 'adjust');
	const gigachad = $derived(calificado && titular !== null && titular >= MOG_THRESHOLD);
	const bono = $derived(analysis[motor] !== null ? analysis.bonus : null);

	onMount(() => {
		mostrarPuntos = leerAjuste('mogops.puntos', false);
		sonidos = createSounds();

		const nuevo = new FaceAnalyzer(
			(a) => (analysis = a),
			() => {
				sonidos?.boom();
				cejaFlash = true;
				clearTimeout(timerCeja);
				timerCeja = window.setTimeout(() => (cejaFlash = false), 1200);
			}
		);
		analizador = nuevo;
		nuevo
			.preload()
			.then(() => (modelosListos = true))
			.catch((e: unknown) => (errorModelos = e instanceof Error ? e.message : String(e)));

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
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		cancelAnimationFrame(raf);
		clearTimeout(timerCeja);
		sonidos?.stop();
		analizador?.stopCamera();
		if (imagenUrl) URL.revokeObjectURL(imagenUrl);
	});

	// La canción de Gigachad suena mientras la calificación esté en 8 o más; al bajar se pausa y luego continúa
	$effect(() => {
		sonidos?.setMusic(gigachad);
	});

	// Enciende la cámara al entrar a ese modo o al cambiar de cámara
	$effect(() => {
		if (modo !== 'camara' || !modelosListos || !analizador || !video) return;
		const a = analizador;
		errorCamara = null;
		a.startCamera(video, camaraId || undefined)
			.then(() => navigator.mediaDevices.enumerateDevices())
			.then((todas) => (camaras = todas.filter((d) => d.kind === 'videoinput')))
			.catch((e: unknown) => (errorCamara = e instanceof Error ? e.message : String(e)));
		return () => a.stopCamera();
	});

	function cambiarModo(siguiente: 'foto' | 'camara') {
		if (siguiente === modo) return;
		analizador?.reset();
		modo = siguiente;
	}

	function alElegirFoto(e: Event) {
		const archivo = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!archivo) return;
		if (imagenUrl) URL.revokeObjectURL(imagenUrl);
		imagenUrl = URL.createObjectURL(archivo);
	}

	function alternar(clave: string, valor: boolean): boolean {
		guardarAjuste(clave, valor);
		return valor;
	}

	const fmt = (v: number | null) => (v === null ? '–' : v.toFixed(1));
	const conSigno = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`;

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
			Sube una foto o usa tu cámara y recibe una calificación del 0 al 10. Todo se procesa en tu dispositivo: tu cara nunca sale de tu navegador.
		</p>
	</section>

	<!-- 2. JUEGO -->
	<section class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
		<!-- Entrada: foto o cámara -->
		<div class="lg:col-span-7 rounded-2xl sm:rounded-[32px] border border-slate-200 bg-white p-5 sm:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)] space-y-5">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider text-slate-500">Entrada</span>
					<div class="flex rounded-xl bg-stone-200/80 p-1">
						{#each [['foto', 'Foto'], ['camara', 'Cámara']] as [valor, texto] (valor)}
							<button
								type="button"
								onclick={() => cambiarModo(valor as 'foto' | 'camara')}
								class={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${modo === valor ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700 hover:bg-stone-300/80'}`}
							>
								{texto}
							</button>
						{/each}
					</div>
				</div>
				<label class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider text-slate-500">Calificación principal</span>
					<select
						bind:value={motor}
						class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
					>
						<option value="geometry">Geometría (aprendida de humanos)</option>
						<option value="psl">Ratios PSL (lore de looksmaxxing)</option>
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

			{#if modo === 'camara'}
				<label class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider text-slate-500">Cámara</span>
					<select
						bind:value={camaraId}
						class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
					>
						<option value="">Cámara predeterminada</option>
						{#each camaras as c, i (c.deviceId)}
							<option value={c.deviceId}>{c.label || `Cámara ${i + 1}`}</option>
						{/each}
					</select>
				</label>
			{:else}
				<label class="flex flex-col gap-1.5">
					<span class="text-xs font-bold uppercase tracking-wider text-slate-500">Foto</span>
					<input
						type="file"
						accept="image/*"
						disabled={!modelosListos}
						onchange={alElegirFoto}
						class="text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-purple-700 disabled:opacity-50"
					/>
				</label>
			{/if}

			<div class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
				{#if modo === 'camara'}
					<video bind:this={video} playsinline muted class="h-full w-full object-contain -scale-x-100"></video>
				{:else if imagenUrl}
					<img
						src={imagenUrl}
						alt="Foto seleccionada"
						onload={(e) => analizador?.analyzeImage(e.currentTarget as HTMLImageElement)}
						class="h-full w-full object-contain"
					/>
				{/if}
				<canvas
					bind:this={lienzo}
					class={`pointer-events-none absolute inset-0 h-full w-full object-contain ${modo === 'camara' ? '-scale-x-100' : ''}`}
				></canvas>

				{#if errorModelos}
					<p class="absolute inset-x-6 text-center text-sm text-slate-400">No se pudieron cargar los modelos: {errorModelos}</p>
				{:else if !modelosListos}
					<p class="absolute inset-x-6 text-center text-sm text-slate-400">Cargando modelo facial (4 MB)…</p>
				{:else if errorCamara}
					<p class="absolute inset-x-6 text-center text-sm text-slate-400">Cámara no disponible: {errorCamara}</p>
				{:else if modo === 'foto' && !imagenUrl}
					<p class="absolute inset-x-6 text-center text-sm text-slate-400">Elige una foto de frente para empezar.</p>
				{/if}

				{#if cejaFlash}
					<span class="absolute left-3 top-3 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
						Ceja levantada
					</span>
				{/if}

				<!-- Sello de Gigachad sobre la vista previa mientras la calificación esté en 8 o más -->
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
				<div class="font-mono text-7xl font-extrabold tabular-nums tracking-tight text-purple-950">
					{titular === null ? '0.0' : titular.toFixed(1)}
				</div>
				{#if titular !== null}
					{@const psl = pslFromScore(titular)}
					{@const top = Math.max(0.1, (1 - percentileOf(titular)) * 100)}
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

	<!-- 3. CÓMO FUNCIONA -->
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
