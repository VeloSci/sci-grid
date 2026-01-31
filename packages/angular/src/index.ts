import { Component, ElementRef, Input, type OnChanges, type OnDestroy, type OnInit, type SimpleChanges, ViewChild } from '@angular/core';
import { SciGrid } from '@sci-grid/core';
import type { GridConfig, IDataGridProvider } from '@sci-grid/core';

/**
 * SciGrid Angular Adapter
 * Enterprise-ready grid component for Angular applications.
 */
@Component({
  selector: 'sci-grid',
  template: `<div #gridContainer style="width: 100%; height: 100%; min-height: 400px;"></div>`,
  standalone: true
})
export class SciGridAngular implements OnInit, OnChanges, OnDestroy {
  @ViewChild('gridContainer', { static: true }) gridContainer!: ElementRef;
  
  @Input() provider!: IDataGridProvider;
  @Input() config: Partial<GridConfig> = {};

  private grid: SciGrid | null = null;

  ngOnInit() {
    this.grid = new SciGrid(this.gridContainer.nativeElement, this.provider, this.config);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.grid) return;

    if (changes['provider']) {
      this.grid.updateProvider(this.provider);
    }
    if (changes['config']) {
      this.grid.updateConfig(this.config);
    }
  }

  ngOnDestroy() {
    this.grid?.destroy();
    this.grid = null;
  }
}
