<script>
  /**
   * @typedef {{ label: string, href: string, active?: boolean }} NavLink
   *
   * @typedef {{
   *   logoSrc?: string,
   *   logoAlt?: string,
   *   links?: NavLink[],
   *   ctaLabel?: string,
   *   avatarSrc?: string,
   *   onCtaClick?: (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => void
   * }} Props
   */

  /** @type {Props} */
  let {
    logoSrc = '/logo.svg',
    logoAlt = 'DroneOps',
    links = [
      { label: 'Inicio', href: '#inicio', active: true },
      { label: 'Objetivo', href: '#objetivo' },
      { label: 'Por hacer', href: '#por-hacer' },
      { label: 'Comunidad', href: '#comunidad' }
    ],
    ctaLabel = 'Acceso Miembros',
    avatarSrc = '/avatar-placeholder.svg',
    onCtaClick = () => {}
  } = $props();
</script>

<nav
  class="flex w-full flex-row items-center justify-between gap-6 border-b border-slate-800 bg-[#0b0f17]/95 px-6 py-5 backdrop-blur-md sm:px-10 lg:px-20"
>
  <a href="#inicio" class="flex flex-row items-center gap-1">
    <img src={logoSrc} alt={logoAlt} class="h-[34px] w-auto" />
  </a>

  <ul class="hidden flex-row items-center gap-8 md:flex">
    {#each links as link (link.label)}
      <li>
        <a
          href={link.href}
          class="text-sm font-medium transition-colors {link.active
            ? 'text-white'
            : 'text-slate-400 hover:text-white'}"
        >
          {link.label}
        </a>
      </li>
    {/each}
  </ul>

  <button
    type="button"
    onclick={onCtaClick}
    class="flex flex-row items-center gap-2 rounded-lg border border-slate-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
  >
    <span>{ctaLabel}</span>
    <img src={avatarSrc} alt="" class="h-[27px] w-[27px] rounded-full" />
  </button>
</nav>