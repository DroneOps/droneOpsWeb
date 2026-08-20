<script>
  let {
    eyebrow = 'APRENDIZAJE Y MEDIOS',
    title = 'Recursos y documentación',
    description = 'En DroneOps fundamentamos nuestras operaciones en ingeniería de control, visión artificial y simulación avanzada. Compartimos nuestra base de conocimiento y guías de desarrollo para el equipo y la comunidad.',
    resources = [
      'Software Base y Simulación',
      'Control, Estimación y Posicionamiento',
      'Documentación Oficial y Librerías'
    ]
  } = $props();
</script>

<section class="flex w-full flex-col gap-8 overflow-hidden px-6 py-10 sm:px-10 lg:px-20">
  <div class="flex flex-col gap-4">
    <h2 class="font-mono text-xl font-semibold tracking-wide text-violet-600">{eyebrow}</h2>
    <h3 class="text-3xl font-extrabold text-black sm:text-4xl">{title}</h3>
    <p class="max-w-3xl text-base leading-relaxed text-slate-600">{description}</p>
  </div>

  <div class="flex flex-col gap-4">
    {#each resources as resource (resource)}
      <a
        href="#"
        class="group flex flex-row items-center gap-6 rounded-[50px] bg-neutral-200 px-8 py-8 shadow transition-colors hover:bg-neutral-300"
      >
        <span
          class="h-0 w-0 rotate-90 border-l-[26px] border-r-[26px] border-t-[25px] border-l-transparent border-r-transparent border-t-neutral-500 transition-transform group-hover:translate-x-1"
        ></span>
        <span class="text-2xl font-semibold text-black sm:text-3xl">{resource}</span>
      </a>
    {/each}
  </div>
</section>
