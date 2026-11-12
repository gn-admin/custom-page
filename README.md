# Grupo Nebak — Réplica estática del sitio web

Réplica estática y fiel de **Grupo Nebak** (https://www.gruponebak.net), asociación de adopción de animales y control de colonias de gatos en Irún, Gipuzkoa.

HTML5, CSS3 y JavaScript vanilla. Sin frameworks ni constructores. Las rutas son relativas y el blog se alimenta de `data/blog-posts.json`.

> **Estado:** réplica completa y verificada en local (19 páginas, 49 imágenes y 18 posts). Menú de escritorio y móvil revisados; 0 imágenes rotas. **No publicada**: el despliegue queda pendiente de autorización.

---

## Diseño

La referencia es el Wix original, no un rediseño moderno:

- Lienzo blanco con contenido centrado de **980 px**.
- Header de **200 px**: logo circular 84×80 centrado, línea de 944 px, navegación de **680×30 px** en x=144 relativo al header, con 7 ítems visibles y un espaciador oculto de 46 px; «Adopciones», «Colabora» y «Más» son desplegables, no enlaces. Redes de 20 px con gap 10 hasta el borde derecho.
- Home con carrusel de **980×800** (imagen original 1960×800), H1 Montserrat de 72 px en verde `#53A142` y párrafo Avenir/Helvetica de 15 px.
- Títulos 72/40/22 px; bordes grises `#BFBFBF` de 1 px; sin sombras, gradientes, badges ni botones pill.
- Tarjetas de evento de 319×379 con imagen de 319×239.
- Formulario de 460 px y mapa de Google de 980×505.
- Banner de cookies fijo de 68 px con Aceptar, Opciones de cookies, cierre y enlaces legales.

## Menú

```
Inicio | Acerca de | Adopciones ▾ | Acogidas | Colabora ▾ | Contacto | Más ▾
```

- **Adopciones:** Protocolo · Gatos En Adopción · Perros En Adopción · Adoptados
- **Colabora:** Hazte voluntario · Acoge · Donaciones
- **Más:** Política de Cookies · Política de Privacidad · Casos Externos · Blog

«Adopciones», «Colabora» y «Más» abren desplegables; no son enlaces. El espaciador invisible de 46 px reproduce el octavo «Más» oculto del Wix original y mantiene el centrado exacto.

---

## Estructura

```text
custom-page/
├── index.html
├── sobre-nosotros.html
├── acogidas.html
├── adopciones.html
├── colabora.html
├── contacto.html
├── gatos-en-adopcion.html
├── perros-en-adopcion.html
├── adoptados.html
├── acoge.html
├── casos-externos.html
├── protocolo.html
├── donaciones.html
├── hazte-socio.html
├── blog.html
├── post.html
├── 404.html
├── politicas-de-cookies.html
├── copia-de-politica-de-cookies.html   # Política de Privacidad
├── css/style.css
├── js/
│   ├── main.js
│   ├── blog-api.js
│   ├── blog-render.js
│   └── blog-render-index.js
├── data/blog-posts.json                # 18 posts
├── assets/images/                      # 49 imágenes locales
├── .gitignore
└── README.md
```

---

## Páginas

| Página | Archivo |
|---|---|
| Inicio | `index.html` |
| Acerca de | `sobre-nosotros.html` |
| Acogidas temporales | `acogidas.html` |
| Adopciones | `adopciones.html` |
| Colabora | `colabora.html` |
| Contacto | `contacto.html` |
| Gatos en adopción | `gatos-en-adopcion.html` |
| Perros en adopción | `perros-en-adopcion.html` |
| Adoptados | `adoptados.html` |
| Acoge | `acoge.html` |
| Casos externos | `casos-externos.html` |
| Protocolo de preadopción | `protocolo.html` |
| Donaciones | `donaciones.html` |
| Hazte socio | `hazte-socio.html` |
| Blog | `blog.html` |
| Detalle de post | `post.html?slug=...` |
| Error 404 | `404.html` |
| Política de Cookies | `politicas-de-cookies.html` |
| Política de Privacidad | `copia-de-politica-de-cookies.html` |

---

## Cookies y datos legales

- Banner funcional con `Aceptar`, `Opciones de cookies` y cierre. La decisión se guarda en `localStorage` con la clave `nebak-cookie-consent`.
- Panel de preferencias con cookies necesarias (siempre activas), analíticas y marketing.
- Si se rechaza o se cierra, no se activan cookies no esenciales.
- Textos legales basados en el original: responsable **Grupo Nebak**, CIF **G75203562**, C/ Santiago 27 1º izq, 20300 Irún, `gruponebak@gmail.com`.

---

## Blog

- `data/blog-posts.json` contiene 18 historias.
- `js/blog-api.js` carga el JSON local (o un endpoint si se configura).
- `js/blog-render-index.js` renderiza las historias en `blog.html`.
- `js/blog-render.js` renderiza el detalle según `?slug=`.
- Sin JavaScript, el blog muestra un aviso de que se requiere JavaScript.

---

## Ejecutar en local

```bash
cd custom-page
python -m http.server 8765 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8765/`.

También sirve cualquier servidor estático:

```bash
npx serve .
```

El blog requiere un servidor HTTP porque usa `fetch`; abrir `index.html` con `file://` no carga el JSON.

---

## Formularios y mapa

Los formularios de la home y de contacto incluyen **Nombre, Email, Teléfono, Dirección, Asunto y Mensaje**. Al enviar, se simula la operación (sitio estático), se muestra el mensaje de éxito y un aviso flotante. El mapa de Google se inserta con un iframe embed y `loading="lazy"`.

---

## Verificación local

- 19 rutas HTML responden HTTP 200; 0 enlaces internos rotos.
- Auditoría a 1280 px: 0 imágenes rotas u ocultas en las 19 páginas y sin desbordamiento horizontal.
- Blog: 18 tarjetas renderizadas, 18 imágenes cargadas y detalle `post.html?slug=laia-border-collie` correcto.
- Menú móvil a 390 px: panel de 340 px abierto en x=50, etiquetas y submenús correctos, sin scroll horizontal.
- `banner-acerca.jpg` del original devuelve 403 y también está roto en Wix; la réplica usa una imagen local válida.

---

## Despliegue

No desplegar todavía. Cuando se autorice:

1. Crear el repositorio en GitHub.
2. Subir los archivos.
3. En **Settings → Pages**, seleccionar la rama `main` y la carpeta raíz.
4. El sitio quedará en `https://usuario.github.io/repositorio/`.

Todas las rutas son relativas, así que funciona en una subcarpeta de GitHub Pages.

---

## Datos de contacto

- Email: `nebakadopciones@gmail.com`
- Teléfonos: 625 140 588 · 600 042 594 · 659 487 771
- Dirección: Calle Santiago 27 1º izq, 20304 Irún, Gipuzkoa, España
- Instagram: https://www.instagram.com/nebakadopciones/
- Facebook: https://www.facebook.com/Grupo-Nebak-Adopciones-103775221237263
- YouTube: https://www.youtube.com/channel/UCpWZP5Q_lC5PaCnrRw4uQRw/channels
- Twitter: https://twitter.com/NebakAdopciones
- Telegram: http://t.me/gruponebak
