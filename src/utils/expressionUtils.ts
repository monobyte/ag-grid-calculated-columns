import type { ValueGetterParams } from "@ag-grid-community/core";
import type { RoundingMode } from "../hooks/useCalculatedColumns";
import { create, all } from "mathjs";

const math = create(all);

// Configure mathjs to handle different rounding modes
const roundingFunctions: Record<RoundingMode, (n: number, p: number) => number> = {
  UP: (n: number, p: number) => Math.ceil(n * 10 ** p) / 10 ** p,
  DOWN: (n: number, p: number) => Math.floor(n * 10 ** p) / 10 ** p,
  CEILING: (n: number, p: number) => Math.ceil(n * 10 ** p) / 10 ** p,
  FLOOR: (n: number, p: number) => Math.floor(n * 10 ** p) / 10 ** p,
  HALF_UP: (n: number, p: number) => {
    const m = 10 ** p;
    return Math.round(n * m) / m;
  },
  HALF_DOWN: (n: number, p: number) => {
    const m = 10 ** p;
    // Custom implementation for HALF_DOWN
    return n > 0 ? Math.floor(n * m + 0.5) / m : Math.ceil(n * m - 0.5) / m;
  },
  HALF_EVEN: (n: number, p: number) => {
    const m = 10 ** p;
    const r = n * m;
    const i = Math.floor(r);
    const f = r - i;
    if (f !== 0.5) return Math.round(r) / m;
    return (i % 2 === 0 ? i : i + 1) / m;
  },
};

// --- Define Custom Functions ---
// Example: DATE_DIFF (simplified, assumes YYYYMMDD format)
math.import(
  {
    DATE_DIFF: (end: number, start: number) => {
      const endDate = new Date(
        String(end).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
      );
      const startDate = new Date(
        String(start).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
      );
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
  },
  { override: true }
);

// --- Generic Value Getter ---
export const getFlattenedFields = (data: any): { name: string; label: string }[] => {
  if (typeof data !== 'object' || data === null) return [];

  const flatten = (obj: any, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flatten(obj[k], pre + k));
      } else {
        const fieldName = pre + k;
        acc[fieldName] = { name: fieldName, label: fieldName };
      }
      return acc;
    }, {} as Record<string, { name: string; label: string }>);
  };

  return Object.values(flatten(data));
};

export const createExpressionValueGetter = (
  expression: string,
  roundingMode?: RoundingMode,
  decimalPlaces?: number
) => {
  return (params: ValueGetterParams) => {
    if (!params.data) return "";

    try {
      const parser = math.parser();
      // Set the row data as the scope for the parser.
      // This makes top-level properties (e.g., 'Composite') available as symbols.
      Object.keys(params.data).forEach(key => {
        parser.set(key, (params.data as any)[key]);
      });

      let result = parser.evaluate(expression);

      if (result === '#ERROR!') {
        return result;
      }

      if (
        typeof result === "number" &&
        roundingMode &&
        decimalPlaces !== undefined
      ) {
        const roundFn = roundingFunctions[roundingMode];
        if (roundFn) {
          result = roundFn(result, decimalPlaces);
        }
      }

      return result;
    } catch (e) {
      // Catch any parsing or evaluation errors
      return "#ERROR!";
    }
  };
};
