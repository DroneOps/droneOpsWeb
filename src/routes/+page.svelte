<script>
  import Navbar from '$lib/Navbar.svelte';
  import Hero from '$lib/Hero.svelte';
  import MissionSection from '$lib/MissionSection.svelte';
  import ResourcesSection from '$lib/ResourcesSection.svelte';
  import Footer from '$lib/Footer.svelte';
</script>

<div class="flex min-h-screen w-full flex-col bg-white">
  <Navbar />
  <main class="flex flex-col">
    <Hero />
    <MissionSection />
    <ResourcesSection />
  </main>
  <Footer />
</div>