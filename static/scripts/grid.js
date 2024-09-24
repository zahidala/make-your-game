export function createGrid() {
  const grid = document.querySelector('.grid');
  
  for (let i = 0; i < 200; i++) {
    const cell = document.createElement('div');
    grid.appendChild(cell);
  }
}