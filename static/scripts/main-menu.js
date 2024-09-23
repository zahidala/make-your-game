export function mainMenu() {
	const newGame = () => {
		const newGameButton = document.getElementById("new-game");

		newGameButton.addEventListener("click", () => {
			document.querySelector(".main-menu-container").style.display = "none";
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
