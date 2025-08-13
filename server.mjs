import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 3000;
const guestbookPath = path.resolve('./guestbook.json');
const rsvpPath = path.resolve('./rsvp.json');

app.use(express.json());

app.get('/api/guestbook', async (req, res) => {
    try {
        const data = await fs.readFile(guestbookPath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: 'Error reading guestbook data' });
    }
});

app.post('/api/guestbook', async (req, res) => {
    try {
        const newEntry = req.body;
        const data = await fs.readFile(guestbookPath, 'utf-8');
        const entries = JSON.parse(data);
        entries.unshift(newEntry);
        await fs.writeFile(guestbookPath, JSON.stringify(entries, null, 2));
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(500).json({ message: 'Error writing guestbook data' });
    }
});

app.post('/api/rsvp', async (req, res) => {
    try {
        const newRsvp = req.body;
        const data = await fs.readFile(rsvpPath, 'utf-8');
        const rsvps = JSON.parse(data);
        rsvps.push(newRsvp);
        await fs.writeFile(rsvpPath, JSON.stringify(rsvps, null, 2));
        res.status(201).json(newRsvp);
    } catch (error) {
        res.status(500).json({ message: 'Error writing rsvp data' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
