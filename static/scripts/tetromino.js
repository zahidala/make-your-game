// Tetromino class to represent the tetromino shape and movement on the grid
const gridWidth = 10;
const gridHeight = 20;
const gridSize = gridWidth * gridHeight;
const BLOCKS = [
	{
		shape: [
			[0, 1, gridWidth, gridWidth + 1],
			[0, 1, gridWidth, gridWidth + 1],
			[0, 1, gridWidth, gridWidth + 1],
			[0, 1, gridWidth, gridWidth + 1],
		],
		class: "O-shape",
	},

	{
		shape: [
			[1, gridWidth + 1, gridWidth * 2 + 1, gridWidth * 3 + 1],
			[gridWidth, gridWidth + 1, gridWidth + 2, gridWidth + 3],
			[1, gridWidth + 1, gridWidth * 2 + 1, gridWidth * 3 + 1],
			[gridWidth, gridWidth + 1, gridWidth + 2, gridWidth + 3],
		],
		class: "I-shape",
	},

	{
		shape: [
			[1, gridWidth, gridWidth + 1, gridWidth + 2],
			[1, gridWidth + 1, gridWidth + 2, gridWidth * 2 + 1],
			[gridWidth, gridWidth + 1, gridWidth + 2, gridWidth * 2 + 1],
			[1, gridWidth, gridWidth + 1, gridWidth * 2 + 1],
		],
		class: "T-shape",
	},

	{
		shape: [
			[1, gridWidth + 1, gridWidth * 2 + 1, 2],
			[gridWidth, gridWidth + 1, gridWidth + 2, gridWidth * 2 + 2],
			[1, gridWidth + 1, gridWidth * 2 + 1, gridWidth * 2],
			[gridWidth, gridWidth * 2, gridWidth * 2 + 1, gridWidth * 2 + 2],
		],
		class: "L-shape",
	},
	// { shape: [1, 11, 12, 21], class: "J-shape" },
	{
		shape: [
			[0, gridWidth, gridWidth + 1, gridWidth * 2 + 1],
			[gridWidth + 1, gridWidth + 2, gridWidth * 2, gridWidth * 2 + 1],
			[0, gridWidth, gridWidth + 1, gridWidth * 2 + 1],
			[gridWidth + 1, gridWidth + 2, gridWidth * 2, gridWidth * 2 + 1],
		],
		class: "Z-shape",
	},
	// { shape: [0, 1, 11, 12], class: "S-shape" },
];

export class Tetromino {
	// Tetromino constructor to initialize the tetromino shape and position on the grid
	// The random variable is used to randomly select a tetromino shape from the BLOCKS array
	constructor() {
		this.currentIndex = 0;
		this.currentPosition = 4;
		this.currentRotation = 0;
		this.random = Math.floor(Math.random() * BLOCKS.length); //length being the number of items in the array
		this.current = BLOCKS[this.random][this.currentRotation];
		this.timeoutId = null;
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

	gameLoop() {
		this.moveDown();
		setTimeout(this.gameLoop.bind(this), 1000);
	}

	moveDown() {
		this.undraw();
		this.currentPosition = this.currenPosition += gridWidth;
		this.draw();
		this.freeze();
	}

	moveLeft() {
		this.undraw();
		const isAtLeftEdge = this.current.some(index => (this.currentPosition + index) % gridWidth === 0);
		if (!isAtLeftEdge) this.currentPosition -= 1;
		if (this.current.some(index => cells[this.currentPosition + index].classList.contains("block2"))) {
			this.currentPosition += 1;
		}
		this.draw();
	}

	moveRight() {
		this.undraw();
		const isAtRightEdge = this.current.some(index => (this.currentPosition + index) % gridWidth === gridWidth - 1);
		if (!isAtRightEdge) this.currentPosition += 1;
		if (this.current.some(index => cells[this.currentPosition + index].classList.contains("block2"))) {
			this.currentPosition -= 1;
		}
		this.draw();
	}

	rotate() {
		if (this.current.class === "O-shape") return;

		this.undraw();
		this.currentRotation++;
		if (this.currentRotation === this.current.length) this.currentRotation = 0;
		this.current = BLOCKS[this.random][this.currentRotation];
		this.draw();
	}

	pause() {
		if (!this.timeoutId) return;

		clearTimeout(this.timeoutId); // Clear the timeout using the stored ID
		this.timeoutId = null; // Reset the timeout ID
	}

	play() {
		if (this.timeoutId) return;

		this.timeoutId = setTimeout(this.gameLoop.bind(this), 1000); // Set the timeout and store the ID
	}

	retry() {
		this.undraw();
		this.currentPosition = 4;
		this.currentRotation = 0;
		this.random = Math.floor(Math.random() * SHAPES.length);
		this.current = SHAPES[this.random];
		this.draw();
	}

	freeze() {
		if (this.current.some(index => cells[this.currentPosition + index + gridWidth].classList.contains("block3") || cells[this.currentPosition + index + gridwidth].classList.contains("block2"))) {
			this.current.forEach(index => cells[index + this.currentPosition].classList.add("block2"));
			this.random = this.nextRandom;
			this.nextRandom = Math.floor(Math.random() * BLOCKS.length);
			this.current = BLOCKS[this.random][this.currentRotation];
			this.currentPosition = 4;
			this.draw();
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
			case " ":
				game.hardDrop();
				break;
		}
	});

	const buttons = {
		"move-left": tetromino.moveLeft,
		"move-right": tetromino.moveRight,
		"move-down": tetromino.moveDown,
		"rotate-left": tetromino.rotate,
		pause: tetromino.pause,
		play: tetromino.play,
		retry: tetromino.retry,
	};

	Object.entries(buttons).forEach(([id, action]) => {
		const button = document.getElementById(id);
		button.addEventListener("click", () => action.call(tetromino));
	});
}
