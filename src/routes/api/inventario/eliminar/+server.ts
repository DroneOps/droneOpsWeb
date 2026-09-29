import { json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

export const DELETE: RequestHandler = async ({ request, locals }) => {
    if (!locals.user?.email) {
        return json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { id } = await request.json();

        if (!id) {
            return json({ error: 'ID de ítem obligatorio' }, { status: 400 });
        }

        const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || '');

        // Borrar el ítem (Postgres borrará los préstamos automáticamente por una condicion que se le aplico al ser creada llamada ON DELETE CASCADE)
        const { error } = await supabaseAdmin
            .from('inventario')
            .delete()
            .eq('id', id);

        if (error) {
            return json({ error: error.message }, { status: 500 });
        }

        return json({ success: true, message: 'Artículo eliminado del inventario' });

    } catch (err) {
        console.error('Error al borrar ítem:', err);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
};