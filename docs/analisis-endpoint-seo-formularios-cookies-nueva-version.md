# Análisis exhaustivo — Nueva versión: endpoint público, SEO, formularios y cookies

> **Alcance:** análisis y plan de ejecución (sin implementación).  
> **Contexto del repositorio:** sitio estático (raíz = versión actual, `nueva-version/` = evolución) con datos hoy en JSON local (`data/*.json`) y consumo por `fetch`/JS. El endpoint objetivo será público, servido por **Google Apps Script (`.gs`)** consultando **hojas de cálculo (Excel/Google Sheets) en Google Drive**.  
> **Fecha de análisis:** 2026-11-14 (estado del código en esta rama).

---

## 1. Objetivo y entregable

Definir **qué endpoint(s) público(s)** se necesitan para alimentar la nueva versión (fichas de animales, blog/historias, eventos y contenidos relacionados), y documentar de forma accionable:

1. **Contrato del endpoint** (recursos, parámetros, respuestas, errores, CORS, caché, versionado) y su **mapeo desde hojas de cálculo en Drive** leídas por Apps Script.
2. **Estrategia de SEO profesional** para el sitio y, críticamente, para **fichas/contenidos cargados desde endpoint** en el momento de migrar a la nueva versión.
3. **Inventario de formularios** y requisitos para **plantillas de correo/notificación y reCAPTCHA**.
4. **Mejora de cookies y políticas** adaptada a una **asociación de protección animal** (RGPD/LSSI, consentimiento real, terceros, transparencia).

Documento de referencia existente relacionado (parcial, ya en el repo): `docs/estructura-endpoint-publicaciones.md` y ejemplo `data/api-ejemplos/publicaciones-endpoint-ejemplo.json`. Este análisis lo amplía y lo aterriza al inventario real del sitio.

---

## 2. Inventario y estado actual (as-is)

### 2.1 Arquitectura y versiones

| Aspecto | Raíz (actual) | `nueva-version/` |
|---|---|---|
| Naturaleza | HTML/CSS/JS estático, réplica fiel del sitio original (Wix) | HTML/CSS/JS estático rediseñado |
| Páginas | `index`, `sobre-nosotros`, `adopciones`, `gatos/perros-en-adopcion`, `adoptados`, `acogidas`, `acoge`, `casos-externos`, `protocolo`, `donaciones`, `hazte-socio`, `colabora`, `contacto`, `blog`, `post`, legales, `404` | Equivalentes + `historias.html` (en lugar de `blog.html`), sin `colabora.html` separado igual |
| Datos blog/historias | `data/blog-list.json` (listado blog raíz, usado por `js/blog-render-index.js` con `fetch`) y `data/blog-posts.json` (detalle/rico, usado por `js/blog-api.js`) | Consume `../data/blog-posts.json` vía `HistoriasAPI` (`nueva-version/js/blog-api.js`) y renderizadores propios |
| Fichas animales en listados | **Estáticas/hardcodeadas** en HTML (p.ej. `gatos-en-adopcion.html`, `adoptados.html` con `js/adoptados.js` para paginación client-side de un dataset embebido) | **Dinámicas desde JSON**: contenedores `[data-adoption-list="Gatos en adopción"|"Perros en adopción"]` renderizados por `nueva-version/js/main.js` filtrando `data/blog-posts.json` por `category` |
| Detalle ficha/post | `post.html?slug=...` (render según `?slug=`; contenido en datos/JS) | `post.html?slug=...&from=...` con `nueva-version/js/blog-render.js` (diferencia ficha vs historia, galería/iconos/vídeo desde `publication`) |
| Navegación | Incluye enlace a `nueva-version/` en “Más” | Incluye “← Versión anterior” a `../index.html` |
| Formularios | Estáticos en página, `data-contact-form`, envío simulado (`js/main.js`) | Formularios tipados (`data-static-form`, `data-form-type`, `data-open-form`) + modal/conceptos y chat asistente (`nueva-version/js/main.js`) |
| Cookies | Banner+modal en `js/main.js`, consentimiento en `localStorage` (`nebak-cookie-consent`), categorías necesarias/analíticas/marketing | Banner+modal equivalente en `nueva-version/js/main.js` |

### 2.2 Fuentes de datos actuales

| Fuente | Contenido | Observaciones |
|---|---|---|
| `data/blog-posts.json` | `site` + `posts[]` (18 posts). Campos: `slug,title,excerpt,content,author,date,dateFormatted,readTime,category,tags,image,imageAlt,views,likes,featured,cta?,publication?` | Es la **fuente rica principal** usada por detalle y por listados de adopción en `nueva-version`. `publication` (schema `nebak-post-v1`) aporta `icons`, `gallery`, `video/videos`, `inventedContent` para fichas (acogida, gato, perro, adoptado, externo). Categorías observadas: `SC, Acogida, Gatos en adopción, Perros en adopción, Adoptados, Caso externo` (y en otros datos/listados también aparecen `Eventos`, `D.E.P.`). Contenido HTML embebido en `content`. |
| `data/blog-list.json` | `categories[]` + `posts[]` (23 posts, 20 listados) con `order,listed,slug,title,dateFormatted,readTime,category,views,likes,image,imageAlt,excerpt,comments?` | Alimenta el **listado de blog de la raíz** (`blog.html`). Modelo más ligero/flat para índice. |
| `data/animal-posts.json` | `posts[]` (formato alternativo: `paragraphs[]`, `images[]`, `views/likes/comments`, tags por año/especie/estado) | Formato distinto a `blog-posts.json`; conviene **unificar** en el contrato del endpoint para no mantener dos esquemas de ficha. |
| `data/api-ejemplos/publicaciones-endpoint-ejemplo.json` | Ejemplo de respuesta `GET /api/publicaciones` con `data[]` de tipo `animal` y `evento` | Buen punto de partida (paginación, filtros, `icons/gallery/videos`, bloques `animal`/`event`). Falta formalizar catálogo, `site/config`, y respuestas de error/headers. |
| HTML estático | Listados de gatos/perros/adoptados/acogidas en raíz, textos, imágenes locales | En raíz **no todo** viene de datos: hay tarjetas y páginas con contenido fijo (implica trabajo de migración a “data-driven”). |

### 2.3 Entidades y dominios de contenido a alimentar

| Entidad | Uso actual | Necesidad en nueva versión (endpoint) |
|---|---|---|
| **Animal/Ficha** (adopción, acogida, adoptado, caso externo/SC) | `blog-posts.json` (`publication` + categoría) y listados estáticos/JS; detalle en `post.html` | Sí, núcleo. Debe soportar especie, estado, ubicación, salud, carácter, compatibilidad, adopción conjunta, contacto/CTA, media (cover, galería, vídeo). |
| **Blog/Historia/Evento** | `blog-list.json` (índice) + `blog-posts.json` (detalle) + `historias.html` en nueva versión | Sí. Unificar “publicaciones” (animal, historia, evento, hito) o exponer recursos separados con esquema común, como ya sugiere `estructura-endpoint-publicaciones.md`. |
| **Eventos/Campañas/Hitos** | Modelados en ejemplo de endpoint (`type:"evento"`, `event{...}`) y categorías como `Eventos`; poco/ningún listado dinámico específico hoy | Sí, previsto. Requiere recurso/filtro propio aunque inicialmente haya pocos registros. |
| **Categorías/taxonomías** | Arrays/strings en JSON (`categories`, `category`, `tags`) | Sí (catálogo para filtros/menús y SEO de listados). |
| **Configuración del sitio** | `site` en `blog-posts.json` (nombre, contacto, redes) | Recomendable (`/config`) para no hardcodear datos de contacto/redes en front. |
| **Páginas estáticas/institucionales** | HTML fijo (sobre nosotros, protocolo, donaciones, legales…) | No requieren endpoint de contenido salvo que se quiera CMS; sí requieren SEO y coherencia legal. |

### 2.4 Inventario de formularios (actual)

> **Estado actual:** envío **simulado** en cliente (no hay backend real de recepción). No hay reCAPTCHA ni plantillas transaccionales reales. En `nueva-version` se tipifican formularios con `form_type/concepto` y campos específicos, lo que es una buena base para clasificación.

#### Raíz

| Página/ubicación | Tipo/propósito | Campos observados | Notas |
|---|---|---|---|
| `index.html` (bloque contacto) | Contacto/consulta general | `nombre*`, `email*`, `telefono`, `direccion`, `asunto`, `mensaje*` | `data-contact-form`, novalidate, éxito simulado |
| `contacto.html` | Contacto general | `nombre*`, `email*`, `telefono`, `direccion`, `asunto`, `mensaje` (textarea sin `required` en markup visto) | Formulario principal de contacto |
| `adopciones.html` | Solicitud/info adopción | `nombre*`, `email*`, `telefono`, `direccion`, `asunto`, `mensaje*` | Contexto adopción pero campos genéricos |
| `acoge.html` | Solicitud de acogida | `nombre*`, `email*`, `asunto`, `mensaje` | Menos campos que nueva versión |
| `hazte-socio.html` (Hazte Voluntario) | Voluntariado | `nombre*`, `email*`, `asunto`, `mensaje` | Sin disponibilidad/zona/tipo |
| `donaciones.html` | Consulta/donación/socio/material | `nombre*`, `email*`, `asunto`, `mensaje` | Varias CTAs llevan a `#contactanos`, Teaming externo, PDF externo |
| Otros con patrón similar | (verificar `casos-externos`, `acogidas` si incluyen form) | — | Auditar en fase de implementación |

#### `nueva-version/`

| Página/mecanismo | `form_type` / concepto | Campos observados | Notas |
|---|---|---|---|
| `contacto.html` (estático tipado) | `contacto-general` | `form_type, concepto, nombre*, email*, telefono, direccion, asunto, mensaje*` | `data-static-form`, clasificación explícita |
| `acoge.html` | `acogida` / “Solicitud de acogida” | `nombre*, email*, telefono, tipo_acogida, duracion, convivencia, mensaje*` | Campos ricos para valoración |
| `hazte-socio.html` (voluntariado) | `voluntariado` | `nombre*, email*, telefono, tipo_voluntariado*, disponibilidad, zona, mensaje*` | Buena segmentación |
| `donaciones.html` | CTAs abren formularios tipados (`donaciones`, `socio`, coordinación material) vía `data-open-form`/modal | Según modal: p.ej. `tipo_donacion`, `modalidad_socio`, `mensaje`, etc. | Parte informativa + parte contacto |
| Modal global (`NebakForms` en `main.js`) | `contacto-general`, `voluntariado`, `donaciones`, `acogida`, `adopcion-animal`, `consulta-animal`, `socio` | Campos comunes (nombre/email/teléfono/dirección/mensaje) + específicos por tipo (animal, tipo_voluntariado, disponibilidad, zona, tipo_acogida, duración, convivencia, modalidad_socio, tipo_donacion, asunto) | **Concepto/asunto** para clasificar email; adjunta contexto (página, animal/slug cuando aplica). Chat asistente también dispara flujos. |
| Fichas (`post.html` / CTAs de adopción) | `adopcion-animal` o `consulta-animal`/`acogida` según categoría | Incluye referencia al animal (`data-animal`, slug, concepto) | Crítico para saber “por qué animal escriben” |

**Conclusión formularios:** hay **múltiples intenciones** (contacto, adopción por animal, acogida, voluntariado, socio, donaciones/material, casos/consultas). La nueva versión ya modela tipos; el backend (.gs) debe recibir `form_type/concepto` + payload estructurado y rutear a plantillas/canales.

### 2.5 SEO actual (as-is)

| Elemento | Estado observado | Gap para SEO profesional en nueva versión |
|---|---|---|
| `<title>` y `meta description` | Presentes en páginas principales (raíz y `nueva-version`); en detalle `post.html` son genéricos (“Historia \| Grupo Nebak”) | Las fichas cargadas por `?slug=` **no tienen meta únicos por contenido** en el HTML inicial (JS renderiza después) → pobre indexación/snippet de fichas dinámicas |
| `meta robots`, `canonical` | No observados de forma sistemática | Faltan canonical por URL, control de indexación (paginaciones/filtros/duplicados), y política para parámetros `?slug=`/`?from=` |
| Open Graph / Twitter Cards | Parcial en raíz `index.html` (`og:title/description/image`); no generalizado ni dinámico por ficha | Faltan OG/Twitter por página y por ficha (imagen, título, descripción) para compartir y rich previews |
| Datos estructurados (JSON-LD) | No encontrados (`application/ld+json`) | Falta `Organization/NGO`, `WebSite`, `BreadcrumbList`, `Article/BlogPosting`, y para animales/fichas esquemas apropiados (`Product` no aplica; considerar `Article`/descripciones ricas y, si procede, marcado específico) |
| `sitemap.xml` / `robots.txt` | **No encontrados** en el repo | Imprescindibles en migración; sitemap debe incluir fichas dinámicas (slugs desde endpoint) |
| Estructura semántica | H1 presente en páginas; maquetación variable entre versiones | Revisar jerarquía H1-H6, landmarks, `alt`, enlaces internos y breadcrumbs en fichas/listados |
| URLs / enrutado | Rutas relativas/limpias parciales en raíz; detalle por query `post.html?slug=`; GitHub Pages `_config.yml` presente | Para SEO de fichas, preferible URL limpia por slug (`/adopciones/gatos/slug/` o `/ficha/slug/`) con HTML prerenderizado o estrategia equivalente |
| Rendimiento/Core Web Vitals | Imágenes locales `.webp/.jpg`, `loading="lazy"` en varios casos; fuentes Google | Optimizar LCP/CLS/INP en nueva versión; imágenes de Drive/endpoint deben servirse con tamaños/formatos adecuados y caché |
| Accesibilidad/idioma | `lang="es"`, skip links, ARIA en menús/cookies en general | Mantener/mejorar (impacta calidad y SEO indirecto) |

**Riesgo SEO principal:** si la nueva versión renderiza fichas **solo en cliente** tras `fetch` del endpoint, buscadores/redes pueden no ver título, descripción ni contenido de cada animal/evento. Esto condiciona la arquitectura (ver §4).

### 2.6 Cookies, privacidad y terceros (as-is)

| Elemento | Estado observado | Gap |
|---|---|---|
| Banner + modal de preferencias | Sí (raíz y `nueva-version`): categorías **Necesarias / Analíticas / Marketing**, botones Aceptar/Opciones/Rechazar/Guardar, cierre | **No se evidencia bloqueo real previo** de scripts/cookies no necesarias condicionado al consentimiento (el consentimiento se guarda, pero hay que garantizar que analítica/marketing/embeds de terceros no carguen antes de aceptar) |
| Almacenamiento consentimiento | `localStorage` clave `nebak-cookie-consent` `{necessary,analytics,marketing,date}` | Falta versionado de política, registro/auditoría (si se requiere), y posibilidad de **revocar/cambiar** fácilmente desde cualquier página/pie |
| Política de cookies (`politicas-de-cookies.html`) | Texto extenso; menciona Google Analytics/Doubleclick/publicidad/terceros y mecanismos genéricos | **Desactualizada/no alineada** al comportamiento real actual (parece heredada de Wix/plantilla): debe reflejar solo cookies/terceros realmente usados, finalidades, base jurídica, plazos y cómo revocar |
| Política de privacidad (`copia-de-politica-de-cookies.html`) | Identifica responsable (Grupo Nebak, CIF, dirección, contacto), finalidades, derechos RGPD, etc. | Revisar y adaptar a **tratamientos reales** de la nueva versión: formularios (web → email/Sheets/GAS), posibles analíticas, alojamiento, terceros (YouTube nocookie embeds, Google Maps iframes, fuentes, redes), encargados de tratamiento y transferencias |
| Terceros embebidos/recursos | Google Maps (iframe en contacto), YouTube (`youtube-nocookie` en contenidos de publicación), Google Fonts, enlaces a redes/Telegram/Teaming, PDF externo en donaciones | Cada tercero implica implicaciones de cookies/transferencias: evaluar carga diferida tras consentimiento o alternativas (facade/aviso) y documentar en políticas |
| Enfoque protectora animal | Genérico | Adaptar lenguaje y secciones a fines de **protección animal sin ánimo de lucro**: adopciones/acogidas/voluntariado/socios/donaciones, datos de solicitantes, menores si aplica, imágenes de personas, legitimación (consentimiento, interés legítimo, ejecución de medidas precontractuales/contrato de adopción-acogida donde proceda) — validar con asesoría legal |

---

## 3. Especificación del endpoint público (Apps Script + Excel/Sheets en Drive)

### 3.1 Principios de diseño

- **Solo lectura para el front** (datos publicados). Escritura/gestión en hojas (y, si se desea, endpoint separado/admin autenticado en el futuro, fuera de alcance).
- **Contrato estable y versionado** (`/v1/...` o `?api=1`) para poder evolucionar sin romper la web.
- **Esquema unificado de “publicación/ficha”** compatible con `blog-posts.json` + `publication` y con el ejemplo de `publicaciones-endpoint-ejemplo.json`, minimizando transformaciones en cliente.
- **Slugs estables** (clave SEO y de enlace) generados/mantenidos en hoja.
- **Respuestas cacheables** (contenido cambia poco) con estrategia de invalidación simple (versión/ETag/`updatedAt`).
- **CORS** habilitado para el dominio de producción (y staging si aplica).

### 3.2 Arquitectura de datos (Drive/Sheets)

**Recomendación:** usar **Google Sheets** como “Excel” nativo en Drive (Apps Script lee/escribe Sheets de forma directa y robusta). Si la fuente maestra es `.xlsx`, definir un proceso de sincronización/importación a Sheets (manual o automatizado) y que el `.gs` consulte siempre la **hoja canónica**.

Hojas/libro sugerido (un libro o varios; una pestaña por entidad):

| Hoja | Propósito | Clave | Campos mínimos sugeridos (columnas) |
|---|---|---|---|
| `animales_fichas` | Fichas de adopción/acogida/adoptados/casos | `id`, `slug` | `type`(animal), `category`, `status`, `title`, `excerpt`, `content_html`, `cover_image_url`, `cover_alt`, `species`, `names`, `sex`, `age_label/value/unit`, `size`, `breed`, `location_city/province`, `health_*`, `temperament`, `compatibility_*`, `adoption_*`, `foster_*`, `contact_email/phone`, `tags`, `published_at`, `updated_at`, `published`(bool), `featured`, `order`, `gallery` (JSON o refs), `videos` (JSON o refs), `icons` (JSON o refs) |
| `publicaciones` (blog/historias/eventos) | Entradas blog, historias, eventos/hitos no-animal o genéricas | `id`, `slug` | `type`(historia/evento), `category`, `status`, `title`, `excerpt`, `content_html`, `cover_*`, `tags`, `author`, `published_at`, `read_time`, `published`, `event_*` (si evento), `gallery/videos/icons` |
| `galeria_media` (opcional) | Normalizar media por ficha | `parent_id/slug`, `order` | `kind`(image/video), `url`, `alt`, `caption`, `provider`, `thumbnail` (útil si hay muchas imágenes por ficha) |
| `taxonomias` / `categorias` | Listas controladas | `key` | `label`, `type_scope`, `order`, `visible` |
| `config` | Datos globales | `key` | `site_name`, `description`, `emails/phones`, `address`, `social_*`, `seo_defaults` |

**Reglas de modelado:**
- `status` y `category` deben usar **valores controlados** (desplegables en Sheet) para que los filtros del front sean estables.
- Campos multivalor (`tags`, `names`, `includes`, `temperament`): JSON en celda o separados por `|`/`,` con convención única.
- `content_html` sanitizado en origen (solo etiquetas permitidas) o sanitizar al servir/consumir.
- `published=true` y fecha válida como condición para exponer en endpoint público.
- Imágenes/vídeos: preferir **URLs públicas estables** (Drive publicado correctamente, CDN, o almacenamiento web); evitar enlaces privados. Definir convención de `cover` y galería.

### 3.3 Recursos y endpoints propuestos (contrato público)

Base URL (ejemplo): `https://script.google.com/macros/s/{DEPLOY_ID}/exec` (Web App de GAS) con parámetro de enrutado, p.ej. `?path=/v1/publicaciones` o `?resource=publicaciones`. (Definir una convención única e interna.)

| Método | Ruta/recurso | Descripción | Parámetros principales |
|---|---|---|---|
| GET | `/v1/config` | Configuración pública (contacto, redes, textos SEO por defecto) | — |
| GET | `/v1/publicaciones` | Listado unificado (animales + historias + eventos) | `type`, `category`, `status`, `species`, `q`, `slug`? no, `featured`, `listed`, `page`, `pageSize`, `sort` (`-publishedAt`, `publishedAt`, `order`, `title`), `fields` (opcional) |
| GET | `/v1/publicaciones/{slug}` | Detalle por slug | — (o `?slug=` si el router usa query) |
| GET | `/v1/animales` (alias) | Listado filtrado `type=animal` | mismos filtros + `adoptionMode`, `urgent`, `specialNeeds` (derivables) |
| GET | `/v1/blog` (alias) | Listado para blog/historias | `category`, `q`, `page`, `sort` |
| GET | `/v1/eventos` (alias) | Listado `type=evento` | `status`, `from`, `to` |
| GET | `/v1/taxonomias` | Categorías/tags/estados disponibles | `scope` |

**Notas:**
- Los alias pueden resolverse internamente al mismo handler de `publicaciones` para simplificar `.gs`.
- Mantener compatibilidad conceptual con `docs/estructura-endpoint-publicaciones.md` (`/api/publicaciones`, filtros) para facilitar migración de `nueva-version`.

### 3.4 Ejemplos de solicitud/respuesta (objetivo)

**Listado fichas de gatos en adopción:**
`GET /v1/animales?category=Gatos%20en%20adopci%C3%B3n&status=en_adopcion&page=1&pageSize=12&sort=-publishedAt`

**Respuesta 200 (resumen):**
```json
{
  "meta": { "apiVersion": "v1", "generatedAt": "2026-11-14T10:00:00Z" },
  "pagination": { "page": 1, "pageSize": 12, "total": 8, "totalPages": 1 },
  "filtersApplied": { "type": "animal", "category": "Gatos en adopción", "status": "en_adopcion" },
  "data": [ { /* Publicacion/Animal */ } ]
}
```

**Detalle:**
`GET /v1/publicaciones/udane-julia-gata` →
```json
{
  "meta": { "apiVersion": "v1", "generatedAt": "..." },
  "data": {
    "id": "…", "slug": "udane-julia-gata", "type": "animal", "category": "Gatos en adopción",
    "status": "en_adopcion", "title": "…", "excerpt": "…", "contentHtml": "<p>…</p>",
    "coverImage": { "src": "…", "alt": "…" },
    "tags": [], "publishedAt": "…", "updatedAt": "…",
    "icons": [], "gallery": [], "videos": [],
    "animal": { /* species, names, health, adoption, foster, location, contact */ },
    "seo": { "metaTitle": "…", "metaDescription": "…", "ogImage": "…" }
  }
}
```

### 3.5 Modelo de datos de respuesta (normalizado)

Alinear con lo ya definido y extendido:

- **Común (`Publicacion`):** `id, slug, type, category, status, title, excerpt, contentHtml, coverImage, tags, author?, publishedAt, updatedAt, listed?, featured?, icons[], gallery[], videos[]` (+ compat `video`), `cta?`, `seo?`.
- **`type=animal`:** bloque `animal{ names,species,breed,sex,age,size,color?,health,temperament,compatibility,adoption,foster,location,contact }`.
- **`type=evento`:** bloque `event{ kind,startDate,endDate,timezone,location,organizer,audience,agenda,registration,milestone }`.
- **`type=historia/blog`:** puede prescindir de `animal/event` y usar campos editoriales (`readTime`, `views/likes` solo si se gestionan; si no, omitir o tratarlos como estáticos históricos).

**Mapeo desde JSON actual:**
- `blog-posts.json.post` → `Publicacion`: `content`→`contentHtml`, `image/imageAlt`→`coverImage`, `date/dateFormatted`→`publishedAt`+formato de presentación (el front puede formatear, pero conviene devolver ISO + label opcional), `publication.icons/gallery/videos`→directo.
- `blog-list.json.post` → vista índice (puede servirse como proyección ligera con `fields=card` para rendimiento).

### 3.6 Comportamiento del servicio (Apps Script)

| Aspecto | Recomendación |
|---|---|
| **Despliegue** | Web App GAS: ejecutar como propietario con acceso a la Sheet; acceso “Cualquier persona” (o “Cualquier persona con cuenta Google” no sirve si es público anónimo) según necesidades — evaluar implicaciones; preferir endpoint realmente público de solo lectura. |
| **CORS** | Responder con `Access-Control-Allow-Origin` al dominio(s) permitido(s) y manejar `OPTIONS` si se usaran métodos no simples (GET suele bastar). |
| **Caché** | Contenido relativamente estático: `Cache-Control` (p.ej. `public, max-age=300, s-maxage=600`) y/o `ETag`/`Last-Modified` basado en `updatedAt` máximo o versión de hoja. Usar `CacheService` de Apps Script para cachear lecturas de Sheet y reducir latencia/cuotas. |
| **Paginación** | `page`/`pageSize` con límites (p.ej. máx 50) y `total/totalPages`. |
| **Errores** | JSON consistente: `{ "error": { "code": "NOT_FOUND|BAD_REQUEST|INTERNAL", "message": "…" } }` con HTTP status adecuado (200/400/404/500). |
| **Seguridad** | Solo exponer registros `published`. No exponer datos personales de solicitantes. No aceptar secretos desde el front. Rate limiting práctico vía caché/cuotas de GAS (ser consciente de límites de Apps Script). |
| **Media** | Validar URLs (https). Si las imágenes están en Drive, asegurar acceso público correcto o migrar a hosting de imágenes; incluir `alt` siempre. |
| **Integridad** | `slug` único; si cambia, contemplar `redirectFrom[]` (útil para SEO en migraciones). |

### 3.7 Consideraciones de cuotas y rendimiento (GAS/Sheets)

- Apps Script tiene **cuotas y tiempos máximos** de ejecución; mitigar con `CacheService`, lecturas agrupadas, y respuestas paginadas/proyectadas.
- Para picos de tráfico, valorar un **caché intermedio** (p.ej. CDN/cache proxy) o exportación periódica a JSON estático si el volumen crece; el contrato JSON debe mantenerse igual para no tocar el front.

---

## 4. SEO profesional — estrategia para sitio y fichas dinámicas

### 4.1 Restricción clave: contenido cargado por endpoint

Hoy (y en un enfoque SPA/CSR puro) `post.html?slug=` y listados JS dependen de `fetch` tras la carga: el HTML inicial no contiene la ficha. Para SEO profesional de **cada animal/evento/historia** se requiere que rastreadores y redes sociales reciban **HTML con meta y contenido propios** por URL.

**Opciones (de mayor a menor recomendación para SEO de fichas):**

| Opción | Descripción | Pros | Contras/consideraciones |
|---|---|---|---|
| **A. Prerender/SSG en build (recomendado)** | En cada build/publicación, leer endpoint/Sheets y generar HTML estático por slug (`/fichas/{slug}.html` o rutas limpias) + `sitemap.xml` + feeds | Máximo SEO, rendimiento, simple hosting (GitHub Pages/estático), sin dependencia de render JS para indexar | Requiere pipeline de build y mecanismo de “rebuild” cuando cambian datos (webhook/manual/programado) |
| **B. Prerender dinámico / middleware** | Servicio que sirve HTML prerenderizado a bots y app a usuarios | Flexible con datos en tiempo real | Infraestructura adicional, complejidad |
| **C. CSR con enhancement limitado** | Mantener `post.html?slug=` y actualizar `document.title`/metas en JS | Mejora UX básica | **Insuficiente** para OG/Twitter y para indexación fiable de contenido de ficha; no recomendado como única estrategia si el SEO de fichas es crítico |
| **D. Híbrido** | Listados y páginas institucionales estáticas/prerender + fichas prerenderizadas por slug; endpoint usado en build y opcionalmente para refresco | Equilibrio práctico | Diseñar bien canonical/URLs para evitar duplicados |

**Recomendación para Nebak (nueva versión):** **Opción A o D**. Mantener sitio estático pero **generar páginas de detalle por ficha/entrada** (y sitemap) a partir del endpoint/hoja en el proceso de publicación, conservando fetch solo para funcionalidades no críticas o filtros client-side donde proceda.

### 4.2 Arquitectura de URLs y migración

- Definir **URLs canónicas limpias** por tipo:
  - Fichas: `/adopcion/gatos/{slug}/`, `/adopcion/perros/{slug}/`, `/acogidas/{slug}/`, `/adoptados/{slug}/` (o un único patrón `/ficha/{slug}/` con categoría en breadcrumb/schema).
  - Blog/historias: `/historias/{slug}/` o `/blog/{slug}/`.
  - Eventos: `/eventos/{slug}/`.
- **301/redirects** desde URLs antiguas (`post.html?slug=`, rutas raíz actuales) a las nuevas canónicas al migrar.
- `rel="canonical"` absoluto en cada página.
- Paginación: `?page=` con canonical a la serie o auto-referencial según criterio; evitar indexar combinaciones de filtros irrelevantes (`noindex,follow` si se generan páginas de facetas).

### 4.3 Metadatos por página (plantillas)

| Tipo de página | `<title>` | `meta description` | OG/Twitter | Notas |
|---|---|---|---|---|
| Home | Marca + propuesta + ubicación (Irún) | Resumen servicios (adopción, colonias CES, acogida) | Imagen representativa, locale `es_ES` | Único, ~50–60 chars título |
| Listados (gatos, perros, acogidas, adoptados, historias, eventos) | “Gatos en adopción en Irún \| Grupo Nebak” etc. | Descripción con intención de búsqueda local + estado | Imagen de sección | Contenido indexable en HTML (no solo tras JS) |
| **Ficha/entrada (detalle)** | `{Nombre/Título} en adopción/acogida \| Grupo Nebak` | Resumen único (edad, carácter, ubicación) desde datos | `og:image` = cover, `og:type=article` (o apropiado) | **Generado por ficha** (build/servidor) |
| Páginas institucionales/contacto/legales | Específico por página | Específico | Consistente | Evitar duplicar descripciones |

- Campos `seo.metaTitle/metaDescription/ogImage` en endpoint para override editorial desde la hoja cuando haga falta.

### 4.4 Datos estructurados (JSON-LD)

Implementar según aplique (validar en Rich Results Test / Schema.org):

| Esquema | Dónde | Propiedades clave |
|---|---|---|
| `Organization` (+ `NGO`/`AnimalShelter` si encaja) | Global (home/layout) | name, url, logo, address (Irún), sameAs (redes), contactPoint, areaServed |
| `WebSite` | Home | name, url, potentialAction (SearchAction solo si hay búsqueda real indexable) |
| `BreadcrumbList` | Listados y fichas | Jerarquía Inicio > Adopciones > Gatos > {Nombre} |
| `BlogPosting`/`Article` | Historias/blog/eventos | headline, description, image, datePublished, author, publisher |
| Fichas de animales | Detalle animal | No hay tipo “Pet” universal rico en Google; usar `Article`/`WebPage` con descripción estructurada y campos claros en HTML; opcionalmente ampliar con propiedades relevantes si se adopta un esquema específico — priorizar contenido textual visible y metadatos completos |
| `FAQPage` | Si se crean secciones FAQ (protocolo, acogida) | Preguntas/respuestas reales visibles |

### 4.5 Indexación técnica

- **`robots.txt`:** permitir rastreo de recursos necesarios; referenciar `Sitemap:`; bloquear rutas privadas/inexistentes si las hubiera.
- **`sitemap.xml`:** generar y mantener actualizado con URLs canónicas de páginas estáticas + **todas las fichas/publicaciones `published`** obtenidas del endpoint/hoja; incluir `lastmod` desde `updatedAt/publishedAt`.
- **Hreflang:** no aplica si solo `es`; mantener `lang="es"`.
- **Parámetros:** canonicalizar `post.html?slug=` a la URL limpia de la ficha; `?from=` como parámetro de navegación (no indexable/canonical al slug).
- **404/410:** fichas dadas de baja (`status` cerrado/adoptado retirado del listado público según política) deben responder 404/410 o redirigir a listado relacionado, evitando soft-404.
- **Imágenes:** `alt` descriptivo (animal, contexto), nombres/URLs estables, lazy-load correcto (no diferir LCP).

### 4.6 Contenido y E-E-A-T local (protectora)

- Páginas claras de **quiénes son** (asociación, CIF, ubicación Irún, misión CES/adopciones), contacto visible, transparencia (donaciones, cuotas), y proceso de adopción/acogida.
- Textos únicos por ficha (evitar duplicados); enlazado interno entre listados, fichas y protocolo/contacto.
- Coherencia NAP (nombre, dirección, teléfono) con Google Business Profile si existe.

### 4.7 Medición

- Google Search Console (propiedad dominio/prefijo), Bing Webmaster Tools.
- GA4 u analítica respetuosa **solo tras consentimiento** (ver §6) y con medición anonimizada/configurada conforme a política.
- Monitorizar indexación de fichas, errores de cobertura, CWV.

---

## 5. Formularios — plantillas, enrutado y reCAPTCHA

### 5.1 Objetivo funcional

Pasar de “envío simulado” a recepción real: **persistencia (opcional en Sheet) + notificación por correo** con **clasificación por tipo/concepto y animal** cuando aplique, protección anti-spam (reCAPTCHA) y cumplimiento RGPD.

### 5.2 Inventario normalizado y mapeo a plantillas

| `form_type` | Origen principal | Campos (payload recomendado) | Plantilla/canal sugerido |
|---|---|---|---|
| `contacto-general` | contacto (raíz/nv), modal | `nombre,email,telefono?,direccion?,asunto?,mensaje,page_url,consent_privacy,recaptcha_token` | Correo a buzón general (asunto: `[Web][Contacto] {asunto/nombre}`) |
| `adopcion-animal` | CTA ficha/post adopción | comunes + `animal_nombre,animal_slug,animal_url,categoria,concepto,mensaje` | Correo a equipo adopciones; asunto incluye animal; cuerpo con enlace a ficha |
| `consulta-animal` | ficha/caso | comunes + `animal_*`, `concepto` | Similar adopción o buzón específico |
| `acogida` | acoge (raíz/nv), modal | `nombre,email,telefono?,tipo_acogida?,duracion?,convivencia?,mensaje,concepto,...` | Correo a responsables de acogidas |
| `voluntariado` | hazte-socio/voluntariado (nv/ruta) | `nombre,email,telefono?,tipo_voluntariado,disponibilidad?,zona?,mensaje,...` | Correo a coordinación voluntariado |
| `socio` | donaciones/CTA socio | `nombre,email,telefono?,modalidad_socio?,mensaje,...` | Correo a gestión socios |
| `donaciones` / material | donaciones | `nombre,email,tipo_donacion?(económica/material/otra),mensaje,...` | Correo a administración/donaciones |

**Requisitos de payload comunes:** `form_type`, `concepto` (humano), `page_url`, `submitted_at`, `user_agent` (opcional, mínimo), `privacy_accepted` (bool + texto/versión), `recaptcha_token` y `recaptcha_action` (si v3).

### 5.3 Recepción con Apps Script (diseño recomendado)

- **Endpoint de formularios separado** del endpoint público de contenido (p.ej. `POST /v1/forms/submit` o Web App GAS dedicado) para:
  - validar entrada y reCAPTCHA en servidor (`.gs` llama a la API de verificación de Google con el secret),
  - aplicar anti-spam (honeypot, rate limit básico, longitud máxima),
  - **no exponer secretos** (secret de reCAPTCHA nunca en front).
- **Acciones en `.gs`:**
  1. Verificar reCAPTCHA y rechazar si score bajo (v3) o inválido.
  2. Validar campos obligatorios y formato email/teléfono.
  3. (Opcional) **Anexar fila en Sheet** “solicitudes_web” (trazabilidad interna, con control de acceso y retención definida en privacidad).
  4. **Enviar correo** vía `MailApp`/`GmailApp` usando plantilla por `form_type` (HTML + texto plano), con `replyTo` al email del usuario cuando proceda.
  5. Responder JSON `{ok:true}` o error.
- **Plantillas:** definir asunto/cuerpo por tipo incluyendo todos los campos relevantes y contexto (animal/slug, página). Mantener copia de plantilla versionada (en código o en hoja de configuración).

### 5.4 reCAPTCHA (recomendación)

- **reCAPTCHA v3** (invisible, por acción) para mejor UX en formularios de protectora; definir umbral de score y fallback (v2 checkbox) si hay muchos falsos positivos.
- Claves site/secret en configuración segura (PropertiesService en GAS para secret; site key en front). Registrar dominios autorizados.
- Informar en privacidad/cookies si reCAPTCHA introduce cookies/transferencias a Google (y actuar en consecuencia en el banner/capa de consentimiento según implementación).

### 5.5 RGPD en formularios

- Casilla/información de **política de privacidad** y finalidad por formulario (adopción/acogida implica datos para valorar idoneidad).
- Minimización: pedir solo lo necesario por tipo.
- Retención definida y acceso restringido a la Sheet/buzón.

---

## 6. Cookies y políticas — adaptación a asociación de protección animal

### 6.1 Principios

- **Consentimiento previo** para cookies/tecnologías no necesarias (analítica, marketing, y en la práctica muchos embeds de terceros según configuración).
- **Rechazar tan fácil como aceptar**, sin “dark patterns”.
- **Información clara**: qué se usa, para qué, quién (propios/terceros), duración, cómo cambiar de opinión.
- **Cargar condicionalmente** scripts/iframes no esenciales solo tras consentimiento de la categoría correspondiente (p.ej. YouTube/Maps/Analytics si se clasifican como no necesarios).

### 6.2 Inventario de cookies/terceros a revisar y documentar

| Origen | Uso probable | Categoría sugerida | Acción |
|---|---|---|---|
| Propias (sitio) | Preferencia de consentimiento, sesión técnica si existiera | Necesaria | Documentar nombre, finalidad, duración (hoy `localStorage`, no cookie HTTP; explicar equivalencia/técnica) |
| Google Fonts | Tipografías | Técnica/tercero (transferencia IP) | Evaluar auto-hospedado para reducir terceros, o documentar |
| Google Maps (iframe contacto) | Mapa ubicación | Tercero (puede implicar cookies/transferencias) | Cargar tras consentimiento o usar enlace/imagen estática + “cargar mapa” |
| YouTube (nocookie embeds en fichas) | Vídeo de apoyo | Tercero | `youtube-nocookie` reduce pero no elimina implicaciones; preferir carga bajo demanda/consentimiento |
| Google Analytics / Tag Manager | Medición | Analítica | Solo si se implementa y tras consentimiento; configurar anonimización/IP y retención |
| Redes sociales (enlaces salientes) | Enlaces, no embeds activos | — | Sin cookies propias por el mero enlace; documentar si se añaden widgets |
| Teaming / enlaces externos | Donación externa | — | Informar redirección a tercero |
| reCAPTCHA | Anti-spam formularios | Seguridad/tercero | Documentar y tratar conforme a guía/implementación elegida |

### 6.3 Cambios recomendados en implementación de consentimiento (para fase de ejecución)

- Bloqueo real: no insertar scripts de analítica/marketing ni iframes de terceros no esenciales hasta aceptación.
- **Centro de preferencias** accesible permanentemente (footer/enlace “Configurar cookies”).
- Registrar versión del texto legal y fecha de consentimiento.
- Política de cookies: tabla real de cookies/almacenamientos, terceros concretos, plazos, base legal.

### 6.4 Adaptación de textos legales para protectora animal

**Política de privacidad — tratamientos a cubrir explícitamente:**
- Consultas y formularios web (contacto, información).
- **Solicitudes de adopción** (datos personales, vivienda/convivencia, motivación) para evaluar idoneidad y gestionar el proceso precontractual/contractual de adopción.
- **Acogidas** (disponibilidad, condiciones del hogar, otros animales/niños).
- **Voluntariado** (disponibilidad, zona, tipo de colaboración).
- **Socios/donaciones** (datos de contacto y, si aplica, datos económicos gestionados por entidades bancarias/terceros de pago — aclarar que Nebak no trata datos de tarjeta si redirige a terceros).
- Comunicaciones relacionadas, obligaciones legales, y conservación/limitación.
- Derechos ARSOPL, contacto del responsable (CIF G75203562, dirección, email), y reclamación ante AEPD.
- Encargados: hosting, Google (Apps Script/Sheets/Drive/Gmail/Fonts/Maps/YouTube/reCAPTCHA según uso), con transferencias internacionales si proceden (cláusulas/garantías).

**Política de cookies — adaptar a:**
- Finalidad informativa y funcional del sitio de la asociación.
- Terceros realmente usados (evitar listar publicidad genérica como Doubleclick si no se usa).
- Relación con formularios y contenido embebido (vídeos de casos/adopciones).

**Avisos en formularios:** capa informativa breve + enlace a privacidad, indicando finalidad específica (p.ej. “gestionar tu solicitud de acogida de animales”).

> **Nota:** este documento es técnico-funcional; la redacción legal final debe revisarse por asesoría especializada en protección de datos.

---

## 7. SEO y datos: implicaciones para el “cambio a la nueva versión”

1. **Congelar inventario de URLs actuales** y mapear redirecciones 301 a la nueva estructura.
2. **Generar sitemap** con todas las fichas publicadas desde la fuente (endpoint/Sheets) en el despliegue de la nueva versión.
3. **Asegurar HTML indexable por ficha** (prerender/build) con metas/OG/JSON-LD únicos.
4. **Unificar modelos de datos** (`blog-posts`, `blog-list`, `animal-posts`) en el contrato del endpoint para evitar duplicidades y contenido inconsistente.
5. **Validar** con Search Console, pruebas de snippet/OG y rastreo antes/después del switch.
6. **No indexar** la nueva versión en staging si es pública temporalmente (`noindex` o acceso controlado).

---

## 8. Plan de ejecución propuesto (fases)

### Fase 0 — Preparación y gobierno de datos
- [ ] Definir **catálogo de estados y categorías** oficiales (adopción, acogida, adoptado, urgente, especie, evento, etc.).
- [ ] Diseñar **hojas en Drive (Sheets)** y convención de columnas/IDs/slugs/URLs de media.
- [ ] Inventariar y **limpiar/migrar** contenido desde `data/*.json` y fichas estáticas de raíz a las hojas.
- [ ] Decidir estrategia de **imágenes/vídeos** (hosting público, permisos, tamaños).

### Fase 1 — Endpoint público de contenido (GAS)
- [ ] Implementar `.gs` de lectura: router, acceso a Sheets, mapeo a JSON normalizado (`/v1/config`, `/v1/publicaciones`, `/v1/publicaciones/{slug}`, alias).
- [ ] Añadir filtros, paginación, orden, solo `published`, CORS, caché (`CacheService`) y manejo de errores.
- [ ] Publicar Web App y validar con ejemplos (comparar con `data/api-ejemplos/publicaciones-endpoint-ejemplo.json`).
- [ ] Documentar URL de despliegue y versión de API.

### Fase 2 — Integración front “nueva versión” (data-driven)
- [ ] Sustituir lecturas de JSON local por endpoint (con fallback configurable en dev si se desea).
- [ ] Unificar consumo: listados gatos/perros/acogidas/adoptados/casos/historias/eventos desde `publicaciones` con filtros.
- [ ] Adaptar `post/ficha` a esquema `icons/gallery/videos/animal/event/seo`.
- [ ] Garantizar estados vacíos, errores de red y carga progresiva accesible.

### Fase 3 — SEO técnico y de fichas
- [ ] Definir estructura de URLs canónicas y redirects.
- [ ] Implementar generación prerender/build de páginas de detalle + listados clave + `sitemap.xml` + `robots.txt`.
- [ ] Inyectar metas, OG/Twitter, canonical y JSON-LD por plantilla y por ficha.
- [ ] Validar indexación, compartir en redes y Core Web Vitals.

### Fase 4 — Formularios, plantillas y reCAPTCHA
- [ ] Implementar endpoint `.gs` de recepción de formularios + verificación reCAPTCHA server-side.
- [ ] Crear plantillas de correo/registro por `form_type` (incluido contexto animal/slug).
- [ ] Conectar formularios raíz/nueva-versión al backend, unificar tipos y añadir avisos RGPD.
- [ ] Pruebas de entrega, spam y usabilidad móvil.

### Fase 5 — Cookies y cumplimiento
- [ ] Auditoría real de cookies/terceros en la nueva versión.
- [ ] Implementar consentimiento previo con bloqueo efectivo y centro de preferencias.
- [ ] Redactar/actualizar política de cookies y privacidad adaptadas a protectora y tratamientos reales (revisión legal).
- [ ] Ajustar embeds (Maps/YouTube/Fonts/Analytics) según categoría y consentimiento.

### Fase 6 — Migración y seguimiento
- [ ] Checklist de lanzamiento (redirects, sitemap enviado, Search Console, analítica con consentimiento, pruebas de formularios).
- [ ] Monitorizar indexación, errores 404, rendimiento y consultas de usuarios.
- [ ] Establecer procedimiento de actualización de datos en Sheets → (cache invalidation/rebuild) → web.

---

## 9. Resumen ejecutivo de decisiones clave

- **Un endpoint público de solo lectura** (GAS sobre Sheets en Drive) con recurso unificado `publicaciones` (+ alias/`config`/`taxonomias`) y esquema compatible con `publication` ya usado en `nueva-version`.
- **SEO de fichas no puede depender solo de `fetch` cliente:** se requiere **prerender/build por slug** (o equivalente) para metas, OG y contenido indexable al migrar.
- **Formularios**: tipificar por intención (`contacto`, `adopcion-animal`, `acogida`, `voluntariado`, `socio`, `donaciones`), procesar en `.gs` con **reCAPTCHA server-side**, plantillas de correo y trazabilidad conforme a RGPD.
- **Cookies/políticas**: pasar de banner informativo a **consentimiento real con bloqueo previo** y textos ajustados a una **asociación de protección animal** y a los terceros efectivamente utilizados.

---

## 10. Anexos (referencias en repositorio)

- `docs/estructura-endpoint-publicaciones.md` — estructura previa de publicaciones (acogida/adopciones/eventos).
- `data/api-ejemplos/publicaciones-endpoint-ejemplo.json` — ejemplo de respuesta de endpoint.
- `data/blog-posts.json`, `data/blog-list.json`, `data/animal-posts.json` — fuentes actuales.
- `js/blog-api.js`, `js/blog-render-index.js`, `js/blog-render.js` — consumo/render raíz.
- `nueva-version/js/blog-api.js`, `nueva-version/js/blog-render.js`, `nueva-version/js/blog-render-index.js`, `nueva-version/js/main.js` — consumo/render, listados adopción, formularios tipados, chat y cookies en nueva versión.
- `politicas-de-cookies.html`, `copia-de-politica-de-cookies.html` — textos legales actuales a revisar.
- `js/main.js` — formularios simulados, cookies y utilidades en raíz.

---

## 11. Apéndice A — Inventario ejecutable de `nueva-version/`

> Esta sección detalla **página a página**, scripts, atributos de datos, comportamiento actual y trabajo requerido para que otro modelo/agente pueda ejecutar la migración a endpoint + SEO + formularios + cookies sin ambigüedad.

### A.1 Estructura de archivos

| Ruta | Tipo | Rol |
|---|---|---|
| `nueva-version/*.html` (18 páginas) | Páginas | `index, sobre-nosotros, adopciones, protocolo, gatos-en-adopcion, perros-en-adopcion, adoptados, acogidas, acoge, casos-externos, colabora, donaciones, hazte-socio, contacto, historias, post, politicas-de-cookies, copia-de-politica-de-cookies, 404` |
| `nueva-version/js/main.js` | JS global | Navegación, animaciones, **listados de adopción** (`[data-adoption-list]`), carruseles, **sistema de formularios/modal tipado** (`NebakForms`, `data-static-form`, `data-open-form`), **chat asistente** (búsqueda de animales y atajos a formularios), cookies/banner/modal, utilidades UI |
| `nueva-version/js/blog-api.js` | JS datos | `HistoriasAPI`: carga `../data/blog-posts.json` (o `ENDPOINT_URL`), normaliza `site/posts`, cache, helpers `getAllPosts/getPostBySlug/getSiteConfig/fallbackImage` (ajusta rutas `assets/`→`../assets/`) |
| `nueva-version/js/blog-render-index.js` | JS render | Render de `historias.html`: destacados, listado con búsqueda/orden/filtros por categoría, exclusiones de categorías de adopción/acogida/SC; usa `#blogFeatured`, `#blogPostsContainer`, `#blogCount`, `#historiasTools` |
| `nueva-version/js/blog-render.js` | JS render | Render de `post.html?slug=&from=`: modo **ficha** vs **historia**, hero, iconos, galería/carrusel, vídeo(s), contenido, CTAs contextuales, back-link según origen/categoría |
| `nueva-version/css/main.css` | CSS | Estilos de la nueva versión |

### A.2 Páginas: inventario, origen de datos, SEO y acciones

| Página | Propósito | Fuente de contenido actual | Elementos dinámicos / hooks | Scripts | Meta/SEO actual | Formularios/CTAs | Brechas para endpoint/SEO |
|---|---|---|---|---|---|---|---|
| `index.html` | Home | **Estático** (hero, secciones, carrusel de casos hardcodeado con enlaces a slugs, noticias con enlaces fijos) | Carrusel `[data-carousel]` (JS); chat | `main.js` | `title`, `meta description` presentes; sin canonical/OG completo/JSON-LD | `data-open-form="contacto-general"`; navegación a secciones | Decidir si destacados/casos/noticias se alimentan de endpoint; añadir metas completas, OG, Organization/WebSite JSON-LD |
| `sobre-nosotros.html` | Institucional | Estático | — | `main.js` | Básico | Enlaces/posibles CTAs | Contenido editorial; SEO on-page y JSON-LD Organization/breadcrumb |
| `adopciones.html` | Landing adopciones/proceso | Estático (pasos, info, enlaces a gatos/perros/protocolo) | — | `main.js` | Básico | `data-open-form="contacto-general"` (consulta adopciones) | Mantener estático o enriquecer con contadores desde endpoint; SEO de servicio local |
| `protocolo.html` | Proceso de preadopción | Estático | — | `main.js` | Básico | CTA consulta protocolo (`data-open-form`) | FAQ/HowTo potencial para SEO |
| `gatos-en-adopcion.html` | Listado gatos | **Dinámico desde datos** (`blog-posts.json`) filtrado por categoría | `[data-adoption-search="Gatos en adopción"]`, `[data-adoption-filter]`, `[data-adoption-chips]`, `[data-adoption-meta]`, `[data-adoption-list="Gatos en adopción"]` | `main.js` | Básico | CTA consulta gatos (`data-open-form="consulta-animal"`) | **Debe consumir endpoint** (`type=animal&category=Gatos en adopción&status=en_adopcion`); listado indexable requiere render server/build o contenido en HTML; metas/canonical/breadcrumb |
| `perros-en-adopcion.html` | Listado perros | **Dinámico** (igual que gatos) | Hooks con categoría `Perros en adopción` | `main.js` | Básico | CTA consulta perros | Igual que gatos (categoría perros) |
| `adoptados.html` | Finales felices | **Estático/hardcodeado** (3 historias destacadas + enlaces a `post.html`/`historias`) | — | `main.js` | Básico | CTAs a protocolo/acoger | Migrar a listado dinámico desde endpoint (`status=adoptado` o categoría `Adoptados`), o mantener editorial curado pero sincronizable; SEO |
| `acogidas.html` | Landing + casos en acogida | **Estático/hardcodeado** (3 cards enlazadas a slugs) | — | `main.js` | Básico | CTA “Quiero ser casa de acogida” → `acoge.html` | Migrar a dinámico (`type=animal&status=en_acogida` o categoría `Acogida/Acogidas`); SEO |
| `acoge.html` | Información y solicitud de acogida | Estático + formulario tipado | — | `main.js` | Básico | `data-static-form` `form_type=acogida` | Conectar a backend formularios; SEO informacional/FAQ |
| `casos-externos.html` | Difusión casos externos | **Estático/hardcodeado** (algunos con `post.html?slug`, otros con CTA directa con `data-animal`) | — | `main.js` | Básico | `data-open-form="consulta-animal"` con/sin slug | Migrar a dinámico (`category=Caso externo`) con slug/CTA consistente |
| `colabora.html` | Hub de colaboración | Estático | — | `main.js` | Básico | Enlaces a acoger/voluntariado/donar | SEO |
| `donaciones.html` | Métodos de donación | Estático (IBAN, Teaming, socio, material) | Anclas `#metodos`, `#metodo-*` | `main.js` | Básico | `data-open-form="donaciones"`, `"socio"`, coordinación material | Aclarar flujos externos (Teaming) y formularios reales; transparencia |
| `hazte-socio.html` | Voluntariado (nombre de archivo heredado; contenido = voluntariado) | Estático + formulario tipado | — | `main.js` | Básico | `data-static-form` `form_type=voluntariado` | Backend formulario; **considerar renombrado/slug SEO** (`voluntariado`) con redirect si cambia |
| `contacto.html` | Contacto y ubicación | Estático + mapa iframe + formulario tipado | — | `main.js` | Básico | `data-static-form` `form_type=contacto-general` | Backend; gestión consentimiento/terceros para mapa; LocalBusiness/ContactPoint SEO |
| `historias.html` | Índice de historias/blog | **Dinámico** vía `HistoriasAPI` + `blog-render-index.js` | `#blogFeatured`, `#blogPostsContainer`, `#blogCount`, `#historiasTools` | `blog-api.js`, `blog-render-index.js`, `main.js` | Básico | — | Consumir endpoint de publicaciones/historias; **hoy excluye** categorías de adopción/acogida/SC (ver A.4) — definir regla en API/filtros; indexabilidad de listado |
| `post.html` | Detalle ficha/historia | **Dinámico** por `?slug` vía `HistoriasAPI` + `blog-render.js` | `#blogPostDetail` | `blog-api.js`, `blog-render.js`, `main.js` | **Genérico/estático** (no por ficha) | CTAs adopción/acogida/consulta con contexto animal | **Crítico SEO:** generar HTML por slug con metas/OG/JSON-LD; endpoint detalle; canonical y manejo `from` |
| `politicas-de-cookies.html` | Legal cookies | Estático (texto) | — | `main.js` | Básico | Enlace/gestión preferencias | Reescribir según inventario real y consentimiento |
| `copia-de-politica-de-cookies.html` | Legal privacidad | Estático (texto) | — | `main.js` | Básico | — | Reescribir según tratamientos reales (GAS/Sheets/correos/terceros) |
| `404.html` | Error | Estático | — | `main.js`? (según plantilla) | `noindex` recomendado | — | Asegurar respuesta 404 real en hosting y UX de vuelta |

### A.3 Comportamiento de `nueva-version/js/main.js` (puntos de integración)

| Componente | Selector/hook | Fuente actual | Lógica relevante | Integración con endpoint |
|---|---|---|---|---|
| Listados adopción | `[data-adoption-list="…"]` + `[data-adoption-search]`, `[data-adoption-filter]`, `[data-adoption-chips]`, `[data-adoption-meta]` | `fetch('../data/blog-posts.json')` → filtra `p.category === cat` | Chips por heurística texto (`urgente,cachorro,adulto/senior,especial`), orden `recent` (fecha desc) o `name`, búsqueda por título/excerpt/categoría/tags; render de card con imagen, badges, excerpt, enlace `post.html?slug=&from=gatos|perros|historias` | Sustituir por llamada a `/v1/animales?category=…&status=en_adopcion` (o equivalente), o mantener filtrado client sobre respuesta; idealmente endpoint devuelve campos para chips (`flags`/edad/urgencia) en vez de inferir por texto |
| Formularios tipados/modal | `[data-static-form]`, `[data-open-form]`, `NebakForms` | Envío simulado en cliente | Tipos: `contacto-general, voluntariado, donaciones, acogida, adopcion-animal, consulta-animal, socio`; construye campos según tipo, inyecta `form_type, concepto, asunto, animal/slug, page_url` etc.; validación básica | Cambiar submit a `POST` al endpoint de formularios con payload JSON + `recaptcha_token`; manejar estados loading/error/éxito; mantener compatibilidad de `data-*` |
| Chat asistente | `#chatToggle/#chatPanel/#chatBody` | `loadPosts()` → `fetch('../data/blog-posts.json')` | Busca animales por texto y ofrece CTAs/atajos (adopción, acogida, voluntariado, contacto) que abren formularios | Reutilizar endpoint de publicaciones (búsqueda `q`) o dataset cacheado; no indexable |
| Cookies | `#cookieBanner/#cookieModal`, `data-cookie-*`, `nebak-cookie-consent` | `localStorage` | Guarda preferencias pero no bloquea terceros de forma demostrada | Implementar carga condicional de Maps/YouTube/Analytics/Fonts externos según consentimiento |
| UI general | menú, carrusel, tilt, toasts | DOM | — | Sin impacto en datos, pero cuidar CLS/LCP (SEO) |

### A.4 Comportamiento de Historias (`blog-api.js`, `blog-render-index.js`, `blog-render.js`)

| Archivo | Comportamiento actual | Implicación |
|---|---|---|
| `blog-api.js` | `LOCAL_DATA_URL='../data/blog-posts.json'`, `ENDPOINT_URL=''`; normaliza `{site,posts}`; `fallbackImage` prefija `../` a rutas `assets/…` | Punto único para cambiar a endpoint: respetar misma forma `getAllPosts()/getPostBySlug()` o adaptar; normalizar URLs de imagen absolutas/https desde API |
| `blog-render-index.js` | Excluye de historias categorías: `SC`, las que contienen `acogida/acogidas`, `gatos en adopcion`, `perros en adopcion`; muestra destacadas (3) + listado filtrable/buscable/ordenable; genera links `post.html?slug=&from=historias` | Definir en endpoint/cliente qué es “historia” vs “ficha” (p.ej. `type=historia|evento` o categorías permitidas) para no duplicar contenido con secciones de adopción |
| `blog-render.js` | Determina `ficha` si `publication` existe o categoría es de adopción/acogida/caso externo (excepto `Adoptados` tratado como historia visualmente); renderiza iconos/galería/vídeos desde `publication`; back-link por `from`/categoría; CTA abre formulario tipado con concepto/animal/slug | Endpoint debe proveer `publication/icons/gallery/videos`, `category/status`, `contentHtml`, `seo`; mantener lógica de CTA con `animal_slug` para trazabilidad |

### A.5 Matriz de formularios (`nueva-version`) — campos por tipo

> Basada en formularios estáticos (`data-static-form`) y modal `NebakForms`/CTAs `data-open-form` observados en HTML/JS.

| `form_type` | Concepto típico | Campos comunes | Campos específicos | Contexto auto | Destino sugerido (email/cola) |
|---|---|---|---|---|---|
| `contacto-general` | Contacto general / consultas generales | `nombre*`, `email*`, `telefono`, `direccion?`, `asunto`, `mensaje*` | — | `page_url`, `form_type`, `concepto` | General |
| `adopcion-animal` | Consulta de adopción (ficha) | comunes + `mensaje*` | `animal`/`animal_nombre`, `animal_slug`, `asunto/concepto` específico | slug/categoría desde post o CTA | Adopciones (con enlace ficha) |
| `consulta-animal` | Consulta sobre caso/animal | comunes + `mensaje*` | `animal`, `asunto`, `concepto` | a veces sin slug (casos externos estáticos) | Adopciones/Casos |
| `acogida` | Solicitud de acogida | `nombre*`, `email*`, `telefono?`, `mensaje*` | `tipo_acogida` (gato adulto, cachorro, perro, urgencia, cuidados especiales, etc.), `duracion`, `convivencia` | — | Acogidas |
| `voluntariado` | Voluntariado | `nombre*`, `email*`, `telefono?`, `mensaje*` | `tipo_voluntariado*`, `disponibilidad`, `zona` | — | Voluntariado |
| `socio` | Hacerme socio/a | `nombre*`, `email*`, `mensaje*` | `modalidad_socio` (5€/mes, 60€/año, etc. según modal) | — | Socios/Admin |
| `donaciones` | Consulta donaciones / material | `nombre*`, `email*`, `mensaje*` | `tipo_donacion`, asunto/concepto (material, dudas) | — | Donaciones/Admin |

**Validaciones mínimas (servidor):** email válido, longitudes máximas, `form_type` en lista blanca, sanitización de texto, verificación reCAPTCHA, consentimiento privacidad aceptado, rate limiting.

**Plantillas de correo (recomendadas):** asunto `[Nebak Web][{form_type}] {concepto} — {nombre}` (+ animal si aplica); cuerpo con tabla campo/valor, `page_url`, fecha/hora, `animal_url` resuelta, y texto plano alternativo.

### A.6 Páginas/zonas con contenido aún estático que debería poder venir del endpoint

| Página/zona | Contenido hardcodeado hoy | Recurso endpoint sugerido | Prioridad |
|---|---|---|---|
| `gatos-en-adopcion.html` listado | ya dinámico (JS) | `GET /v1/animales?category=Gatos en adopción&status=en_adopcion` | Alta |
| `perros-en-adopcion.html` listado | ya dinámico | `GET /v1/animales?category=Perros en adopción&status=en_adopcion` | Alta |
| `acogidas.html` cards | 3 fichas fijas | `GET /v1/animales?category=Acogida&status=en_acogida` (o `status`/`type` acordado) | Alta |
| `adoptados.html` | 3 historias fijas | `GET /v1/publicaciones?category=Adoptados&status=adoptado&sort=-publishedAt` | Media (editorial) |
| `casos-externos.html` | 4 casos fijos | `GET /v1/publicaciones?category=Caso externo&status=activo` | Alta |
| `index.html` carrusel/noticias | slugs/títulos fijos | destacados (`featured=true`) + últimas historias/eventos | Media |
| `historias.html` | dinámico pero desde JSON | `GET /v1/blog` o `/v1/publicaciones?type=historia,evento` con exclusiones/reglas | Alta |
| `post.html` | dinámico por slug | `GET /v1/publicaciones/{slug}` | Alta |

---

## 12. Apéndice B — Especificación de endpoint y Sheets (ejecutable)

### B.1 Convenciones

- **Base:** Web App GAS, p.ej. `GET {BASE_URL}?path=/v1/publicaciones&...` y `POST {BASE_URL}?path=/v1/forms/submit`.
- **Codificación:** UTF-8, JSON. Fechas ISO 8601 (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ssZ`).
- **Booleanos en Sheets:** `TRUE/FALSE` (o `1/0`) normalizados en salida.
- **Visibilidad:** solo filas con `published = TRUE` y (si aplica) `listed != FALSE`.
- **Slugs:** minúsculas, guiones, sin tildes, únicos, estables.

### B.2 Endpoints de contenido (contrato detallado)

| Endpoint | Params | Respuesta `data` | Uso en `nueva-version` |
|---|---|---|---|
| `GET /v1/config` | — | `{site, contact, socials, seoDefaults, featureFlags}` | footer, metas por defecto, datos contacto |
| `GET /v1/publicaciones` | `type,category,status,species,q,featured,listed,page,pageSize,sort,ids,slugs` | array de publicaciones (card o full según `fields`) | `historias.html`, `adoptados`, `acogidas`, `casos-externos`, home |
| `GET /v1/publicaciones/{slug}` | — | publicación completa | `post.html` |
| `GET /v1/animales` | alias + `category,status,urgent,specialNeeds,ageGroup` | animales | `gatos-en-adopcion`, `perros-en-adopcion` |
| `GET /v1/taxonomias` | `scope` | categorías/estados/tags | filtros UI |

**Ejemplo de objeto publicación (mínimo viable para front actual):**
```json
{
  "id": "pub_max",
  "slug": "max",
  "type": "animal",
  "category": "Perros en adopción",
  "status": "en_adopcion",
  "title": "Max",
  "excerpt": "…",
  "contentHtml": "<p>…</p>",
  "coverImage": { "src": "https://…/max.webp", "alt": "Max" },
  "image": "https://…/max.webp",
  "imageAlt": "Max",
  "tags": ["urgente"],
  "author": "gruponebak",
  "publishedAt": "2026-09-15",
  "dateFormatted": "15 sept",
  "readTime": "2 min de lectura",
  "listed": true,
  "featured": false,
  "flags": { "urgente": true, "cachorro": false, "adulto": true, "especial": true },
  "icons": [],
  "gallery": [],
  "videos": [],
  "animal": { "species": "perro", "names": ["Max"] },
  "cta": { "label": "Quiero adoptar a Max", "form_type": "adopcion-animal" },
  "seo": { "metaTitle": "Max en adopción | Grupo Nebak", "metaDescription": "…", "ogImage": "…" }
}
```
> Nota: incluir `flags` precalculadas evita heurísticas frágiles en cliente; mantener campos legacy (`image`, `dateFormatted`) facilita migración progresiva.

### B.3 Endpoint de formularios

| Endpoint | Método | Request (JSON) | Respuesta |
|---|---|---|---|
| `/v1/forms/submit` | POST | `{ form_type, concepto, fields:{…}, page_url, privacy_accepted, recaptcha:{token,action} }` | `200 {ok:true,id}` / `4xx/5xx {ok:false,error:{code,message}}` |

**Pasos GAS:** parse → honeypot/rate-check → verify reCAPTCHA → validate whitelist por `form_type` → append a Sheet (opcional) → enviar email plantilla → responder.

### B.4 Esquema de hojas (Sheets) — columnas sugeridas

**Hoja `publicaciones_animales` (o unificada `publicaciones` con `type`)**

| Columna | Tipo | Requerido | Ejemplo / nota |
|---|---|---|---|
| `id` | string | sí | `pub_udane_julia` |
| `slug` | string | sí | `udane-julia-gata` (único) |
| `type` | enum | sí | `animal` / `historia` / `evento` |
| `category` | string | sí | `Gatos en adopción`, `Perros en adopción`, `Acogida`, `Adoptados`, `Caso externo`, `Eventos` |
| `status` | enum | sí | `en_adopcion`, `en_acogida`, `adoptado`, `urgente`, `activo`, `finalizado` |
| `title` | string | sí | `Udane y Julia` |
| `excerpt` | string | sí | resumen tarjeta/SEO |
| `content_html` | html | sí | cuerpo |
| `cover_url` | url | sí | imagen principal |
| `cover_alt` | string | sí | alt |
| `gallery_json` | json | no | `[{src,alt,caption,order}]` |
| `videos_json` | json | no | `[{title,url,provider,note}]` |
| `icons_json` | json | no | `[{icon,label,value}]` |
| `tags` | string | no | `urgente|cachorro` o JSON |
| `species` | string | cond. | `gato/perro` |
| `names` | string/json | no | para adopción conjunta |
| `age_text` | string | no | `3 meses` |
| `urgent` | bool | no | flag |
| `special_needs` | bool/text | no | — |
| `published` | bool | sí | visibilidad |
| `listed` | bool | sí | aparece en listados |
| `featured` | bool | no | destacados home |
| `published_at` | date | sí | ISO |
| `updated_at` | date | sí | ISO |
| `seo_title` | string | no | override |
| `seo_description` | string | no | override |
| `cta_label` | string | no | — |
| `cta_form_type` | string | no | — |

**Hoja `config`**: `key,value` (o columnas fijas) para `site_name`, `emails`, `phones`, `address`, `socials_json`, `default_og_image`, `api_version`.

**Hoja `solicitudes_form` (opcional, interna)**: `timestamp, form_type, concepto, nombre, email, telefono, animal_slug, payload_json, status, recaptcha_score`.

### B.5 Mapeo endpoint → componentes `nueva-version`

| Componente | Llamada actual | Llamada objetivo | Notas |
|---|---|---|---|
| `blog-api.js` (`HistoriasAPI`) | `../data/blog-posts.json` | `GET /v1/publicaciones` (o `/v1/blog`) + `GET /v1/publicaciones/{slug}` | cache por sesión; exponer `ENDPOINT_BASE` configurable |
| `main.js` listados adopción | `../data/blog-posts.json` + filtro local | `GET /v1/animales?category=…` | o un fetch compartido cacheado |
| `main.js` chat | `../data/blog-posts.json` | `/v1/publicaciones?q=` o dataset cacheado | — |
| Formularios (`NebakForms`/static) | simulado local | `POST /v1/forms/submit` | incluir reCAPTCHA token |
| Home destacados | hardcode | `/v1/publicaciones?featured=true` o por ids | opcional fase 2+ |

---

## 13. Apéndice C — SEO por página de `nueva-version` y plan de prerender

### C.1 Metadatos objetivo (resumen)

| Página/Tipo | URL canónica propuesta | Title (patrón) | Description | Index | Schema |
|---|---|---|---|---|---|
| Home | `/` (o `/nueva-version/` según despliegue final) | `Adopción de animales y colonias felinas en Irún | Grupo Nebak` | propuesta única | sí | Organization, WebSite |
| Gatos adopción | `/adopciones/gatos/` | `Gatos en adopción en Irún | Grupo Nebak` | listado + intención local | sí | CollectionPage/Breadcrumb |
| Perros adopción | `/adopciones/perros/` | `Perros en adopción en Irún | Grupo Nebak` | ídem | sí | ídem |
| Ficha animal | `/ficha/{slug}/` (o por tipo) | `{title} en adopción/acogida | Grupo Nebak` | desde `seo`/excerpt | sí | Article/WebPage, Breadcrumb |
| Historias | `/historias/` | `Historias y finales felices | Grupo Nebak` | editorial | sí | Collection/Blog |
| Historia detalle | `/historias/{slug}/` | `{title} | Grupo Nebak` | desde `seo` | sí | BlogPosting |
| Acogidas | `/acogidas/` | `Acogidas temporales en Irún | Grupo Nebak` | informativa+listado | sí | Breadcrumb |
| Voluntariado | `/voluntariado/` (recomendado) | `Voluntariado de protección animal en Irún | Grupo Nebak` | — | sí | — |
| Contacto | `/contacto/` | `Contacto | Grupo Nebak` | NAP | sí | ContactPoint/LocalBusiness si aplica |
| Legales | `/politica-cookies/`, `/privacidad/` | específico | específico | sí (normalmente) | — |

### C.2 Requisitos de prerender/build (para fichas y listados)

1. **Fuente:** consumir endpoint público (o export de Sheets) en tiempo de build.
2. **Generar:** un HTML por `slug` publicado con contenido, `<title>`, `meta description`, `link rel="canonical"`, OG/Twitter, JSON-LD y cuerpo visible (no vacío).
3. **Sitemap:** `sitemap.xml` con todas las URLs generadas + `lastmod`.
4. **Robots:** `robots.txt` con `Sitemap:` y reglas de staging/producción.
5. **Redirects:** mapa `post.html?slug=X` → `/ficha/X/` (o destino final) y rutas antiguas raíz → nuevas.
6. **Fallback:** si no hay prerender, al menos inyectar metas en runtime no es suficiente para redes/bots — marcar como deuda crítica.

---

## 14. Apéndice D — Checklist ejecutable por fases (para otro modelo)

> Marcar `[x]` al completar. Orden sugerido con dependencias.

### Fase 0 — Datos y Sheets
- [ ] Crear libro Google Sheets (fuente canónica) con hojas `publicaciones`, `config`, `taxonomias`, `solicitudes_form`.
- [ ] Cargar/migrar registros desde `data/blog-posts.json`, `data/blog-list.json`, `data/animal-posts.json` y cards estáticas de `nueva-version`.
- [ ] Normalizar `slug`, `category`, `status`, `type`, `published/listed/featured`, URLs de media.
- [ ] Definir y documentar columnas finales (congelar v1).

### Fase 1 — GAS contenido
- [ ] Crear proyecto Apps Script vinculado a la Sheet (o con acceso por ID).
- [ ] Implementar router (`doGet`) para `/v1/config`, `/v1/publicaciones`, `/v1/publicaciones/{slug}`, `/v1/animales`, `/v1/taxonomias`.
- [ ] Implementar filtros, paginación, sort, proyección, solo publicados, errores JSON.
- [ ] Añadir CORS y `CacheService` (TTL configurable).
- [ ] Desplegar Web App, probar con los casos de `gatos`, `perros`, `acogidas`, `casos`, `historias`, detalle `slug`.
- [ ] Registrar `BASE_URL` y versión en `docs/`.

### Fase 2 — Integración `nueva-version`
- [ ] Parametrizar `ENDPOINT_BASE` en `nueva-version/js/blog-api.js` y `main.js` (constante/config).
- [ ] Migrar `HistoriasAPI.load()`/detalle a endpoint manteniendo API interna.
- [ ] Migrar listados `[data-adoption-list]` a `/v1/animales` (o unificado).
- [ ] Convertir secciones estáticas priorizadas (`acogidas`, `casos-externos`, `adoptados`, destacados home) a data-driven.
- [ ] Añadir manejo de errores/offline y estados vacíos.

### Fase 3 — SEO
- [ ] Definir mapa de URLs canónicas y redirects.
- [ ] Implementar prerender/build de fichas y listados desde endpoint.
- [ ] Añadir `<title>`, `meta description`, canonical, OG/Twitter, JSON-LD por plantilla/ficha.
- [ ] Generar `sitemap.xml` y `robots.txt`.
- [ ] Validar (Rich Results, inspección URL, compartir en redes).

### Fase 4 — Formularios
- [ ] Crear `POST /v1/forms/submit` en GAS con verificación reCAPTCHA server-side.
- [ ] Implementar plantillas de email por `form_type` y (opcional) log en Sheet.
- [ ] Conectar `NebakForms` y `data-static-form` en `nueva-version` (y raíz si aplica) al endpoint.
- [ ] Añadir checkbox/texto de privacidad y UX de estados (enviando/éxito/error).
- [ ] Probar todos los tipos con payloads reales (incl. animal_slug).

### Fase 5 — Cookies y legal
- [ ] Auditar scripts/iframes/terceros reales en `nueva-version`.
- [ ] Implementar bloqueo previo y carga condicional según consentimiento.
- [ ] Añadir enlace permanente “Configurar cookies”.
- [ ] Actualizar textos de cookies y privacidad (revisión legal).

### Fase 6 — Release
- [ ] Ejecutar redirects y publicar nueva versión.
- [ ] Enviar sitemap a Search Console y verificar propiedad.
- [ ] Monitorizar 404, indexación, envíos de formularios y métricas CWV.
- [ ] Documentar operación: cómo actualizar Sheets y refrescar caché/rebuild.

---

## 15. Criterios de aceptación (resumen)

- **Contenido:** cada ficha/listado de `nueva-version` muestra datos provenientes del endpoint (sin hardcode para entidades dinámicas definidas) y respeta `published/listed`.
- **Detalle:** `post.html` (o URL canónica de ficha) renderiza iconos/galería/vídeo/CTA correctos por tipo.
- **Formularios:** todos los `form_type` llegan al destino correcto con contexto (animal/slug cuando aplica), protegidos por reCAPTCHA y con aviso de privacidad.
- **SEO:** fichas publicadas tienen HTML indexable con meta/OG/canonical/JSON-LD únicos y están en `sitemap.xml`.
- **Cookies:** nada no esencial se carga sin consentimiento correspondiente; políticas reflejan la realidad.
- **Trazabilidad:** el documento en `docs/` es suficiente para que otro modelo ejecute las fases sin información tácita adicional del repositorio.
