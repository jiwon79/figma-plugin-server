import { google } from 'googleapis';

export async function GET(request: Request) {
  // get url query from request.url
  // const url = new URL(request.url);
  // const query = url.searchParams.get('url');
  // console.log(query);

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const sheets = google.sheets({
    auth,
    version: 'v4',
  });

  return new Response(JSON.stringify({
    result: "result",
  }));
}
