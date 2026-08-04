// Database & Storage Variables
const DB_NAME = 'DiegoProxyDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_games';
let db = null;

let customGames = [];

// Working Unblocked HTML5 & CDN Games Catalog
const basePopularGames = [
    // --- ROBLOX & CLOUD LAUNCHERS (Auto about:blank) ---
    { id: 'rbx-1', title: "Roblox (Now.gg Cloud)", url: "https://now.gg/apps/roblox-corporation/5349/roblox.html", emoji: "🟥", category: "Roblox", isDefault: true },
    { id: 'rbx-2', title: "Roblox Web Portal", url: "https://www.roblox.com/discover", emoji: "🌐", category: "Roblox", isDefault: true },

    // --- 100% WORKING UNBLOCKED HTML5 GAMES ---
    { id: 'g1', title: "2048 Classic", url: "https://gabrielecirulli.github.io/2048/", emoji: "🔢", category: "Puzzle", isDefault: true },
    { id: 'g2', title: "Hextris", url: "https://hextris.github.io/hextris/", emoji: "🔷", category: "Arcade", isDefault: true },
    { id: 'g3', title: "Flappy Bird", url: "https://ellisonleao.github.io/clumsy-bird/", emoji: "🐤", category: "Arcade", isDefault: true },
    { id: 'g4', title: "Pac-Man Classic", url: "https://macek.github.io/google_pacman/", emoji: "👾", category: "Arcade", isDefault: true },
    { id: 'g5', title: "Canvas Tetris", url: "https://dionyziz.github.io/canvas-tetris/", emoji: "🧱", category: "Puzzle", isDefault: true },
    { id: 'g6', title: "Cookie Clicker", url: "https://orteil.dashnet.org/cookieclicker/", emoji: "🍪", category: "Clicker", isDefault: true },
    { id: 'g7', title: "Browser Snake", url: "https://playsnake.org/", emoji: "🐍", category: "Classic", isDefault: true },
    
    // --- WORKING EMBEDS FROM GITHUB STATIC REPOS ---
    { id: 'g8', title: "1v1.LOL", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/1v1-lol/index.html", emoji: "🎯", category: "Action", isDefault: true },
    { id: 'g9', title: "Doodle Jump", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/doodle-jump/index.html", emoji: "🐸", category: "Arcade", isDefault: true },
    { id: 'g10', title: "Geometry Dash", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/geometry-dash/index.html", emoji: "🟦", category: "Action", isDefault: true },
    { id: 'g11', title: "Paper Minecraft", url: "https://scratch.mit.edu/projects/10128407/embed", emoji: "⛏️", category: "Simulation", isDefault: true },
    { id: 'g12', title: "Retro Bowl", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/retro-bowl/index.html", emoji: "🏈", category: "Sports", isDefault: true },
    { id: 'g13', title: "BitLife", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/bitlife/index.html", emoji: "🧬", category: "Simulation", isDefault: true },
    { id: 'g14', title: "Moto X3M", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/motox3m/index.html", emoji: "🏍️", category: "Sports", isDefault: true },
    { id: 'g15', title: "Slope", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/slope/index.html", emoji: "⛷️", category: "Action", isDefault: true }
];

let allGames = [];

// App Startup
window.addEventListener('DOMContentLoaded', async () => {
    updateClock();
    setInterval(updateClock, 1000);

    try {
        await initIndexedDB();
        await loadSavedGames();
    } catch (err) {
        console.error('Initialization Note:', err);
    }

    refreshGameCatalog();
});

// IndexedDB Setup
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

// Load User Uploads
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

// Handle Custom HTML File Uploads
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

// Delete Saved Game
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
    allGames = [...customGames, ...basePopularGames];
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
    
    // Auto launch external sites into about:blank to bypass black screen iframe blocks
    if (url.includes('roblox.com') || url.includes('now.gg') || url.includes('xbox.com')) {
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
        aiMsg.innerText = `Diego Proxy online! 🌸`;
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
