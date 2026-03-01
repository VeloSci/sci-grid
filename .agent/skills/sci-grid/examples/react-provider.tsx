import React, { useMemo } from 'react';
import { SciGridReact } from '@sci-grid/react';
import type { IDataGridProvider } from '@sci-grid/core';

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
      <SciGridReact 
        provider={provider} 
        config={{ headerHeight: 60, rowHeight: 32 }}
      />
    </div>
  );
}
