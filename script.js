let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "❌";
let gameActive = false;
let difficulty = "easy";

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");

const winConditions = [
	[0,1,2],
	[3,4,5],
	[6,7,8],
	[0,3,6],
	[1,4,7],
	[2,5,8],
	[0,4,8],
	[2,4,6]
];

function startGame(level){
	difficulty = level;
	menu.classList.add("hidden");
	game.classList.remove("hidden");
	gameActive = true;
	board = ["", "", "", "", "", "", "", "", ""];
	currentPlayer = "❌";
	statusText.textContent = "התור שלך (❌)";

	cells.forEach(cell=>{
		cell.textContent = "";
		cell.classList.remove("win");
		cell.addEventListener("click", handleClick);
	});
}

function handleClick(e){
	const index = e.target.dataset.index;

	if(board[index] !== "" || !gameActive || currentPlayer !== "❌") return;

	makeMove(index, "❌");

	if(checkGameEnd("❌")) return;

	currentPlayer = "🤖";
	statusText.textContent = "התור של הבוט";

	setTimeout(botMove, 500);
}

function makeMove(index, player){
	board[index] = player;
	cells[index].textContent = player;
}

function checkWinner(player){
	return winConditions.some(cond=>{
		return cond.every(i => board[i] === player);
	});
}

function checkGameEnd(player){
	if(checkWinner(player)){
		endGame(player === "❌" ? "ניצחת!" : "הפסדת!");
		return true;
	}

	if(!board.includes("")){
		endGame("תיקו!");
		return true;
	}

	return false;
}

function endGame(text){
	gameActive = false;
	popup.classList.remove("hidden");
	popupText.textContent = text;
}
function botMove(){
	let index;

	if(difficulty === "easy"){
		index = randomMove();
	}
	else if(difficulty === "medium"){
		index = mediumMove();
	}
	else{
		index = bestMove();
	}

	makeMove(index, "🤖");

	if(checkGameEnd("🤖")) return;

	currentPlayer = "❌";
	statusText.textContent = "התור שלך (❌)";
}

function randomMove(){
	let empty = [];
	board.forEach((v,i)=>{
		if(v === "") empty.push(i);
	});
	return empty[Math.floor(Math.random() * empty.length)];
}

function mediumMove(){
	// לפעמים חכם לפעמים רנדומלי
	if(Math.random() < 0.5){
		return bestMove();
	}
	return randomMove();
}

function bestMove(){
	let bestScore = -Infinity;
	let move;

	for(let i = 0; i < board.length; i++){
		if(board[i] === ""){
			board[i] = "🤖";
			let score = minimax(board, 0, false);
			board[i] = "";

			if(score > bestScore){
				bestScore = score;
				move = i;
			}
		}
	}

	return move;
}

function minimax(newBoard, depth, isMaximizing){
	if(checkWinner("🤖")) return 10 - depth;
	if(checkWinner("❌")) return depth - 10;
	if(!newBoard.includes("")) return 0;

	if(isMaximizing){
		let best = -Infinity;

		for(let i = 0; i < newBoard.length; i++){
			if(newBoard[i] === ""){
				newBoard[i] = "🤖";
				best = Math.max(best, minimax(newBoard, depth + 1, false));
				newBoard[i] = "";
			}
		}

		return best;
	}
	else{
		let best = Infinity;

		for(let i = 0; i < newBoard.length; i++){
			if(newBoard[i] === ""){
				newBoard[i] = "❌";
				best = Math.min(best, minimax(newBoard, depth + 1, true));
				newBoard[i] = "";
			}
		}

		return best;
	}
}

function restartGame(){
	popup.classList.add("hidden");
	startGame(difficulty);
}

function backToMenu(){
	popup.classList.add("hidden");
	game.classList.add("hidden");
	menu.classList.remove("hidden");
	gameActive = false;
}