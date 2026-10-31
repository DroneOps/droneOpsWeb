import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ESARCHIVO = /\.(html|css|js|mjs|json|xml|map|webp|png|jpe?g|gif|svg|ico|woff2?|ttf|otf|txt|pdf|mp4|webm|mp3|wasm)$/i;

export const GET: RequestHandler = ({ params, url }) => {
	const path = params.path ?? '';
	const last = path.split('/').pop() ?? '';

	// Archivo que no existe, o carpeta con barra final: no hay nada que reescribir
	if (last === '' || ESARCHIVO.test(last)) error(404, 'No encontrado');

	const destino = '/docs/' + path.split('/').map(encodeURIComponent).join('/') + '.html';
	redirect(302, destino + url.search);
};