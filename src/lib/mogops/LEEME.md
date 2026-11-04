# MogOps — documentación de la versión web

Autor: Miguel Tovar

MogOps es un juego que califica una cara del 0 al 10 en tiempo real con la cámara. En esta web vive en
[/galeria/mogops](../../routes/galeria/mogops/+page.svelte), enlazado desde la pestaña pública **Galería**
([/galeria](../../routes/galeria/+page.svelte)). No hace falta iniciar sesión.

Es la versión ligera del proyecto [DroneOps/MogOps](https://github.com/DroneOps/MogOps): usa los mismos motores
de proporciones faciales, pero no la red neuronal MogNet (89 MB), que es demasiado pesada para una página web.

---

## 1. Funciones

### Modo competencia

1. Al abrir la página se pide acceso a la cámara. Mientras no se conceda, la vista previa dice
   **"Permite el uso de la cámara para jugar."**
2. Con la cámara activa aparece el botón **Iniciar** sobre la vista previa.
3. **Calentamiento (5 s).** La calificación se muestra en vivo, pequeña y en gris. Abajo de la vista previa:
   "La batalla empieza en N".
4. **Batalla (8 s).** El número crece, toma color y pasa a mostrar el **promedio ponderado por tiempo** de la
   batalla, con la calificación del momento al lado ("ahora 7.9"). Una etiqueta roja cuenta los segundos.
5. **Final.** El promedio queda congelado indefinidamente. Aparecen:
   - **Reiniciar**, sobre la vista previa, para volver al paso 2.
   - **Tu trofeo**, si la puntuación supera el récord de este dispositivo: la foto del trofeo, la
     puntuación, un campo de nombre y el botón **Registrar puntuación**, con su aviso de privacidad.
   - Si no supera el récord: "Tu récord de esta semana es X. Supéralo para volver a registrarte."

Durante el calentamiento y la batalla no se puede cambiar el motor de calificación ni la cámara.

**Promedio ponderado por tiempo.** Cada calificación cuenta durante el tiempo que estuvo en pantalla, hasta que
llega la siguiente; así un cuadro que tardó más pesa más, sin importar los cuadros por segundo del dispositivo.
Si en un momento no hay cara o la pose no sirve, ese tramo no cuenta. El promedio empieza a contar desde el
inicio de la batalla (el calentamiento no cuenta). Lógica en [competencia.svelte.ts](competencia.svelte.ts).

**Foto del trofeo.** Durante la batalla se guarda el cuadro con la calificación **instantánea** más alta (no el
promedio). Se recorta la cara con un 16% de margen a cada lado, se reduce a 256 px como máximo, se pone en espejo
como la vista previa y se convierte en JPEG (calidad 0.85, unos 10–20 KB) al terminar la batalla.

### Escala de colores del número

| Puntuación | Color |
|---|---|
| menos de 4 | gris |
| 4 a 6 | azul |
| 6 a 8.5 | amarillo |
| 8.5 a 9.3 | rojo |
| 9.3 a 10 | plata con brillo animado |

Se usa en el número grande durante la batalla y al final, en el trofeo y en el ranking
(`colorPuntuacion()` en [competencia.svelte.ts](competencia.svelte.ts); el plata es `.puntuacion-plata` en la página).

### Ranking semanal

- Muestra los 5 mejores; **Expandir** muestra hasta 15 (y **Contraer** los oculta).
- Cada fila: posición, foto del trofeo, nombre, cuándo se registró ("Hoy", "Ayer", "Hace 3 días") y la
  puntuación con su color. La fila del
  dispositivo actual se marca con **Tú**.
- **Una sola entrada por dispositivo**: su mejor puntuación. Una puntuación más alta sobrescribe a la anterior y
  permite cambiar el nombre. Una igual o menor no se puede registrar (el formulario ni siquiera aparece).
- **Cada entrada expira 7 días después de registrarse**, de forma individual. Si se sobrescribe con una
  puntuación mayor, sus 7 días empiezan de nuevo.

### Calificación

Dos motores, a elegir en "Calificación principal":

- **Geometría (aprendida de humanos).** 8 proporciones medidas con los 478 puntos de MediaPipe. Cada una se
  califica con una curva aprendida de las 5,500 caras calificadas de SCUT-FBP5500 y se combinan con pesos
  aprendidos: separación de ojos 39%, ancho de mandíbula 33%, ancho/alto 14%, inclinación cantal 9%, tercio
  inferior 3%, forma de ojos 1% (simetría y tercio medio se muestran pero no cuentan). Coincidencia con
  calificaciones humanas en caras no vistas: r = 0.58.
- **Ratios PSL (lore de looksmaxxing).** 10 proporciones "ideales" de los foros (inclinación cantal 4–8°, FWHR
  1.8–2.0, ESR 0.45–0.47, mentón/filtrum 2.0–2.25, ...). Cada una vale 10 dentro de su rango y baja hasta 0 a
  dos desviaciones estándar fuera. Se probó contra los datos y no predice nada (r = −0.09): es puro meme.

Los dos se pasan a la misma escala 0–10, estirada para que, entre las caras de referencia (SCUT-FBP5500 +
MEBeauty), la mitad lleguen a 6, una cuarta parte a 8, el 8% a 9 y el 3% a 9.5. Debajo del número se muestra
también la escala **PSL 1–8** de los foros (4 es el promedio; Gigachad desde 7, Chad desde 6, Chadlite desde
5.25) y el "Top N% de las caras".

En cámara, las proporciones se suavizan con un promedio recortado de los últimos 30 cuadros (se descarta el 20%
más alto y el 20% más bajo), y si la cara está girada o inclinada se pausa la calificación en vez de castigarla.

Panel de la derecha: lo más fuerte y lo más débil, barras de cada proporción (o cada ratio PSL con su rango
ideal) y los bonos del modo meme.

### Modo meme (siempre activo)

MediaPipe estima la fuerza de 52 expresiones faciales. Estas suman o restan puntos a la calificación, con un
medidor en vivo para cada una:

| Bono | Cara | Puntos |
|---|---|---|
| The Rock | Levantar una ceja | +1.0 |
| Hunter eyes | Entrecerrar los ojos | +0.75 |
| Mejillas hundidas | Chupar los cachetes | +0.75 |
| Mewing | Mandíbula al frente, labios apretados | +0.5 |
| Sonrisa | Sonreír | −0.75 |
| Cachetes inflados | Inflar los cachetes | −0.5 |

Cada bono crece de 0 a su valor completo entre dos umbrales, elegidos para que una foto normal casi no gane
nada (+0.03 en promedio). Detalles en [expressions.ts](expressions.ts).

### Efectos

- **Gigachad.** Mientras el promedio de la batalla (o la puntuación congelada) sea 8 o más, aparece la imagen
  de Gigachad arriba a la derecha de la vista previa y suena `gigachad.mp3` en bucle. Al bajar de 8 se pausa y
  luego continúa donde iba. Antes de la batalla no se activa.
- **Ceja levantada.** Cada ceja levantada hace sonar `vine-boom.mp3` y muestra la imagen de The Rock arriba a
  la izquierda durante un segundo. Funciona en cualquier fase.
- **Puntos faciales.** Botón para dibujar los 478 puntos sobre la vista previa.

El detector de ceja compara la altura de cada ceja (sobre las esquinas de los ojos, dividida entre la distancia
entre ojos) con el percentil 25 de los últimos ~3 s. Una ceja 15% más alta durante 3 cuadros dispara el efecto;
se rearma al bajar. Como la referencia se recalcula siempre, varias personas pueden turnarse sin recargar.
Ver [eyebrow.ts](eyebrow.ts).

Los navegadores bloquean el audio hasta que la persona interactúa con la página. El primer clic o tecla
desbloquea ambos sonidos (pulsar **Iniciar** basta).

---

## 2. Privacidad

- El análisis de la cara corre completo en el navegador (WebAssembly). El video de la cámara nunca se envía.
- Solo si la persona pulsa **Registrar puntuación** se envían al servidor su nombre, la puntuación y la foto
  del trofeo. El formulario lo explica junto al botón.
- Lo registrado se publica en el ranking y se borra 7 días después.
- El dispositivo se reconoce con una cookie anónima (`mogops_dispositivo`, un UUID aleatorio). No se guarda
  IP, cuenta ni ningún otro dato.

---

## 3. Arquitectura

```
src/routes/galeria/+page.svelte           Galería: MogOps destacado + tarjetas de los repos del equipo
src/routes/galeria/mogops/+page.svelte    El juego: cámara, competencia, calificación, trofeo, ranking
src/routes/api/mogops/ranking/+server.ts  API del ranking (GET y POST)
src/lib/mogops/
  analysis.ts             Bucle de la cámara: landmarks -> pose -> geometría, PSL, bonos; detecta la ceja
  competencia.svelte.ts   Fases de la competencia, promedio ponderado por tiempo y escala de colores
  landmarker.ts           Carga MediaPipe Face Landmarker (modo VIDEO, GPU con respaldo en CPU)
  geometry.ts             Las 8 proporciones y su calificación con curvas aprendidas
  psl.ts                  Los 10 ratios PSL y su calificación
  display.ts              Escala 0–10 compartida, percentiles y escala PSL 1–8
  pose.ts                 Revisa que la cara esté de frente, derecha, completa y cerca
  expressions.ts          Bonos del modo meme y suavizado de expresiones entre cuadros
  eyebrow.ts              Detector de ceja levantada
  rolling.ts              Promedio recortado de los últimos 30 cuadros
  sounds.ts               Canción de Gigachad y vine boom, con desbloqueo al primer clic
  model-params.json       Parámetros entrenados (geometry, pose, psl)
  ranking.sql             Tabla de Supabase del ranking
static/mogops/
  face_landmarker.task    Modelo de MediaPipe (3.6 MB)
  audio/gigachad.mp3      Canción de Gigachad (4.4 MB)
  audio/vine-boom.mp3     Vine boom (20 KB)
src/lib/assets/gigachad.png, the-rock.png   Imágenes de los efectos
```

**Página.** Svelte 5 con runes. `FaceAnalyzer` (en `analysis.ts`) no depende de Svelte: recibe una función que
se llama con cada análisis (cada ~100 ms). La página pasa cada calificación válida a `Competencia.registrar()` y,
si es la más alta, copia ese cuadro para el trofeo. Un intervalo de 100 ms llama a `Competencia.avanzar()` para
cambiar de fase aunque no lleguen cuadros.

**Carga de MediaPipe.** `@mediapipe/tasks-vision` se importa solo en el navegador (import dinámico en
`analysis.ts`), así la página se sigue renderizando en el servidor. Vite empaqueta los `.wasm` como assets de la
propia web (con y sin SIMD, ~13 MB, unos 4 MB comprimidos); el navegador descarga solo uno. No se usa ningún CDN.
La cámara requiere HTTPS (o `localhost`).

**Cámara.** Se pide al cargar la página y otra vez al elegir otra cámara. Ese efecto solo depende del modelo, el
analizador, el elemento de video y la cámara elegida (`untrack`), porque `startCamera` hace una primera
actualización síncrona; si el efecto también siguiera la fase, pulsar Iniciar reiniciaría la cámara.

---

## 4. API del ranking

`src/routes/api/mogops/ranking/+server.ts`. Pública (no requiere sesión).

**Identidad del dispositivo.** Cookie `mogops_dispositivo`: UUID aleatorio, `httpOnly`, `SameSite=Lax`, 400 días.
La crea el servidor en la primera petición. Los identificadores nunca se envían al navegador.

**`GET /api/mogops/ranking`** → `200`
```json
{
  "ranking": [{ "nombre": "Ana", "puntuacion": 9.4, "foto": "data:image/jpeg;base64,...", "registradoEn": "2026-11-03T20:00:00Z", "esMio": true }],
  "mio": { "nombre": "Ana", "puntuacion": 9.4 }
}
```
Hasta 15 filas, de mayor a menor puntuación (empates: gana quien registró primero). `mio` es la entrada vigente
de este dispositivo, o `null`.

**`POST /api/mogops/ranking`** con `{ "nombre", "puntuacion", "foto" }` → la misma respuesta que GET.

| Regla | Respuesta |
|---|---|
| Nombre de 1 a 24 caracteres (se recortan y unen los espacios) | `400` si no |
| Puntuación entre 0 y 10 (se redondea a 2 decimales) | `400` si no |
| Foto en `data:image/jpeg;base64,...`, máximo 120,000 caracteres | `400` si no |
| Este dispositivo ya tiene una puntuación igual o mayor | `409` |
| Ranking sin configurar en producción | `503` |
| Error de la base de datos | `500` |

En cada petición se borran primero las entradas vencidas, y nunca se muestran entradas vencidas.

**Almacenamiento.** Tabla `mogops_ranking` en Supabase, a la que el servidor accede con
`SUPABASE_SERVICE_ROLE_KEY` (la misma variable que usa el inventario). La tabla tiene RLS activado y ninguna
política, así que la llave pública (anon) no puede leerla ni escribirla: todo pasa por la API. La foto se guarda
como data URL en la misma fila, así que se borra junto con ella (no hay archivos sueltos en Storage).

**Desarrollo local.** Sin `SUPABASE_SERVICE_ROLE_KEY`, en `npm run dev` el ranking se guarda en memoria y se
pierde al reiniciar el servidor. En producción, sin la llave, la API responde `503`.

---

## 5. Puesta en marcha

1. **Crear la tabla (una sola vez).** En Supabase: SQL Editor → New query → pegar [ranking.sql](ranking.sql) → Run.
2. **Variables en Vercel.** `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`
   (ya existen para el resto de la web).
3. Desplegar. No hace falta ningún cron: las entradas vencidas se borran solas en la siguiente petición.

Probar en local: `npm install` y `npm run dev` con un `.env` que tenga las dos variables `PUBLIC_SUPABASE_*`
(ver el README de la web), y abrir `http://localhost:5173/galeria/mogops`.

---

## 6. Limitaciones conocidas

- **Las puntuaciones se calculan en el navegador**, así que alguien con conocimientos puede enviar una
  puntuación falsa directamente a la API. Es un juego; la API solo valida rangos y formato.
- **No hay moderación** de nombres ni fotos. Una entrada se puede borrar a mano en la tabla `mogops_ranking`
  de Supabase.
- Borrar las cookies (o usar otro navegador) cuenta como un dispositivo nuevo.
- Las calificaciones imitan la opinión promedio de las personas que calificaron SCUT-FBP5500 y son menos
  confiables para caras distintas a las de ese conjunto de datos. Es solo para entretenerse.
- La canción, el vine boom y las imágenes de Gigachad y The Rock son material con derechos de terceros.

---

## 7. Mantenimiento

Estos archivos vienen de [DroneOps/MogOps](https://github.com/DroneOps/MogOps) (`web/src/lib`), con los textos
traducidos al español: `geometry.ts`, `psl.ts`, `display.ts`, `pose.ts`, `expressions.ts`, `eyebrow.ts`,
`rolling.ts` y `model-params.json` (solo las secciones `geometry`, `pose` y `psl`). Las rutas `training/...` en
sus comentarios se refieren a ese repo. Si allá se reentrenan los modelos, vuelve a copiar `model-params.json`
y los archivos que hayan cambiado.

Solo existen en esta web: `analysis.ts`, `competencia.svelte.ts`, `landmarker.ts`, `sounds.ts` y `ranking.sql`.

Para probar el juego sin cámara (por ejemplo en un navegador de pruebas), se puede reemplazar
`navigator.mediaDevices.getUserMedia` por una función que devuelva `canvas.captureStream()` de un canvas con una
foto, y luego entrar a la página con navegación interna (desde la Galería) para que la use.
