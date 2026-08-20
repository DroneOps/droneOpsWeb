<script>
  let {
    badgeText = 'COMPETIDORES INTERNACIONALES 2026',
    title = '¡Bienvenido a la central de DroneOps!',
    description = 'Somos un equipo apasionado por la tecnología robótica, la innovación y la captura de datos desde las alturas. Diseñamos, operamos y optimizamos soluciones con drones para llevar cualquier proyecto al siguiente nivel.',
    primaryCtaLabel = 'Únete',
    primaryCtaHref = '#unete',
    secondaryCtaLabel = 'Por hacer',
    secondaryCtaHref = '#por-hacer',
    imageSrc = '/hero-drone-camera.jpg',
    imageAlt = 'Cámara de drone Tello'
  } = $props();
</script>

<section
  class="flex w-full flex-col items-center gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:gap-16 lg:px-20 lg:py-24"
>
  <div class="flex w-full flex-1 flex-col gap-8 lg:max-w-xl">
    <span
      class="inline-flex w-fit items-center gap-2 rounded-full border border-violet-600 bg-violet-600/10 px-3 py-1.5"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-violet-600"></span>
      <span class="font-mono text-xs font-semibold uppercase tracking-wide text-violet-600">
        {badgeText}
      </span>
    </span>

    <h1
      class="text-4xl font-extrabold leading-[1.15] tracking-tight text-black sm:text-5xl lg:text-[56px]"
    >
      {title}
    </h1>

    <p class="text-base leading-relaxed text-slate-600 sm:text-lg">
      {description}
    </p>

    <div class="flex flex-row flex-wrap items-center gap-4">
      <a
        href={primaryCtaHref}
        class="rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
      >
        {primaryCtaLabel}
      </a>
      <a
        href={secondaryCtaHref}
        class="rounded-lg border border-slate-800 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-slate-50"
      >
        {secondaryCtaLabel}
      </a>
    </div>
  </div>

  <div class="w-full flex-1 lg:max-w-lg">
    <img
      src={imageSrc}
      alt={imageAlt}
      class="w-full rounded-3xl border-[3px] border-[#4c4c4c]/60 object-cover shadow-2xl"
    />
  </div>
</section>
