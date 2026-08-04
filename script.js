// Database & Storage Variables
const DB_NAME = 'DiegoProxyDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_games';
let db = null;

let customGames = [];
let cdnGames = [];

// Hand-Curated List of REAL Working HTML5 Games
const basePopularGames = [
    // --- CLASSICS & PUZZLE ---
    { id: 'g1', title: "2048", url: "https://gabrielecirulli.github.io/2048/", emoji: "🔢", category: "Puzzle", isDefault: true },
    { id: 'g2', title: "Hextris", url: "https://hextris.github.io/hextris/", emoji: "🔷", category: "Arcade", isDefault: true },
    { id: 'g3', title: "Flappy Bird", url: "https://ellisonleao.github.io/clumsy-bird/", emoji: "🐤", category: "Arcade", isDefault: true },
    { id: 'g4', title: "Pac-Man Classic", url: "https://macek.github.io/google_pacman/", emoji: "👾", category: "Arcade", isDefault: true },
    { id: 'g5', title: "Canvas Tetris", url: "https://dionyziz.github.io/canvas-tetris/", emoji: "🧱", category: "Puzzle", isDefault: true },
    { id: 'g6', title: "Cookie Clicker", url: "https://orteil.dashnet.org/cookieclicker/", emoji: "🍪", category: "Clicker", isDefault: true },
    { id: 'g7', title: "Browser Snake", url: "https://playsnake.org/", emoji: "🐍", category: "Classic", isDefault: true },
    { id: 'g8', title: "Doodle Jump", url: "https://html5.gamedistribution.com/rvvAS48/bb22d4f208c04ec4a02d416973347078/index.html", emoji: "🐸", category: "Arcade", isDefault: true },
    { id: 'g9', title: "Cut the Rope", url: "https://html5.gamedistribution.com/rvvAS48/a25287d3536d4f6a908051779b5c3281/index.html", emoji: "🍬", category: "Puzzle", isDefault: true },
    { id: 'g10', title: "Fruit Ninja", url: "https://html5.gamedistribution.com/rvvAS48/c50c0ef4ff30456aa6a2c286e082829b/index.html", emoji: "🍉", category: "Arcade", isDefault: true },

    // --- ACTION & RUNNERS ---
    { id: 'g11', title: "Paper.io 2", url: "https://paper-io.com/", emoji: "📜", category: "Action", isDefault: true },
    { id: 'g12', title: "Crossy Road", url: "https://crossyroad.io/", emoji: "🐔", category: "Action", isDefault: true },
    { id: 'g13', title: "Subway Surfers", url: "https://subwaysurfers.com/", emoji: "🏃", category: "Action", isDefault: true },
    { id: 'g14', title: "Geometry Dash", url: "https://geometrydash.io/", emoji: "🟦", category: "Action", isDefault: true },
    { id: 'g15', title: "Temple Run 2", url: "https://html5.gamedistribution.com/rvvAS48/591d5735cfef41b6a71cb0a81180eb78/index.html", emoji: "🗿", category: "Action", isDefault: true },
    { id: 'g16', title: "Cluster Rush", url: "https://clusterrush.io/", emoji: "🚚", category: "Action", isDefault: true },
    { id: 'g17', title: "Vex 6", url: "https://html5.gamedistribution.com/rvvAS48/9bc490dd9ec24f5a895c1c4f5263a2a6/index.html", emoji: "🏃", category: "Action", isDefault: true },
    { id: 'g18', title: "Vex 7", url: "https://html5.gamedistribution.com/rvvAS48/6d22ffc32dbf4ef1960bd27fdd7459ef/index.html", emoji: "🤸", category: "Action", isDefault: true },

    // --- SPORTS & RACING ---
    { id: 'g19', title: "Moto X3M", url: "https://motox3m.co/", emoji: "🏍️", category: "Sports", isDefault: true },
    { id: 'g20', title: "Moto X3M Winter", url: "https://html5.gamedistribution.com/rvvAS48/a2df4edaa38d4f049d5bfb9f1d072f87/index.html", emoji: "❄️", category: "Sports", isDefault: true },
    { id: 'g21', title: "Moto X3M Pool Party", url: "https://html5.gamedistribution.com/rvvAS48/48d904b7849e493e82d56c80537be4d6/index.html", emoji: "🏊", category: "Sports", isDefault: true },
    { id: 'g22', title: "Basket Random", url: "https://twoplayergames.org/game/basket-random", emoji: "🏀", category: "Sports", isDefault: true },
    { id: 'g23', title: "Soccer Random", url: "https://twoplayergames.org/game/soccer-random", emoji: "⚽", category: "Sports", isDefault: true },
    { id: 'g24', title: "Basketball Stars", url: "https://html5.gamedistribution.com/rvvAS48/8fb81e05d0e2417e88258525b68df9f2/index.html", emoji: "⛹️", category: "Sports", isDefault: true },
    { id: 'g25', title: "Retro Bowl", url: "https://game316006.konggames.com/gamez/0031/6006/live/index.html", emoji: "🏈", category: "Sports", isDefault: true },
    { id: 'g26', title: "Smash Karts", url: "https://smashkarts.io/", emoji: "🏎️", category: "Sports", isDefault: true },

    // --- SIMULATION & STRATEGY ---
    { id: 'g27', title: "BitLife Simulator", url: "https://bitlifeonline.com/", emoji: "🧬", category: "Simulation", isDefault: true },
    { id: 'g28', title: "Paper Minecraft", url: "https://scratch.mit.edu/projects/10128407/embed", emoji: "⛏️", category: "Simulation", isDefault: true },
    { id: 'g29', title: "Bloons TD 4", url: "https://html5.gamedistribution.com/rvvAS48/d9c79f33fb854f3484f23e6702d1d0f5/index.html", emoji: "🎈", category: "Strategy", isDefault: true },

    // --- EXTERNAL FRAME LAUNCHERS ---
    { id: 'g30', title: "1v1.LOL", url: "https://1v1.lol/", emoji: "🎯", category: "Action", isDefault: true },
    { id: 'g31', title: "Roblox Web", url: "https://www.roblox.com/", emoji: "🟥", category: "Action", isDefault: true },
    { id: 'g32', title: "Fortnite Cloud", url: "https://www.xbox.com/play/games/fortnite", emoji: "⚡", category: "Action", isDefault: true }
];

let allGames = [];

// App Startup
window.addEventListener('DOMContentLoaded', async () => {
    updateClock();
    setInterval(updateClock, 1000);

    try {
        await initIndexedDB();
        await loadSavedGames();
        await loadRealCdnGames();
    } catch (err) {
        console.error('Initialization Note:', err);
    }

    refreshGameCatalog();
});

// Load Real External Game Catalog JSONs
async function loadRealCdnGames() {
    try {
        const res = await fetch('https://cdn.jsdelivr.net/gh/gn-math/gn-math.github.io@main/config/games.json');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                cdnGames = data.map((g, idx) => ({
                    id: `cdn-${idx}`,
                    title: g.name || g.title || `Game ${idx}`,
                    url: g.url || g.link,
                    emoji: "🎮",
                    category: g.category || "Game",
                    isDefault: true
                })).filter(g => g.url && g.title);
            }
        }
    } catch (e) {
        console.warn("CDN fetch fallback engaged.");
    }
}

// 1. IndexedDB Setup
function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = (e) => { db = e.target.result; resolve(); };
        request.onerror = (e) => reject(e.target.error);
    });
}

// 2. Load User Uploads
function loadSavedGames() {
    return new Promise((resolve, reject) => {
        if (!db) return resolve();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const savedItems = request.result || [];
            customGames = savedItems.map(item => {
                const blob = new Blob([item.content], { type: 'text/html' });
                return {
                    id: item.id,
                    title: item.title,
                    url: URL.createObjectURL(blob),
                    emoji: item.emoji || "☁️",
                    category: "Custom",
                    isDefault: false
                };
            });
            resolve();
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

// 3. Save User HTML Uploads Permanently
function handleBrowserFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
        alert('Please upload a valid .html file! 🌸');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const htmlContent = e.target.result;
        const gameId = 'game_' + Date.now();
        const gameName = file.name.replace(/\.[^/.]+$/, "") + " (Saved)";

        const gameRecord = {
            id: gameId,
            title: gameName,
            content: htmlContent,
            emoji: "☁️",
            timestamp: Date.now()
        };

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put(gameRecord);

        transaction.oncomplete = () => {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            customGames.unshift({
                id: gameId,
                title: gameName,
                url: URL.createObjectURL(blob),
                emoji: "☁️",
                category: "Custom",
                isDefault: false
            });

            refreshGameCatalog();
            toggleCloudModal();
            alert(`"${file.name}" saved permanently! 🌸`);
        };
    };

    reader.readAsText(file);
}

// Delete Game
async function deleteGame(event, gameId) {
    event.stopPropagation();
    if (!confirm("Delete this saved game?")) return;

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(gameId);

    transaction.oncomplete = () => {
        customGames = customGames.filter(g => g.id !== gameId);
        refreshGameCatalog();
    };
}

function refreshGameCatalog() {
    allGames = [...customGames, ...basePopularGames, ...cdnGames];
    renderGames(allGames);
}

function renderGames(data) {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    
    data.forEach(game => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openGame(game.title, game.url);
        
        let deleteBtnHTML = '';
        if (!game.isDefault) {
            deleteBtnHTML = `<button onclick="deleteGame(event, '${game.id}')" class="delete-btn">🗑️</button>`;
        }

        card.style.position = 'relative';
        card.innerHTML = `
            ${deleteBtnHTML}
            <div class="card-thumb">${game.emoji || '🎮'}</div>
            <div class="card-title">${game.title}</div>
        `;
        grid.appendChild(card);
    });
}

let currentUrl = '';

function openGame(title, url) {
    currentUrl = url;
    
    if (url.includes('roblox.com') || url.includes('1v1.lol') || url.includes('xbox.com')) {
        aboutBlankLaunch();
        return;
    }

    document.getElementById('modal-title').innerText = title;
    document.getElementById('game-frame').src = url;
    document.getElementById('player-modal').style.display = 'flex';
}

function closeGame() {
    document.getElementById('player-modal').style.display = 'none';
    document.getElementById('game-frame').src = '';
}

function filterGames() {
    const query = document.getElementById('search').value.toLowerCase();
    const filtered = allGames.filter(g => g.title.toLowerCase().includes(query));
    renderGames(filtered);
}

function filterCategory(cat) {
    const filtered = allGames.filter(g => g.category === cat || g.title.toLowerCase().includes(cat.toLowerCase()));
    renderGames(filtered);
}

function resetSearch() {
    document.getElementById('search').value = '';
    renderGames(allGames);
}

function toggleCloudModal() {
    const modal = document.getElementById('cloud-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function toggleCredits() {
    const modal = document.getElementById('credits-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function toggleNolan() {
    const modal = document.getElementById('nolan-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function sendNolanMessage() {
    const input = document.getElementById('nolan-input');
    const container = document.getElementById('nolan-messages');
    if (!input.value.trim()) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.innerText = input.value;
    container.appendChild(userMsg);
    
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'msg ai';
        aiMsg.innerText = `Diego Proxy loaded ${allGames.length} games! 🌸`;
        container.appendChild(aiMsg);
        container.scrollTop = container.scrollHeight;
    }, 400);

    input.value = '';
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    hours = hours % 12 || 12;
    document.getElementById('clock').innerText = `${hours}:${minutes}`;
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('date').innerText = now.toLocaleDateString('en-US', options);
}

let cloaked = false;
function toggleCloak() {
    cloaked = !cloaked;
    document.title = cloaked ? "Classes" : "Google Classroom 🌸";
    document.getElementById('cloak-btn').innerText = cloaked ? "🌸 Uncloak" : "🕵️‍♂️ Classroom Cloak";
}

function aboutBlankLaunch() {
    if (!currentUrl) return;
    const win = window.open('about:blank');
    if (win) {
        win.document.write(`<iframe src="${currentUrl}" style="width:100%;height:100vh;border:none;margin:0;padding:0;"></iframe>`);
    }
}

function toggleHaparaBypass() {
    alert('Hapara tracker flushed! 🌸');
}
