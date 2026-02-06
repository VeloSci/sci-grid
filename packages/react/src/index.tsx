import { useRef, useEffect, type CSSProperties } from 'react';
import { SciGrid } from '@sci-grid/core';
import type { GridConfig, IDataGridProvider } from '@sci-grid/core';

interface SciGridReactProps {
  provider: IDataGridProvider;
  config?: Partial<GridConfig>;
  className?: string;
  style?: CSSProperties;
  onSort?: (col: number, order: 'asc' | 'desc' | null) => void;
  onSelectionChange?: (info: any) => void;
  onContextMenu?: (row: number, col: number, e: MouseEvent) => void;
}

/**
 * SciGrid React Adapter
 * High-performance data grid component for React applications.
 */
export const SciGridReact = ({ 
  provider, 
  config = {}, 
  className, 
  style, 
  onSort,
  onSelectionChange,
  onContextMenu
}: SciGridReactProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<SciGrid | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      gridRef.current = new SciGrid(containerRef.current, provider, {
        ...config,
        onSort,
        onSelectionChange,
        onContextMenu
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
        onContextMenu
      });
    }
  }, [config, onSort, onSelectionChange, onContextMenu]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ width: '100%', height: '100%', ...style }} 
    />
  );
};
