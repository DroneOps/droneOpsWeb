import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ locals }) => {
        // Ejecutamos el cierre de sesión en Supabase (esto borra las cookies)
        await locals.supabase.auth.signOut();
        
        // Redirigimos al inicio
        redirect(303, '/');
    }
};