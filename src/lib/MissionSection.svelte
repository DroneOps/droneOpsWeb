<script>
  /**
   * @typedef {{ name: string, subtitle: string, description: string, status: string }} Competition
   */

  let {
    eyebrow = 'Nuestro Objetivo',
    title = 'Competencias internacionales',
    description = 'En DroneOps, nos proyectamos hacia el futuro de la industria aérea no tripulada. Transformamos la perspectiva de los proyectos mediante tecnología de vanguardia, precisión técnica y máxima seguridad operativa.',
    imageSrc = '/mission-team.jpg',
    imageAlt = 'Equipo DroneOps',
    competitions = /** @type {Competition[]} */ ([
      {
        name: 'TMR',
        subtitle: 'Torneo Mexicano de Robótica (TMR)',
        description:
          'La competencia de robótica aérea más grande de México, organizada por la federación mexicana de robótica.',
        status: 'EN PROGRESO'
      },
      {
        name: 'IMAV 2026',
        subtitle: 'International Micro Air Vehicle Competition',
        description:
          'Navegación autónoma de enjambres en entornos outdoor complejos sin soporte de GPS externo.',
        status: 'EN PROGRESO'
      }
    ])
  } = $props();
</script>

<section class="flex w-full flex-col gap-12 px-6 py-16 sm:px-10 lg:px-20">
  <div class="grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
    <div class="flex flex-col gap-3">
      <h2 class="font-mono text-xl font-semibold tracking-wide text-violet-600">
        {eyebrow}
      </h2>
      <h3 class="text-3xl font-extrabold text-black sm:text-4xl">
        {title}
      </h3>
      <p class="text-base leading-relaxed text-slate-600">
        {description}
      </p>
    </div>

    <img
      src={imageSrc}
      alt={imageAlt}
      class="hidden w-full rounded-3xl border-4 border-[#535353]/80 object-cover shadow-lg lg:col-start-2 lg:row-span-2 lg:block"
    />

    <div class="flex flex-col gap-5">
      {#each competitions as comp (comp.name)}
        <article
          class="flex flex-col gap-4 rounded-2xl border border-violet-600 bg-violet-50 p-6"
        >
          <div class="flex flex-row items-center justify-between gap-4">
            <div class="flex flex-col gap-1">
              <h4 class="text-xl font-bold text-violet-600">{comp.name}</h4>
              <p class="text-xs text-black">{comp.subtitle}</p>
            </div>
            <span
              class="whitespace-nowrap rounded-full border border-[#1829bb] bg-[#d8dcff] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-[#1829bb]"
            >
              {comp.status}
            </span>
          </div>
          <p class="text-sm leading-relaxed text-black">{comp.description}</p>
        </article>
      {/each}
    </div>
  </div>
</section>
