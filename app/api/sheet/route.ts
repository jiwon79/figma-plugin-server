import { google } from 'googleapis';
import { GaxiosError } from "gaxios";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const sheetUrl = query.get('sheetUrl');
  const sheetName = query.get('sheetName');
  if (sheetUrl == null) {
    // Return Response with code 400
    return new Response(JSON.stringify({
      error: 'url is required',
      errorCode: 'URL_REQUIRED',
    }), {
      status: 400,
    });
  }
  if (sheetName == null) {

    return new Response(JSON.stringify({
      error: 'sheetName is required',
      errorCode: 'SHEET_NAME_REQUIRED',
    }), {
      status: 400,
    });
  }

  const sheetId = extractSpreadsheetId(sheetUrl);
  if (sheetId === null) return;

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
        spreadsheetId: sheetId,
        range: sheetName,
      }
    )
    console.log(response.data)
    return new Response(JSON.stringify({
      range: response.data.range,
      values: response.data.values,
    }))

  } catch (error: GaxiosError | any) {
    if (error instanceof GaxiosError) {
      console.log(error.code)
      console.log(typeof error.code)

      if (error.code === undefined) {
        console.log("error.code is undefined")
        console.log(error.message)
        return new Response(JSON.stringify({
          error: error.message,
          errorCode: 'UNEXPECTED_ERROR',
        }));
      }

      switch (error.code.toString()) {
        case "400":
          if (error.message.startsWith("Unable to parse range")) {
            return new Response(JSON.stringify({
              error: error.message,
              errorCode: 'UNABLE_TO_PARSE_RANGE',
            }), {
              status: 400,
            });
          } else {
            console.log("UNEXPECTED_ERROR")
            return new Response(JSON.stringify({
              error: error.message,
              errorCode: 'UNEXPECTED_ERROR',
            }), {
              status: 400,
            });
          }
        case "403":
          console.log("PERMISSION_DENIED")
          return new Response(JSON.stringify({
            error: error.message,
            errorCode: 'PERMISSION_DENIED',
          }), {
            status: 403,
          });
        default:
          return new Response(JSON.stringify({
            error: error.message,
            errorCode: 'UNEXPECTED_ERROR',
          }), {
            status: 400,
          });
      }
    } else {
      return new Response(JSON.stringify({
        error: error.message,
        errorCode: 'UNEXPECTED_ERROR',
      }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({
      result: "result",
    }));
  }
}

const extractSpreadsheetId = (url: string) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
