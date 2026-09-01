import { fail, redirect, type Actions } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, locals }) => {
    // Verificación de seguridad por si no cargó el hook
    if (!locals.supabase) {
      return fail(500, { message: 'El cliente de Supabase no fue inicializado en hooks.server.ts' })
    }
    // 1. Extraer el correo y la contraseña ingresados por el usuario
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return fail(400, { message: 'Por favor, llena todos los campos.' })
    }

    // 2. Autenticar con Supabase usando la instancia creada en hooks.server.ts
    const { error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    })

    // 3. Si la contraseña o correo son erróneos
    if (error) {
      return fail(400, {
        email,
        message: 'Correo electrónico o contraseña incorrectos.'
      })
    }

    // 4. Si la autenticación es exitosa:
    // Las cookies de sesión se guardan automáticamente gracias a la configuración de hooks.server.ts.
    // Redirigimos a la ruta protegida.
    redirect(303, '/por-hacer')
  }
}