# AG-Grid Calculated Columns Demo

This is a React application demonstrating a powerful, user-configurable calculated column feature for AG-Grid. It allows users to define custom columns on the fly using mathematical expressions, with support for advanced formatting and persistence.

## Features

- **Dynamic Calculated Columns**: Add, edit, and delete custom columns in the grid.
- **Custom Expression Builder**: A user-friendly modal for creating and editing expressions.
- **Free-Form Input**: Utilizes a textarea for flexible, complex mathematical and logical expressions, powered by `mathjs`.
- **Result Formatting**: Apply rounding modes (e.g., `HALF_UP`, `FLOOR`) and set a fixed number of decimal places for calculated values.
- **Live Preview**: See the result of your expression instantly based on a sample row of data.
- **State Persistence**: Your custom column configurations are saved to `localStorage` and reloaded on subsequent visits.
- **Robust Error Handling**: Invalid expressions are handled gracefully, displaying `#ERROR!` in cells without crashing or polluting the console.

## Tech Stack

- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Grid**: AG-Grid Community
- **UI Components**: Mantine UI
- **Expression Parsing**: `mathjs`

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm (or your preferred package manager)

### Installation

1.  Clone the repository:
    ```sh
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```sh
    cd my-ag-grid-app
    ```
3.  Install the dependencies:
    ```sh
    pnpm install
    ```

### Running the Application

To start the development server, run:

```sh
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build, run:

```sh
pnpm build
```

The output files will be located in the `dist/` directory.
