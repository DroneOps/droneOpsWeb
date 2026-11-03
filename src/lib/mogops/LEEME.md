# MogOps (versión web ligera)

Autor: Miguel Tovar

Lógica del juego de [/galeria/mogops](../../routes/galeria/mogops/+page.svelte).
Todo corre en el navegador del usuario: las fotos y la cámara nunca salen del dispositivo.

Copiado de [DroneOps/MogOps](https://github.com/DroneOps/MogOps) (`web/src/lib`), con los textos traducidos al español.
Las rutas `training/...` en los comentarios se refieren a ese repo.
Si cambian los modelos allá, vuelve a copiar estos archivos:

| Archivo | Qué hace |
|---|---|
| `geometry.ts` | 8 proporciones faciales con curvas aprendidas de calificaciones humanas (SCUT-FBP5500) |
| `psl.ts` | Ratios "PSL" de los foros de looksmaxxing (meme, sin relación real con las calificaciones) |
| `display.ts` | Escala 0–10 compartida y la escala PSL 1–8 |
| `pose.ts` | Revisa que la cara esté de frente |
| `expressions.ts` | Bonos del modo meme (ceja levantada, hunter eyes, ...) |
| `eyebrow.ts` | Detector de ceja levantada (sonido "boom") |
| `rolling.ts` | Promedio recortado de los últimos 30 cuadros |
| `model-params.json` | Parámetros entrenados (`geometry`, `pose`, `psl` de `model-params.json` de MogOps) |

Solo en esta web:

| Archivo | Qué hace |
|---|---|
| `landmarker.ts` | Carga MediaPipe Face Landmarker desde esta misma web (`static/mogops/face_landmarker.task`) |
| `analysis.ts` | El pipeline de foto y cámara (equivale a `useFaceAnalysis.ts`, sin React ni MogNet) |
| `sounds.ts` | Canción de Gigachad (8 o más) y "vine boom" de la ceja, desde `static/mogops/audio/` |

MogNet, la red neuronal de MogOps (89 MB), no se incluye: es demasiado pesada para la web.
