import { useState, useEffect } from 'react';

export type RoundingMode = 'UP' | 'DOWN' | 'CEILING' | 'FLOOR' | 'HALF_UP' | 'HALF_DOWN' | 'HALF_EVEN';

export interface CalculatedColumn {
  id: string;
  headerName: string;
  expression: string;
  roundingMode?: RoundingMode;
  decimalPlaces?: number;
}

export const useCalculatedColumns = () => {
  const [calculatedCols, setCalculatedCols] = useState<CalculatedColumn[]>(() => {
    const saved = localStorage.getItem('calculatedColumns');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('calculatedColumns', JSON.stringify(calculatedCols));
  }, [calculatedCols]);

  const addColumn = (col: Omit<CalculatedColumn, 'id'>) => {
    const newCol = { ...col, id: `calc_${Date.now()}` };
    setCalculatedCols(prev => [...prev, newCol]);
  };

  const updateColumn = (id: string, updatedCol: Omit<CalculatedColumn, 'id'>) => {
    const newCols = calculatedCols.map(c => c.id === id ? { ...c, ...updatedCol } : c);
    setCalculatedCols(newCols);
  };

  const deleteColumn = (id: string) => {
    setCalculatedCols(prev => prev.filter(c => c.id !== id));
  };

  return { calculatedCols, addColumn, updateColumn, deleteColumn };
};
