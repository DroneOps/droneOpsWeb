import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // Si no hay un usuario en 'locals' (no inició sesión)
    if (!locals.user) {
        // Redirigir obligatoriamente al login
        redirect(303, '/iniciar_sesion');
    }

    // Si sí hay usuario, le permitimos cargar la página
    return {
        // Puedes pasar datos específicos de esta página aquí si lo necesitas
    };
};