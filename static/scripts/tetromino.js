// Tetromino class to represent the tetromino shape and movement on the grid
const SHAPES = [
	{ shape: [1, 2, 11, 21], class: "L-shape" },
	{ shape: [1, 11, 21, 22], class: "J-shape" },
	{ shape: [1, 2, 11, 12], class: "O-shape" },
	{ shape: [1, 11, 21, 31], class: "I-shape" },
	{ shape: [1, 11, 12, 21], class: "T-shape" },
	{ shape: [1, 2, 10, 11], class: "Z-shape" },
	{ shape: [0, 1, 11, 12], class: "S-shape" },
];

export class Tetromino {
	// Tetromino constructor to initialize the tetromino shape and position on the grid
	// The random variable is used to randomly select a tetromino shape from the SHAPES array
	constructor() {
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
	
	// Check if the tetromino shape is at the bottom of the grid
	// If it is, return true, otherwise return false
	// isAtBottom() {
	// 	const cells = document.querySelectorAll(".grid div");
	// 	return this.current.shape.some(index => {
	// 		const nextPosition = this.currentPosition + index + 10;
	// 		return nextPosition >= 200 || cells[nextPosition].classList.contains("tetromino");
	// 	});
	// }

	// Freeze the tetromino shape on the grid by adding the tetromino class to the grid cells
	// freeze() {
	// 	const cells = document.querySelectorAll(".grid div");
	// 	this.current.shape.forEach(index => {
	// 		cells[this.currentPosition + index].classList.add("tetromino", this.current.class);
	// 	});
	// }

	// Move the tetromino down by one cell on the grid 
	// by removing the tetromino class from the grid cells and updating the current position
	moveDown() {
		// if (!this.isAtBottom()) {
		// 	this.undraw();
		// 	this.currentPosition += 10;
		// 	this.draw();
		// } else {
		// 	this.freeze();
		// }
		this.undraw();
		this.currentPosition += 10;
		this.draw();
	}

	// Move the tetromino left by one cell on the grid 
	moveLeft() {
		this.undraw();
		this.currentPosition--;
		this.draw();
	}

	// Move the tetromino right by one cell on the grid
	moveRight() {
		this.undraw();
		this.currentPosition++;
		this.draw();
	}

	// Rotate the tetromino shape on the grid by rotating the shape array and updating the current rotation
	rotate() {
		this.undraw();
		this.currentRotation = (this.currentRotation + 1) % 4;
		this.current.shape = SHAPES[this.random].shape.map(index => {
			return this.rotateShape(index, this.currentRotation);
		});
		this.draw();
	}

	// Rotate the shape array based on the current rotation and return the new index of the shape array
	rotateShape(index, rotation) {
		// Calculate the x and y coordinates of the index
		const x = index % 10;
		const y = Math.floor(index / 10);
		// Calculate the new index based on the rotation
		switch (rotation) {
			case 1:
				// Rotate 90 degrees clockwise
				return y + (3 - x) * 10;
			case 2:
				// Rotate 180 degrees clockwise
				return 3 - x + (3 - y) * 10;
			case 3:
				// Rotate 270 degrees clockwise
				return 3 - y + x * 10;
			default:
				// No rotation
				return index;
		}
	}
}

// Setup the controls for the tetromino shape on the grid
export function setupControls(tetromino) {
	document.addEventListener("keydown", e => {
		// Check if the key pressed is one of the arrow keys 
		// Call the corresponding method on the tetromino object to move the tetromino shape on the grid
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
}
