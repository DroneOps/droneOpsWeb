<script>
  import Navbar from './Navbar.svelte';
  import Hero from './Hero.svelte';
  import MissionSection from './MissionSection.svelte';
  import ResourcesSection from './ResourcesSection.svelte';
  import Footer from './Footer.svelte';

  // Pass-through props so this page can be reused/re-skinned without
  // touching the subcomponents directly.
  let {
    navbar = {},
    hero = {},
    mission = {},
    resources = {},
    footer = {}
  } = $props();
</script>

<div class="flex min-h-screen w-full flex-col bg-white">
  <Navbar {...navbar} />
  <main class="flex flex-col">
    <Hero {...hero} />
    <MissionSection {...mission} />
    <ResourcesSection {...resources} />
  </main>
  <Footer {...footer} />
</div>
