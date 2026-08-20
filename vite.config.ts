import adapter from '@sveltejs/kit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';


export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	]
});
