export function createGrid() {
  // Get the grid element from the HTML document
  const grid = document.querySelector('.grid');

  // Create 200 div elements and append them to the grid element
  for (let i = 0; i < 200; i++) {
    const cell = document.createElement('div');
    grid.appendChild(cell);
  }
}
