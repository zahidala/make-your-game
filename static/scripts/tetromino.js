// Grid dimensions and tetromino shapes.
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;

// Array of tetromino shapes with their corresponding classes.
// Tetromino class to represent the tetromino shape and movement on the grid.
const SHAPES = [
	{
		shape: [
			[1, 0],
			[2, 0],
			[1, 1],
			[1, 2],
		],
		class: "L-shape",
	},
	{
		shape: [
			[1, 0],
			[1, 1],
			[1, 2],
			[0, 2],
		],
		class: "J-shape",
	},
	{
		shape: [
			[1, 0],
			[2, 0],
			[1, 1],
			[2, 1],
		],
		class: "O-shape",
	},
	{
		shape: [
			[1, 0],
			[1, 1],
			[1, 2],
			[1, 3],
		],
		class: "I-shape",
	},
	{
		shape: [
			[1, 0],
			[0, 1],
			[1, 1],
			[2, 1],
		],
		class: "T-shape",
	},
	{
		shape: [
			[0, 0],
			[1, 0],
			[1, 1],
			[2, 1],
		],
		class: "Z-shape",
	},
	{
		shape: [
			[2, 0],
			[1, 0],
			[1, 1],
			[0, 1],
		],
		class: "S-shape",
	},
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
		this.currentPosition = { x: 4, y: 0 }; // Start in the middle of the grid
		this.currentRotation = 0;
		this.random = Math.floor(Math.random() * SHAPES.length);
		this.current = SHAPES[this.random];
	}

	// Convert coordinates to grid index
	getGridIndex(x, y) {
		return y * GRID_WIDTH + x;
	}

	// Draw the tetromino based on its coordinates
	draw() {
		const cells = document.querySelectorAll(".grid div");
		this.current.shape.forEach(([xOffset, yOffset]) => {
			const x = this.currentPosition.x + xOffset;
			const y = this.currentPosition.y + yOffset;
			const index = this.getGridIndex(x, y);
			cells[index].classList.add("tetromino", this.current.class);
		});
	}

	// Remove the tetromino from the grid
	undraw() {
		const cells = document.querySelectorAll(".grid div");
		this.current.shape.forEach(([xOffset, yOffset]) => {
			const x = this.currentPosition.x + xOffset;
			const y = this.currentPosition.y + yOffset;
			const index = this.getGridIndex(x, y);
			cells[index].classList.remove("tetromino", this.current.class);
		});
	}

	// Check if the tetromino can move to a new position
	isValidMove(x, y, shape) {
		return shape.every(([xOffset, yOffset]) => {
			const newX = x + xOffset;
			const newY = y + yOffset;
			const index = this.getGridIndex(newX, newY);
			const isWithinGrid = newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT;
			const cell = document.querySelector(`.grid div:nth-child(${index + 1})`);
			const isEmpty = isWithinGrid && cell && !cell.classList.contains("taken");
			return isWithinGrid && isEmpty;
		});
	}

	// Move the tetromino down
	moveDown() {
		if (this.isValidMove(this.currentPosition.x, this.currentPosition.y + 1, this.current.shape)) {
			this.undraw();
			this.currentPosition.y++;
			this.draw();
		} else {
			this.freeze();
			if (!this.isValidMove(4, 0, this.current.shape)) {
				this.gameOver();
			} else {
				this.reset();
				this.draw();
			}
		}
	}

	// Move the tetromino left
	moveLeft() {
		if (this.isValidMove(this.currentPosition.x - 1, this.currentPosition.y, this.current.shape)) {
			this.undraw();
			this.currentPosition.x--;
			this.draw();
		}
	}

	// Move the tetromino right
	moveRight() {
		if (this.isValidMove(this.currentPosition.x + 1, this.currentPosition.y, this.current.shape)) {
			this.undraw();
			this.currentPosition.x++;
			this.draw();
		}
	}

	// Rotate the tetromino
	rotate() {
		if (this.current.class === "O-shape") return; // O-shape doesn't need rotation
		const rotatedShape = this.rotateShape(this.current.shape);
		if (this.isValidMove(this.currentPosition.x, this.currentPosition.y, rotatedShape)) {
			this.undraw();
			this.current.shape = rotatedShape;
			this.draw();
		}
	}

	// Helper function to rotate a shape 90 degrees clockwise
	rotateShape(shape) {
		return shape.map(([x, y]) => [-y, x]); // Simple 90 degree rotation matrix
	}

	// Freeze the tetromino when it can't move down anymore
	freeze() {
		const cells = document.querySelectorAll(".grid div");
		this.current.shape.forEach(([xOffset, yOffset]) => {
			const x = this.currentPosition.x + xOffset;
			const y = this.currentPosition.y + yOffset;
			const index = this.getGridIndex(x, y);
			cells[index].classList.add("taken", this.current.class);
		});
		this.checkForFullRows();
		this.draw();
	}

	// Check and clear full rows
	checkForFullRows() {
		const cells = document.querySelectorAll(".grid div");
		for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
			const row = Array.from(cells).slice(y * GRID_WIDTH, (y + 1) * GRID_WIDTH);
			if (row.every(cell => cell.classList.contains("taken"))) {
				row.forEach(cell => {
					cell.classList.remove("taken", "tetromino");
				});
				// Move rows above down
				for (let j = y; j > 0; j--) {
					for (let k = 0; k < GRID_WIDTH; k++) {
						const index = j * GRID_WIDTH + k;
						const aboveIndex = (j - 1) * GRID_WIDTH + k;
						cells[index].className = cells[aboveIndex].className;
					}
				}
				// Clear the top row
				for (let k = 0; k < GRID_WIDTH; k++) {
					cells[k].className = "";
				}
				// Re-check the row in case more rows can be cleared
				y++;
			}
		}
	}

	gameOver() {
		clearInterval(this.intervalId);
	}

	gameLoop() {
		this.moveDown();
		this.intervalId = setTimeout(this.gameLoop.bind(this), 1000);
	}

	pause() {
		clearTimeout(this.intervalId);
		this.intervalId = null;
	}

	play() {
		if (!this.intervalId) {
			this.gameLoop();
		}
	}

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

	clearBoard() {
		const cells = document.querySelectorAll(".grid div");
		cells.forEach(cell => {
			cell.classList.remove("taken", "tetromino");
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
