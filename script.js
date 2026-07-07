const searchInput = document.getElementById("search");
const games = document.querySelectorAll(".game-card");

searchInput.addEventListener("input", function () {
	const value = searchInput.value.toLowerCase();

	games.forEach(game => {
		const name = game.innerText.toLowerCase();
		if (name.includes(value)) {
			game.style.display = "block";
		} else {
			game.style.display = "none";
		}
	});
});

function filterGames(category) {
	games.forEach(game => {
		if (category === "all") {
			game.style.display = "block";
		} else {
			if (game.classList.contains(category)) {
				game.style.display = "block";
			} else {
				game.style.display = "none";
			}
		}
	});
}

function openGame(url) {
	window.location.href = url;
}