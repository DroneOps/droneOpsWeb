// Autor: Miguel Tovar
// Pipeline de MogOps para la cámara en vivo, sin redes neuronales
// pesadas (MogNet pesa 89 MB y no está en la web):
//   landmarks de MediaPipe -> revisión de pose -> ratios de geometría
//   (+ ventana de 30 cuadros en cámara) -> ratios "PSL" -> bonos de
//   expresión del modo meme. En cámara también detecta una ceja levantada.
// Es el equivalente de web/src/lib/useFaceAnalysis.ts del repo MogOps, sin React.
import { aplicarCurva } from "./curva";
import { BlendshapeSmoother, type BonusState, scoreBonuses, withBonus } from "./expressions";
import { EyebrowDetector } from "./eyebrow";
import {
  computeMetrics,
  geometryScore,
  type Landmark,
  METRIC_KEYS,
  type Metrics,
  strongestAndWeakest,
  subScores,
} from "./geometry";
// MediaPipe solo existe en el navegador: se importa hasta que se usa.
const landmarker = () => import("./landmarker");
import { checkPose } from "./pose";
import { PSL_KEYS, pslMetrics, type PslMetrics, pslScore, pslSubScores } from "./psl";
import { MetricWindow } from "./rolling";

export type Status = "idle" | "loading" | "analyzing" | "ready" | "adjust" | "noface" | "error";
export type Engine = "geometry" | "psl";

export const ENGINE_LABEL: Record<Engine, string> = { geometry: "Geometría", psl: "Ratios PSL" };

export type Analysis = {
  status: Status;
  message: string;
  reasons: string[];
  geometry: number | null;
  subs: Metrics | null;
  strength: string | null;
  flaw: string | null;
  psl: number | null;
  pslRatios: PslMetrics | null;
  pslSubs: PslMetrics | null;
  bonus: { total: number; items: BonusState[] } | null;
  frames: number;
};

export type Overlay = { landmarks: Landmark[] | null; width: number; height: number };

export const EMPTY: Analysis = {
  status: "idle",
  message: "Esperando una cara",
  reasons: [],
  geometry: null,
  subs: null,
  strength: null,
  flaw: null,
  psl: null,
  pslRatios: null,
  pslSubs: null,
  bonus: null,
  frames: 0,
};

/** Calificación con la que suena el modo Giga Chad. */
export const MOG_THRESHOLD = 8.0;
const UI_INTERVAL_MS = 100;

/** El número grande: el motor elegido, más los bonos si el modo meme está activo. En geometría pasa por la curva de dificultad. */
export function headlineScore(a: Analysis, engine: Engine, meme: boolean, dificultad: number): number | null {
  const base = a[engine];
  if (base === null) return null;
  const bonus = meme && a.bonus ? a.bonus.total : 0;
  return engine === "geometry" ? aplicarCurva(base + bonus, dificultad) : withBonus(base, bonus);
}

const sourceWidth = (v: HTMLVideoElement) => v.videoWidth;
const sourceHeight = (v: HTMLVideoElement) => v.videoHeight;

function scoreGeometry(metrics: Metrics) {
  const subs = subScores(metrics);
  return { subs, geometry: geometryScore(subs), ...strongestAndWeakest(metrics, subs) };
}

function scorePsl(ratios: PslMetrics) {
  const pslSubs = pslSubScores(ratios);
  return { pslRatios: ratios, pslSubs, psl: pslScore(pslSubs) };
}

export class FaceAnalyzer {
  /** Lo que dibuja la capa de puntos; se lee en cada cuadro. */
  overlay: Overlay = { landmarks: null, width: 0, height: 0 };
  private camera = { stop: true, raf: 0, stream: null as MediaStream | null };

  constructor(
    private readonly onUpdate: (analysis: Analysis) => void,
    private readonly onEyebrowRaise: () => void = () => {},
  ) {}

  preload = () => landmarker().then((m) => m.preloadLandmarker());

  async startCamera(video: HTMLVideoElement, deviceId?: string): Promise<void> {
    this.stopCamera();
    this.onUpdate({ ...EMPTY, status: "loading", message: "Iniciando cámara" });
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId ? { exact: deviceId } : undefined, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
    } catch (e) {
      this.onUpdate({ ...EMPTY, status: "error", message: "Cámara no disponible" });
      throw e;
    }
    const state = { stop: false, raf: 0, stream: stream as MediaStream | null };
    this.camera = state;

    const { detectVideo } = await landmarker();
    const history = new MetricWindow(METRIC_KEYS, 30);
    const pslHistory = new MetricWindow(PSL_KEYS, 30);
    const expressions = new BlendshapeSmoother();
    const eyebrow = new EyebrowDetector();
    let lastUi = 0;
    let latest: Analysis = { ...EMPTY, status: "analyzing", message: "Buscando una cara" };

    const tick = async () => {
      if (state.stop) return;
      if (video.readyState >= 2) {
        const now = performance.now();
        const w = sourceWidth(video);
        const h = sourceHeight(video);
        const face = await detectVideo(video, now);
        if (state.stop) return;
        if (!face) {
          history.reset();
          pslHistory.reset();
          expressions.reset();
          eyebrow.reset();
          this.overlay = { landmarks: null, width: w, height: h };
          latest = { ...latest, status: "noface", message: "No se encontró una cara", reasons: [] };
        } else {
          const { landmarks } = face;
          this.overlay = { landmarks, width: w, height: h };
          const pose = checkPose(landmarks, w, h);
          if (!pose.ok) {
            // Pausa en vez de castigar: conserva la última calificación y pide otra pose.
            latest = { ...latest, status: "adjust", message: "Ajusta tu pose", reasons: pose.reasons };
          } else {
            // Las cejas solo se revisan de frente: girar o asentir cambia su altura aparente.
            if (eyebrow.update(landmarks, w, h, now)) this.onEyebrowRaise();
            const smoothed = history.push(computeMetrics(landmarks, w, h));
            latest = {
              ...latest,
              ...scoreGeometry(smoothed),
              ...scorePsl(pslHistory.push(pslMetrics(landmarks, w, h))),
              bonus: scoreBonuses(expressions.push(face.blendshapes)),
              status: "ready",
              message: "En vivo",
              reasons: [],
              frames: history.count,
            };
          }
        }
        if (now - lastUi > UI_INTERVAL_MS) {
          lastUi = now;
          this.onUpdate(latest);
        }
      }
      state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);
  }

  stopCamera(): void {
    const state = this.camera;
    state.stop = true;
    cancelAnimationFrame(state.raf);
    state.stream?.getTracks().forEach((t) => t.stop());
    state.stream = null;
  }
}
