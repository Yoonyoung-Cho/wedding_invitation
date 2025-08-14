import { neon } from '@netlify/neon';

const sql = neon();

exports.handler = async (event, context) => {
  console.log('post-guestbook function invoked.');
  console.log('Raw event body:', event.body); // Log raw body

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const parsedBody = JSON.parse(event.body);
    const { name, message } = parsedBody;
    console.log('Parsed data:', { name, message });

    if (!name || !message) {
      console.log('Missing name or message.');
      return { statusCode: 400, body: 'Name and message are required.' };
    }

    // Insert into Neon database
    const [newEntry] = await sql`
      INSERT INTO guestbook (name, message)
      VALUES (${name}, ${message})
      RETURNING id, name, message, date;
    `;
    console.log('Successfully inserted new entry:', newEntry);
    console.log('New entry object:', newEntry); // Log the actual object

    return {
      statusCode: 200, // Changed to 200 to match network tab observation
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    };
  } catch (error) {
    console.error('Error posting guestbook entry:', error);
    console.error('Full error object:', error); // Log full error object
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error writing guestbook data' }),
    };
  }
};
