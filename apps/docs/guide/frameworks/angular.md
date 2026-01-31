# Angular Integration

The `@velo-sci/angular` package provides a native Angular component.

## Installation

```bash
pnpm add @velo-sci/angular @velo-sci/core
```

## Component Registration

Import the `SciGridAngular` component into your component or module.

```typescript
import { Component } from '@angular/core';
import { SciGridAngular } from '@velo-sci/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SciGridAngular],
  template: `
    <div style="height: 500px">
      <sci-grid [provider]="provider" [config]="config"></sci-grid>
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
