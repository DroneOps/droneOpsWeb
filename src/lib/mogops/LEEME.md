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
2. Con la cámara activa aparece el botón **Iniciar** sobre la vista previa. La tecla **Enter** hace lo mismo y
   funciona en cualquier fase: inicia una partida, reinicia la actual o empieza una nueva al terminar.
3. **Calentamiento (8 s).** La calificación se muestra en vivo, pequeña y en gris. Abajo de la vista previa:
   "La batalla empieza en N".
4. **Batalla (15 s).** El número crece, toma color y pasa a mostrar el **promedio ponderado por tiempo** de la
   batalla, con la calificación del momento al lado ("ahora 7.9"). Una etiqueta roja cuenta los segundos.
5. **Pantalla final (25 s).** La cámara se queda congelada en el cuadro de la calificación más alta (de ese mismo
   cuadro sale el trofeo; el cuadro completo no sale del navegador), detrás del formulario y los controles, y el número
   de la calificación crece durante los 25 segundos. Termina antes si empieza otra partida. Luego regresa la cámara en vivo.
6. **Final.** El promedio queda congelado indefinidamente. Sobre la vista previa aparecen:
   - **Reiniciar**, para volver al paso 2.
   - **Tu trofeo**, si la puntuación supera el récord de este dispositivo: la foto del trofeo, la
     puntuación, un campo de nombre y el botón **Registrar**, con su aviso de privacidad.
   - Si no supera el récord: "Tu récord de esta semana es X. Supéralo para volver a registrarte."

Durante el calentamiento y la batalla no se puede cambiar la cámara, el Modo Arcade ni la dificultad.

**Enter.** No actúa mientras se escribe en un campo (en el del nombre, Enter envía el formulario) ni si un botón o
enlace tiene el foco por haber llegado a él con el teclado. La excepción es el nombre en Modo Arcade, abajo.

**Promedio ponderado por tiempo.** Cada calificación cuenta durante el tiempo que estuvo en pantalla, hasta que
llega la siguiente; así un cuadro que tardó más pesa más, sin importar los cuadros por segundo del dispositivo.
Si en un momento no hay cara o la pose no sirve, ese tramo no cuenta. El promedio empieza a contar desde el
inicio de la batalla (el calentamiento no cuenta). Lógica en [competencia.svelte.ts](competencia.svelte.ts).

**Foto del trofeo.** Durante la batalla se guarda el cuadro con la calificación **instantánea** más alta (no el
promedio). Al terminar, se recorta la cara con un 16% de margen a cada lado, se reduce a 256 px como máximo, se pone en espejo
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

- Muestra hasta 20 lugares en una caja con desplazamiento propio (en Modo Arcade, abajo, es distinto).
- Cada fila: posición, foto del trofeo, nombre, cuándo se registró ("Hoy", "Ayer", "Hace 3 días") y la
  puntuación con su color. La fila del
  dispositivo actual se marca con **Tú**.
- **Una sola entrada por dispositivo**: su mejor puntuación. Una puntuación más alta sobrescribe a la anterior y
  permite cambiar el nombre. Una igual o menor no se puede registrar (el formulario ni siquiera aparece).
- **Cada entrada expira 7 días después de registrarse**, de forma individual. Si se sobrescribe con una
  puntuación mayor, sus 7 días empiezan de nuevo.

### Calificación

Solo se muestra el motor de **geometría**. Los Ratios PSL siguen en el código ([psl.ts](psl.ts)) y se siguen
calculando, pero están ocultos mientras se trabaja en ellos: para volver a mostrarlos, cambia la constante `motor`
de la página y recupera su selector del historial de git. Cada motor:

- **Geometría (aprendida de humanos).** 8 proporciones medidas con los 478 puntos de MediaPipe. Cada una se
  califica con una curva aprendida de las 5,500 caras calificadas de SCUT-FBP5500 y se combinan con pesos
  aprendidos: separación de ojos 39%, ancho de mandíbula 33%, ancho/alto 14%, inclinación cantal 9%, tercio
  inferior 3%, forma de ojos 1% (simetría y tercio medio se muestran pero no cuentan). Coincidencia con
  calificaciones humanas en caras no vistas: r = 0.58.
- **Ratios PSL (lore de looksmaxxing, oculto).** 10 proporciones "ideales" de los foros (inclinación cantal 4–8°, FWHR
  1.8–2.0, ESR 0.45–0.47, mentón/filtrum 2.0–2.25, ...). Cada una vale 10 dentro de su rango y baja hasta 0 a
  dos desviaciones estándar fuera. Se probó contra los datos y no predice nada (r = −0.09): es puro meme.

Los dos se pasan a la misma escala 0–10, estirada para que, entre las caras de referencia (SCUT-FBP5500 +
MEBeauty), la mitad lleguen a 6, una cuarta parte a 8, el 8% a 9 y el 3% a 9.5. Debajo del número se muestra
también la escala **PSL 1–8** de los foros (4 es el promedio; Gigachad desde 7, Chad desde 6, Chadlite desde
5.25) y el "Top N% de las caras".

En cámara, las proporciones se suavizan con un promedio recortado de los últimos 30 cuadros (se descarta el 20%
más alto y el 20% más bajo), y si la cara está girada o inclinada se pausa la calificación en vez de castigarla.

Panel de calificación: lo más fuerte y lo más débil, y una sola lista con los gestos y las proporciones.

### Curva de dificultad (solo geometría)

Arriba de 8 cada punto cuesta más ([curva.ts](curva.ts)). Con la dificultad normal (1), comparado con la escala
original:

| Tramo | Esfuerzo extra | Puntos que pide |
|---|---|---|
| 8 a 9 | +20% | 1.2 |
| 9 a 9.5 | +40% | 0.7 |
| 9.5 a 10 | +50% | 0.75 |

Los "puntos" son la calificación más los gestos, **sin tope**. La curva va después de sumar los gestos porque, si
no, se podría brincar haciendo caras. En cifras: 8 se queda en 8, 9.2 da 9, 9.9 da 9.5 y hacen falta 10.65 para
llegar a 10. Una cara sin gestos llega como máximo a 9.57, así que el 10 solo se alcanza con gestos.

Se aplica a cada calificación instantánea, antes de promediar la batalla. El "Top N%" y la escala PSL deshacen la
curva antes de buscar el percentil, para no presumir un lugar que la cara no tiene. El umbral de Gigachad (8) no cambia.

La **dificultad** va de 1 a 5 y multiplica el extra de cada tramo:

| Puntos | Dif. 1 | Dif. 2 | Dif. 3 | Dif. 4 | Dif. 5 |
|---|---|---|---|---|---|
| 8.5 | 8.42 | 8.36 | 8.31 | 8.28 | 8.25 |
| 9 | 8.83 | 8.71 | 8.63 | 8.56 | 8.50 |
| 9.5 | 9.21 | 9.06 | 8.94 | 8.83 | 8.75 |
| 10 | 9.57 | 9.33 | 9.18 | 9.08 | 9.00 |
| 11 | 10.00 | 9.85 | 9.62 | 9.46 | 9.33 |
| 12 | 10.00 | 10.00 | 10.00 | 9.80 | 9.64 |

La dificultad solo cambia en el navegador donde se ajusta, y el ranking no guarda con cuál se jugó: las
puntuaciones de dificultades distintas no son comparables. Conviene fijarla antes de un evento y no moverla.

### Modo Arcade (con contraseña)

Para eventos, en un equipo donde juegan muchas personas y Enter puede ser el único control. El interruptor
**Modo Arcade** pide una contraseña; al acertarla se enciende y aparecen la **Dificultad**, **Bloquear** y
**Confirmar**.

- **Confirmar** oculta esos ajustes y deja el Modo Arcade encendido, para que el público no los vea.
- Con los ajustes ocultos, el interruptor pide la contraseña otra vez: sin ella nadie puede apagar el modo ni ver
  la dificultad. Al recargar la página los ajustes también quedan ocultos.
- El modo y la dificultad siguen activos en ese navegador 3 días, aunque se recargue.
- **Bloquear** apaga todo y regresa la dificultad a 1.

Funcionamiento:

- **Cada intento es un registro nuevo**, sin el límite de uno por dispositivo y aunque sea más bajo que los anteriores.
- **Todas las puntuaciones se guardan.** El nombre es opcional (sin nombre se guarda como "Anónimo"). El campo se
  enfoca solo y una barra marca 15 segundos; al acabarse, se registra con lo que tenga escrito. Si falla, lo
  reintenta cada 15 segundos.
- **Enter guarda y sigue.** Con una puntuación pendiente, Enter (también dentro del campo del nombre) la registra e
  inicia la siguiente partida, así que basta un solo botón. Reiniciar también la guarda.
- **El ranking se mueve solo.** Los 3 primeros lugares quedan fijos y del 4 al 15 pasan en un carrusel sin fin
  (3 s por fila). Si caben en la caja, no se mueve. La fila que se acaba de registrar se marca con **Tú**.
- **Sin navegación a mano.** Toda la pantalla del juego cabe sin desplazarse, ver Diseño.

Como en este modo la foto se publica sin que la persona lo decida, el aviso de privacidad del formulario y la
frase de la barra de ajustes cambian para decirlo.

### Gestos (siempre activos)

MediaPipe estima la fuerza de 52 expresiones faciales. Estas suman o restan puntos a la calificación, con un
medidor en vivo para cada una:

| Gesto | Cara | Puntos |
|---|---|---|
| Ceja levantada | Levantar una ceja | +1.0 |
| Hunter eyes | Entrecerrar los ojos | +0.75 |
| Cachetes hundidos | Chupar los cachetes | +0.75 |
| Mewing | Mandíbula al frente, labios apretados | +0.5 |
| Sonrisa | Sonreír | −0.75 |
| Cachetes inflados | Inflar los cachetes | −0.5 |

Cada gesto crece de 0 a su valor completo entre dos umbrales, elegidos para que una foto normal casi no gane
nada (+0.03 en promedio). Detalles en [expressions.ts](expressions.ts).

### Efectos

- **Gigachad.** Mientras el promedio de la batalla (o la puntuación congelada) sea 8 o más, aparece la imagen
  de Gigachad arriba a la derecha de la vista previa y suena `gigachad.mp3` en bucle. Al bajar de 8 se pausa y
  luego continúa donde iba. Antes de la batalla no se activa.
- **Ceja levantada.** Cada ceja levantada hace sonar `vine-boom.mp3` y muestra la imagen de The Rock arriba a
  la izquierda durante un segundo. Funciona en cualquier fase.
- **Silencio al terminar.** Los sonidos siguen un máximo de 10 segundos después de acabar la batalla, y no
  vuelven hasta la siguiente partida. La imagen de Gigachad se queda.
- **Puntos faciales.** Botón para dibujar los 478 puntos sobre la vista previa.

El detector de ceja compara la altura de cada ceja (sobre las esquinas de los ojos, dividida entre la distancia
entre ojos) con el percentil 25 de los últimos ~3 s. Una ceja 15% más alta durante 3 cuadros dispara el efecto;
se rearma al bajar. Como la referencia se recalcula siempre, varias personas pueden turnarse sin recargar.
Ver [eyebrow.ts](eyebrow.ts).

Los navegadores bloquean el audio hasta que la persona interactúa con la página. El primer clic o tecla
desbloquea ambos sonidos (pulsar **Iniciar** o Enter basta).

### Diseño

**Escritorio (1024 px o más).** El juego ocupa exactamente la pantalla bajo la barra de navegación: la cámara a la
izquierda con los ajustes debajo, la calificación arriba a la derecha y el ranking abajo a la derecha. Los mensajes
("Mira de frente a la cámara"), el formulario y los controles van sobre la cámara. Lo demás ("¿Cómo funciona?") queda
abajo y es opcional. En pantallas bajas el panel de calificación se compacta para no necesitar desplazamiento:

| Alto de la ventana | Qué se oculta |
|---|---|
| 775 px o menos | Lo más fuerte y lo más débil |
| 700 px o menos | Las barras de las proporciones (quedan los números) |
| 610 px o menos | Las proporciones (quedan los gestos) |

Probado en el estado más alto (final con formulario) en 1920×1080, 1920×950, 1536×864, 1440×900, 1366×768, 1366×650,
1280×720, 1280×600 y 1024×700. Para un evento, usa pantalla completa (F11) y haz clic una vez en la página para que
reciba las teclas.

**Celular.** La calificación va sobre la cámara. Debajo siguen las métricas, el ranking y los ajustes.

---

## 2. Privacidad

- El análisis de la cara corre completo en el navegador (WebAssembly). El video de la cámara nunca se envía.
- En modo normal, solo si la persona pulsa **Registrar** se envían al servidor su nombre, la puntuación y la foto
  del trofeo. El formulario lo explica junto al botón.
- En **Modo Arcade** se envían siempre, sin que la persona lo pida, y el formulario lo avisa. Quien opere el evento
  debe avisar también a los participantes: su foto queda pública 7 días.
- Lo registrado se publica en el ranking y se borra 7 días después.
- El dispositivo se reconoce con una cookie anónima (`mogops_dispositivo`, un UUID aleatorio). No se guarda
  IP, cuenta ni ningún otro dato.

---

## 3. Arquitectura

```
src/routes/galeria/+page.svelte           Galería: MogOps destacado + tarjetas de los repos del equipo
src/routes/galeria/mogops/+page.svelte    El juego: cámara, competencia, calificación, trofeo, ranking
src/routes/api/mogops/ranking/+server.ts  API del ranking (GET y POST)
src/routes/api/mogops/arcade/+server.ts   Desbloquea y bloquea el Modo Arcade (GET, POST y DELETE)
src/lib/mogops/
  analysis.ts             Bucle de la cámara: landmarks -> pose -> geometría, PSL, bonos; detecta la ceja
  curva.ts                Curva de dificultad arriba de 8
  arcade.server.ts        Hash de la contraseña y cookie firmada del Modo Arcade (solo servidor)
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

**Varias caras.** `numFaces` es 1, así que solo se analiza una cara. En modo VIDEO, MediaPipe la elige con su
detector (la de mayor confianza, no la más grande ni la más centrada) y luego la **sigue** cuadro a cuadro sin volver
a detectar. Otra cara que entre al cuadro no la reemplaza; solo se detecta de nuevo cuando se pierde la que sigue.

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
Hasta 20 filas, de mayor a menor puntuación (empates: gana quien registró primero). `mio` es la entrada vigente
de este dispositivo, o `null`.

**`POST /api/mogops/ranking`** con `{ "nombre", "puntuacion", "foto", "arcade"? }` → la misma respuesta que GET.

| Regla | Respuesta |
|---|---|
| Nombre de 1 a 24 caracteres (se recortan y unen los espacios) | `400` si no |
| Puntuación entre 0 y 10 (se redondea a 2 decimales) | `400` si no |
| Foto en `data:image/jpeg;base64,...`, máximo 120,000 caracteres | `400` si no |
| Este dispositivo ya tiene una puntuación igual o mayor (no aplica en Arcade) | `409` |
| `arcade: true` sin la cookie de Arcade | `403` |
| Ranking sin configurar en producción | `503` |
| Error de la base de datos | `500` |

En cada petición se borran primero las entradas vencidas, y nunca se muestran entradas vencidas.

**Modo Arcade.** Con `arcade: true`, el nombre puede ir vacío (se guarda "Anónimo") y la fila se guarda con un UUID
nuevo en la columna `dispositivo`, en vez del de la cookie. Por eso no sobrescribe nada, y la tabla no necesitó
cambios. La respuesta marca esa fila como `esMio`.

**`/api/mogops/arcade`.** `GET` responde `{ "desbloqueado": boolean }`. `POST` con `{ "clave" }` compara su scrypt con
el hash de [arcade.server.ts](arcade.server.ts) y deja la cookie `mogops_arcade` (`httpOnly`, 3 días), o responde
`403`. `DELETE` la quita. La cookie es una firma HMAC hecha con `SUPABASE_SERVICE_ROLE_KEY`, así que no se puede
fabricar desde el navegador.

**Cambiar la contraseña.** Nunca la escribas en el código: el repo es público. Calcula el hash nuevo, pégalo en
`CLAVE_HASH` y despliega:

```bash
node -e "console.log(require('crypto').scryptSync(process.argv[1], 'mogops-arcade', 32).toString('hex'))" 'contraseña nueva'
```

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
  puntuación falsa directamente a la API, que solo valida rangos y formato. Si hay premios, confirma en persona
  a quien gane.
- **El ranking no distingue origen ni dificultad.** Las filas de Arcade, las de internet y las anteriores a la curva
  (5 de noviembre de 2026) compiten en la misma tabla.
- **Una pantalla con Enter como único control no puede teclear nombres**, así que sus filas salen como "Anónimo".
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

Solo existen en esta web: `analysis.ts`, `competencia.svelte.ts`, `curva.ts`, `arcade.server.ts`, `landmarker.ts`,
`sounds.ts` y `ranking.sql`. `expressions.ts` tiene aquí dos nombres propios ("Ceja levantada" y "Cachetes hundidos").

Para probar el juego sin cámara (por ejemplo en un navegador de pruebas), se puede reemplazar
`navigator.mediaDevices.getUserMedia` por una función que devuelva `canvas.captureStream()` de un canvas con una
foto, y luego entrar a la página con navegación interna (desde la Galería) para que la use. Tras editar archivos con
el servidor de desarrollo, abre la página una vez antes de hacerlo: el primer enlace después de un cambio recarga
todo y borra el reemplazo.
