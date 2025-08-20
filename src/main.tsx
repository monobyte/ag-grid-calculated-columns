import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// AG Grid styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import './index.css';
import App from './App.tsx';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const theme = createTheme({
  /** Put your mantine theme override here */
});

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
  <Notifications position="top-right" />
  <App />
</MantineProvider>,
)
