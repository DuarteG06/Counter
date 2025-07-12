const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const FILE = 'counters.json';

app.use(cors());
app.use(express.json());

// Read counters
function readCounters() {
    const data = fs.readFileSync(FILE);
    return JSON.parse(data);
}

// Write counters
function writeCounters(counters) {
    fs.writeFileSync(FILE, JSON.stringify(counters, null, 2));
}

// Get current counters
app.get('/api/counters', (req, res) => {
    res.json(readCounters());
});

// Update a specific counter
app.post('/api/update', (req, res) => {
    const { name, delta } = req.body;
    const counters = readCounters();

    if (counters[name] !== undefined) {
        counters[name] += delta;
        if (counters[name] < 0) counters[name] = 0;
        writeCounters(counters);
        res.json({ success: true, counters });
    } else {
        res.status(400).json({ error: "Invalid counter name" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
