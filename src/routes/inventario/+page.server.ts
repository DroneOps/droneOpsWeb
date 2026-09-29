import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals }) => {
    const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || '');

    // 1. Consultar inventario con préstamos e información del miembro
    const { data: itemsRaw, error } = await supabaseAdmin
        .from('inventario')
        .select(`
            *,
            prestamos:prestamos_inventario (
                id,
                motivo_uso,
                fecha_prestamo,
                fecha_limite,
                devuelto,
                miembro:admins!miembro_email ( user )
            )
        `)
        .order('creado_en', { ascending: false });

    if (error) {
        console.error('Error al cargar inventario:', error);
    }

    // 2. Mapear ítems para ajustarse a las propiedades que espera el front
    const items = (itemsRaw || []).map((item) => ({
        id: item.id,
        codigo: item.id.slice(0, 8).toUpperCase(),
        nombre: item.nombre,
        descripcion: item.descripcion || 'Sin descripción',
        categoria: item.categoria === 'Piezas de servicio' ? 'Piezas' : item.categoria,
        estado: (item.estado === 'en_uso' ? 'en_uso' : 'libre') as 'libre' | 'en_uso', 
        cantidad: item.cantidad,
        ubicacion: item.ubicacion || 'Sin ubicación asignada',
        foto_url: item.imagen_url
    }));

    // 3. Extraer el arreglo plano de préstamos/usos para el panel de historial
    const usos = (itemsRaw || []).flatMap((item) =>
        (item.prestamos || []).map((p: any) => ({
            id: p.id,
            item_id: item.id,
            usuario: p.miembro?.user || 'Miembro',
            motivo: p.motivo_uso || 'Uso general',
            fecha: p.fecha_prestamo
        }))
    );

    // 4. Traer la lista de miembros para los modales de asignación
    const { data: miembros } = await supabaseAdmin
        .from('admins')
        .select('email, user, area')
        .order('user', { ascending: true });

    return {
        items,
        usos,
        miembros: miembros || [],
        esSuperAdmin: locals.esSuperAdmin || false
    };
};