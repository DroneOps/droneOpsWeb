// Autor: Miguel Tovar
// MediaPipe Face Landmarker, servido por esta misma web (nada de CDN):
// Vite copia los .wasm del paquete como assets y el modelo vive en
// static/mogops. Solo se carga en el navegador (import dinámico en la página).
import { FaceLandmarker, type FaceLandmarkerResult, FilesetResolver } from "@mediapipe/tasks-vision";
import simdLoader from "@mediapipe/tasks-vision/vision_wasm_internal.js?url";
import simdBinary from "@mediapipe/tasks-vision/vision_wasm_internal.wasm?url";
import noSimdLoader from "@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js?url";
import noSimdBinary from "@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm?url";
import type { Blendshapes } from "./expressions";
import type { Landmark } from "./geometry";

export type Face = { landmarks: Landmark[]; blendshapes: Blendshapes };

const MODEL = "/mogops/face_landmarker.task";
let instance: Promise<FaceLandmarker> | null = null;
let mode: "IMAGE" | "VIDEO" = "IMAGE";

function load(): Promise<FaceLandmarker> {
  instance ??= (async () => {
    const simd = await FilesetResolver.isSimdSupported();
    const fileset = simd
      ? { wasmLoaderPath: simdLoader, wasmBinaryPath: simdBinary }
      : { wasmLoaderPath: noSimdLoader, wasmBinaryPath: noSimdBinary };
    const options = (delegate: "GPU" | "CPU") => ({
      baseOptions: { modelAssetPath: MODEL, delegate },
      runningMode: mode,
      numFaces: 1,
      outputFaceBlendshapes: true, // fuerza de cada expresión, para los bonos del modo meme
    });
    try {
      return await FaceLandmarker.createFromOptions(fileset, options("GPU"));
    } catch {
      return FaceLandmarker.createFromOptions(fileset, options("CPU"));
    }
  })();
  return instance;
}

async function withMode(next: "IMAGE" | "VIDEO"): Promise<FaceLandmarker> {
  const landmarker = await load();
  if (mode !== next) {
    mode = next;
    await landmarker.setOptions({ runningMode: next });
  }
  return landmarker;
}

function firstFace(result: FaceLandmarkerResult): Face | null {
  const landmarks = result.faceLandmarks[0];
  if (!landmarks) return null;
  const categories = result.faceBlendshapes[0]?.categories ?? [];
  return { landmarks, blendshapes: Object.fromEntries(categories.map((c) => [c.categoryName, c.score])) };
}

export async function detectImage(image: HTMLImageElement): Promise<Face | null> {
  return firstFace((await withMode("IMAGE")).detect(image));
}

export async function detectVideo(video: HTMLVideoElement, timestamp: number): Promise<Face | null> {
  return firstFace((await withMode("VIDEO")).detectForVideo(video, timestamp));
}

export const preloadLandmarker = () => load().then(() => undefined);
