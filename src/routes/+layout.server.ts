// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
	// user, isAdmin y nombreAdmin ya se resuelven una sola vez en
	// hooks.server.ts (consultando la tabla "admins"). Aquí solo se
	// reutilizan, sin volver a golpear Supabase en cada navegación.
	//
	// Antes esta función consultaba una tabla "user" con columna
	// "nombre" que no coincide con tu esquema real (tu tabla es
	// "admins", con el nombre en la columna "user"). Si en verdad
	// tienes una tabla "user" aparte con otro propósito, dime su
	// estructura y lo ajusto — tal como estaba, lo más probable es que
	// esa consulta fallara siempre y por eso el navbar mostraba el
	// correo en vez del nombre.
	return {
		user: locals.user,
		nombreUsuario: locals.nombreAdmin
	}
}