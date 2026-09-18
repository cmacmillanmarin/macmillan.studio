# Project title SVGs (`components/Global/Svg/Project/*`)

Cada proyecto del portfolio tiene un título compuesto por SVGs por letra que se
animan con `shuffleIn`. Este documento explica cómo añadir un proyecto nuevo
partiendo únicamente de los SVGs exportados de Figma (uno por línea).

## Estructura de archivos

Para un proyecto `nombre-proyecto` (slug en kebab-case, componente en
PascalCase = `NombreProyecto`):

```
components/Global/Svg/Project/NombreProyecto/
├── Index.vue        # wrapper con ticker/animaciones
├── FirstLine.vue    # primera línea del título
└── SecondLine.vue   # opcional, sólo si el título tiene dos líneas
```

Los componentes se auto-importan como `SvgProjectNombreProyectoFirstLine`, etc.
El wrapper `Svg/Project/Index.vue` los resuelve por slug via
`hyphensToCamelcase`.

## Preparar los SVGs

El SVG viene de Figma con un `fill="#..."` por letra (sirve para exportar cada
letra por separado). Antes de pegarlo:

1. **Un `<path>` por letra.** Todos los `<path>` que compartan `fill` son
   fragmentos de la misma letra y deben fusionarse en un único `<path>`
   concatenando sus `d`. Es obligatorio: la animación `shuffleIn` recorre los
   `<path>` como unidades independientes, así que dejar una letra partida en
   varios paths la hace parpadear a destiempo.
   - Si el segundo `<path>` empieza con `M` mayúscula (absoluto), basta con
     concatenar los `d` tal cual.
   - Si empieza con `m` minúscula (relativo), convertir la primera pareja a
     `M x y` y añadir `l` explícito antes del siguiente par de coordenadas,
     para que la posición no dependa del path anterior. Ejemplo:
     `m164.558 37.5219.001-18.7606…` → `M164.558 37.5219l.001-18.7606…`.
2. **Quitar los `fill="..."`** de cada `<path>` (ya son sólo un marcador de
   agrupación por letra). El color final lo aplica el padre con
   `svg path { fill: v-bind(fill); }`.
3. **Quitar `<defs>` / `<clipPath>`** si sólo recortan al viewBox completo
   (no aportan nada visual). Si el SVG tiene varios `<g clip-path>` con un
   `<path>` suelto entre ellos, aplanarlo todo dentro del `<svg>`.
4. **Quitar `fill="none"`** del `<svg>` — lo pone el CSS.
5. Mantener el `viewBox` tal cual.

## Dimensiones

La altura mobile de cada línea es fija en **7.7rem** (coincide con el
`min-height` del ticker). El resto se deriva del `viewBox`:

```
desktopWidth (rem) = viewBoxWidth / 10
mobileWidth  (rem) = viewBoxWidth * 7.7 / viewBoxHeight
```

Ejemplo (Already Home first line, viewBox 780×133):

- desktop: `78rem`
- mobile: `780 * 7.7 / 133 = 45.16rem`

## ¿Ticker en mobile?

Añadir `<Ticker>` sólo si la línea **no cabe** en el viewport mobile de
referencia (37.5rem = 375px):

- `mobileWidth > 37.5rem` → envolver en `<Ticker>`
- `mobileWidth <= 37.5rem` → renderizar la línea inline (con
  `margin: auto` en mobile si se quiere centrar)

Las dos líneas se evalúan de forma independiente: una puede llevar ticker y la
otra no (patrón `IntornoLabs`).

## Template del `FirstLine.vue` / `SecondLine.vue`

```vue
<template>
  <svg class="svg__project__<slug>__first-line" viewBox="0 0 W H">
    <path d="..." />
    <!-- resto de paths sin fill -->
  </svg>
</template>

<style lang="scss">
.svg__project__<slug>__first-line {
  display: block;
  fill: none;
  height: auto;
  width: toScale(<mobileWidth>rem, 37.5rem);
  @include from__tablet--landscape {
    width: toScale(<desktopWidth>rem);
  }
  path {
    fill: var(--black);
  }
}
</style>
```

## Template del `Index.vue`

Elegir la variante según qué líneas necesitan ticker:

- **Sin ticker en ninguna línea** → referencia: `Ambia`, `LoroPiana`,
  `RomaLevin`.
- **Ticker sólo en primera línea (o sólo en segunda)** → referencia:
  `IntornoLabs`, `Buff`, `OurPlanet`, `PixelWallpapers`.
- **Ticker en ambas líneas** → referencia: `GoogleCloudTeamUsa`,
  `HublotDigitalBoutique`, `NikeHouseOfInnovation`.
- **Una sola línea con ticker** → referencia: `Evagher`, `H2o`.

Puntos clave del wrapper:

- Prop `color` opcional; el `fill` computado hace fallback a `var(--black)`.
- La animación `shuffleIn` se pasa a cada svg vía `v-transition:in`.
- Cada ticker persiste su estado en `localStorage` con key
  `project-ticker-<slug>` (o `-first-line` / `-second-line` si hay dos
  tickers). En `onBeforeUnmount`, si `next` es true, se pausa y se guarda para
  que el siguiente proyecto continúe la animación.
- `useDevice().isMobileLayout` decide entre el template con ticker y el inline.

## Checklist rápido

1. [ ] Crear carpeta `components/Global/Svg/Project/<PascalCase>/`.
2. [ ] Fusionar en un único `<path>` todos los que compartan `fill` (una letra
   = un path).
3. [ ] Quitar `fill` de cada path, quitar `<defs>`/`<clipPath>` redundantes y
   aplanar los grupos.
4. [ ] Calcular `mobileWidth` y `desktopWidth` con la fórmula.
5. [ ] Decidir ticker por línea comparando `mobileWidth` con `37.5rem`.
6. [ ] Escribir `FirstLine.vue` (+ `SecondLine.vue` si aplica) con el CSS de
   dimensiones.
7. [ ] Escribir `Index.vue` según el patrón de tickers necesario, ajustando
   `id` y clase raíz al slug del proyecto.
