import { json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, locals }) => {
    // Validar sesión / permisos de SuperAdmin o Moderador
    if (!locals.user?.email) {
        return json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const nombre = formData.get('nombre') as string;
        const descripcion = formData.get('descripcion') as string;
        const ubicacion = formData.get('ubicacion') as string;
        const categoria = formData.get('categoria') as string;
        const cantidad = parseInt(formData.get('cantidad') as string || '1', 10);
        const imagenFile = formData.get('imagen') as File | null;

        if (!nombre || !categoria) {
            return json({ error: 'El nombre y la categoría son obligatorios' }, { status: 400 });
        }

        const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, serviceRoleKey || '');

        let imagen_url: string | null = null;

        // 1. Subir imagen a Supabase Storage si se adjunto un archivo
        if (imagenFile && imagenFile.size > 0) {
            const fileExt = imagenFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('inventario-imagenes')
                .upload(fileName, imagenFile, {
                    contentType: imagenFile.type,
                    upsert: true
                });

            if (uploadError) {
                console.error('Error al subir imagen:', uploadError);
                return json({ error: 'Error al subir la imagen' }, { status: 500 });
            }

            // Obtener la URL pública de la imagen
            const { data: urlData } = supabaseAdmin.storage
                .from('inventario-imagenes')
                .getPublicUrl(uploadData.path);

            imagen_url = urlData.publicUrl;
        }

        // 2. Insertar el artículo en la base de datos
        const { data: itemCreado, error: dbError } = await supabaseAdmin
            .from('inventario')
            .insert([{
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() || null,
                ubicacion: ubicacion?.trim() || null,
                categoria,
                cantidad,
                estado: 'libre',
                imagen_url,
                creado_por: locals.user.email
            }])
            .select()
            .single();

        if (dbError) {
            console.error('Error en BD al crear ítem:', dbError);
            return json({ error: dbError.message }, { status: 500 });
        }

        return json({ success: true, item: itemCreado });

    } catch (err) {
        console.error('Error interno en crear ítem:', err);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
};