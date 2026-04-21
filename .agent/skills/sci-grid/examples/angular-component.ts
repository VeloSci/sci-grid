import { Component } from '@angular/core';
import { VeloGridAngular } from '@velosci-grid/angular';
import type { IDataGridProvider } from '@velosci-grid/core';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [VeloGridAngular],
  template: `
    <div style="height: 600px; width: 100%;">
      <velogrid [provider]="provider" [config]="config"></velogrid>
    </div>
  `
})
export class GridComponent {
  config = { headerHeight: 50 };
  
  provider: IDataGridProvider = {
    getRowCount: () => 5000,
    getColumnCount: () => 20,
    getCellData: (r, c) => `Ang-${r}-${c}`,
    getHeader: (c) => ({ name: `Col ${c}` })
  };
}
