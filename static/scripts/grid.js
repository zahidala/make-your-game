document.addEventListener('DOMContentLoaded', () => {
    const gridWidth = 10;
    const gridHeight = 20;
    const gridSize = gridWidth * gridHeight;

    const grid = createGrid();
    let squares = Array.from(grid.querySelectorAll('div'));
});

function createGrid() {
    // Create the main grid
    let grid = document.querySelector('.grid');
    for (let i = 0; i < gridSize; i++) {
        let gridElement = document.createElement('div');
        grid.appendChild(gridElement);
    }

    // Create the border of the grid
    let border = document.createElement('div');
    border.classList.add('border');
    grid.appendChild(border);
    for (let i = 0; i < gridSize; i++) {
        let borderElement = document.createElement('div');
        border.appendChild(borderElement);
    }

    // Since 16 is the max grid size in which all the tetrominos can fit, we can use it to calculate the size of the grid
    let previousGrid = document.querySelector('.previous-grid');
    for (let i = 0; i < 16; i++) {
        let gridElement = document.createElement('div');
        previousGrid.appendChild(gridElement);
    }

    return grid;
}

export { gridWidth, gridHeight, gridSize, grid, squares };
