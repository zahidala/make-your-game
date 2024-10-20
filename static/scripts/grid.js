// export function createGrid() {
// Get the grid element from the HTML document
let board = document.querySelector(".board-section");

// Create 200 div elements and append them to the grid element
for (let i = 0; i < 200; i++) {
	let block = document.createElement("div");
	block.classList.add("block");
	board.appendChild(block);
}
