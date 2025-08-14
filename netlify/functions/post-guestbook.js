import { neon } from '@netlify/neon';

const sql = neon();

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, message } = JSON.parse(event.body);

    if (!name || !message) {
      return { statusCode: 400, body: 'Name and message are required.' };
    }

    // Insert into Neon database
    const [newEntry] = await sql`
      INSERT INTO guestbook (name, message)
      VALUES (${name}, ${message})
      RETURNING id, name, message, date;
    `;

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    };
  } catch (error) {
    console.error('Error posting guestbook entry:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error writing guestbook data' }),
    };
  }
};
