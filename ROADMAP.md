# SciGrid Development Roadmap

> High-performance canvas data grid for scientific applications

---

## v1.1 — Context Menus, Keyboard Shortcuts & Interaction Polish ✅

### Context Menu System
- **4 zonas diferenciadas** — `header`, `rowNumber`, `cell`, `multiCell` con items por zona
- **`ContextMenuContext`** — Cada callback recibe contexto completo (zona, fila, columna, selección)
- **Sub-menus anidados** — Soporte para `children` en `ContextMenuItem`
- **Items deshabilitados e iconos** — `disabled`, `icon` en items de menú
- **Checkbox items** — `checked` con indicador ✓ para toggles rápidos
- **Separadores con etiqueta** — `ContextMenuSection` (`{ type: 'section', label: 'Edición' }`)
- **Shortcut hints** — `shortcut` para mostrar atajos de teclado en el menú
- **`onHeaderContextMenu`** — Callback externo para headers
- **`onRowNumberContextMenu`** — Callback externo para números de fila
- **`getContextMenuItems(defaults, context)`** — Personalización total por zona

### Keyboard Shortcuts
- **Sistema configurable** — `KeyboardShortcuts` con defaults overridables por el usuario
- **Shortcuts deshabilitables** — Setear a `null` para desactivar cualquier shortcut
- **Custom shortcuts** — Definir acciones propias con `onShortcut` callback
- **`Shift+F10`** — Abre context menu en la celda actual
- **`Ctrl+A`** — Seleccionar todo

### Accesibilidad
- **ARIA roles** — `role="menu"`, `role="menuitem"`, `role="menuitemcheckbox"`, `role="separator"`, `role="presentation"`
- **Navegación con flechas** — `↑`/`↓` navegar, `Enter`/`Space` activar, `→` abrir sub-menú, `Escape` cerrar
- **`aria-checked`** — Para checkbox items
- **`aria-disabled`** — Para items deshabilitados
- **`aria-haspopup`** — Para items con sub-menú

### Documentación
- **guide/context-menus.md** — Guía completa de context menus con ejemplos por zona
- **guide/keyboard-shortcuts.md** — Guía de shortcuts configurables con custom actions
- **api/events.md** — Documentación completa de todos los callbacks y tipos
- **api/config.md** — Tabla de event callbacks y keyboard shortcuts
- **examples/interactivity.md** — Actualizado con todas las nuevas features
- **Sidebar** — Nueva sección "Interactivity" en la navegación

---

## v1.2 — Cell Editing & Validation (Marzo–Abril 2026)

- [ ] **Inline cell editing** — Doble clic o F2 para editar celdas
- [ ] **Cell validators** — Funciones de validación por columna (`(value) => boolean | string`)
- [ ] **Undo/Redo stack** — `Ctrl+Z` / `Ctrl+Y` con historial de cambios
- [ ] **Paste from clipboard** — `Ctrl+V` para pegar datos tabulares desde Excel/Sheets
- [ ] **Cell formatting rules** — Formato condicional (color por rango de valores, iconos)
- [ ] **Formula bar** — Barra de fórmulas opcional para ver/editar el valor de la celda activa

---

## v1.3 — Filtering & Sorting (Abril–Mayo 2026)

- [ ] **Column filters UI** — Dropdown de filtro en cada header (text, numeric, date)
- [ ] **Multi-column sort** — Ordenar por múltiples columnas con prioridad
- [ ] **Filter expressions** — `> 100`, `contains "abc"`, `between 10 and 50`
- [ ] **Quick filter bar** — Barra global de búsqueda que filtra todas las columnas
- [ ] **Filter persistence** — Guardar/restaurar filtros activos en localStorage
- [ ] **Sort indicators** — Iconos de dirección en headers con número de prioridad

---

## v1.4 — Grouping & Aggregation (Mayo–Junio 2026)

- [ ] **Row grouping** — Agrupar filas por valores de una columna
- [ ] **Collapsible groups** — Expandir/colapsar grupos con animación
- [ ] **Group aggregations** — Sum, Avg, Count, Min, Max por grupo
- [ ] **Footer row** — Fila de totales/resumen al final del grid
- [ ] **Pinned rows** — Filas fijas (top/bottom) que no scrollean

---

## v1.5 — Column Features (Junio–Julio 2026)

- [ ] **Pinned columns** — Columnas fijas (left/right) que no scrollean horizontalmente
- [ ] **Column groups** — Headers agrupados con span (multi-level headers)
- [ ] **Column visibility toggle** — Mostrar/ocultar columnas desde el context menu
- [ ] **Auto-fit all columns** — Ajustar todas las columnas al contenido en un clic
- [ ] **Column templates** — Renderers personalizados por tipo (sparkline, progress, tags)

---

## v1.6 — Performance & Virtualization (Julio–Agosto 2026)

- [ ] **Virtual scrolling mejorado** — Soporte para 10M+ filas sin degradación
- [ ] **Lazy loading** — `onRowsNeeded` mejorado con prefetch inteligente
- [ ] **Web Worker rendering** — Offscreen canvas para cálculos pesados
- [ ] **Typed array backend** — Acceso directo a Float64Array para datos numéricos
- [ ] **Benchmark suite** — Tests de rendimiento automatizados (FPS, memory, scroll latency)
- [ ] **Tree-shaking** — Módulos opcionales para reducir bundle size

---

## v1.7 — Export & Import (Agosto–Septiembre 2026)

- [ ] **Export a Excel (.xlsx)** — Con formato, colores y filtros
- [ ] **Export a PDF** — Tabla paginada con headers repetidos
- [ ] **Export a JSON** — Estructura configurable
- [ ] **Import desde Excel** — Drag & drop de archivos .xlsx
- [ ] **Import desde clipboard** — Detección automática de formato tabular
- [ ] **Print mode** — Vista optimizada para impresión

---

## v1.8 — Theming & Customization (Septiembre–Octubre 2026)

- [ ] **Theme presets** — Light, Dark, Scientific, Material, Nord
- [ ] **CSS custom properties** — Variables CSS para theming externo
- [ ] **Custom cell renderers** — API para renderers personalizados por celda
- [ ] **Header templates** — Renderers personalizados para headers
- [ ] **Row height auto-fit** — Altura de fila dinámica según contenido
- [ ] **Animation system** — Transiciones suaves para sort, filter, reorder

---

## v1.9 — Accessibility & i18n (Octubre–Noviembre 2026)

- [ ] **Full ARIA support** — `role="grid"`, `aria-rowindex`, `aria-colindex`, live regions
- [ ] **Screen reader navigation** — Anuncio de celda activa, headers, selección
- [ ] **High contrast mode** — Tema de alto contraste para accesibilidad visual
- [ ] **RTL support** — Soporte para idiomas right-to-left
- [ ] **i18n strings** — Todas las cadenas de UI externalizables
- [ ] **Focus management** — Tab navigation completa dentro del grid

---

## v2.0 — Framework Adapters & Ecosystem (Noviembre–Diciembre 2026)

- [ ] **React adapter** — ✅ Existente, mejorar con hooks (`useGridApi`, `useGridSelection`)
- [ ] **Vue adapter** — Mejorar con composables
- [ ] **Angular adapter** — Mejorar con signals
- [ ] **Svelte adapter** — Crear adapter nativo
- [ ] **Astro adapter** — ✅ Existente, mejorar SSR
- [ ] **Solid adapter** — ✅ Existente, mejorar signals
- [ ] **Web Component** — `<sci-grid>` custom element standalone
- [ ] **Storybook** — Documentación interactiva de todos los features
- [ ] **Playground** — Editor online para probar configuraciones

---

## Principios de Desarrollo

1. **Canvas-first** — Todo el rendering en canvas para máximo rendimiento
2. **Zero dependencies** — Core sin dependencias externas
3. **Type-safe** — TypeScript estricto en toda la API pública
4. **Framework-agnostic** — Core independiente, adapters ligeros
5. **Backward compatible** — Cambios breaking solo en major versions
6. **Test-driven** — Cada feature con tests unitarios y de integración
7. **Scientific focus** — Optimizado para datos numéricos, unidades SI, notación científica
