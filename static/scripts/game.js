let field = document.getElementsByClassName("block");
let nextPieces = [];
let holdPiece = null;
let canHold = true;

// INITIAL NEW GRID
const newGrid = (width, height) => {
	let grid = new Array(height);
	for (let i = 0; i < height; i++) {
		grid[i] = new Array(width);
	}

	let index = 0;
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			grid[i][j] = {
				index: index++,
				value: 0,
			};
		}
	}

	return {
		board: grid,
		width: width,
		height: height,
	};
};

const highScore = parseInt(localStorage.getItem("highScore"));

let game = {
	score: START_SCORE,
	high: highScore || 0,
	speed: START_SPEED,
	level: 1,
	lives: START_LIVES,
	state: GAME_STATE.END,
	startTime: null,
	elapsedTime: null,
	finalTime: null,
	timerRequestId: null,
	gameLoopRequestId: null,
	lastUpdateTime: 0,
};

let grid = newGrid(GRID_WIDTH, GRID_HEIGHT);

let tetromino = null;

let score_span = document.querySelector("#score");
let level_span = document.querySelector("#level");
let highScoreSpan = document.querySelector("#high");

score_span.innerHTML = game.score;
highScoreSpan.innerHTML = game.high;

// RESET GRID
const resetGrid = grid => {
	for (let i = 0; i < grid.height; i++) {
		// row
		for (let j = 0; j < grid.width; j++) {
			// col
			grid.board[i][j].value = 0;
		}
	}

	// RESET FIELD BACKGROUND COLOR
	Array.from(field).forEach(e => {
		e.style.background = TRANSPARENT;
	});
};

// CREATE NEW TETROMINO
const newTetromino = (blocks, colors, start_x, start_y) => {
	let index = Math.floor(Math.random() * blocks.length);

	return {
		block: JSON.parse(JSON.stringify(blocks[index])),
		color: colors[index],
		x: start_x,
		y: start_y,
	};
};

// DRAW TETROMINO ON GRID
const drawTetromino = (tetromino, grid) => {
	tetromino.block.forEach((row, i) => {
		row.forEach((value, j) => {
			let x = tetromino.x + i;
			let y = tetromino.y + j;
			if (value > 0) {
				field[grid.board[x][y].index].style.background = tetromino.color;
			}
		});
	});
};

// DRAW GHOST TETROMINO ON GRID
const drawGhostTetromino = (tetromino, grid) => {
	let ghostTetromino = calculateGhostPosition(tetromino, grid);
	ghostTetromino.block.forEach((row, i) => {
		row.forEach((value, j) => {
			let x = ghostTetromino.x + i;
			let y = ghostTetromino.y + j;
			if (value > 0 && grid.board[x][y].value === 0) {
				field[grid.board[x][y].index].style.background = "rgba(255, 255, 255, 0.2)";
			}
		});
	});
};

// CLEAR TETROMINO ON GRID
const clearTetromino = (tetromino, grid) => {
	tetromino.block.forEach((row, i) => {
		row.forEach((value, j) => {
			let x = tetromino.x + i;
			let y = tetromino.y + j;
			if (value > 0) {
				field[grid.board[x][y].index].style.background = TRANSPARENT;
			}
		});
	});
};

const clearGhostTetromino = (tetromino, grid) => {
	let ghostTetromino = calculateGhostPosition(tetromino, grid);
	ghostTetromino.block.forEach((row, i) => {
		row.forEach((value, j) => {
			let x = ghostTetromino.x + i;
			let y = ghostTetromino.y + j;
			if (value > 0 && grid.board[x][y].value === 0) {
				field[grid.board[x][y].index].style.background = TRANSPARENT;
			}
		});
	});
};

// CHECK IF FIELD IS IN GRID
const isInGrid = (x, y, grid) => {
	return x < grid.height && x >= 0 && y >= 0 && y < grid.width;
};

// CHECK IF FIELD IS FILLED
const isFilled = (x, y, grid) => {
	if (!isInGrid(x, y, grid)) {
		return false;
	} else {
		return grid.board[x][y].value !== 0;
	}
};

// CHECK IF TETROMINO IS MOVABLE
const movable = (tetromino, grid, direction) => {
	let newX = tetromino.x;
	let newY = tetromino.y;

	switch (direction) {
		case DIRECTION.DOWN:
			newX = tetromino.x + 1;
			break;
		case DIRECTION.LEFT:
			newY = tetromino.y - 1;
			break;
		case DIRECTION.RIGHT:
			newY = tetromino.y + 1;
			break;
	}

	return tetromino.block.every((row, i) => {
		return row.every((value, j) => {
			let x = newX + i;
			let y = newY + j;
			return value === 0 || (isInGrid(x, y, grid) && !isFilled(x, y, grid));
		});
	});
};

// MOVE TETROMINO DOWN
const moveDown = (tetromino, grid) => {
	if (!movable(tetromino, grid, DIRECTION.DOWN)) return;
	clearTetromino(tetromino, grid);
	clearGhostTetromino(tetromino, grid);
	tetromino.x++;
	drawGhostTetromino(tetromino, grid);
	drawTetromino(tetromino, grid);
};

// MOVE TETROMINO LEFT
const moveLeft = (tetromino, grid) => {
	if (!movable(tetromino, grid, DIRECTION.LEFT)) return;
	clearTetromino(tetromino, grid);
	clearGhostTetromino(tetromino, grid);
	tetromino.y--;
	drawGhostTetromino(tetromino, grid);
	drawTetromino(tetromino, grid);
};

// MOVE TETROMINO RIGHT
const moveRight = (tetromino, grid) => {
	if (!movable(tetromino, grid, DIRECTION.RIGHT)) return;
	clearTetromino(tetromino, grid);
	clearGhostTetromino(tetromino, grid);
	tetromino.y++;
	drawGhostTetromino(tetromino, grid);
	drawTetromino(tetromino, grid);
};

// CHECK IF TETROMINO IS ROTATABLE
const rotatable = (tetromino, grid) => {
	// CLONE TETROMINO
	let cloneBlock = JSON.parse(JSON.stringify(tetromino.block));

	// ROTATE CLONED TETROMINO
	for (let y = 0; y < cloneBlock.length; y++) {
		for (let x = 0; x < y; ++x) {
			[cloneBlock[x][y], cloneBlock[y][x]] = [cloneBlock[y][x], cloneBlock[x][y]];
		}
	}
	cloneBlock.forEach(row => row.reverse());

	// CHECK IF ROTATED TETROMINO IS MOVABLE
	return cloneBlock.every((row, i) => {
		return row.every((value, j) => {
			let x = tetromino.x + i;
			let y = tetromino.y + j;
			return value === 0 || (isInGrid(x, y, grid) && !isFilled(x, y, grid));
		});
	});
};

// ROTATE TETROMINO CLOCKWISE
const rotate = (tetromino, grid) => {
	if (!rotatable(tetromino, grid)) return;
	clearTetromino(tetromino, grid);
	clearGhostTetromino(tetromino, grid);
	for (let y = 0; y < tetromino.block.length; y++) {
		for (let x = 0; x < y; ++x) {
			[tetromino.block[x][y], tetromino.block[y][x]] = [tetromino.block[y][x], tetromino.block[x][y]];
		}
	}
	tetromino.block.forEach(row => row.reverse());
	drawGhostTetromino(tetromino, grid);
	drawTetromino(tetromino, grid);
};

// HARD DROP TETROMINO
const hardDrop = (tetromino, grid) => {
	clearTetromino(tetromino, grid);
	while (movable(tetromino, grid, DIRECTION.DOWN)) {
		tetromino.x++;
	}
	drawTetromino(tetromino, grid);
};

// GHOST TETROMINO - GUIDE TO FALLING TETROMINO POSITION
const calculateGhostPosition = (tetromino, grid) => {
	let ghostTetromino = JSON.parse(JSON.stringify(tetromino));
	while (movable(ghostTetromino, grid, DIRECTION.DOWN)) {
		ghostTetromino.x++;
	}
	return ghostTetromino;
};

// UPGRADE GRID WHEN TETROMINO IS DROPPED
const updateGrid = (tetromino, grid) => {
	tetromino.block.forEach((row, i) => {
		row.forEach((value, j) => {
			let x = tetromino.x + i;
			let y = tetromino.y + j;
			if (value > 0 && isInGrid(x, y, grid)) {
				grid.board[x][y].value = value;
			}
		});
	});
};

// CHECK IF ROW IS FILLED
const checkFilledRow = row => {
	return row.every(v => {
		return v.value !== 0;
	});
};

// DELETE FILLED ROW AND UPDATE SCORE
const deleteRow = (row_index, grid) => {
	for (let row = row_index; row > 0; row--) {
		for (let col = 0; col < 10; col++) {
			grid.board[row][col].value = grid.board[row - 1][col].value;
			let value = grid.board[row][col].value;
			// UPDATE FIELD BACKGROUND COLOR
			field[grid.board[row][col].index].style.background = value === 0 ? TRANSPARENT : COLORS[value - 1];
		}
	}
};

// CHECK GRID FOR FILLED ROW/ROW TO DELETE
const checkGrid = grid => {
	let row_count = 0;
	grid.board.forEach((row, i) => {
		if (checkFilledRow(row)) {
			deleteRow(i, grid);
			row_count++;
		}
	});
	if (row_count > 0) updateGame(row_count);
};

const generateNextPieces = () => {
	while (nextPieces.length < 3) {
		nextPieces.push(newTetromino(BLOCKS, COLORS, START_X, START_Y));
	}
};

const updateNextQueue = () => {
	for (let i = 0; i < 3; i++) {
		const nextPieceElement = document.querySelector(`#next-piece-${i + 1}`);
		nextPieceElement.innerHTML = "";
		if (nextPieces[i]) {
			const piece = nextPieces[i];
			const maxSize = Math.max(piece.block.length, piece.block[0].length);
			nextPieceElement.style.gridTemplateColumns = `repeat(${maxSize}, 1fr)`;
			nextPieceElement.style.gridTemplateRows = `repeat(${maxSize}, 1fr)`;

			for (let j = 0; j < maxSize; j++) {
				for (let k = 0; k < maxSize; k++) {
					const block = document.createElement("div");
					if (piece.block[j] && piece.block[j][k] > 0) {
						block.style.backgroundColor = piece.color;
						block.classList.add("tetromino-block");
					}
					nextPieceElement.appendChild(block);
				}
			}
		}
	}
};

const updateHoldQueue = () => {
	const holdPieceElement = document.querySelector(".hold-piece");
	holdPieceElement.innerHTML = "";
	if (holdPiece) {
		const maxSize = Math.max(holdPiece.block.length, holdPiece.block[0].length);
		holdPieceElement.style.gridTemplateColumns = `repeat(${maxSize}, 1fr)`;
		holdPieceElement.style.gridTemplateRows = `repeat(${maxSize}, 1fr)`;

		for (let i = 0; i < maxSize; i++) {
			for (let j = 0; j < maxSize; j++) {
				const block = document.createElement("div");
				if (holdPiece.block[i] && holdPiece.block[i][j] > 0) {
					block.style.backgroundColor = holdPiece.color;
					block.classList.add("tetromino-block");
				}
				holdPieceElement.appendChild(block);
			}
		}
	}
};

const holdCurrentPiece = () => {
	if (!canHold) return;

	clearTetromino(tetromino, grid);
	clearGhostTetromino(tetromino, grid);

	if (holdPiece === null) {
		holdPiece = tetromino;
		tetromino = nextPieces.shift();
		generateNextPieces();
	} else {
		const temp = holdPiece;
		holdPiece = tetromino;
		tetromino = temp;
		tetromino.x = START_X;
		tetromino.y = START_Y;
	}

	canHold = false;
	updateHoldQueue();
	updateNextQueue();
	drawGhostTetromino(tetromino, grid);
	drawTetromino(tetromino, grid);
};

const updateLivesDisplay = ({ reset = false } = {}) => {
	const lives = document.querySelector(".lives");

	// Reset lives display
	if (reset) {
		lives.innerHTML = "";
		for (let i = 0; i < game.lives; i++) {
			lives.innerHTML += "<span class='life'>❤️</span>";
		}
	} else {
		// Update lives display
		const fullHeart = lives.querySelector(".life:not(.empty)");
		if (fullHeart) {
			fullHeart.textContent = "🖤";
			fullHeart.classList.add("empty");
		}
	}
};

const updateTimer = () => {
	if (game.state === GAME_STATE.PLAY) {
		const now = new Date();
		const elapsedTime = now - game.startTime;
		game.elapsedTime = elapsedTime;
		const hours = Math.floor(elapsedTime / 3600000);
		const minutes = Math.floor((elapsedTime % 3600000) / 60000);
		const seconds = Math.floor((elapsedTime % 60000) / 1000);

		const formattedHours = String(hours).padStart(2, "0");
		const formattedMinutes = String(minutes).padStart(2, "0");
		const formattedSeconds = String(seconds).padStart(2, "0");

		// Format time as 00:00:00
		let timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

		document.querySelector("#time").innerHTML = timeString;

		// Request the next frame
		game.timerRequestId = requestAnimationFrame(updateTimer);
	}
};

const requestNextFrame = () => {
	game.gameLoopRequestId = requestAnimationFrame(gameLoop);
};

const handleLifeLoss = () => {
	game.lives--;
	updateLivesDisplay();

	if (game.lives > 0) {
		resetGrid(grid);
		tetromino = newTetromino(BLOCKS, COLORS, START_X, START_Y);
		drawTetromino(tetromino, grid);
	} else {
		endGame();
	}
};

const handleTetrominoLanding = () => {
	updateGrid(tetromino, grid);
	checkGrid(grid);
	tetromino = nextPieces.shift();
	generateNextPieces();
	updateNextQueue();
	canHold = true;

	if (movable(tetromino, grid, DIRECTION.DOWN)) {
		drawTetromino(tetromino, grid);
		drawGhostTetromino(tetromino, grid);
	} else {
		handleLifeLoss();
	}
};

const gameLoop = timestamp => {
	if (game.state !== GAME_STATE.PLAY) return;

	if (!game.lastUpdateTime) game.lastUpdateTime = timestamp;
	const elapsedTime = timestamp - game.lastUpdateTime;

	if (elapsedTime <= game.speed) {
		requestNextFrame();
		return;
	}

	if (movable(tetromino, grid, DIRECTION.DOWN)) {
		moveDown(tetromino, grid);
	} else {
		handleTetrominoLanding();
	}

	game.lastUpdateTime = timestamp;
	requestNextFrame();
};

const endGame = () => {
	if (!highScore || game.score > highScore) {
		localStorage.setItem("highScore", game.score);
	}

	game.state = GAME_STATE.END;
	game.finalTime = document.querySelector("#time").innerHTML;

	let body = document.querySelector("body");
	body.classList.remove("play");

	document.querySelector(".main-menu-container").setAttribute("style", "display: none");
	document.querySelector(".background-image").setAttribute("style", "filter: contrast(130%) sepia(100%) blur(3px)");
	document.querySelector(".main-menu-container.game-over").setAttribute("style", "display: flex");

	document.getElementById("result-time").innerHTML = game.finalTime;
	document.getElementById("result-score").innerHTML = game.score;
	document.getElementById("result-high-score").innerHTML = game.high;
	document.getElementById("result-level").innerHTML = game.level;
};

const gameStart = () => {
	game.state = GAME_STATE.PLAY;
	game.startTime = new Date();
	level_span.innerHTML = "1";
	score_span.innerHTML = "0";
	generateNextPieces();
	tetromino = nextPieces.shift();
	generateNextPieces();
	updateNextQueue();
	updateHoldQueue();
	drawTetromino(tetromino, grid);
	drawGhostTetromino(tetromino, grid);
	game.lastUpdateTime = 0;
	game.gameLoopRequestId = requestAnimationFrame(gameLoop);
	game.timerRequestId = requestAnimationFrame(updateTimer);

	document.body.classList.add("play");
	document.querySelector(".main-menu-container").setAttribute("style", "display: none");
};

const updateGame = row_count => {
	game.score += row_count * MAIN_SCORE + (row_count - 1) * BONUS_SCORE;

	game.level = Math.floor(game.score / 800) + 1;

	let new_speed = game.speed < 200 ? 50 : START_SPEED - game.level * 50;

	if (new_speed !== game.speed) {
		game.speed = new_speed;
	}

	level_span.innerHTML = game.level;
	score_span.innerHTML = game.score;
};

const gamePause = () => {
	game.state = GAME_STATE.PAUSE;
	cancelAnimationFrame(game.timerRequestId); // Stop the timer
	cancelAnimationFrame(game.gameLoopRequestId); // Stop the game loop

	const dialog = document.querySelector("#pauseDialog");
	dialog.showModal();

	const resumeButton = dialog.querySelector("#resumeButton");

	resumeButton.addEventListener("click", gameResume);

	const quitButton = dialog.querySelector("#quitButton");

	quitButton.addEventListener("click", () => {
		gameReset();
		document.querySelector(".main-menu-container").setAttribute("style", "display: flex");
		document.querySelector(".main-menu-container.game-over").setAttribute("style", "display: none");
		document.querySelector(".background-image").setAttribute("style", "filter: contrast(130%) sepia(70%) blur(3px)");
		dialog.close();
		document.body.classList.remove("pause");
	});
};

const gameResume = () => {
	game.state = GAME_STATE.PLAY;
	game.startTime = new Date(new Date() - game.elapsedTime); // Adjust start time
	game.timerRequestId = requestAnimationFrame(updateTimer); // Resume the timer
	game.gameLoopRequestId = requestAnimationFrame(gameLoop); // Resume the game loop
	const body = document.querySelector("body");
	body.classList.add("play");
	body.classList.remove("pause");
	const dialog = document.querySelector("#pauseDialog");
	dialog.close();
};

const gameReset = () => {
	cancelAnimationFrame(game.gameLoopRequestId);
	cancelAnimationFrame(game.timerRequestId); // Clear the timer interval
	resetGrid(grid);
	game.score = START_SCORE;
	game.speed = START_SPEED;
	game.state = GAME_STATE.END;
	game.level = 1;
	game.lives = START_LIVES;
	game.finalTime = null;
	game.startTime = null;
	game.elapsedTime = null;
	updateLivesDisplay({ reset: true });
	game.gameLoopRequestId = null;
	game.timerRequestId = null; // Reset the timer interval
	tetromino = null;
	holdPiece = null;
	document.querySelector("#time").innerHTML = "00:00:00"; // Reset timer display
};

const continueGame = () => {
	if (game.state === GAME_STATE.PAUSE) {
		gameResume();
	}
	document.body.classList.add("play");
};

// add keyboard event
document.addEventListener("keydown", e => {
	let body = document.querySelector("body");
	e.preventDefault();
	let key = e.which;
	switch (key) {
		case KEY.DOWN:
			moveDown(tetromino, grid);
			break;
		case KEY.LEFT:
			moveLeft(tetromino, grid);
			break;
		case KEY.RIGHT:
			moveRight(tetromino, grid);
			break;
		case KEY.UP:
			rotate(tetromino, grid);
			break;
		case KEY.SPACE:
			hardDrop(tetromino, grid);
			break;
		case KEY.P:
			let btn_play = document.querySelector("#btn-play");
			if (game.state !== GAME_STATE.PAUSE) {
				gamePause();
				body.classList.add("pause");
				body.classList.remove("play");
				btn_play.innerHTML = "resume";
			} else {
				body.classList.remove("pause");
				body.classList.add("play");
				gameResume();
			}
			break;
		case KEY.C:
			holdCurrentPiece();
			break;
	}
});

const buttons = {
	"btn-drop": () => hardDrop(tetromino, grid),
	"btn-up": () => rotate(tetromino, grid),
	"btn-down": () => moveDown(tetromino, grid),
	"btn-left": () => moveLeft(tetromino, grid),
	"btn-right": () => moveRight(tetromino, grid),
	"btn-space": () => hardDrop(tetromino, grid),
	"btn-play": () => {
		const body = document.querySelector("body");
		body.classList.add("play");
		gameReset();
		gameStart();
	},
	"btn-continue": () => continueGame(),
	"btn-pause": () => {
		const body = document.querySelector("body");
		gamePause();
		body.classList.remove("play");
		body.classList.add("pause");
	},
	"btn-reset": () => {
		const body = document.querySelector("body");
		gameReset();
		document.querySelector(".main-menu-container").setAttribute("style", "display: none");
		document.querySelector(".background-image").setAttribute("style", "filter: contrast(130%) sepia(70%) blur(3px)");
		document.querySelector(".main-menu-container.game-over").setAttribute("style", "display: none");
		body.classList.add("play");
		body.classList.remove("pause");
		body.classList.remove("end");
		gameStart();
	},
	"btn-volume": () => {
		const body = document.querySelector("body");
		body.classList.toggle("muted");
		if (body.classList.contains("muted")) {
			pauseMusic();
		} else {
			playMusic();
		}
	},
	"btn-audio": () => {
		const body = document.querySelector("body");
		body.classList.toggle("muted");
		if (body.classList.contains("muted")) {
			pauseMusic();
		} else {
			playMusic();
		}
	},
	"btn-new-game": () => {
		const body = document.querySelector("body");
		gameReset();
		body.classList.add("play");
		body.classList.remove("pause");
		body.classList.remove("end");
		gameStart();
	},
	"btn-play-again-yes": () => {
		const body = document.querySelector("body");
		gameReset();
		document.querySelector(".main-menu-container").setAttribute("style", "display: none");
		document.querySelector(".background-image").setAttribute("style", "filter: contrast(130%) sepia(70%) blur(3px)");
		document.querySelector(".main-menu-container.game-over").setAttribute("style", "display: none");
		body.classList.add("play");
		body.classList.remove("pause");
		body.classList.remove("end");
		gameStart();
	},
	"btn-play-again-no": () => {
		// const body = document.querySelector("body");
		gameReset();
		document.querySelector(".main-menu-container").setAttribute("style", "display: flex");
		document.querySelector(".main-menu-container.game-over").setAttribute("style", "display: none");
		document.querySelector(".background-image").setAttribute("style", "filter: contrast(130%) sepia(70%) blur(3px)");
	},
	"btn-help": () => {
		const how_to = document.querySelector(".how-to");
		how_to.classList.toggle("active");
	},
	"btn-info": () => {
		const how_to = document.querySelector(".how-to");
		how_to.classList.toggle("active");
	},
};

Object.entries(buttons).forEach(([id, action]) => {
	const button = document.getElementById(id);
	if (button) {
		button.addEventListener("click", action);
	}
});
