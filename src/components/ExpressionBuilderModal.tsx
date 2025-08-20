import { useState, useMemo, useRef } from 'react';
import { Modal, Button, TextInput, Text, Textarea, Group, SimpleGrid, Paper, ScrollArea, Select, NumberInput, Tooltip } from '@mantine/core';
import { generateFields } from '../utils/schemaUtils';
import type { CalculatedColumn, RoundingMode } from '../hooks/useCalculatedColumns';
import type { IBond } from '../types';
import { createExpressionValueGetter } from '../utils/expressionUtils';

const roundingModes: RoundingMode[] = ['UP', 'DOWN', 'CEILING', 'FLOOR', 'HALF_UP', 'HALF_DOWN', 'HALF_EVEN'];

const roundingModeOptions = roundingModes.map(mode => ({
  value: mode,
  label: mode.replace(/_/g, ' '),
}));

interface ExpressionBuilderModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (col: Omit<CalculatedColumn, 'id'>) => void;
  existingCol: CalculatedColumn | null;
  sampleRow: IBond;
}

const operators = ['+', '-', '*', '/', '(', ')', ',', '=', '!=', '>', '<', '>=', '<='];

export const ExpressionBuilderModal = ({ 
  opened, 
  onClose, 
  onSave, 
  existingCol, 
  sampleRow 
}: ExpressionBuilderModalProps) => {
  const [headerName, setHeaderName] = useState(existingCol?.headerName || '');
  const [expression, setExpression] = useState(existingCol?.expression || '');
  const [roundingMode, setRoundingMode] = useState<RoundingMode | undefined>(existingCol?.roundingMode);
  const [decimalPlaces, setDecimalPlaces] = useState<number | undefined>(existingCol?.decimalPlaces);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fields = useMemo(() => generateFields(sampleRow), [sampleRow]);

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = expression.substring(0, start) + text + expression.substring(end);
    setExpression(newText);
    textarea.focus();
  };

  const handleSave = () => {
    onSave({ headerName, expression, roundingMode, decimalPlaces });
  };

  const previewResult = useMemo(() => {
    if (!expression) return 'Enter an expression';
    const valueGetter = createExpressionValueGetter(expression, roundingMode, decimalPlaces);
    const result = valueGetter({ data: sampleRow } as any);
    return String(result);
  }, [expression, sampleRow, roundingMode, decimalPlaces]);

  return (
    <Modal opened={opened} onClose={onClose} title={existingCol ? 'Edit Column' : 'Add New Column'} size="80%">
      <SimpleGrid cols={2} spacing="md">
        <div>
          <Tooltip label="The name that will appear as the column header in the grid.">
            <TextInput
              label="Column Name"
              placeholder="e.g., Price Change"
              value={headerName}
              onChange={(event) => setHeaderName(event.currentTarget.value)}
              required
            />
          </Tooltip>
          <Group grow mt="sm">
            <Tooltip label="Determines how the calculated value is rounded. If not set, no rounding is applied.">
              <Select
                label="Rounding Mode"
                placeholder="Default"
                value={roundingMode}
                onChange={(value) => setRoundingMode(value as RoundingMode)}
                data={roundingModeOptions}
                clearable
              />
            </Tooltip>
            <Tooltip label="Formats the calculated value to a fixed number of decimal places.">
              <NumberInput
                label="Decimal Places"
                placeholder="e.g., 2"
                value={decimalPlaces}
                onChange={(value) => setDecimalPlaces(typeof value === 'number' ? value : undefined)}
                min={0}
                max={10}
              />
            </Tooltip>
          </Group>
          <Text size="sm" mt="md" mb="xs">Expression:</Text>
          <Group gap="xs" mb="xs">
            {operators.map(op => (
              <Button key={op} variant="outline" size="xs" onClick={() => insertText(` ${op} `)}>
                {op}
              </Button>
            ))}
          </Group>
          <Textarea
            ref={textareaRef}
            value={expression}
            onChange={(event) => setExpression(event.currentTarget.value)}
            placeholder="e.g., Composite.MidPrice - Composite.OpeningPrice"
            rows={6}
          />
          <Paper withBorder p="xs" mt="sm">
            <Text size="sm">Result (using Test Data): <strong>{previewResult}</strong></Text>
          </Paper>
        </div>
        <div>
          <Text size="sm" mb="xs">Available Fields:</Text>
          <ScrollArea style={{ height: 300 }}>
            <Paper withBorder p="xs">
              {fields.map(field => (
                <Text key={field.name} size="sm" style={{ cursor: 'pointer' }} onClick={() => insertText(field.name)}>
                  {field.label}
                </Text>
              ))}
            </Paper>
          </ScrollArea>
        </div>
      </SimpleGrid>
      <Button onClick={handleSave} mt="md" disabled={!headerName || !expression}>
        Save Column
      </Button>
    </Modal>
  );
};
