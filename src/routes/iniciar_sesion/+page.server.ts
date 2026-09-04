// src/routes/iniciar_sesion/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.supabase) {
			return fail(500, {
				email: '',
				message: 'El cliente de Supabase no fue inicializado en hooks.server.ts'
			});
		}

		const formData = await request.formData();
		const email = ((formData.get('email') as string) ?? '').toLowerCase().trim();;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { email, message: 'Por favor, llena todos los campos.' });
		}

		const { error: authError } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (authError) {
			return fail(400, {
				email,
				message: 'Correo electrónico o contraseña incorrectos.'
			});
		}

		// La contraseña es correcta, pero esta web es exclusiva para admins.
		// Si el correo no está en la tabla "admins", no lo dejamos entrar
		// aunque su cuenta de Supabase Auth sea válida — antes esto pasaba
		// silenciosamente: el login "funcionaba" y hasta llegar a
		// /por-hacer el hook lo rebotaba, sin ningún mensaje.
		const { data: admin, error: adminError } = await locals.supabase
			.from('admins')
			.select('email')
			.eq('email', email)
			.maybeSingle();

		if (adminError) {
			console.error('Error al verificar admin en login:', adminError);
		}

		if (!admin) {
			await locals.supabase.auth.signOut();
			return fail(403, {
				email,
				message: 'Esta cuenta no tiene permisos de administrador.'
			});
		}

		throw redirect(303, '/por-hacer');
	}
};