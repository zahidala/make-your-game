export function createGrid() {
	// Get the grid element from the HTML document
	const grid = document.querySelector(".grid");

	// Create 200 div elements and append them to the grid element
	for (let i = 0; i < 200; i++) {
		const cell = document.createElement("div");

		// add coordinates to the div element
		cell.setAttribute("data-x", i % 10);
		cell.setAttribute("data-y", Math.floor(i / 10));

		// add bounds to the edges of the grid
		if (i < 10 || i >= 190 || i % 10 === 0 || i % 10 === 9) {
			cell.setAttribute("data-bound", "true");
		}

		grid.appendChild(cell);
	}
}
