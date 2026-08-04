const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(__dirname, 'cloud_db.json');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

function getDatabase() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
        return [];
    }
}

function saveDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/html' || file.originalname.endsWith('.html') || file.originalname.endsWith('.htm')) {
            cb(null, true);
        } else {
            cb(new Error('Only .html files are permitted on Diego Cloud!'));
        }
    }
});

app.get('/api/games', (req, res) => {
    const games = getDatabase();
    res.json(games);
});

app.post('/api/upload', upload.single('gameFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const db = getDatabase();
        const gameName = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, "");
        
        const newGame = {
            id: Date.now().toString(),
            title: `${gameName} (Cloud Server)`,
            url: `/uploads/${req.file.filename}`,
            filename: req.file.filename,
            emoji: "☁️",
            category: "Cloud",
            uploadedAt: new Date().toISOString()
        };

        db.unshift(newGame);
        saveDatabase(db);

        res.json({ success: true, game: newGame });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/games/:id', (req, res) => {
    let db = getDatabase();
    const game = db.find(g => g.id === req.params.id);
    
    if (game) {
        const filePath = path.join(UPLOADS_DIR, game.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        db = db.filter(g => g.id !== req.params.id);
        saveDatabase(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Game not found.' });
    }
});

app.listen(PORT, () => {
    console.log(` Diego Cloud Server running on http://localhost:${PORT}`);
});
