import { mainMenu } from "./main-menu.js";
import { createGrid } from "./grid.js";
import { Tetromino, setupControls} from "./tetromino.js";

mainMenu();
createGrid();

const tetromino = new Tetromino();
tetromino.draw();
setupControls(tetromino);

// Game loop function to move the tetromino down every second (1000 milliseconds)
function gameLoop() {
	tetromino.moveDown();
	setTimeout(gameLoop, 1000);
}

gameLoop();

