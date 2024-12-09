import { NextApiResponse } from "next";

  export function sendResponse(
    res: NextApiResponse,
    success: boolean,
    message: string,
    statusCode: number = success ? 200 : 400, // Default status code
    data?: object
  ) {
    res.status(statusCode).json({ success, message, data });
  }
  