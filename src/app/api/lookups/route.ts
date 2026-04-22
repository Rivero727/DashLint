import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = String(searchParams.get("type") ?? "").trim();
  const q = String(searchParams.get("q") ?? "").trim();

  if (!type || !["client", "company"].includes(type)) {
    return NextResponse.json(
      { message: "Tipo de búsqueda inválido." },
      { status: 400 },
    );
  }

  if (q.length < 1) {
    return NextResponse.json({ items: [] });
  }

  if (type === "client") {
    const clients = await prisma.client.findMany({
      where: {
        clientName: {
          contains: q,
          mode: "insensitive",
        },
      },
      orderBy: {
        clientName: "asc",
      },
      take: 8,
      select: {
        clientName: true,
      },
    });

    return NextResponse.json({
      items: clients.map((item) => item.clientName),
    });
  }

  const companies = await prisma.company.findMany({
    where: {
      companyName: {
        contains: q,
        mode: "insensitive",
      },
    },
    orderBy: {
      companyName: "asc",
    },
    take: 8,
    select: {
      companyName: true,
    },
  });

  return NextResponse.json({
    items: companies.map((item) => item.companyName),
  });
}
