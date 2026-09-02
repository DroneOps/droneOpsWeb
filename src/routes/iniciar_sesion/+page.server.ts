import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.supabase) {
			return fail(500, { message: 'El cliente de Supabase no fue inicializado en hooks.server.ts' });
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { message: 'Por favor, llena todos los campos.' });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return fail(400, {
				email,
				message: 'Correo electrónico o contraseña incorrectos.'
			});
		}

		redirect(303, '/por-hacer');
	}
};