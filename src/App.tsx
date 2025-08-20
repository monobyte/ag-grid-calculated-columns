import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import type { ColDef, GetRowIdFunc, GridApi, GridReadyEvent, ValueFormatterParams } from '@ag-grid-community/core';
import { Button } from '@mantine/core';
import './App.css';
import type { IBond } from './types';
import { useCalculatedColumns } from './hooks/useCalculatedColumns';
import { CalculatedColumnManager } from './components/CalculatedColumnManager';
import { createExpressionValueGetter } from './utils/expressionUtils';

// Formats number to 2 decimal places
const twoDecimalPlacesFormatter = (params: ValueFormatterParams) => {
  if (typeof params.value === 'number') {
    return params.value.toFixed(2);
  }
  return params.value;
};

const mockConfig = {
  rowCount: 100,
  updateIntervalMs: 1000, // Ticking data interval (slower)
  updateBatchSize: 10, // Number of rows to update per tick
};

// Generates a single row of mock data
const createRow = (index: number): IBond => {
  const initialPrice = 98 + Math.random() * 4; // e.g., 98.00 to 102.00
  const initialYield = 2 + Math.random() * 2; // e.g., 2.00 to 4.00
  const isUsd = index % 2 === 0;

  return {
    RecordId: `REC${1000 + index}`,
    MapIdCode: `MAP${500 + index}`,
    DisplayTier: `Tier ${1 + (index % 3)}`,
    TwBid: initialPrice - 0.1,
    TwAsk: initialPrice + 0.1,
    TwBidYield: initialYield + 0.05,
    TwAskYield: initialYield - 0.05,
    Composite: {
      MidPrice: initialPrice,
      MidYield: initialYield,
      AnalyticsPv01: 0.01 + Math.random() * 0.01,
      ModDuration: 3 + Math.random() * 2,
    },
    Instrument: {
      CodeType: isUsd ? 'US912828U822' : 'DE0001102341',
      Country: isUsd ? 'USA' : 'DEU',
      SecurityType: 'Govt Bond',
      Segment: isUsd ? 'Treasury' : 'Bund',
      DateMaturity: isUsd ? 20331115 : 20310215,
      Currency: isUsd ? 'USD' : 'EUR',
      IsDefaultTier: index % 5 === 0,
      LastUpdateTime: new Date().toISOString(),
    },
  };
};

export default function App() {
  const gridApiRef = useRef<GridApi<IBond> | null>(null);
  const [rowData, setRowData] = useState<IBond[]>([]);
  const [managerOpened, setManagerOpened] = useState(false);

  // Generate initial data
  useEffect(() => {
    const data = Array.from({ length: mockConfig.rowCount }, (_, i) => createRow(i));
    setRowData(data);
  }, []);

  // Ticking data effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gridApiRef.current) return;

      const allNodes: any[] = [];
      gridApiRef.current.forEachNode(node => allNodes.push(node));

      // Shuffle and pick a random subset to update
      const shuffledNodes = allNodes.sort(() => 0.5 - Math.random());
      const nodesToUpdate = shuffledNodes.slice(0, mockConfig.updateBatchSize);

      const updates: IBond[] = [];
      nodesToUpdate.forEach(node => {
        if (node.data) {
          // Deep copy to avoid mutation issues with nested objects
          const update = JSON.parse(JSON.stringify(node.data));

          const priceChange = (Math.random() - 0.5) * 0.1;
          const yieldChange = (Math.random() - 0.5) * 0.01;

          update.Composite.MidPrice = (update.Composite.MidPrice || 100) + priceChange;
          update.Composite.MidYield = (update.Composite.MidYield || 3) + yieldChange;
          update.TwBid = update.Composite.MidPrice - 0.1;
          update.TwAsk = update.Composite.MidPrice + 0.1;
          update.Instrument.LastUpdateTime = new Date().toISOString();

          updates.push(update);
        }
      });

      if (updates.length > 0) {
        gridApiRef.current.applyTransactionAsync({ update: updates });
      }
    }, mockConfig.updateIntervalMs);

    return () => clearInterval(interval);
  }, []);

  // Base Column Definitions
  const baseColDefs = useMemo<ColDef<IBond>[]>(() => [
    { field: 'Instrument.CodeType', headerName: 'ISIN' },
    { field: 'Instrument.SecurityType', headerName: 'Security' },
    { field: 'Instrument.Currency', headerName: 'Ccy' },
    { field: 'Composite.MidPrice', headerName: 'Mid Price', valueFormatter: twoDecimalPlacesFormatter },
    { field: 'Composite.MidYield', headerName: 'Mid Yield', valueFormatter: twoDecimalPlacesFormatter },
    { field: 'TwBid', headerName: 'TW Bid', valueFormatter: twoDecimalPlacesFormatter },
    { field: 'TwAsk', headerName: 'TW Ask', valueFormatter: twoDecimalPlacesFormatter },
    { field: 'DisplayTier', headerName: 'Tier' },
    { field: 'Composite.ModDuration', headerName: 'Mod Duration', valueFormatter: twoDecimalPlacesFormatter },
    { field: 'Instrument.Country', headerName: 'Country' },
    { field: 'Instrument.LastUpdateTime', headerName: 'Updated' },
  ], []);

  const { calculatedCols, addColumn, updateColumn, deleteColumn } = useCalculatedColumns();

  const columnDefs = useMemo(() => {
    const dynamicColDefs: ColDef[] = calculatedCols.map(c => ({
      headerName: c.headerName,
      colId: c.id,
      valueGetter: createExpressionValueGetter(c.expression, c.roundingMode, c.decimalPlaces),
      valueFormatter: (params: ValueFormatterParams) => {
        if (typeof params.value === 'number' && c.decimalPlaces !== undefined) {
          return params.value.toFixed(c.decimalPlaces);
        }
        return params.value;
      }
    }));
    return [...baseColDefs, ...dynamicColDefs];
  }, [baseColDefs, calculatedCols]);

  // Apply settings across all columns
  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  }), []);

  const onGridReady = useCallback((params: GridReadyEvent<IBond>) => {
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();
  }, []);

  // Required for transaction updates
  const getRowId = useMemo<GetRowIdFunc>(() => {
    return (params) => params.data.RecordId;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px' }}>
        <Button onClick={() => setManagerOpened(true)}>Manage Calculated Columns</Button>
      </div>
      <div className="ag-theme-quartz" style={{ flex: 1, width: '100%' }}>
        <AgGridReact<IBond>
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          getRowId={getRowId}
          pagination
          paginationPageSize={500}
          paginationPageSizeSelector={[10, 100, 500, 1000]}
        />
      </div>
      {managerOpened && rowData.length > 0 && (
        <CalculatedColumnManager
          opened={managerOpened}
          onClose={() => setManagerOpened(false)}
          calculatedCols={calculatedCols}
          addColumn={addColumn}
          updateColumn={updateColumn}
          deleteColumn={deleteColumn}
          sampleRow={rowData[0]}
        />
      )}
    </div>
  );
}
