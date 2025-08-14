import { neon } from '@netlify/neon';

const sql = neon();

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, attendance, guestCount } = JSON.parse(event.body);

    if (!name || !attendance) {
      return { statusCode: 400, body: 'Name and attendance are required.' };
    }

    // Insert into Neon database
    const [newRsvp] = await sql`
      INSERT INTO rsvp (name, attendance, guest_count)
      VALUES (${name}, ${attendance}, ${guestCount || 0})
      RETURNING id, name, attendance, guest_count, timestamp;
    `;

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRsvp),
    };
  } catch (error) {
    console.error('Error posting RSVP entry:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error writing RSVP data' }),
    };
  }
};
