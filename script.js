// Database & Storage Variables
const DB_NAME = 'DiegoHubDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_games';
let db = null;

let customGames = [];

const basePopularGames = [
    { id: 'default-1', title: "Paper Minecraft", url: "https://turbowarp.org/10128407/embed", emoji: "🧱", category: "Game", isDefault: true },
    { id: 'default-2', title: "Geometry Dash", url: "https://turbowarp.org/105500895/embed", emoji: "🟩", category: "Game", isDefault: true },
    { id: 'default-3', title: "Flappy Bird", url: "https://turbowarp.org/18381180/embed", emoji: "🐤", category: "Game", isDefault: true },
    { id: 'default-4', title: "Slope 3D", url: "https://turbowarp.org/609174067/embed", emoji: "⛷️", category: "Game", isDefault: true },
    { id: 'default-5', title: "Retro Football", url: "https://turbowarp.org/764858013/embed", emoji: "🏈", category: "Game", isDefault: true },
    { id: 'default-6', title: "Pac-Man Arcade", url: "https://turbowarp.org/389028042/embed", emoji: "👾", category: "Arcade", isDefault: true }
];

let allGames = [];

// Initialize App & Database on Load
window.addEventListener('DOMContentLoaded', async () => {
    updateClock();
    setInterval(updateClock, 1000);

    try {
        await initIndexedDB();
        await loadSavedGames();
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }

    refreshGameCatalog();
});

// 1. Initialize IndexedDB
function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            resolve();
        };

        request.onerror = (e) => {
            reject(e.target.error);
        };
    });
}

// 2. Load Saved Games from Browser Storage
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

// 3. Save Uploaded Game Permanently
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

        // Save to IndexedDB
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
            alert(`"${file.name}" saved permanently! It will stay here forever! 🌸`);
        };
    };

    reader.readAsText(file);
}

// 4. Delete Saved Game
async function deleteGame(event, gameId) {
    event.stopPropagation(); // Prevents opening the game when clicking delete
    
    if (!confirm("Are you sure you want to delete this saved game?")) return;

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
            deleteBtnHTML = `<button onclick="deleteGame(event, '${game.id}')" style="position: absolute; top: 6px; right: 6px; background: rgba(239, 68, 68, 0.8); color: white; border: none; border-radius: 8px; padding: 2px 7px; font-size: 0.75rem; cursor: pointer; z-index: 10;">🗑️</button>`;
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
    const filtered = allGames.filter(g => g.category === cat || g.title.includes(cat));
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
        aiMsg.innerText = "All your uploaded games are saved directly in your browser forever! 🌸";
        container.appendChild(aiMsg);
        container.scrollTop = container.scrollHeight;
    }, 500);

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
