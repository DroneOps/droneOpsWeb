// Autor: Miguel Tovar
// Llave del Modo Arcade y de la dificultad. La contraseña nunca está en el
// código (el repo es público): aquí solo vive su hash scrypt. Al acertarla, el
// servidor deja en el navegador una cookie httpOnly firmada, y es esa cookie la
// que autoriza guardar varios intentos desde un mismo dispositivo.
import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const COOKIE = 'mogops_arcade';
const SAL = 'mogops-arcade';
const CLAVE_HASH = '77025422895271c9a75adc8c81b09d6e92330ba5ee5bd2eb6a8805607ec88490'; // scrypt(clave, SAL), ver LEEME.md
const DIAS_VIGENCIA = 3;

// La firma usa un secreto del servidor; sin él (desarrollo) basta con el hash
const firma = () =>
	createHmac('sha256', env.SUPABASE_SERVICE_ROLE_KEY || CLAVE_HASH)
		.update(COOKIE)
		.digest('hex');

export function claveCorrecta(clave: string): boolean {
	return timingSafeEqual(scryptSync(clave, SAL, 32), Buffer.from(CLAVE_HASH, 'hex'));
}

export const arcadeAutorizado = (cookies: Cookies) => cookies.get(COOKIE) === firma();

export function autorizarArcade(cookies: Cookies): void {
	cookies.set(COOKIE, firma(), { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * DIAS_VIGENCIA });
}

export const revocarArcade = (cookies: Cookies) => cookies.delete(COOKIE, { path: '/' });
