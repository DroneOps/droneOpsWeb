// Autor: Miguel Tovar
// Ranking semanal del modo competencia de MogOps.
//
// Cada dispositivo se identifica con una cookie httpOnly y solo guarda su mejor
// puntuación: una más alta sobrescribe a la anterior (y puede cambiar el nombre).
// Cada registro expira 7 días después de guardarse; los vencidos se borran en
// cada petición. La tabla está en src/lib/mogops/ranking.sql y solo el
// servidor la lee y escribe (Service Role Key), igual que el inventario.
//
// En Modo Arcade (cookie de arcade.server.ts) cada intento es un registro nuevo:
// se guarda con un identificador propio en vez del del dispositivo, así que no
// sobrescribe nada y varias personas pueden jugar en el mismo equipo. El nombre
// es opcional.
//
// En desarrollo, sin la llave, se usa una lista en memoria.
import { json, type Cookies, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { dev } from '$app/environment';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { arcadeAutorizado } from '$lib/mogops/arcade.server';

const TABLA = 'mogops_ranking';
const COOKIE = 'mogops_dispositivo';
const DIAS_VIGENCIA = 7;
const TOP = 20;
const MAX_NOMBRE = 24;
const MAX_FOTO = 120_000; // caracteres del data URL (~90 KB de JPEG)
const ANONIMO = 'Anónimo';

type Fila = {
	dispositivo: string;
	nombre: string;
	puntuacion: number;
	foto: string;
	registrado_en: string;
	expira_en: string;
};

type Almacen = {
	limpiar(): Promise<void>;
	top(): Promise<Fila[]>;
	buscar(dispositivo: string): Promise<Fila | null>;
	guardar(fila: Fila): Promise<void>;
};

function almacenSupabase(llave: string): Almacen {
	const db = createClient(PUBLIC_SUPABASE_URL, llave, { auth: { autoRefreshToken: false, persistSession: false } });
	const revisar = <T>({ data, error }: { data: T; error: { message: string } | null }) => {
		if (error) throw new Error(error.message);
		return data;
	};
	return {
		async limpiar() {
			revisar(await db.from(TABLA).delete().lt('expira_en', new Date().toISOString()));
		},
		async top() {
			return revisar(
				await db
					.from(TABLA)
					.select('*')
					.gt('expira_en', new Date().toISOString())
					.order('puntuacion', { ascending: false })
					.order('registrado_en', { ascending: true })
					.limit(TOP)
			) as Fila[];
		},
		async buscar(dispositivo) {
			return revisar(await db.from(TABLA).select('*').eq('dispositivo', dispositivo).maybeSingle()) as Fila | null;
		},
		async guardar(fila) {
			revisar(await db.from(TABLA).upsert(fila, { onConflict: 'dispositivo' }));
		}
	};
}

// Solo para desarrollo local sin la Service Role Key
const memoria = new Map<string, Fila>();
const almacenMemoria: Almacen = {
	async limpiar() {
		const ahora = Date.now();
		for (const [k, f] of memoria) if (Date.parse(f.expira_en) <= ahora) memoria.delete(k);
	},
	async top() {
		return [...memoria.values()]
			.sort((a, b) => b.puntuacion - a.puntuacion || a.registrado_en.localeCompare(b.registrado_en))
			.slice(0, TOP);
	},
	async buscar(dispositivo) {
		return memoria.get(dispositivo) ?? null;
	},
	async guardar(fila) {
		memoria.set(fila.dispositivo, fila);
	}
};

function almacen(): Almacen | null {
	if (env.SUPABASE_SERVICE_ROLE_KEY) return almacenSupabase(env.SUPABASE_SERVICE_ROLE_KEY);
	return dev ? almacenMemoria : null;
}

// Lee la cookie del dispositivo o crea una nueva
function dispositivoDe(cookies: Cookies): string {
	const actual = cookies.get(COOKIE);
	if (actual && /^[0-9a-f-]{36}$/.test(actual)) return actual;
	const nuevo = crypto.randomUUID();
	cookies.set(COOKIE, nuevo, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 400 });
	return nuevo;
}

// Lo que ve el navegador: nunca expone los identificadores de dispositivo
async function respuesta(db: Almacen, dispositivo: string) {
	const top = await db.top();
	const mio = top.find((f) => f.dispositivo === dispositivo) ?? (await db.buscar(dispositivo));
	return {
		ranking: top.map((f) => ({
			nombre: f.nombre,
			puntuacion: Number(f.puntuacion),
			foto: f.foto,
			registradoEn: f.registrado_en,
			esMio: f.dispositivo === dispositivo
		})),
		mio: mio && Date.parse(mio.expira_en) > Date.now() ? { nombre: mio.nombre, puntuacion: Number(mio.puntuacion) } : null
	};
}

export const GET: RequestHandler = async ({ cookies }) => {
	const db = almacen();
	if (!db) return json({ error: 'El ranking no está configurado' }, { status: 503 });
	const dispositivo = dispositivoDe(cookies);
	try {
		await db.limpiar();
		return json(await respuesta(db, dispositivo));
	} catch (err) {
		console.error('Error al leer el ranking de MogOps:', err);
		return json({ error: 'No se pudo cargar el ranking' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const db = almacen();
	if (!db) return json({ error: 'El ranking no está configurado' }, { status: 503 });
	const dispositivo = dispositivoDe(cookies);

	let datos: { nombre?: unknown; puntuacion?: unknown; foto?: unknown; arcade?: unknown };
	try {
		datos = await request.json();
	} catch {
		return json({ error: 'Datos inválidos' }, { status: 400 });
	}

	const arcade = datos.arcade === true;
	if (arcade && !arcadeAutorizado(cookies)) {
		return json({ error: 'El Modo Arcade no está autorizado en este navegador' }, { status: 403 });
	}

	// Validar los datos recibidos
	const escrito = typeof datos.nombre === 'string' ? datos.nombre.trim().replace(/\s+/g, ' ') : '';
	const nombre = escrito || (arcade ? ANONIMO : '');
	const puntuacion = typeof datos.puntuacion === 'number' ? Math.round(datos.puntuacion * 100) / 100 : NaN;
	const foto = typeof datos.foto === 'string' ? datos.foto : '';
	if (!nombre || nombre.length > MAX_NOMBRE) {
		return json({ error: `El nombre debe tener entre 1 y ${MAX_NOMBRE} caracteres` }, { status: 400 });
	}
	if (!Number.isFinite(puntuacion) || puntuacion < 0 || puntuacion > 10) {
		return json({ error: 'Puntuación inválida' }, { status: 400 });
	}
	if (!foto.startsWith('data:image/jpeg;base64,') || foto.length > MAX_FOTO) {
		return json({ error: 'Imagen inválida' }, { status: 400 });
	}

	try {
		await db.limpiar();
		const anterior = arcade ? null : await db.buscar(dispositivo);
		if (anterior && Number(anterior.puntuacion) >= puntuacion) {
			return json({ error: 'Ya registraste una puntuación igual o mayor esta semana' }, { status: 409 });
		}
		const ahora = new Date();
		const id = arcade ? crypto.randomUUID() : dispositivo;
		await db.guardar({
			dispositivo: id,
			nombre,
			puntuacion,
			foto,
			registrado_en: ahora.toISOString(),
			expira_en: new Date(ahora.getTime() + DIAS_VIGENCIA * 24 * 60 * 60 * 1000).toISOString()
		});
		return json(await respuesta(db, id));
	} catch (err) {
		console.error('Error al guardar en el ranking de MogOps:', err);
		return json({ error: 'No se pudo guardar la puntuación' }, { status: 500 });
	}
};
