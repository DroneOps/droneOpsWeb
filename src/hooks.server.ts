// src/hooks.server.ts
import { createServerClient } from '@supabase/ssr'
import { redirect, type Handle } from '@sveltejs/kit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Confirmado con el usuario: no existe /login en esta app.
// La ruta real de inicio de sesión es /iniciar_sesion.
const RUTA_LOGIN = '/iniciar_sesion'

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Inicializar cliente de Supabase leyendo las cookies del servidor
	event.locals.supabase = createServerClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' })
					})
				}
			}
		}
	)

	// 2. Obtener el usuario autenticado de forma segura
	const { data: { user } } = await event.locals.supabase.auth.getUser()
	event.locals.user = user
	event.locals.isAdmin = false
	event.locals.nombreAdmin = null

	// 3. Una sola consulta por request: de aquí sale tanto isAdmin
	//    (para proteger /por-hacer) como nombreAdmin (para mostrar el
	//    nombre en el navbar en vez del correo crudo). Antes esto vivía
	//    duplicado: una verificación a medias aquí y otra consulta a una
	//    tabla distinta ("user") en +layout.server.ts.
	if (user) {
		const { data: admin, error: adminError } = await event.locals.supabase
			.from('admins')
			.select('email, user')
			.eq('email', user.email)
			.maybeSingle()

		if (adminError) {
			console.error('Error al verificar admin:', adminError)
		}

		event.locals.isAdmin = !!admin
		event.locals.nombreAdmin = admin?.user ?? null
	}

	// 4. Proteger /por-hacer: hay que estar logueado Y ser admin.
	//    (El "throw" es obligatorio, sin él redirect() no hace nada.)
	if (event.url.pathname.startsWith('/por-hacer')) {
		if (!user) {
			throw redirect(303, RUTA_LOGIN)
		}
		if (!event.locals.isAdmin) {
			// Tiene sesión válida pero no es admin: al inicio, no al login
			// otra vez (ya inició sesión correctamente).
			throw redirect(303, '/')
		}
	}

	// 5. Evitar que usuarios ya logueados entren al formulario de login
	if (event.url.pathname === RUTA_LOGIN && user) {
		throw redirect(303, '/por-hacer')
	}

	return resolve(event)
}