import { NextResponse } from "next/server";

export function sendResponse(
  success: boolean,
  message: string,
  statusCode: number = success ? 200 : 400, // Default status code
  data?: object
) {
  return NextResponse.json(
    { success, message, data },
    { status: statusCode }
  );
}
