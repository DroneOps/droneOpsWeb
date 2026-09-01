// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  let nombreUsuario = null;

  // Si hay un usuario autenticado, buscamos su nombre en tu tabla 'user'
  if (locals.user) {
    const { data, error } = await locals.supabase
      .from('user') // Nombre de tu tabla
      .select('nombre') // Cambia 'nombre' por el nombre real de la columna en tu BD (ej. 'name')
      .eq('email', locals.user.email)
      .single(); // Esperamos un solo resultado

    if (data && !error) {
      nombreUsuario = data.nombre; // Cambia 'nombre' si tu columna se llama distinto
    }
  }

  // Enviamos el usuario y el nombre extraído a la interfaz
  return {
    user: locals.user,
    nombreUsuario: nombreUsuario
  }
}