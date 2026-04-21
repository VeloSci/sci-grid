import { Component } from 'solid-js';
import { VeloGridSolid } from '@velosci-grid/solid';
import type { IDataGridProvider } from '@velosci-grid/core';

export const SolidGrid: Component = () => {
  const provider: IDataGridProvider = {
    getRowCount: () => 2000,
    getColumnCount: () => 100,
    getCellData: (r, c) => `S-${r}-${c}`,
    getHeader: (c) => ({ name: `H${c}` })
  };

  return (
    <div style="height: 600px; width: 100%;">
      <VeloGridSolid 
        provider={provider} 
        config={{ headerHeight: 40 }} 
      />
    </div>
  );
};
