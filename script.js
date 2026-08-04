// ==========================================
// 1. CONFIGURATION & DATABASE SETUP
// ==========================================
const DB_NAME = 'DiegoProxyDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_games';
let db = null;

let customGames = [];
let cdnGames = [];
let currentUrl = '';
let cloaked = false;

const basePopularGames = [
    { id: 'rbx-1', title: "Bloxd.io (Bedwars/Obby)", url: "https://bloxd.io/", emoji: "🧱", category: "Roblox", isDefault: true },
    { id: 'rbx-2', title: "Voxiom.io (3D Build & Battle)", url: "https://voxiom.io/", emoji: "⚔️", category: "Roblox", isDefault: true },
    { id: 'rbx-3', title: "Kogama (Web Sandbox)", url: "https://www.kogama.com/", emoji: "🕹️", category: "Roblox", isDefault: true },
    { id: 'g1', title: "1v1.LOL", url: "https://1v1.lol/", emoji: "🎯", category: "Action", isDefault: true },
    { id: 'g2', title: "2048 Classic", url: "https://gabrielecirulli.github.io/2048/", emoji: "🔢", category: "Puzzle", isDefault: true },
    { id: 'g3', title: "Hextris", url: "https://hextris.github.io/hextris/", emoji: "🔷", category: "Arcade", isDefault: true },
    { id: 'g4', title: "Flappy Bird", url: "https://ellisonleao.github.io/clumsy-bird/", emoji: "🐤", category: "Arcade", isDefault: true },
    { id: 'g5', title: "Pac-Man Classic", url: "https://macek.github.io/google_pacman/", emoji: "👾", category: "Arcade", isDefault: true },
    { id: 'g6', title: "Canvas Tetris", url: "https://dionyziz.github.io/canvas-tetris/", emoji: "🧱", category: "Puzzle", isDefault: true },
    { id: 'g7', title: "Cookie Clicker", url: "https://orteil.dashnet.org/cookieclicker/", emoji: "🍪", category: "Clicker", isDefault: true },
    { id: 'g8', title: "Browser Snake", url: "https://playsnake.org/", emoji: "🐍", category: "Classic", isDefault: true },
    { id: 'g9', title: "Paper Minecraft", url: "https://scratch.mit.edu/projects/10128407/embed", emoji: "⛏️", category: "Simulation", isDefault: true },
    { id: 'g10', title: "Geometry Dash (Scratch)", url: "https://scratch.mit.edu/projects/105500895/embed", emoji: "🟦", category: "Action", isDefault: true }
];

let allGames = [];

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

function refreshGameCatalog() {
    allGames = [...customGames, ...basePopularGames, ...cdnGames];
    renderGames(allGames);
}

function renderGames(data) {
    const grid = document.getElementById('game-grid');
    if (!grid) return;
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

function openGame(title, url) {
    currentUrl = url;
    aboutBlankLaunch();
}

// Explicit Modal Toggle Fix
function toggleProxyModal() {
    const modal = document.getElementById('proxy-modal');
    if (!modal) return;
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        const input = document.getElementById('proxy-url-input');
        if (input) input.focus();
    }
}

function launchProxyUrl() {
    const input = document.getElementById('proxy-url-input');
    if (!input || !input.value.trim()) return;

    let target = input.value.trim();
    
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
        if (target.includes('.') && !target.includes(' ')) {
            target = 'https://' + target;
        } else {
            target = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(target);
        }
    }

    currentUrl = target;
    toggleProxyModal();
    aboutBlankLaunch();
    input.value = '';
}

function aboutBlankLaunch() {
    if (!currentUrl) return;
    const win = window.open('about:blank');
    if (win) {
        win.document.write(`
            <html style="margin:0;padding:0;width:100%;height:100%;">
                <head><title>Google Classroom</title></head>
                <body style="margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000;">
                    <iframe src="${currentUrl}" style="width:100%;height:100%;border:none;margin:0;padding:0;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" allowfullscreen></iframe>
                </body>
            </html>
        `);
    }
}

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
    const searchInput = document.getElementById('search');
    if (searchInput) searchInput.value = '';
    renderGames(allGames);
}

function toggleCloudModal() {
    const modal = document.getElementById('cloud-modal');
    if (modal) modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function toggleNolan() {
    const modal = document.getElementById('nolan-modal');
    if (modal) modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function sendNolanMessage() {
    const input = document.getElementById('nolan-input');
    const container = document.getElementById('nolan-messages');
    if (!input || !input.value.trim() || !container) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.innerText = input.value;
    container.appendChild(userMsg);
    
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'msg ai';
        aiMsg.innerText = `Proxy routing verified! 🌸`;
        container.appendChild(aiMsg);
        container.scrollTop = container.scrollHeight;
    }, 400);

    input.value = '';
}

function updateClock() {
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    if (!clockEl || !dateEl) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    hours = hours % 12 || 12;
    clockEl.innerText = `${hours}:${minutes}`;
    
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    dateEl.innerText = now.toLocaleDateString('en-US', options);
}

function toggleCloak() {
    cloaked = !cloaked;
    document.title = cloaked ? "Google Classroom" : "Google Classroom 🌸";
    const cloakBtn = document.getElementById('cloak-btn');
    if (cloakBtn) {
        cloakBtn.innerText = cloaked ? "🌸 Uncloak" : "🕵️‍♂️ Classroom Cloak";
    }
}
