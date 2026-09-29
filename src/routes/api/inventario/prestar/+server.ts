import { json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, locals }) => {
    // Validar que exista usuario Y que sea SuperAdmin
    if (!locals.user?.email || !locals.esSuperAdmin) {
        return json({ error: 'Acceso denegado. Se requieren permisos de SuperAdmin.' }, { status: 403 });
    }

    try {
        const { item_id, miembro_email, motivo_uso, fecha_limite, notas } = await request.json();

        if (!item_id || !miembro_email) {
            return json({ error: 'El ítem y el miembro solicitante son obligatorios' }, { status: 400 });
        }

        const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || '');

        // 1. Registrar el préstamo
        const { data: prestamo, error: errorPrestamo } = await supabaseAdmin
            .from('prestamos_inventario')
            .insert([{
                item_id,
                miembro_email,
                motivo_uso: motivo_uso?.trim() || 'Préstamo general',
                fecha_limite: fecha_limite ? new Date(fecha_limite).toISOString() : null,
                devuelto: false,
                registrado_por: locals.user.email,
                notas: notas?.trim() || null
            }])
            .select()
            .single();

        if (errorPrestamo) {
            console.error('Error al registrar préstamo:', errorPrestamo);
            return json({ error: errorPrestamo.message }, { status: 500 });
        }

        // 2. Cambiar el estado del artículo en la tabla inventario a 'en_uso'
        const { error: errorUpdate } = await supabaseAdmin
            .from('inventario')
            .update({ estado: 'en_uso', actualizado_en: new Date().toISOString() })
            .eq('id', item_id);

        if (errorUpdate) {
            console.error('Error al actualizar estado del ítem:', errorUpdate);
        }

        return json({ success: true, prestamo });

    } catch (err) {
        console.error('Error en solicitar préstamo:', err);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
};