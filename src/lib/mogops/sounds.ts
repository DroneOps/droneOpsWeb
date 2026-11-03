// Autor: Miguel Tovar
// Efecto de sonido de la ceja levantada, sintetizado con Web Audio (sin
// archivos: los clips originales tienen derechos de autor). Un golpe grave
// que cae de tono, al estilo "vine boom".

let ctx: AudioContext | null = null;

export function boom(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.6);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.9, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.95);
  } catch {
    // Sin audio (navegador sin Web Audio o bloqueado): el juego sigue en silencio.
  }
}
