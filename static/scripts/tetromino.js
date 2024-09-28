// Grid dimensions and tetromino shapes.
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;

// Array of tetromino shapes with their corresponding classes.
// Tetromino class to represent the tetromino shape and movement on the grid.
const SHAPES = [
	{ shape: [1, 2, 11, 21], class: "L-shape" },
	{ shape: [1, 11, 21, 22], class: "J-shape" },
	{ shape: [1, 2, 11, 12], class: "O-shape" },
	{ shape: [1, 11, 21, 31], class: "I-shape" },
	{ shape: [1, 11, 12, 21], class: "T-shape" },
	{ shape: [1, 2, 10, 11], class: "Z-shape" },
	{ shape: [0, 1, 11, 12], class: "S-shape" },
];

// Tetromino class definition with methods for drawing, undrawing, and moving the tetromino.
export class Tetromino {
	// Tetromino constructor to initialize the tetromino shape and position on the grid
	// The random variable is used to randomly select a tetromino shape from the SHAPES array
	constructor() {
		this.reset();
		this.intervalId = null;
	}

	// Reset the tetromino to its initial state.
	reset() {
		this.currentPosition = 4;
		this.currentRotation = 0;
		this.random = Math.floor(Math.random() * SHAPES.length);
		this.current = SHAPES[this.random];
	}

	// Draw the tetromino shape on the grid by adding the tetromino class to the grid cells
	draw() {
		const cells = document.querySelectorAll(".grid div");
		this.current.shape.forEach(index => {
			cells[this.currentPosition + index].classList.add("tetromino", this.current.class);
		});
	}

	// Undraw the tetromino shape from the grid by removing the tetromino class from the grid cells
	undraw() {
		const cells = document.querySelectorAll(".grid div");
		this.current.shape.forEach(index => {
			cells[this.currentPosition + index].classList.remove("tetromino", this.current.class);
		});
	}

	isValidMove(position, rotation) {
		const cells = document.querySelectorAll(".grid div");
		return this.current.shape.every(index => {
			const newIndex = this.rotateShape(index, rotation) + position; // Calculate the new index of the shape array based on the current rotation
			const validPosition = newIndex >= 0 && newIndex < GRID_SIZE; // Check if the new index is within the grid bounds
			const isAvailable = validPosition && !cells[newIndex].classList.contains("taken"); // Check if the new index is available (not taken)
			const isWithinGrid = Math.floor(newIndex % GRID_WIDTH) - Math.floor(position % GRID_WIDTH) < 4; // Check if the new index is within the grid bounds
			return validPosition && isAvailable && isWithinGrid;
		});
	}

	// Move the tetromino down by one row on the grid
	// by removing the tetromino class from the grid cells and updating the current position
	moveDown() {
		if (this.isValidMove(this.currentPosition + GRID_WIDTH, this.currentRotation)) {
			this.undraw();
			this.currentPosition += GRID_WIDTH;
			this.draw();
		} else {
			this.freeze();
			this.reset();
			if (!this.isValidMove(this.currentPosition, this.currentRotation)) {
				this.gameOver();
			}
		}
	}

	// Move the tetromino left by one column on the grid.
	moveLeft() {
		if (this.isValidMove(this.currentPosition - 1, this.currentRotation)) {
			this.undraw();
			this.currentPosition--;
			this.draw();
		}
	}

	// Move the tetromino right by one column on the grid.
	moveRight() {
		if (this.isValidMove(this.currentPosition + 1, this.currentRotation)) {
			this.undraw();
			this.currentPosition++;
			this.draw();
		}
	}

	// Rotate the tetromino clockwise on the grid
	// by rotating the shape array and updating the current rotation.
	rotate() {
		if (this.current.class === "O-shape") return;

		const nextRotation = (this.currentRotation + 1) % 4;
		if (this.isValidMove(this.currentPosition, nextRotation)) {
			this.undraw();
			this.currentRotation = nextRotation;
			this.current.shape = SHAPES[this.random].shape.map(index => this.rotateShape(index, this.currentRotation));
			this.draw();
		}
	}

	// Freeze the tetromino on the grid.
	freeze() {
		const cells = document.querySelectorAll(".grid div");
		this.current.shape.forEach(index => {
			cells[this.currentPosition + index].classList.add("taken");
		});
		this.checkForFullRows();
	}

	// Check for full rows and remove them.
	checkForFullRows() {
		const cells = document.querySelectorAll(".grid div");
		for (let i = 0; i < GRID_HEIGHT; i++) {
			const row = Array.from(cells).slice(i * GRID_WIDTH, (i + 1) * GRID_WIDTH);
			if (row.every(cell => cell.classList.contains("taken"))) {
				row.forEach(cell => {
					cell.classList.remove("taken");
					cell.classList.remove("tetromino");
					cell.className = "";
				});
				const removedRow = cells.splice(i * GRID_WIDTH, GRID_WIDTH);
				cells.unshift(...removedRow);
				cells.forEach(cell => document.querySelector(".grid").appendChild(cell));
			}
		}
	}

	// Game over logic.
	gameOver() {
		clearInterval(this.intervalId);
	}

	// Helper function to rotate the tetromino shape.
	// Rotate the shape array based on the current rotation and return the new index of the shape array.
	rotateShape(index, rotation) {
		// Calculate the x and y coordinates of the index.
		const x = index % 10;
		const y = Math.floor(index / 10);
		// Calculate the new index of the shape array based on the current rotation.
		switch (rotation) {
			case 1:
				// Rotate the shape array 90 degrees clockwise.
				return y + (3 - x) * 10;
			case 2:
				// Rotate the shape array 180 degrees clockwise.
				return 3 - x + (3 - y) * 10;
			case 3:
				// Rotate the shape array 270 degrees clockwise.
				return 3 - y + x * 10;
			default:
				// Return the original index if the rotation is not 0, 1, 2, or 3.
				// No rotation.
				return index;
		}
	}

	// Game loop to control the tetromino movement.
	gameLoop() {
		this.moveDown();
		this.intervalId = setTimeout(this.gameLoop.bind(this), 1000);
	}

	// pause() {
	// 	if (!this.timeoutId) return;
	// 	clearTimeout(this.timeoutId); // Clear the timeout using the stored ID
	// 	this.timeoutId = null; // Reset the timeout ID
	// }

	// Pause the game
	pause() {
		clearTimeout(this.intervalId);
		this.intervalId = null;
	}

	// play() {
	// 	if (this.timeoutId) return;
	// 	this.timeoutId = setTimeout(this.gameLoop.bind(this), 1000); // Set the timeout and store the ID
	// }

	// Resume the game
	play() {
		if (!this.intervalId) {
			this.gameLoop();
		}
	}

	// retry() {
	// 	this.undraw();
	// 	this.currentPosition = 4;
	// 	this.currentRotation = 0;
	// 	this.random = Math.floor(Math.random() * SHAPES.length);
	// 	this.current = SHAPES[this.random];
	// 	this.draw();
	// }

	// Retry the game
	retry() {
		this.clearBoard();
		this.undraw();
		this.reset();
		this.draw();
		if (this.intervalId) {
			clearTimeout(this.intervalId);
		}
		this.gameLoop();
	}

	// Clear the game board.
	clearBoard() {
		const cells = document.querySelectorAll(".grid div");
		cells.forEach(cell => {
			cell.classList.remove("taken");
			cell.classList.remove("tetromino");
			cell.className = "";
		});
	}
}

// Function to set up event listeners for game controls for the tetromino.
export function setupControls(tetromino) {
	document.addEventListener("keydown", e => {
		// Check if the key pressed is one of the arrow keys.
		// Call the corresponding method on the tetromino object to move the tetromino shape on the grid.
		switch (e.key) {
			case "ArrowLeft":
				tetromino.moveLeft();
				break;
			case "ArrowRight":
				tetromino.moveRight();
				break;
			case "ArrowDown":
				tetromino.moveDown();
				break;
			case "ArrowUp":
				tetromino.rotate();
				break;
		}
	});

	// Create an object with button IDs and corresponding actions.
	const buttons = {
		"move-left": tetromino.moveLeft,
		"move-right": tetromino.moveRight,
		"move-down": tetromino.moveDown,
		"rotate-left": tetromino.rotate,
		pause: tetromino.pause,
		play: tetromino.play,
		retry: tetromino.retry,
	};

	// Add event listeners to the buttons with the corresponding actions.
	Object.entries(buttons).forEach(([id, action]) => {
		const button = document.getElementById(id);
		button.addEventListener("click", () => action.call(tetromino));
	});
}
