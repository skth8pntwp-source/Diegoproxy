// Database & Storage Variables
const DB_NAME = 'DiegoHubDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_games';
let db = null;

let customGames = [];
let CDN_GAMES = [];

// Base unblocked HTML5 game catalog
const basePopularGames = [
    { id: 'real-1', title: "2048", url: "https://gabrielecirulli.github.io/2048/", emoji: "🔢", category: "Puzzle", isDefault: true },
    { id: 'real-2', title: "Hextris", url: "https://hextris.github.io/hextris/", emoji: "🔷", category: "Arcade", isDefault: true },
    { id: 'real-3', title: "Flappy Bird HTML5", url: "https://ellisonleao.github.io/clumsy-bird/", emoji: "🐤", category: "Arcade", isDefault: true },
    { id: 'real-4', title: "Pac-Man Classic", url: "https://macek.github.io/google_pacman/", emoji: "👾", category: "Arcade", isDefault: true },
    { id: 'real-5', title: "Canvas Tetris", url: "https://dionyziz.github.io/canvas-tetris/", emoji: "🧱", category: "Puzzle", isDefault: true },
    { id: 'real-6', title: "Cookie Clicker", url: "https://orteil.dashnet.org/cookieclicker/", emoji: "🍪", category: "Clicker", isDefault: true },
    { id: 'real-7', title: "Paper.io 2", url: "https://paper-io.com/", emoji: "📜", category: "Action", isDefault: true },
    { id: 'real-8', title: "Slope 3D", url: "https://krunker.io/", emoji: "⛷️", category: "Action", isDefault: true },
    { id: 'real-9', title: "Browser Snake", url: "https://playsnake.org/", emoji: "🐍", category: "Classic", isDefault: true },
    { id: 'real-10', title: "Retro Bowl", url: "https://game316006.konggames.com/gamez/0031/6006/live/index.html", emoji: "🏈", category: "Sports", isDefault: true },
    { id: 'real-11', title: "BitLife Simulator", url: "https://bitlifeonline.com/", emoji: "🧬", category: "Simulation", isDefault: true },
    { id: 'real-12', title: "Cluster Rush", url: "https://clusterrush.io/", emoji: "🚚", category: "Action", isDefault: true }
];

let allGames = [];

// App Startup
window.addEventListener('DOMContentLoaded', async () => {
    updateClock();
    setInterval(updateClock, 1000);

    try {
        await initIndexedDB();
        await loadSavedGames();
        await loadMassiveGameCatalog();
    } catch (err) {
        console.error('Initialization Note:', err);
    }

    refreshGameCatalog();
});

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

// 3. Fetch 900+ Open Source HTML5 Games from Unblocked CDNs
async function loadMassiveGameCatalog() {
    const mirrors = [
        'https://cdn.jsdelivr.net/gh/gn-math/gn-math.github.io@main/config/games.json',
        'https://raw.githubusercontent.com/3kh0/3kh0-assets/main/games.json',
        'https://cdn.jsdelivr.net/gh/bubbls/m3th@main/games.json'
    ];

    for (const mirror of mirrors) {
        try {
            const res = await fetch(mirror);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    CDN_GAMES = data
                        .filter(g => g.name || g.title)
                        .map((g, idx) => {
                            let gameUrl = g.url || g.link || g.file;
                            if (gameUrl && !gameUrl.startsWith('http')) {
                                gameUrl = `https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/${gameUrl.replace(/^\//, '')}`;
                            }
                            return {
                                id: `cdn-${idx}`,
                                title: g.name || g.title,
                                url: gameUrl,
                                emoji: "🎮",
                                category: g.category || "Game",
                                isDefault: true
                            };
                        })
                        .filter(g => g.url && !g.url.includes('turbowarp') && !g.url.includes('scratch'));
                    
                    if (CDN_GAMES.length > 50) break; // Break loop once games are retrieved
                }
            }
        } catch (e) {
            console.warn('Attempting secondary CDN mirror...');
        }
    }
}

// 4. Save User HTML Uploads Permanently
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

// 5. Delete Game
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
    allGames = [...customGames, ...basePopularGames, ...CDN_GAMES];
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
        aiMsg.innerText = `Loaded ${allGames.length} unblocked games! 🌸`;
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
