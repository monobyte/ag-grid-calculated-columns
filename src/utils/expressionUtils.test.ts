import { describe, it, expect } from 'vitest';
import { createExpressionValueGetter, getFlattenedFields } from './expressionUtils';
import type { ValueGetterParams } from '@ag-grid-community/core';

// Mock data that mirrors the structure of the application's row data
const mockRowData = {
  RecordId: 1,
  MapldCode: 'US1234567890',
  TwBid: 100.5,
  TwAsk: 101.5,
  Composite: {
    MidPrice: 101.0,
    MidYield: 2.5,
    AnalyticsPv01: 0.05,
  },
  Instrument: {
    SecurityType: 'Bond',
    Country: 'USA',
    IssueDate: '20200101',
    MaturityDate: '20300101',
  },
};

const mockParams = { data: mockRowData } as ValueGetterParams;

describe('createExpressionValueGetter', () => {
  it('should evaluate a simple arithmetic expression', () => {
    const valueGetter = createExpressionValueGetter('TwAsk - TwBid');
    expect(valueGetter(mockParams)).toBe(1);
  });

  it('should evaluate an expression with nested properties', () => {
    const valueGetter = createExpressionValueGetter('Composite.MidPrice * 2');
    expect(valueGetter(mockParams)).toBe(202);
  });

  it('should handle rounding with HALF_UP', () => {
    const valueGetter = createExpressionValueGetter('10 / 3', 'HALF_UP', 2);
    expect(valueGetter(mockParams)).toBe(3.33);
  });

  it('should handle rounding with FLOOR', () => {
    const valueGetter = createExpressionValueGetter('3.99', 'FLOOR', 0);
    expect(valueGetter(mockParams)).toBe(3);
  });

  it('should handle rounding with CEILING', () => {
    const valueGetter = createExpressionValueGetter('3.01', 'CEILING', 0);
    expect(valueGetter(mockParams)).toBe(4);
  });

  it('should use the custom DATE_DIFF function', () => {
    const valueGetter = createExpressionValueGetter('DATE_DIFF(Instrument.MaturityDate, Instrument.IssueDate)');
    // 365 days/year * 10 years + 3 leap days (2020, 2024, 2028)
    expect(valueGetter(mockParams)).toBe(3653);
  });

  it('should return #ERROR! for an invalid expression', () => {
    const valueGetter = createExpressionValueGetter('TwBid +');
    expect(valueGetter(mockParams)).toBe('#ERROR!');
  });

  it('should return #ERROR! for a non-existent field', () => {
    const valueGetter = createExpressionValueGetter('NonExistent.Field * 2');
    expect(valueGetter(mockParams)).toBe('#ERROR!');
  });

  it('should return an empty string if params.data is missing', () => {
    const valueGetter = createExpressionValueGetter('1 + 1');
    expect(valueGetter({ data: null } as ValueGetterParams)).toBe('');
  });
});

describe('getFlattenedFields', () => {
  it('should flatten a nested object and create label/name pairs', () => {
    const fields = getFlattenedFields(mockRowData);
    const expectedFields = [
      { name: 'RecordId', label: 'RecordId' },
      { name: 'MapldCode', label: 'MapldCode' },
      { name: 'TwBid', label: 'TwBid' },
      { name: 'TwAsk', label: 'TwAsk' },
      { name: 'Composite.MidPrice', label: 'Composite.MidPrice' },
      { name: 'Composite.MidYield', label: 'Composite.MidYield' },
      { name: 'Composite.AnalyticsPv01', label: 'Composite.AnalyticsPv01' },
      { name: 'Instrument.SecurityType', label: 'Instrument.SecurityType' },
      { name: 'Instrument.Country', label: 'Instrument.Country' },
      { name: 'Instrument.IssueDate', label: 'Instrument.IssueDate' },
      { name: 'Instrument.MaturityDate', label: 'Instrument.MaturityDate' },
    ];
    expect(fields).toEqual(expect.arrayContaining(expectedFields));
    expect(fields.length).toBe(expectedFields.length);
  });

  it('should return an empty array for a non-object input', () => {
    expect(getFlattenedFields(null)).toEqual([]);
    expect(getFlattenedFields(undefined)).toEqual([]);
    expect(getFlattenedFields('string')).toEqual([]);
  });
});
