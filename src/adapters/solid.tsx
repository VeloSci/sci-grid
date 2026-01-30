import { onMount, onCleanup, createEffect } from 'solid-js';
import { SciGrid } from '../sci-grid.js';
import type { GridConfig, IDataGridProvider } from '../types/grid.js';

interface SciGridSolidProps {
  provider: IDataGridProvider;
  config?: Partial<GridConfig>;
  class?: string;
  style?: any;
}

/**
 * SciGrid SolidJS Adapter
 * Fine-grained reactive wrapper for maximum performance.
 */
export const SciGridSolid = (props: SciGridSolidProps) => {
  let containerRef!: HTMLDivElement;
  let grid: SciGrid | null = null;

  onMount(() => {
    grid = new SciGrid(containerRef, props.provider, props.config || {});
  });

  onCleanup(() => {
    grid?.destroy();
  });

  createEffect(() => {
    grid?.updateProvider(props.provider);
  });

  createEffect(() => {
    grid?.updateConfig(props.config || {});
  });

  return (
    <div 
      ref={(el: any) => (containerRef = el)} 
      className={props.class} 
      style={{ width: '100%', height: '100%', ...props.style } as any} 
    />
  );
};
