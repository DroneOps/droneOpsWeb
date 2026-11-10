// Autor: Miguel Tovar
// Tarjeta 3D con la calificación, flotando sobre la cabeza de quien juega (solo en escritorio).
// Convierte los puntos de la cara en dónde dibujarla sobre la cámara y cómo girarla.
// La vista previa va en espejo y con object-cover, así que aquí se hace lo mismo.
import type { Landmark } from "./geometry";

const FRENTE = 10;
const MENTON = 152;
const LADO_A = 234;
const LADO_B = 454;
const DEG = 180 / Math.PI;
const SEPARACION = 0.62; // sobre la frente, en alturas de cara

const GIRO_MAX = 35;
const PITCH_NEUTRO = -19; // lo que mide una cara de frente: la frente queda más cerca que el mentón
const limitar = (v: number, max: number) => Math.min(max, Math.max(-max, v));

// MediaPipe también da la profundidad de cada punto
type Punto = Landmark & { z?: number };

export type PoseTarjeta = { x: number; y: number; roll: number; yaw: number; pitch: number; escala: number };

export function poseTarjeta(puntos: Landmark[], videoW: number, videoH: number, cajaW: number, cajaH: number): PoseTarjeta {
  const zoom = Math.max(cajaW / videoW, cajaH / videoH);
  const margenX = (cajaW - videoW * zoom) / 2;
  const margenY = (cajaH - videoH * zoom) / 2;
  const enCaja = (i: number) => {
    const p = puntos[i] as Punto;
    return { x: cajaW - (margenX + p.x * videoW * zoom), y: margenY + p.y * videoH * zoom, z: (p.z ?? 0) * videoW * zoom };
  };
  const frente = enCaja(FRENTE);
  const menton = enCaja(MENTON);
  const a = enCaja(LADO_A);
  const b = enCaja(LADO_B);
  const arribaX = frente.x - menton.x;
  const arribaY = frente.y - menton.y;
  const altoCara = Math.hypot(arribaX, arribaY);
  return {
    x: frente.x + arribaX * SEPARACION,
    y: frente.y + arribaY * SEPARACION,
    roll: Math.atan2(arribaX, -arribaY) * DEG,
    yaw: limitar(Math.atan2(a.z - b.z, Math.abs(a.x - b.x)) * DEG, GIRO_MAX),
    pitch: limitar(Math.atan2(frente.z - menton.z, altoCara) * DEG - PITCH_NEUTRO, GIRO_MAX),
    escala: altoCara,
  };
}
