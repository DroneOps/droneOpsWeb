import { json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request, locals }) => {
	// 1. Validar que la persona que hace la petición es SuperAdmin
	if (!locals.esSuperAdmin) {
		return json({ error: 'No tienes permisos de superadministrador' }, { status: 403 });
	}

	try {
		const { user, email, password, area } = await request.json();

		if (!user || !email || !password) {
			return json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
		}

		// 2. Crear cliente administrativo con la Service Role Key
		// (Permite saltarse las restricciones de RLS al insertar en PostgreSQL)
		const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});

		// 3. Crear la cuenta en Supabase Auth
		const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true
		});

		if (authError) {
			return json({ error: `Auth Error: ${authError.message}` }, { status: 400 });
		}

		// 4. Insertar en la tabla "admins" usando el cliente con permisos de servicio (supabaseAdmin)
		const { error: dbError } = await supabaseAdmin
			.from('admins')
			.insert([{ 
				email: email.toLowerCase().trim(), 
				user: user.trim(), 
				area: area || 'General', 
				ve_todo: false,
				es_superadmin: false 
			}]);

		if (dbError) {
			console.error('Error detallado de PostgreSQL:', dbError);
			// Si falla la BD, revertimos borrando la cuenta creada en Auth para evitar duplicados
			await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
			return json({ error: `Error en la base de datos: ${dbError.message}` }, { status: 500 });
		}

		return json({ success: true, message: `¡Administrador "${user}" registrado exitosamente!` });

	} catch (err) {
		console.error('Error interno al crear admin:', err);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
};