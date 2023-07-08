import { google } from 'googleapis';
import { GaxiosError } from "gaxios";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const sheetId = query.get('url');
  if (sheetId == null) return;

  const spreadsheetId = extractSpreadsheetId(sheetId);
  if (spreadsheetId === null) return;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
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

  try {
    const response = await sheets.spreadsheets.values.get(
      {
        spreadsheetId: spreadsheetId,
        range: '시트1',
      }
    )
    console.log(response.data)
    return new Response(JSON.stringify({
      result: response.data,
    }))

  } catch (error: GaxiosError | any) {
    if (error instanceof GaxiosError) {
      console.log(error.code)
      if (error.code == "403") {
        console.log("PERMISSION_DENIED")
      } else {
        console.log(error)
      }
    } else {
      console.log(error)
    }
  }


  // const response = await sheets.spreadsheets.values.append({
  //   spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  //   range: `${sheetName}!A2:${alphabet[answers.length + 2]}`,
  //   valueInputOption: 'USER_ENTERED',
  //   requestBody: {
  //     values: [[koreanDateLocalString, ...answers, resultNum, resultString]],
  //   },
  // });

  return new Response(JSON.stringify({
    result: "result",
  }));


}

const extractSpreadsheetId = (url: string) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
