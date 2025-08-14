import { neon } from '@netlify/neon';

const sql = neon();

exports.handler = async (event, context) => {
  try {
    // Neon에서 방명록 데이터를 가져옵니다.
    // 'guestbook' 테이블이 있고 'name', 'message', 'date' 컬럼이 있다고 가정합니다.
    const entries = await sql`SELECT name, message, date FROM guestbook ORDER BY date DESC`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entries),
    };
  } catch (error) {
    console.error("Error fetching guestbook:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error reading guestbook data' }),
    };
  }
};
