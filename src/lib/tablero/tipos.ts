// src/lib/tablero/tipos.ts
// Tipos, constantes y funciones auxiliares del tablero de proyectos.

export type Estado = 'not_started' | 'in_progress' | 'in_review' | 'done';
export type Salud = 'en_tiempo' | 'en_riesgo' | 'atrasado';
export type Prioridad = 'baja' | 'media' | 'alta' | 'urgente';
export type TipoAvance = 'avance' | 'bloqueo' | 'nota' | 'aprobado' | 'devuelto';

export interface Subtarea {
	id: string;
	texto: string;
	hecho: boolean;
	asignado: string | null; // correo de quien la tiene asignada
}

export interface Categoria {
	id: number;
	nombre: string;
	descripcion: string | null;
	tipo: 'competencia' | 'grupo';
	color: string;
	activa: boolean;
	orden: number;
}

export interface Miembro {
	email: string;
	user: string;
	es_superadmin: boolean;
	area: string;
}

// Una fila de la tabla "tareas" (en la interfaz se llama "proyecto")
export interface Proyecto {
	id: number;
	titulo: string;
	comentarios: string | null;
	estado: Estado;
	prioridad: Prioridad;
	fecha_limite: string | null;
	orden: number;
	subtareas: Subtarea[];
	categoria_id: number | null;
	lider_email: string | null;
	supervisor_email: string | null;
	equipo_emails: string[];
	salud: Salud;
	completado_en: string | null;
	archivado_en: string | null;
	ultimo_avance_en: string;
	creado_en: string;
	creado_por: string | null;
}

export interface Avance {
	id: number;
	tarea_id: number;
	autor_email: string;
	tipo: TipoAvance;
	texto: string;
	creado_en: string;
}

// ---------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------
export const DIAS_SIN_AVANCES = 7; // a partir de aquí un proyecto en curso se marca "estancado"
export const DIAS_HECHO_VISIBLE = 14; // los hechos más viejos salen del tablero

// Cuentas de prueba que no deben aparecer en los selectores de miembros
export const CORREOS_OCULTOS = ['a0123456@tec.mx'];

export const ESTADOS: { id: Estado; label: string; clase: string }[] = [
	{ id: 'not_started', label: 'Por iniciar', clase: 'bg-slate-100 text-slate-700' },
	{ id: 'in_progress', label: 'En curso', clase: 'bg-purple-100 text-purple-700' },
	{ id: 'in_review', label: 'En revisión', clase: 'bg-sky-100 text-sky-700' },
	{ id: 'done', label: 'Hecho', clase: 'bg-emerald-100 text-emerald-700' }
];

export const SALUD: Record<Salud, { label: string; punto: string }> = {
	en_tiempo: { label: 'En tiempo', punto: 'bg-emerald-500' },
	en_riesgo: { label: 'En riesgo', punto: 'bg-amber-500' },
	atrasado: { label: 'Atrasado', punto: 'bg-red-500' }
};

export const PRIORIDADES: { id: Prioridad; label: string }[] = [
	{ id: 'baja', label: 'Baja' },
	{ id: 'media', label: 'Media' },
	{ id: 'alta', label: 'Alta' },
	{ id: 'urgente', label: 'Urgente' }
];

export const TIPOS_AVANCE: Record<TipoAvance, { label: string; clase: string }> = {
	avance: { label: 'Avance', clase: 'bg-purple-100 text-purple-700' },
	bloqueo: { label: 'Bloqueo', clase: 'bg-red-100 text-red-700' },
	nota: { label: 'Nota', clase: 'bg-slate-100 text-slate-700' },
	aprobado: { label: 'Aprobado', clase: 'bg-emerald-100 text-emerald-700' },
	devuelto: { label: 'Devuelto', clase: 'bg-amber-100 text-amber-700' }
};

// ---------------------------------------------------------------------
// Normalización de datos que vienen de Supabase
// ---------------------------------------------------------------------
export function parsearSubtareas(raw: unknown): Subtarea[] {
	let data: unknown = raw;
	// Si viene como texto JSON (incluso doblemente escapado), se parsea
	while (typeof data === 'string') {
		try {
			data = JSON.parse(data);
		} catch {
			return [];
		}
	}
	if (!Array.isArray(data)) return [];
	return data.map((item: any) => ({
		id: String(item?.id ?? crypto.randomUUID()),
		texto: String(item?.texto ?? item?.titulo ?? ''),
		hecho: Boolean(item?.hecho ?? item?.completado ?? false),
		asignado: item?.asignado ? String(item.asignado) : null
	}));
}

export function normalizarProyecto(raw: any): Proyecto {
	return {
		...raw,
		estado: raw.estado ?? 'not_started',
		prioridad: raw.prioridad ?? 'media',
		salud: raw.salud ?? 'en_tiempo',
		equipo_emails: Array.isArray(raw.equipo_emails) ? raw.equipo_emails : [],
		subtareas: parsearSubtareas(raw.subtareas)
	} as Proyecto;
}

// ---------------------------------------------------------------------
// Fechas
// ---------------------------------------------------------------------
const DIA = 86_400_000;

// Fecha de hoy en la zona del usuario, formato AAAA-MM-DD
function hoyLocal(): string {
	return new Date().toLocaleDateString('en-CA');
}

// Días que faltan para la fecha límite (negativo = ya venció).
// Se compara solo la fecha (sin hora) para evitar desfases de zona horaria.
export function diasParaLimite(iso: string): number {
	const limite = Date.parse(iso.slice(0, 10) + 'T00:00:00Z');
	const hoy = Date.parse(hoyLocal() + 'T00:00:00Z');
	return Math.round((limite - hoy) / DIA);
}

// La fecha límite se guarda como medianoche UTC; se muestra en UTC para no correrla un día
export function formatoFecha(iso: string): string {
	return new Date(iso).toLocaleDateString('es-MX', {
		day: 'numeric',
		month: 'short',
		timeZone: 'UTC'
	});
}

export function haceCuanto(iso: string): string {
	const minutos = Math.floor((Date.now() - Date.parse(iso)) / 60_000);
	if (minutos < 1) return 'ahora';
	if (minutos < 60) return `hace ${minutos} min`;
	const horas = Math.floor(minutos / 60);
	if (horas < 24) return `hace ${horas} h`;
	const dias = Math.floor(horas / 24);
	return dias === 1 ? 'ayer' : `hace ${dias} días`;
}

// ---------------------------------------------------------------------
// Estado derivado de un proyecto
// ---------------------------------------------------------------------
export function progreso(p: Proyecto) {
	const total = p.subtareas.length;
	const hechas = p.subtareas.filter((s) => s.hecho).length;
	return { total, hechas, pct: total ? Math.round((hechas / total) * 100) : 0 };
}

export function estaVencido(p: Proyecto): boolean {
	return p.estado !== 'done' && !!p.fecha_limite && diasParaLimite(p.fecha_limite) < 0;
}

// Si la fecha límite ya pasó cuenta como atrasado, aunque la mesa no lo haya marcado
export function saludEfectiva(p: Proyecto): Salud {
	return estaVencido(p) ? 'atrasado' : p.salud;
}

export function diasSinAvances(p: Proyecto): number | null {
	if (p.estado !== 'in_progress') return null;
	return Math.floor((Date.now() - Date.parse(p.ultimo_avance_en)) / DIA);
}

export function estaEstancado(p: Proyecto): boolean {
	const dias = diasSinAvances(p);
	return dias !== null && dias >= DIAS_SIN_AVANCES;
}

// Los hechos viejos no estorban en el tablero
export function esReciente(p: Proyecto): boolean {
	if (p.estado !== 'done' || !p.completado_en) return true;
	return (Date.now() - Date.parse(p.completado_en)) / DIA <= DIAS_HECHO_VISIBLE;
}

export function involucrado(p: Proyecto, email: string): boolean {
	return (
		p.lider_email === email || p.supervisor_email === email || p.equipo_emails.includes(email)
	);
}

export function iniciales(nombre: string): string {
	return nombre
		.split(' ')
		.map((parte) => parte[0] ?? '')
		.join('')
		.toUpperCase()
		.slice(0, 2);
}