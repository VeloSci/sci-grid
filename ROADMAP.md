# VeloGrid Development Roadmap

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

## v1.2 — Cell Editing & Validation ✅

### Editing
- **Inline cell editing** — Doble clic o `F2` para editar celdas (ya existía, ahora con shortcut configurable)
- **Cell validators** — `CellValidator` por columna: `(value, row, col) => true | 'error message'`
- **`onCellEdit` callback** — Notificación después de cada edición con `{ row, col, oldValue, newValue }`
- **Delete cells** — `Delete` key borra celdas seleccionadas (con undo)

### Undo/Redo
- **`UndoManager`** — Stack de undo/redo con tamaño configurable (`undoHistorySize`, default: 100)
- **`Ctrl+Z` / `Ctrl+Y`** — Shortcuts configurables para undo/redo
- **Paste tracking** — Paste operations se registran como una sola acción de undo

### Clipboard
- **`Ctrl+V` paste** — Pegar datos tabulares desde Excel/Sheets (tab-separated)
- **Validación en paste** — Cada celda se valida antes de pegar
- **Tipo numérico** — Auto-parse de valores numéricos al pegar en columnas numéricas

### Formato Condicional
- **`CellFormattingRule`** — Reglas con `condition(value, row, col)` y estilos (`backgroundColor`, `textColor`, `fontWeight`, `icon`)
- **Por columna** — Reglas pueden aplicarse a columnas específicas o a todas

### Formula Bar
- **`showFormulaBar: true`** — Barra que muestra `ColName:Row` y el valor de la celda activa
- **Auto-update** — Se actualiza en cada render

### Keyboard Shortcuts (sistema por defecto)
- **`DEFAULT_SHORTCUTS` exportado** — Objeto con todos los shortcuts por defecto, visible para el usuario
- **Nuevos defaults**: `Ctrl+V` (paste), `Ctrl+Z` (undo), `Ctrl+Y` (redo), `F2` (edit), `Delete` (delete)

---

## v1.3 — Filtering & Sorting ✅

### FilterEngine
- **`FilterEngine`** — Motor de filtrado/ordenamiento/agrupación exportado como clase pública
- **13 operadores** — `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `contains`, `notContains`, `startsWith`, `endsWith`, `between`, `empty`, `notEmpty`
- **`ColumnFilter`** — `{ col, operator, value, valueTo? }` para cada filtro activo
- **Quick filter** — Búsqueda global en todas las columnas

### Multi-Column Sort
- **`SortState[]`** — Array de `{ col, order }` para ordenamiento multi-columna
- **`addSort(col, order)`** — API pública para agregar/modificar sort
- **`clearSort()`** — Limpiar todos los sorts
- **`onSortChange` callback** — Notificación cuando cambia el sort

### Filter API
- **`addFilter(filter)`** — Agregar/modificar filtro por columna
- **`removeFilter(col)`** — Eliminar filtro de una columna
- **`clearFilters()`** — Limpiar todos los filtros
- **`onFilterChange` callback** — Notificación cuando cambian los filtros
- **Persistencia** — Filtros se guardan en `config.filters`, compatible con localStorage

### Quick Filter Bar
- **`showQuickFilter: true`** — Barra de búsqueda global con icono 🔍
- **`onQuickFilterChange` callback** — Notificación cuando cambia el texto

### DataView
- **`rebuildDataView()`** — Reconstruye el mapeo virtual → real (filter + sort + group)
- **`getRealRow(virtualRow)`** — Obtiene el índice real de una fila virtual
- **`getVisibleRowCount()`** — Cuenta de filas visibles después de filtrar

---

## v1.4 — Grouping & Aggregation ✅

### Row Grouping
- **`GroupConfig`** — `{ col, aggregations? }` para agrupar por columna
- **`setGroupBy(col, aggregations?)`** — API pública para activar agrupación
- **`clearGroupBy()`** — Desactivar agrupación

### Collapsible Groups
- **`toggleGroup(groupValue)`** — Expandir/colapsar un grupo
- **`GroupInfo`** — `{ value, startIndex, endIndex, collapsed, rowCount }`
- **Estado persistente** — Grupos colapsados se mantienen entre rebuilds

### Aggregations
- **5 tipos** — `sum`, `avg`, `count`, `min`, `max`
- **`FilterEngine.aggregate()`** — Método estático para calcular agregaciones
- **`getAggregation(col, type)`** — API pública en VeloGrid
- **Por grupo** — Cada grupo puede tener agregaciones independientes

### Footer Row
- **`FooterRow`** — `{ aggregations: Record<number, AggregationType>, label? }`
- **Configurable** — `config.footerRow` para activar fila de totales

### Pinned Rows
- **`PinnedRow`** — `{ position: 'top' | 'bottom', data, style? }`
- **Estilos custom** — `backgroundColor`, `textColor`, `fontWeight` por fila pinneada
- **Configurable** — `config.pinnedRows[]` para filas fijas

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
- [ ] **Web Component** — `<velogrid>` custom element standalone
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
