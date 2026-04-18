import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireConcierge() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  if (session.user.role !== "CONSERJE") return null;
  return session;
}

// DELETE /api/apartments/[id] — only if no packages and no residents
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireConcierge();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      _count: { select: { packages: true, residents: true } },
    },
  });

  if (!apartment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (apartment._count.packages > 0 || apartment._count.residents > 0) {
    return NextResponse.json(
      { error: "APARTMENT_IN_USE" },
      { status: 409 }
    );
  }

  await prisma.apartment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
