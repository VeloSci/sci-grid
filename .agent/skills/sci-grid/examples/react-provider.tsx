import React, { useMemo } from 'react';
import { VeloGridReact } from '@velosci-grid/react';
import type { IDataGridProvider } from '@velosci-grid/core';

export function ReactGrid() {
  // Memoize the provider to avoid re-instantiating on every React render
  const provider = useMemo<IDataGridProvider>(() => {
    return {
      getRowCount: () => 1000,
      getColumnCount: () => 50,
      getCellData: (row, col) => `Cell ${row},${col}`,
      getHeader: (col) => ({ name: `Col ${col}`, units: 'N/A' })
    };
  }, []);

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <VeloGridReact 
        provider={provider} 
        config={{ headerHeight: 60, rowHeight: 32 }}
      />
    </div>
  );
}
