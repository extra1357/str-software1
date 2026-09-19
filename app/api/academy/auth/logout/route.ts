import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ACADEMY_SESSION_COOKIE,
} from "@/lib/auth-academy";

function obterAppOrigin(): string | null {
  const appUrl =
    process.env.APP_URL?.trim();

  if (!appUrl) {
    console.error(
      "[academy-logout] APP_URL ausente",
    );

    return null;
  }

  try {
    const url = new URL(appUrl);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return null;
    }

    if (
      process.env.NODE_ENV === "production" &&
      url.protocol !== "https:"
    ) {
      return null;
    }

    return url.origin;
  } catch {
    console.error(
      "[academy-logout] APP_URL invalida",
    );

    return null;
  }
}

function origemPermitida(
  request: NextRequest,
  appOrigin: string,
): boolean {
  const origin =
    request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return (
      new URL(origin).origin ===
      appOrigin
    );
  } catch {
    return false;
  }
}

export async function POST(
  request: NextRequest,
) {
  const appOrigin =
    obterAppOrigin();

  if (!appOrigin) {
    return NextResponse.json(
      {
        erro:
          "Logout temporariamente indisponível.",
      },
      {
        status: 503,
      },
    );
  }

  if (
    !origemPermitida(
      request,
      appOrigin,
    )
  ) {
    console.warn(
      "[academy-logout] origem rejeitada",
    );

    return NextResponse.json(
      {
        erro:
          "Solicitação não autorizada.",
      },
      {
        status: 403,
      },
    );
  }

  const response =
    NextResponse.json(
      {
        mensagem:
          "Sessão encerrada.",
      },
      {
        status: 200,
      },
    );

  response.cookies.set(
    ACADEMY_SESSION_COOKIE,
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    },
  );

  console.info(
    "[academy-logout] sessao encerrada",
  );

  return response;
}