# Estructura de endpoint: publicaciones de acogida y adopciones

Este documento define la estructura recomendada para las respuestas de endpoint que alimentan publicaciones relacionadas con **acogida** y **adopciones** en `nueva-version/`, incluyendo:
- **Fichas de animales** (adopción, acogida, adoptados/casos relacionados).
- **Eventos u otros hitos** (jornadas, campañas, hitos informativos o de difusión).

Está alineado con:
- Los datos actuales en `data/blog-posts.json` (campo `publication` añadido para normalizar esquema de publicación).
- El ejemplo de respuesta en `data/api-ejemplos/publicaciones-endpoint-ejemplo.json`.

> Nota: parte del contenido de galería/vídeo/iconos puede ser **orientativo o inventado** cuando falte material real, para mantener una estructura de publicación homogénea (iconos, imágenes/carrusel y vídeo) en escritorio y móvil.

---

## 1. Endpoint y variantes (filtrados)

### Listado general
- `GET /api/publicaciones`
- Devuelve publicaciones paginadas con filtros opcionales.

### Variantes recomendadas por filtrado (query params)
- Por tipo de publicación:
  - `GET /api/publicaciones?type=animal`
  - `GET /api/publicaciones?type=evento`
- Por categoría/ámbito:
  - `GET /api/publicaciones?category=Acogida`
  - `GET /api/publicaciones?category=Acogidas`
  - `GET /api/publicaciones?category=Gatos%20en%20adopci%C3%B3n`
  - `GET /api/publicaciones?category=Perros%20en%20adopci%C3%B3n`
  - `GET /api/publicaciones?category=Adoptados`
  - `GET /api/publicaciones?category=Caso%20externo`
  - `GET /api/publicaciones?category=Eventos`
- Por estado:
  - `GET /api/publicaciones?type=animal&status=en_adopcion`
  - `GET /api/publicaciones?type=animal&status=en_acogida`
  - `GET /api/publicaciones?type=animal&status=adoptado`
  - `GET /api/publicaciones?type=animal&status=urgente`
  - `GET /api/publicaciones?type=evento&status=activo|finalizado`
- Por especie (fichas de animales):
  - `GET /api/publicaciones?type=animal&species=gato`
  - `GET /api/publicaciones?type=animal&species=perro`
- Búsqueda y combinación:
  - `GET /api/publicaciones?q=acogida&type=animal&status=en_acogida`
  - `GET /api/publicaciones?type=animal&category=Gatos%20en%20adopci%C3%B3n&status=en_adopcion&page=1&pageSize=12&sort=-publishedAt`

### Detalle
- `GET /api/publicaciones/:slug` (o `:id`)
- Devuelve una publicación completa con esquema de publicación (`icons`, `gallery`, `video`) y bloque específico (`animal` o `event`).

---

## 2. Estructura de respuesta (listado)

```json
{
  "endpoint": "GET /api/publicaciones",
  "generatedAt": "ISO-8601",
  "filters": {
    "type": ["animal", "evento"],
    "category": ["..."],
    "status": ["..."],
    "species": ["gato", "perro", "otros"],
    "q": "string"
  },
  "pagination": {
    "page": 1,
    "pageSize": 12,
    "total": 100,
    "totalPages": 9
  },
  "data": [/* Publicacion[] */]
}
```

---

## 3. Esquema común de publicación (`Publicacion`)

Campos comunes para que todas las publicaciones de acogida/adopciones mantengan la misma estructura visual/funcional:

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---:|---|
| `id` | string | Sí | Identificador único estable. |
| `slug` | string | Sí | Identificador para URL/detalle (`post.html?slug=`). |
| `type` | `"animal" \| "evento"` | Sí | Tipo principal de contenido. |
| `category` | string | Sí | Categoría editorial (ej. `Acogida`, `Gatos en adopción`, `Eventos`). |
| `status` | string | Sí | Estado operativo/editorial (`en_adopcion`, `en_acogida`, `adoptado`, `urgente`, `activo`, `finalizado`, etc.). |
| `title` | string | Sí | Título. |
| `excerpt` | string | Recomendado | Resumen breve para tarjetas/listados. |
| `publishedAt` | string (fecha/ISO) | Recomendado | Fecha de publicación. |
| `updatedAt` | string (fecha/ISO) | Opcional | Última actualización. |
| `author` | string | Opcional | Autor/fuente. |
| `coverImage` | `{src, alt}` | Recomendado | Imagen principal. |
| `icons` | `IconItem[]` | **Sí*** | Datos destacados con icono (especie, zona, estado, prioridad, etc.). |
| `gallery` | `GalleryItem[]` | **Sí*** | Carrusel de imágenes (mín. 1, recomendado 3–6). |
| `video` | `VideoItem` | **Sí*** | Vídeo de apoyo/informativo (puede ser orientativo si no hay material propio). |
| `contentHtml` | string | Recomendado | Cuerpo HTML de la descripción. |
| `tags` | string[] | Opcional | Etiquetas. |
| `cta` | `{label,url}` | Opcional | Acción principal. |
| `animal` | `AnimalFicha` | Condicional | Presente cuando `type="animal"`. |
| `event` | `EventHito` | Condicional | Presente cuando `type="evento"`. |

\* En el esquema normalizado de `nueva-version`, las publicaciones de acogida/adopciones **siempre** deben exponer `icons`, `gallery` (carrusel) y `video`. Si falta contenido real, se añade contenido de apoyo/orientativo.

### Subestructuras comunes

**IconItem**
```json
{ "icon": "🐱", "label": "Especie", "value": "Gato" }
```

**GalleryItem**
```json
{ "src": "assets/images/...", "alt": "texto alternativo", "caption": "pie opcional", "order": 1 }
```
- Rutas pueden ser relativas al sitio/datos (`assets/images/...`) y el frontend las normaliza según contexto.

**VideoItem**
```json
{
  "title": "Vídeo orientativo",
  "provider": "youtube",
  "url": "https://www.youtube-nocookie.com/embed/...",
  "thumbnail": null,
  "durationSec": null,
  "note": "Texto aclaratorio opcional"
}
```

---

## 4. Ficha de animal (`type: "animal"`)

Aplicable a categorías como `Gatos en adopción`, `Perros en adopción`, `Acogida`, `Acogidas`, `Adoptados` y casos externos relacionados.

```json
{
  "type": "animal",
  "category": "Gatos en adopción",
  "status": "en_adopcion",
  "animal": {
    "names": ["Nombre"],
    "species": "gato | perro | otros",
    "breed": "string",
    "sex": ["macho|hembra|desconocido"],
    "age": { "value": 3, "unit": "months|years", "label": "3 meses" },
    "size": "pequeño | mediano | grande",
    "color": "string (opcional)",
    "health": {
      "vaccinated": true,
      "dewormed": true,
      "neutered": false,
      "microchipped": true,
      "specialNeeds": "texto o null"
    },
    "temperament": ["cariñoso", "sociable"],
    "compatibility": { "dogs": "sí|no|desconocido", "cats": "sí|no|desconocido", "kids": "sí|no|valorar" },
    "adoption": {
      "mode": "individual | conjunta",
      "feeEur": 100,
      "includes": ["microchip", "desparasitación"],
      "requirements": ["contrato", "seguimiento"]
    },
    "foster": {
      "temporary": false,
      "reason": "string",
      "durationLabel": "string",
      "expensesPolicy": "string"
    },
    "location": { "city": "Irún", "province": "Gipuzkoa", "shelter": "opcional" },
    "contact": { "email": "nebakadopciones@gmail.com", "phone": "625 140 588" }
  }
}
```

**Notas**
- Usar `adoption` para publicaciones de adopción/adoptados y `foster` para acogidas; pueden coexistir si aplica.
- En casos conjuntos (hermanos/tríos), `names`, `sex` y detalles pueden ser arrays o incluir el vínculo en `icons`/`adoption.mode`.
- `status` recomendado: `en_adopcion`, `en_acogida`, `adoptado`, `reservado`, `urgente`, `cerrado`.

---

## 5. Evento u hito (`type: "evento"`)

Aplicable a eventos, campañas, jornadas, hitos informativos o de difusión.

```json
{
  "type": "evento",
  "category": "Eventos",
  "status": "activo",
  "event": {
    "kind": "evento | campaña | hito | jornada | difusión",
    "startDate": "2026-10-20T10:00:00+02:00",
    "endDate": "2026-10-20T13:00:00+02:00",
    "timezone": "Europe/Madrid",
    "location": {
      "name": "Espacio Nebak",
      "address": "Dirección",
      "city": "Irún",
      "onlineUrl": null
    },
    "organizer": { "name": "Grupo Nebak", "contactEmail": "nebakadopciones@gmail.com", "phone": "625 140 588" },
    "audience": ["familias", "personas interesadas en acoger", "voluntariado"],
    "agenda": [
      { "time": "10:00", "title": "Bienvenida" },
      { "time": "10:30", "title": "Charla informativa" }
    ],
    "registration": { "required": false, "url": "contacto.html", "label": "Solicitar información" },
    "milestone": { "label": "Hito alcanzado", "value": "texto", "date": "YYYY-MM-DD" }
  }
}
```

**Notas**
- Para hitos sin horario exacto, pueden omitirse `startDate/endDate` y usarse `milestone`/`status`.
- `status` recomendado: `activo`, `programado`, `finalizado`, `cancelado`.

---

## 6. Mapeo con `data/blog-posts.json` (`nueva-version`)

Para compatibilidad con el sitio estático actual, las publicaciones relacionadas con acogida/adopciones incluyen un bloque `publication`:

```json
{
  "slug": "...",
  "title": "...",
  "category": "Acogida | Acogidas | Gatos en adopción | Perros en adopción | Adoptados | Caso externo",
  "image": "assets/images/...",
  "content": "<p>...</p>",
  "publication": {
    "schema": "nebak-post-v1",
    "type": "acogida | gato | perro | adoptado | externo",
    "icons": [{ "icon": "", "label": "", "value": "" }],
    "gallery": [{ "src": "assets/images/...", "alt": "", "caption": "" }],
    "video": { "title": "", "url": "https://...", "provider": "youtube", "note": "" },
    "inventedContent": { "gallery": true, "video": true, "icons": true }
  }
}
```

- El render de detalle (`nueva-version/js/blog-render.js`) muestra **iconos**, **carrusel de imágenes** y **vídeo** cuando existe `publication`, de forma responsive en escritorio y móvil.
- El ejemplo completo de respuesta de endpoint se encuentra en `data/api-ejemplos/publicaciones-endpoint-ejemplo.json`.
