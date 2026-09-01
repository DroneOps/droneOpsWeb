// src/hooks.server.js
import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { redirect, type Handle } from '@sveltejs/kit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'


export const handle: Handle = async ({ event, resolve }) => { // handle funciona como un middleware que se ejecuta antes de cada solicitud entrante
    // handle hace lo siguiente:
  // 1. Inicializar cliente de Supabase leyendo las cookies del servidor
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(), // las cookies se lean correctamente desde el servidor
        setAll: (cookiesToSet) => { // las cookies se establezcan correctamente en el servidor
          cookiesToSet.forEach(({ name, value, options }) => { 
            event.cookies.set(name, value, { ...options, path: '/' }) // Asegurarse de que la cookie sea accesible en todas las rutas
          })
        }
      }
    }
  )

  // 2. Obtener el usuario autenticado de forma segura
  const { data: { user } } = await event.locals.supabase.auth.getUser()
  event.locals.user = user


  // 3. Proteger rutas privadas (ejemplo: cualquier ruta dentro de /por-hacer)
  if (event.url.pathname.startsWith('/por-hacer') && !user) { 
    // Si el usuario no está autenticado y trata de acceder a /por-hacer, redirigirlo a /login
    throw redirect(303, '/login')
  }

  // 4. Evitar que usuarios ya logueados entren al formulario de /login
  if (event.url.pathname === '/login' && user) {
    throw redirect(303, '/por-hacer') // Redirigir a /por-hacer si el usuario ya está autenticado
  }

  return resolve(event)
}