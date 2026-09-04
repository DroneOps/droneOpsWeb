// src/routes/por-hacer/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// La verificación de sesión Y de rol admin ya la hace hooks.server.ts
	// para cualquier ruta bajo /por-hacer (incluida esta). No se repite
	// aquí a propósito: tener la misma regla escrita en dos archivos fue
	// justo lo que causó que /login y /iniciar_sesion se desincronizaran.
	return {
		user: locals.user
	};
};