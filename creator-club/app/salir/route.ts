import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const c = await cookies();
  c.delete("cc_creator");
  return NextResponse.redirect(new URL("/", req.url));
}
