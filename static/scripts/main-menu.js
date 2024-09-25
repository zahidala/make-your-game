import { Tetromino, setupControls } from "./tetromino.js";

export function mainMenu() {
	const newGame = () => {
		const newGameButton = document.getElementById("new-game");

		newGameButton.addEventListener("click", () => {
			document.querySelector(".main-menu-container").style.display = "none";

			const tetromino = new Tetromino();
			tetromino.draw();
			setupControls(tetromino);

			// Game loop function to move the tetromino down every second (1000 milliseconds)
			tetromino.gameLoop();
		});
	};

	newGame();

	const continueGame = () => {
		const continueGameButton = document.getElementById("continue-game");

		continueGameButton.addEventListener("click", () => {
			document.querySelector(".main-menu-container").style.display = "none";
		});
	};

	continueGame();
}
