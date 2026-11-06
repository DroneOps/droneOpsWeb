// Autor: Miguel Tovar
// Modo competencia de MogOps:
//   listo -> "Iniciar" -> calentamiento (8 s, solo se muestra la calificación)
//   -> batalla (15 s, promedio ponderado por tiempo) -> final (queda congelado).
//
// El promedio es por tiempo, no por cuadro: cada calificación cuenta durante el
// tiempo que estuvo en pantalla, hasta que llega la siguiente. Los cuadros sin
// cara (o con mala pose) cortan el tramo y ese tiempo no cuenta.

export type Fase = 'listo' | 'calentamiento' | 'batalla' | 'final';

export const CALENTAMIENTO_MS = 8000;
export const BATALLA_MS = 15000;

export class Competencia {
	fase = $state<Fase>('listo');
	/** Segundos que le quedan a la fase actual (redondeado hacia arriba). */
	restante = $state(0);
	/** Promedio ponderado por tiempo de la batalla; congelado en la fase final. */
	promedio = $state<number | null>(null);
	/** Calificación instantánea más alta de la batalla (no el promedio). */
	mejor = $state<number | null>(null);

	private inicio = 0;
	private suma = 0;
	private peso = 0;
	private tramo: { puntuacion: number; desde: number } | null = null;

	iniciar(ahora: number): void {
		this.reiniciar();
		this.fase = 'calentamiento';
		this.inicio = ahora;
		this.restante = CALENTAMIENTO_MS / 1000;
	}

	reiniciar(): void {
		this.fase = 'listo';
		this.restante = 0;
		this.promedio = null;
		this.mejor = null;
		this.suma = 0;
		this.peso = 0;
		this.tramo = null;
	}

	/** Cambia de fase cuando se acaba el tiempo. Llamar seguido (p. ej. cada 100 ms). */
	avanzar(ahora: number): void {
		const transcurrido = ahora - this.inicio;
		if (this.fase === 'calentamiento') {
			if (transcurrido >= CALENTAMIENTO_MS) {
				this.fase = 'batalla';
				this.inicio += CALENTAMIENTO_MS;
				this.restante = BATALLA_MS / 1000;
			} else {
				this.restante = Math.ceil((CALENTAMIENTO_MS - transcurrido) / 1000);
			}
		} else if (this.fase === 'batalla') {
			if (transcurrido >= BATALLA_MS) {
				this.cerrarTramo(this.inicio + BATALLA_MS);
				this.tramo = null;
				this.actualizarPromedio();
				this.fase = 'final';
				this.restante = 0;
			} else {
				this.restante = Math.ceil((BATALLA_MS - transcurrido) / 1000);
			}
		}
	}

	/**
	 * Registra la calificación de un cuadro (null si no hubo cara o la pose no sirve).
	 * Devuelve true si es la más alta de la batalla hasta ahora.
	 */
	registrar(puntuacion: number | null, ahora: number): boolean {
		this.avanzar(ahora);
		if (this.fase !== 'batalla') return false;
		this.cerrarTramo(ahora);
		this.tramo = puntuacion === null ? null : { puntuacion, desde: ahora };
		this.actualizarPromedio();
		if (puntuacion === null || (this.mejor !== null && puntuacion <= this.mejor)) return false;
		this.mejor = puntuacion;
		return true;
	}

	private cerrarTramo(hasta: number): void {
		if (!this.tramo) return;
		const dt = Math.max(0, hasta - this.tramo.desde);
		this.suma += this.tramo.puntuacion * dt;
		this.peso += dt;
	}

	private actualizarPromedio(): void {
		if (this.peso > 0) this.promedio = this.suma / this.peso;
		else if (this.tramo) this.promedio = this.tramo.puntuacion; // primer cuadro de la batalla
	}
}

/** Color de la calificación: gris, azul, amarillo, rojo y plata brillante. */
export function colorPuntuacion(v: number | null): string {
	if (v === null || v < 4) return 'text-slate-400';
	if (v < 6) return 'text-blue-600';
	if (v < 8.5) return 'text-yellow-500 puntuacion-contorno';
	if (v < 9.3) return 'text-red-600';
	return 'puntuacion-plata';
}
