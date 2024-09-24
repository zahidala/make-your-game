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
	constructor() {
		this.currentPosition = 4;
		this.currentRotation = 0;
		this.random = Math.floor(Math.random() * SHAPES.length);
		this.current = SHAPES[this.random];
	}

	draw() {
		const cells = document.querySelectorAll(".grid div");
		this.current.shape.forEach(index => {
			cells[this.currentPosition + index].classList.add("tetromino", this.current.class);
		});
	}

	undraw() {
		const cells = document.querySelectorAll(".grid div");
		this.current.shape.forEach(index => {
			cells[this.currentPosition + index].classList.remove("tetromino", this.current.class);
		});
	}

	moveDown() {
		this.undraw();
		this.currentPosition += 10;
		this.draw();
	}

	moveLeft() {
		this.undraw();
		this.currentPosition--;
		this.draw();
	}

	moveRight() {
		this.undraw();
		this.currentPosition++;
		this.draw();
	}

	rotate() {
		this.undraw();
		this.currentRotation = (this.currentRotation + 1) % 4;
		this.current.shape = SHAPES[this.random].shape.map(index => {
			return this.rotateShape(index, this.currentRotation);
		});
		this.draw();
	}

	rotateShape(index, rotation) {
		const x = index % 10;
		const y = Math.floor(index / 10);
		switch (rotation) {
			case 1:
				return y + (3 - x) * 10;
			case 2:
				return 3 - x + (3 - y) * 10;
			case 3:
				return 3 - y + x * 10;
			default:
				return index;
		}
	}
}

export function setupControls(tetromino) {
	document.addEventListener("keydown", e => {
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
