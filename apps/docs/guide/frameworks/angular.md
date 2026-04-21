# Angular Integration

The `@velosci-grid/angular` package provides a native Angular component.

## Installation

```bash
pnpm add @velosci-grid/angular @velosci-grid/core
```

## Component Registration

Import the `VeloGridAngular` component into your component or module.

```typescript
import { Component } from '@angular/core';
import { VeloGridAngular } from '@velosci-grid/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [VeloGridAngular],
  template: `
    <div style="height: 500px">
      <velogrid [provider]="provider" [config]="config"></velogrid>
    </div>
  `
})
export class AppComponent {
  provider = {
    getRowCount: () => 100,
    getColumnCount: () => 10,
    getCellData: (r, c) => `Val ${r},${c}`,
    getHeader: (c) => ({ name: `Col ${c}` })
  };

  config = {
    rowHeight: 40
  };
}
```
