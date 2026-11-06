// Autor: Miguel Tovar
// Desbloquea (y vuelve a bloquear) el Modo Arcade y la dificultad en un navegador.
import { json, type RequestHandler } from '@sveltejs/kit';
import { arcadeAutorizado, autorizarArcade, claveCorrecta, revocarArcade } from '$lib/mogops/arcade.server';

export const GET: RequestHandler = ({ cookies }) => json({ desbloqueado: arcadeAutorizado(cookies) });

export const POST: RequestHandler = async ({ request, cookies }) => {
	const datos = await request.json().catch(() => null);
	if (typeof datos?.clave !== 'string' || !claveCorrecta(datos.clave)) {
		return json({ error: 'Contraseña incorrecta' }, { status: 403 });
	}
	autorizarArcade(cookies);
	return json({ desbloqueado: true });
};

export const DELETE: RequestHandler = ({ cookies }) => {
	revocarArcade(cookies);
	return json({ desbloqueado: false });
};
