// src/hooks.server.ts
import { createServerClient } from '@supabase/ssr'
import { redirect, type Handle } from '@sveltejs/kit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

const RUTA_LOGIN = '/iniciar_sesion'

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Inicializar cliente de Supabase
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

	// 2. Obtener el usuario autenticado
	const { data: { user } } = await event.locals.supabase.auth.getUser()
	event.locals.user = user
	event.locals.isAdmin = false
	event.locals.nombreAdmin = null
	event.locals.esSuperAdmin = false

	// 3. Una sola consulta por request
	if (user) {
		const { data: admin, error: adminError } = await event.locals.supabase
			.from('admins')
			.select('email, user, es_superadmin') // <-- 1. CORREGIDO: agregamos es_superadmin aquí
			.eq('email', user.email)
			.maybeSingle()

		if (adminError) {
			console.error('Error al verificar admin:', adminError)
		}

		event.locals.isAdmin = !!admin
		event.locals.nombreAdmin = admin?.user ?? null
		event.locals.esSuperAdmin = admin?.es_superadmin ?? false
	}

	// 4. CORREGIDO: Proteger tanto /por-hacer como /miembros
	const esPorHacer = event.url.pathname.startsWith('/por-hacer')
	const esMiembros = event.url.pathname.startsWith('/miembros')
	const esInventario = event.url.pathname.startsWith('/inventario')

	if (esPorHacer || esMiembros || esInventario) {
		// A. No ha iniciado sesión
		if (!user) {
			throw redirect(303, RUTA_LOGIN)
		}
		// B. Inició sesión pero no está en la tabla admins
		if (!event.locals.isAdmin) {
			throw redirect(303, '/')
		}
		// C. Intenta entrar a /miembros pero NO es superadmin (ej. Omar, Yaya, Ricky)
		if (esMiembros && !event.locals.esSuperAdmin) {
			throw redirect(303, '/por-hacer')
		}
	}

	// 5. Evitar que usuarios ya logueados entren al formulario de login
	if (event.url.pathname === RUTA_LOGIN && user) {
		throw redirect(303, '/por-hacer')
	}

	return resolve(event)
}