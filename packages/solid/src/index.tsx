import { onMount, onCleanup, createEffect } from 'solid-js';
import { VeloGrid } from '@velosci-grid/core';
import type { GridConfig, IDataGridProvider } from '@velosci-grid/core';

interface VeloGridSolidProps {
  provider: IDataGridProvider;
  config?: Partial<GridConfig>;
  class?: string;
  style?: any;
}

/**
 * VeloGrid SolidJS Adapter
 * Fine-grained reactive wrapper for maximum performance.
 */
export const VeloGridSolid = (props: VeloGridSolidProps) => {
  let containerRef!: HTMLDivElement;
  let grid: VeloGrid | null = null;

  onMount(() => {
    grid = new VeloGrid(containerRef, props.provider, props.config || {});
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
      ref={containerRef} 
      class={props.class} 
      style={{ width: '100%', height: '100%', ...props.style } as any} 
    />
  );
};
