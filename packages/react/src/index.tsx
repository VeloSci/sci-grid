import { useRef, useEffect, type CSSProperties } from 'react';
import { VeloGrid } from '@velosci-grid/core';
import type { GridConfig, IDataGridProvider } from '@velosci-grid/core';

interface VeloGridReactProps {
  provider: IDataGridProvider;
  config?: Partial<GridConfig>;
  className?: string;
  style?: CSSProperties;
  onSort?: (col: number, order: 'asc' | 'desc' | null) => void;
  onSelectionChange?: (info: any) => void;
  onContextMenu?: (row: number, col: number, e: MouseEvent) => void;
  onHeaderContextMenu?: (col: number, e: MouseEvent) => void;
  onRowNumberContextMenu?: (row: number, e: MouseEvent) => void;
  getContextMenuItems?: GridConfig['getContextMenuItems'];
}

/**
 * VeloGrid React Adapter
 * High-performance data grid component for React applications.
 */
export const VeloGridReact = ({ 
  provider, 
  config = {}, 
  className, 
  style, 
  onSort,
  onSelectionChange,
  onContextMenu,
  onHeaderContextMenu,
  onRowNumberContextMenu,
  getContextMenuItems
}: VeloGridReactProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<VeloGrid | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      gridRef.current = new VeloGrid(containerRef.current, provider, {
        ...config,
        onSort,
        onSelectionChange,
        onContextMenu,
        onHeaderContextMenu,
        onRowNumberContextMenu,
        getContextMenuItems
      });
    }
    return () => {
      gridRef.current?.destroy();
      gridRef.current = null;
    };
  }, []); // Only on mount

  // Handle provider updates
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.updateProvider(provider);
    }
  }, [provider]);

  // Handle config & callback updates
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.updateConfig({
        ...config,
        onSort,
        onSelectionChange,
        onContextMenu,
        onHeaderContextMenu,
        onRowNumberContextMenu,
        getContextMenuItems
      });
    }
  }, [config, onSort, onSelectionChange, onContextMenu, onHeaderContextMenu, onRowNumberContextMenu, getContextMenuItems]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ width: '100%', height: '100%', ...style }} 
    />
  );
};
