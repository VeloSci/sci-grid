import { Component } from '@angular/core';
import { SciGridAngular } from '@sci-grid/angular';
import type { IDataGridProvider } from '@sci-grid/core';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [SciGridAngular],
  template: `
    <div style="height: 600px; width: 100%;">
      <sci-grid [provider]="provider" [config]="config"></sci-grid>
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
