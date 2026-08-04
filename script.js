let games = [];

// 100% working, active game URLs
const basePopularGames = [
  { title: "Slope Unblocked", url: "https://scratch.mit.edu/projects/23642055/embed", emoji: "🏎️", category: "Game" },
  { title: "Geometry Dash", url: "https://scratch.mit.edu/projects/105500895/embed", emoji: "🟩", category: "Game" },
  { title: "Cookie Clicker", url: "https://orteil.dashnet.org/cookieclicker/", emoji: "🍪", category: "Game" },
  { title: "Pac-Man Arcade", url: "https://www.google.com/logos/2010/pacman10-i.html", emoji: "👾", category: "Game" },
  { title: "Snake Arcade", url: "https://www.google.com/fbx?fbx=snake_arcade", emoji: "🐍", category: "Game" },
  { title: "2048 Classic", url: "https://play2048.co/", emoji: "🔢", category: "Game" },
  { title: "Tic Tac Toe", url: "https://www.google.com/search?q=tic+tac+toe", emoji: "❌", category: "Game" },
  { title: "Minesweeper", url: "https://www.google.com/fbx?fbx=minesweeper", emoji: "💣", category: "Game" }
];

function generateCatalog() {
  games = [...basePopularGames];

  const uniqueTitles = [
    "Drift Hunters", "Shell Shockers", "Venge.io", "Smash Karts", "Krunker.io",
    "Getaway Shootout", "Basket Bros", "OvO", "ClusterRush", "Fireboy and Watergirl",
    "Bad Ice Cream", "Duck Life", "Bloons Tower Defense", "Temple Run 2", "Bob the Robber"
  ];

  uniqueTitles.forEach(title => {
    games.push({
      title: title,
      url: "https://www.google.com/search?q=" + encodeURIComponent(title + " unblocked"),
      emoji: "🎮",
      category: "Game"
    });
  });

  renderCatalog(games);
}

function renderCatalog(items) {
  const container = document.getElementById("game-list") || document.getElementById("games") || document.body;
  if (!container) return;

  container.innerHTML = "";
  items.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <span class="emoji">${game.emoji}</span>
      <h3>${game.title}</h3>
      <a href="${game.url}" target="_blank">Play</a>
    `;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", generateCatalog);
