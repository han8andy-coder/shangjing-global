import { NextResponse } from "next/server";

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-sjg-pathname", request.nextUrl.pathname);
  requestHeaders.set(
    "x-sjg-language",
    request.nextUrl.pathname.startsWith("/en") ? "en" : "zh",
  );

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
