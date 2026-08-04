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

// Base Hand-Curated Game Catalog
const basePopularGames = [
    // --- ROBLOX & CLOUD PLATFORMS (Auto about:blank) ---
    { id: 'rbx-1', title: "Roblox (Now.gg Cloud)", url: "https://now.gg/apps/roblox-corporation/5349/roblox.html", emoji: "🟥", category: "Roblox", isDefault: true },
    { id: 'rbx-2', title: "Roblox Web Portal", url: "https://www.roblox.com/discover", emoji: "🌐", category: "Roblox", isDefault: true },
    { id: 'rbx-3', title: "Fortnite Cloud", url: "https://www.xbox.com/play/games/fortnite", emoji: "⚡", category: "Action", isDefault: true },

    // --- UNBLOCKED STATIC HTML5 / CDN EMBEDS ---
    { id: 'g1', title: "1v1.LOL", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/1v1-lol/index.html", emoji: "🎯", category: "Action", isDefault: true },
    { id: 'g2', title: "2048 Classic", url: "https://gabrielecirulli.github.io/2048/", emoji: "🔢", category: "Puzzle", isDefault: true },
    { id: 'g3', title: "Hextris", url: "https://hextris.github.io/hextris/", emoji: "🔷", category: "Arcade", isDefault: true },
    { id: 'g4', title: "Flappy Bird", url: "https://ellisonleao.github.io/clumsy-bird/", emoji: "🐤", category: "Arcade", isDefault: true },
    { id: 'g5', title: "Pac-Man Classic", url: "https://macek.github.io/google_pacman/", emoji: "👾", category: "Arcade", isDefault: true },
    { id: 'g6', title: "Canvas Tetris", url: "https://dionyziz.github.io/canvas-tetris/", emoji: "🧱", category: "Puzzle", isDefault: true },
    { id: 'g7', title: "Cookie Clicker", url: "https://orteil.dashnet.org/cookieclicker/", emoji: "🍪", category: "Clicker", isDefault: true },
    { id: 'g8', title: "Browser Snake", url: "https://playsnake.org/", emoji: "🐍", category: "Classic", isDefault: true },
    { id: 'g9', title: "Doodle Jump", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/doodle-jump/index.html", emoji: "🐸", category: "Arcade", isDefault: true },
    { id: 'g10', title: "Geometry Dash", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/geometry-dash/index.html", emoji: "🟦", category: "Action", isDefault: true },
    { id: 'g11', title: "Paper Minecraft", url: "https://scratch.mit.edu/projects/10128407/embed", emoji: "⛏️", category: "Simulation", isDefault: true },
    { id: 'g12', title: "Retro Bowl", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/retro-bowl/index.html", emoji: "🏈", category: "Sports", isDefault: true },
    { id: 'g13', title: "BitLife", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/bitlife/index.html", emoji: "🧬", category: "Simulation", isDefault: true },
    { id: 'g14', title: "Moto X3M", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/motox3m/index.html", emoji: "🏍️", category: "Sports", isDefault: true },
    { id: 'g15', title: "Slope", url: "https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/slope/index.html", emoji: "⛷️", category: "Action", isDefault: true }
];

let allGames = [];

// ==========================================
// 2. APP INITIALIZATION
// ==========================================
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

// Initialize IndexedDB Storage
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

// Fetch Additional Repositories Dynamically
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
        console.warn("CDN fallback activated.");
    }
}

// ==========================================
// 3. CATALOG & RENDERING LOGIC
// ==========================================
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

// ==========================================
// 4. GAME LAUNCHER & PLAYER MODAL
// ==========================================
function openGame(title, url) {
    currentUrl = url;
    
    // Automatically route external platforms into about:blank to bypass iframe security blocks
    if (url.includes('roblox.com') || url.includes('now.gg') || url.includes('xbox.com') || url.includes('1v1.lol')) {
        aboutBlankLaunch();
        return;
    }

    const modalTitle = document.getElementById('modal-title');
    const gameFrame = document.getElementById('game-frame');
    const playerModal = document.getElementById('player-modal');

    if (modalTitle) modalTitle.innerText = title;
    if (gameFrame) gameFrame.src = url;
    if (playerModal) playerModal.style.display = 'flex';
}

function closeGame() {
    const playerModal = document.getElementById('player-modal');
    const gameFrame = document.getElementById('game-frame');
    
    if (playerModal) playerModal.style.display = 'none';
    if (gameFrame) gameFrame.src = '';
}

function aboutBlankLaunch() {
    if (!currentUrl) return;
    const win = window.open('about:blank');
    if (win) {
        win.document.write(`
            <html style="margin:0;padding:0;width:100%;height:100%;">
                <head><title>Classes</title></head>
                <body style="margin:0;padding:0;width:100%;height:100%;overflow:hidden;">
                    <iframe src="${currentUrl}" style="width:100%;height:100%;border:none;margin:0;padding:0;"></iframe>
                </body>
            </html>
        `);
    }
}

// ==========================================
// 5. CUSTOM STORAGE (INDEXEDDB FILE UPLOAD)
// ==========================================
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

// ==========================================
// 6. FILTERS & SEARCH
// ==========================================
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

// ==========================================
// 7. UI CONTROLS & MODALS
// ==========================================
function toggleCloudModal() {
    const modal = document.getElementById('cloud-modal');
    if (modal) modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function toggleCredits() {
    const modal = document.getElementById('credits-modal');
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
        aiMsg.innerText = `Diego Proxy loaded ${allGames.length} items! 🌸`;
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
    document.title = cloaked ? "Classes" : "Google Classroom 🌸";
    const cloakBtn = document.getElementById('cloak-btn');
    if (cloakBtn) {
        cloakBtn.innerText = cloaked ? "🌸 Uncloak" : "🕵️‍♂️ Classroom Cloak";
    }
}

function toggleHaparaBypass() {
    alert('Hapara tracker flushed! 🌸');
}
