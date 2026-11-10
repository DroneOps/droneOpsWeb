// Autor: Miguel Tovar
// Curva de dificultad de MogOps (solo el motor de geometría).
//
// Hasta 8 la calificación no cambia. Arriba de 8 cada tramo cuesta más: subir
// de 8 a 9 pide 20% más puntos que antes, de 9 a 9.5 un 40% más y de 9.5 a 10
// un 50% más. La dificultad multiplica ese extra: en 2, los tramos cuestan
// 40%, 80% y 100% más.
//
// Se aplica después de sumar los bonos del modo meme, sin tope, porque si no
// los gestos brincarían la curva. Con dificultad 1 los nudos son
// 8 -> 8, 9.2 -> 9, 9.9 -> 9.5 y 10.65 -> 10, así que una cara sin bonos se
// queda en 9.57 como máximo y el 10 solo se alcanza con bonos.
import { interp } from "./display";

const TRAMOS = [
  { ancho: 1, extra: 0.2 }, // 8 a 9
  { ancho: 0.5, extra: 0.4 }, // 9 a 9.5
  { ancho: 0.5, extra: 0.5 }, // 9.5 a 10
];
const INICIO = 8;

export const DIFICULTAD_MIN = 1;
export const DIFICULTAD_MAX = 5;
export const DIFICULTAD_INICIAL = 3; // la que tiene todo el público

function nudos(dificultad: number) {
  const entrada = [INICIO];
  const salida = [INICIO];
  for (const { ancho, extra } of TRAMOS) {
    entrada.push(entrada[entrada.length - 1] + ancho * (1 + extra * dificultad));
    salida.push(salida[salida.length - 1] + ancho);
  }
  return { entrada, salida };
}

/** Pasa los puntos (calificación + bonos, sin tope) a la escala final de 0 a 10. */
export function aplicarCurva(puntos: number, dificultad: number): number {
  if (puntos <= INICIO) return Math.max(0, puntos);
  const { entrada, salida } = nudos(dificultad);
  return interp(puntos, entrada, salida);
}

/** Lo contrario: los puntos que hacen falta para una calificación final. */
export function quitarCurva(calificacion: number, dificultad: number): number {
  if (calificacion <= INICIO) return calificacion;
  const { entrada, salida } = nudos(dificultad);
  return interp(calificacion, salida, entrada);
}
