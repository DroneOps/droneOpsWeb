// Autor: Miguel Tovar
// Sonidos de MogOps, servidos desde static/mogops/audio:
//   gigachad.mp3  suena en bucle mientras la calificación esté en 8 o más
//   vine-boom.mp3 una vez por cada ceja levantada
//
// Los navegadores bloquean el audio hasta que la persona interactúa con la
// página. La cámara puede arrancar sin ningún clic, así que en el primer clic
// o tecla se "desbloquean" ambos audios y se aplica el estado pendiente.

const AUDIO = "/mogops/audio";

export type Sounds = {
  /** Reproduce o pausa la canción. Al pausar conserva la posición, así que continúa en vez de reiniciar. */
  setMusic(playing: boolean): void;
  boom(): void;
  stop(): void;
};

export function createSounds(): Sounds {
  const music = new Audio(`${AUDIO}/gigachad.mp3`);
  music.loop = true;
  music.preload = "auto";
  const boom = new Audio(`${AUDIO}/vine-boom.mp3`);
  boom.preload = "auto";
  // Ignora los rechazos por falta de interacción o archivos faltantes.
  const quietly = (p: Promise<void>) => p.catch(() => undefined);

  let wantMusic = false;
  const unlock = () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    boom.muted = true;
    quietly(
      boom.play().then(() => {
        boom.pause();
        boom.currentTime = 0;
        boom.muted = false;
      }),
    );
    if (wantMusic) quietly(music.play());
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);

  return {
    setMusic(playing) {
      wantMusic = playing;
      if (playing && music.paused) quietly(music.play());
      else if (!playing && !music.paused) music.pause();
    },
    boom() {
      boom.currentTime = 0;
      quietly(boom.play());
    },
    stop() {
      wantMusic = false;
      music.pause();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    },
  };
}
