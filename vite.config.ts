import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit(),
        {
            // Plugin para arreglar las rutas de Quartz en local
            name: 'quartz-html-rewrite',
            enforce: 'pre',
            configureServer(server) {
                const staticDir = join(server.config.root, 'static');
                const esArchivo = /\.(html|css|js|mjs|json|xml|map|webp|png|jpe?g|gif|svg|ico|woff2?|ttf|otf|txt|pdf|mp4|webm|mp3|wasm)$/i;

                server.middlewares.use((req, res, next) => {
                    if (!req.url) return next();
                    const [pathname, query] = req.url.split('?');
                    if (!pathname.startsWith('/docs/')) return next();

                    const qs = query ? '?' + query : '';
                    const last = pathname.split('/').pop() ?? '';

                    // Carpeta con barra final → su index.html
                    if (last === '') {
                        req.url = pathname + 'index.html' + qs;
                        return next();
                    }
                    // Archivos reales (css, js, imágenes, .html…) → no tocar
                    if (esArchivo.test(last)) return next();

                    let rel = pathname;
                    try { rel = decodeURIComponent(pathname); } catch {}

                    // Pagina: x → x.html
                    if (existsSync(join(staticDir, rel + '.html'))) {
                        req.url = pathname + '.html' + qs;
                        return next();
                    }
                    // Carpeta sin barra final: redirigir a x/ para que los enlaces relativos funcionen
                    const dir = join(staticDir, rel);
                    if (existsSync(dir) && statSync(dir).isDirectory()) {
                        res.statusCode = 302;
                        res.setHeader('Location', pathname + '/' + qs);
                        return res.end();
                    }
                    next();
                });
            }
        }
    ]
});