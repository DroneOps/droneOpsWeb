<script>
  /** @typedef {{ label: string, href: string, icon: 'github' | 'instagram' | 'linkedin' | 'youtube' }} SocialLink */

  let {
    logoSrc = '/logo.svg',
    logoAlt = 'DroneOps',
    description = 'Grupo de tecnología y robótica aérea de vanguardia. Diseñando autonomía, rompiendo barreras internacionales.',
    orgName = 'Asociación de Robótica de la Universidad',
    socialLinks = /** @type {SocialLink[]} */ ([
      { label: 'GitHub', href: '#', icon: 'github' },
      { label: 'Instagram', href: '#', icon: 'instagram' }
    ]),
    copyright = '© 2026 DroneOps. Todos los derechos reservados.',
    institution = 'Instituto Tecnológico y de Estudios Superiores de Monterrey, Campus Guadalajara · TEC'
  } = $props();
</script>

<footer class="flex w-full flex-col gap-12 border-t border-slate-800 bg-[#0b0f17] px-6 pb-10 pt-16 sm:px-10 lg:px-20">
  <div class="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
    <div class="flex max-w-sm flex-col gap-4">
      <img src={logoSrc} alt={logoAlt} class="h-[34px] w-auto" />
      <p class="text-sm leading-relaxed text-slate-400">{description}</p>
      <p class="font-mono text-xs text-violet-600">{orgName}</p>
    </div>

    <div class="flex flex-col gap-4">
      <h4 class="font-mono text-xs font-bold tracking-wide text-white">COMUNIDAD</h4>
      <ul class="flex flex-col gap-4">
        {#each socialLinks as social (social.label)}
          <li>
            <a
              href={social.href}
              class="flex flex-row items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <span class="h-4 w-4">
                <!-- icon placeholder: swap for lucide-svelte or inline svg per social.icon -->
              </span>
              {social.label}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div
    class="flex flex-col gap-2 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"
  >
    <p>{copyright}</p>
    <p>{institution}</p>
  </div>
</footer>
