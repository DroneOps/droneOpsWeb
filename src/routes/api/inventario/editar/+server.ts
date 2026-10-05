import { json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

export const PUT: RequestHandler = async ({ request, locals }) => {
    // 1. Validar permisos de SuperAdmin
    if (!locals.user?.email || !locals.esSuperAdmin) {
        return json({ error: 'Acceso denegado. Se requieren permisos de SuperAdmin.' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const nombre = formData.get('nombre') as string;
        const descripcion = formData.get('descripcion') as string;
        const ubicacion = formData.get('ubicacion') as string;
        const categoria = formData.get('categoria') as string;
        const cantidad = parseInt(formData.get('cantidad') as string || '1', 10);
        const imagenFile = formData.get('imagen') as File | null;

        if (!id || !nombre || !categoria) {
            return json({ error: 'El ID, nombre y categoría son obligatorios' }, { status: 400 });
        }

        const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || '');

        // 2. Si enviaron una nueva imagen, subirla a Supabase Storage
        let nueva_imagen_url: string | null = null;

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
                console.error('Error al subir nueva imagen:', uploadError);
                return json({ error: 'Error al subir la nueva imagen' }, { status: 500 });
            }

            const { data: urlData } = supabaseAdmin.storage
                .from('inventario-imagenes')
                .getPublicUrl(uploadData.path);

            nueva_imagen_url = urlData.publicUrl;
        }

        // 3. Preparar objeto de actualización
        const updateData: Record<string, any> = {
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || null,
            ubicacion: ubicacion?.trim() || null,
            categoria,
            cantidad,
            actualizado_en: new Date().toISOString()
        };

        // Solo actualizar la URL de la imagen si se subió una nueva
        if (nueva_imagen_url) {
            updateData.imagen_url = nueva_imagen_url;
        }

        // 4. Actualizar en PostgreSQL
        const { data: itemActualizado, error: dbError } = await supabaseAdmin
            .from('inventario')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (dbError) {
            console.error('Error en BD al editar ítem:', dbError);
            return json({ error: dbError.message }, { status: 500 });
        }

        return json({ success: true, item: itemActualizado });

    } catch (err) {
        console.error('Error interno al editar ítem:', err);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
};