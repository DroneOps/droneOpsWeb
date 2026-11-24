// src/lib/tablero/tipos.ts
// Tipos, constantes y funciones auxiliares del tablero de proyectos.
// El detalle operativo (subtareas, avances, entregables) vive en Discord;
// aquí solo queda lo esencial de cada proyecto[cite: 5].

export type Estado = 'idea' | 'in_progress' | 'done';

// Una competencia: TMR, IMAV, Grand Prix... (un proyecto puede no pertenecer a ninguna)[cite: 5]
export interface Competencia {
	id: number;
	nombre: string;
	descripcion: string | null;
	activa: boolean;
	orden: number;
}

// "Quién lo hace": un equipo del grupo o un departamento de la mesa.
// Al asignar departamentos a un proyecto, su equipo son los integrantes de esos departamentos[cite: 5].
export interface Departamento {
	id: number;
	nombre: string;
	descripcion: string | null;
	tipo: 'equipo' | 'mesa';
	color: string;
	activo: boolean;
	orden: number;
}

export interface Membresia {
	departamento_id: number;
	email: string;
	rol: 'lider' | 'miembro'; // lider = jefe del departamento[cite: 5]
}

export interface Miembro {
	email: string;
	user: string;
	es_superadmin: boolean;
}

// Una fila de la tabla "tareas" (en la interfaz se llama "proyecto")[cite: 5]
export interface Proyecto {
	id: number;
	titulo: string;
	comentarios?: string | null; // descripción[cite: 5]
	estado: Estado;
	fecha_limite: string | null; // fecha de entrega[cite: 5]
	orden: number;
	competencia_id: number | null; // null = no pertenece a una competencia[cite: 5]
	departamentos_ids: number[]; // vacío = proyecto de todo el grupo[cite: 5]
	equipo_emails: string[]; // miembros extra del proyecto[cite: 4]
	encargado_email: string | null;
	intereses: string[]; // quién marcó "me interesa" (solo ideas)[cite: 5]
	completado_en: string | null;
	archivado_en: string | null;
	creado_en: string;
	creado_por: string | null;
}

// ---------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------
export const DIAS_HECHO_VISIBLE = 14; // los completados más viejos salen del tablero[cite: 5]

// Cuentas de prueba que no deben aparecer en los selectores de miembros[cite: 5]
export const CORREOS_OCULTOS = ['b0123456@tec.mx'];

// Paleta de los departamentos: sale de los colores del sitio (morado de la marca, rosa,
// azul marino y grises) y de sus acentos. Cada uno es distinto para reconocerlo de un vistazo[cite: 5].
export const COLORES = [
	'#7c3aed', // violeta: el morado de la marca[cite: 5]
	'#2563eb', // azul[cite: 5]
	'#a78bfa', // lavanda: el morado claro del sitio[cite: 5]
	'#334155', // azul marino / pizarra: el tono del header[cite: 5]
	'#db2777', // rosa: el acento del sitio[cite: 5]
	'#c026d3', // fucsia[cite: 5]
	'#f59e0b', // ámbar[cite: 5]
	'#10b981' // esmeralda[cite: 5]
];

export const ESTADOS: { id: Estado; label: string; clase: string }[] = [
	{ id: 'idea', label: 'Idea', clase: 'bg-amber-100 text-amber-800' },
	{ id: 'in_progress', label: 'En progreso', clase: 'bg-purple-100 text-purple-700' },
	{ id: 'done', label: 'Completado', clase: 'bg-emerald-100 text-emerald-700' }
];

// ---------------------------------------------------------------------
// Normalización de datos que vienen de Supabase
// ---------------------------------------------------------------------

// Por si algún arreglo de Postgres llega como texto ("{a,b}") en lugar de arreglo,
// por ejemplo en los eventos de tiempo real[cite: 5].
function aArreglo(valor: unknown): unknown[] {
	if (Array.isArray(valor)) return valor;
	if (typeof valor === 'string') {
		const limpio = valor.trim();
		if (limpio.startsWith('[') && limpio.endsWith(']')) {
			try {
				const parsed = JSON.parse(limpio);
				return Array.isArray(parsed) ? parsed : [];
			} catch {
				return [];
			}
		}
		if (limpio.startsWith('{') && limpio.endsWith('}')) {
			const interior = limpio.slice(1, -1).trim();
			if (!interior) return [];
			return interior.split(',').map((x) => x.trim().replace(/^"|"$/g, ''));
		}
	}
	return [];
}

export function normalizarProyecto(raw: any): Proyecto {
	return {
		...raw,
		estado: raw.estado ?? 'in_progress',
		departamentos_ids: aArreglo(raw.departamentos_ids).map(Number),
		equipo_emails: aArreglo(raw.equipo_emails) as string[],
		intereses: aArreglo(raw.intereses) as string[]
	} as Proyecto;
}

// Convierte los errores de Supabase/Postgres en mensajes entendibles[cite: 5]
export function mensajeError(e: { message?: string; code?: string } | null | undefined): string {
	if (!e) return '';
	if (e.code === 'PGRST116') return 'No tienes permiso para hacer este cambio.';
	if (e.code === '23505') return 'Ya existe un registro con ese nombre.';
	if (e.code === '23503') {
		return 'No se puede borrar porque todavía se usa en otros registros. Desactívalo en su lugar.';
	}
	return e.message ?? 'Ocurrió un error inesperado.';
}

// ---------------------------------------------------------------------
// Fechas
// ---------------------------------------------------------------------
const DIA = 86_400_000;

// Fecha de hoy en la zona del usuario, formato AAAA-MM-DD[cite: 5]
function hoyLocal(): string {
	return new Date().toLocaleDateString('en-CA');
}

// Días que faltan para la fecha de entrega (negativo = ya venció).
// Se compara solo la fecha (sin hora) para evitar desfases de zona horaria[cite: 5].
export function diasParaLimite(iso: string): number {
	const limite = Date.parse(iso.slice(0, 10) + 'T00:00:00Z');
	const hoy = Date.parse(hoyLocal() + 'T00:00:00Z');
	return Math.round((limite - hoy) / DIA);
}

// La fecha se guarda como medianoche UTC; se muestra en UTC para no correrla un día[cite: 5]
export function formatoFecha(iso: string): string {
	return new Date(iso).toLocaleDateString('es-MX', {
		day: 'numeric',
		month: 'short',
		timeZone: 'UTC'
	});
}

// Fecha de un momento exacto (por ejemplo cuándo se archivó), en la zona del usuario[cite: 5]
export function fechaLocal(iso: string): string {
	return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------
// Estado derivado de un proyecto
// ---------------------------------------------------------------------
export function estaVencido(p: Proyecto): boolean {
	return p.estado === 'in_progress' && !!p.fecha_limite && diasParaLimite(p.fecha_limite) < 0;
}

// Los completados viejos no estorban en el tablero[cite: 5]
export function esReciente(p: Proyecto): boolean {
	if (p.estado !== 'done' || !p.completado_en) return true;
	return (Date.now() - Date.parse(p.completado_en)) / DIA <= DIAS_HECHO_VISIBLE;
}

// En progreso: lo que vence primero va primero; lo que no tiene fecha, al final[cite: 5]
export function compararEnProgreso(a: Proyecto, b: Proyecto): number {
	const fa = a.fecha_limite ? Date.parse(a.fecha_limite) : Infinity;
	const fb = b.fecha_limite ? Date.parse(b.fecha_limite) : Infinity;
	if (fa !== fb) return fa < fb ? -1 : 1;
	return (a.orden ?? 0) - (b.orden ?? 0);
}

// ---------------------------------------------------------------------
// Personas y departamentos
// ---------------------------------------------------------------------
export function departamentosDe(email: string, membresias: Membresia[]): number[] {
	return membresias.filter((m) => m.email === email).map((m) => m.departamento_id);
}

export function miembrosDeDepto(deptoId: number, membresias: Membresia[]): Membresia[] {
	return membresias
		.filter((m) => m.departamento_id === deptoId)
		.sort((a, b) => (a.rol === b.rol ? 0 : a.rol === 'lider' ? -1 : 1));
}

// El equipo de un proyecto: los integrantes de los departamentos que se le asignaron[cite: 5]
export function equipoDe(p: Proyecto, membresias: Membresia[]): string[] {
	const correos = membresias
		.filter((m) => p.departamentos_ids.includes(m.departamento_id))
		.map((m) => m.email);
	return [...new Set(correos)];
}

// Para el filtro "Mis proyectos": soy el encargado, estoy en alguno de sus
// departamentos, o lo creé yo (así lo que propones no desaparece de tu vista)[cite: 5]
export function involucrado(p: Proyecto, email: string, membresias: Membresia[] = []): boolean {
	if (p.creado_por === email || p.encargado_email === email || p.equipo_emails.includes(email)) {
		return true;
	}
	const mios = departamentosDe(email, membresias);
	return p.departamentos_ids.some((d) => mios.includes(d));
}

export function iniciales(nombre: string): string {
	return nombre
		.split(' ')
		.map((parte) => parte[0] ?? '')
		.join('')
		.toUpperCase()
		.slice(0, 2);
}