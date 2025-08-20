import { useState } from 'react';
import { Modal, Button, Table, ActionIcon, Group, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { CalculatedColumn } from '../hooks/useCalculatedColumns';
import { ExpressionBuilderModal } from '.';
import type { IBond } from '../types';

interface CalculatedColumnManagerProps {
  opened: boolean;
  onClose: () => void;
  calculatedCols: CalculatedColumn[];
  addColumn: (col: Omit<CalculatedColumn, 'id'>) => void;
  updateColumn: (id: string, updatedCol: Omit<CalculatedColumn, 'id'>) => void;
  deleteColumn: (id: string) => void;
  sampleRow: IBond;
}

export const CalculatedColumnManager = ({ 
  opened, 
  onClose, 
  calculatedCols, 
  addColumn, 
  updateColumn, 
  deleteColumn,
  sampleRow
}: CalculatedColumnManagerProps) => {
  const [builderOpened, setBuilderOpened] = useState(false);
  const [editingCol, setEditingCol] = useState<CalculatedColumn | null>(null);

  const handleAdd = () => {
    setEditingCol(null);
    setBuilderOpened(true);
  };

  const handleEdit = (col: CalculatedColumn) => {
    setEditingCol(col);
    setBuilderOpened(true);
  };

  const handleSave = (col: Omit<CalculatedColumn, 'id'>) => {
    if (editingCol) {
      updateColumn(editingCol.id, col);
    } else {
      addColumn(col);
    }
    setBuilderOpened(false);
    setEditingCol(null);
  };

  const rows = calculatedCols.map((col) => (
    <Table.Tr key={col.id}>
      <Table.Td>{col.headerName}</Table.Td>
      <Table.Td>{col.expression}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleEdit(col)}><IconPencil size={16} /></ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => deleteColumn(col.id)}><IconTrash size={16} /></ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="Calculated Column Manager" size="lg">
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Column Name</Table.Th>
              <Table.Th>Expression</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c="dimmed" ta="center">No calculated columns yet.</Text>
              </Table.Td>
            </Table.Tr>
          )}</Table.Tbody>
        </Table>
        <Button onClick={handleAdd} mt="md">Add New Column</Button>
      </Modal>

      {builderOpened && (
        <ExpressionBuilderModal 
          opened={builderOpened}
          onClose={() => setBuilderOpened(false)}
          onSave={handleSave}
          existingCol={editingCol}
          sampleRow={sampleRow}
        />
      )}
    </>
  );
};
