import express from 'express';
import { neon } from '@netlify/neon'; // Import neon
import dotenv from 'dotenv'; // To load environment variables from .env

dotenv.config(); // Load .env file

const app = express();
const port = 3000;

// Initialize Neon client
const sql = neon(process.env.NETLIFY_DATABASE_URL);

app.use(express.json());

app.get('/api/guestbook', async (req, res) => {
    try {
        const entries = await sql`SELECT name, message, date FROM guestbook ORDER BY date DESC`;
        res.json(entries);
    } catch (error) {
        console.error('Error reading guestbook data:', error);
        res.status(500).json({ message: 'Error reading guestbook data' });
    }
});

app.post('/api/guestbook', async (req, res) => {
    try {
        const { name, message } = req.body;
        if (!name || !message) {
            return res.status(400).json({ message: 'Name and message are required.' });
        }
        const [newEntry] = await sql`
            INSERT INTO guestbook (name, message)
            VALUES (${name}, ${message})
            RETURNING id, name, message, date;
        `;
        res.status(201).json(newEntry);
    } catch (error) {
        console.error('Error writing guestbook data:', error);
        res.status(500).json({ message: 'Error writing guestbook data' });
    }
});

app.post('/api/rsvp', async (req, res) => {
    try {
        const { name, attendance, guestCount } = req.body;
        if (!name || !attendance) {
            return res.status(400).json({ message: 'Name and attendance are required.' });
        }
        const [newRsvp] = await sql`
            INSERT INTO rsvp (name, attendance, guest_count)
            VALUES (${name}, ${attendance}, ${guestCount || 0})
            RETURNING id, name, attendance, guest_count, timestamp;
        `;
        res.status(201).json(newRsvp);
    } catch (error) {
        console.error('Error writing rsvp data:', error);
        res.status(500).json({ message: 'Error writing rsvp data' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
