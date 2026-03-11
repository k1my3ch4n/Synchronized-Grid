import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireWorkspaceMember,
  hasPermission,
} from "@/lib/auth-helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await requireWorkspaceMember(id, user.id!);

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        _count: { select: { rooms: true } },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "워크스페이스를 찾을 수 없습니다" },
        { status: 404 },
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Not a member of this workspace") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const member = await requireWorkspaceMember(id, user.id!);

    if (!hasPermission(member.role, "OWNER")) {
      return NextResponse.json(
        { error: "OWNER 권한이 필요합니다" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, slug } = body;

    const updateData: Record<string, string> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "워크스페이스 이름은 필수입니다" },
          { status: 400 },
        );
      }
      if (name.length > 50) {
        return NextResponse.json(
          { error: "워크스페이스 이름은 50자 이하여야 합니다" },
          { status: 400 },
        );
      }
      updateData.name = name.trim();
    }

    if (slug !== undefined) {
      if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
        return NextResponse.json(
          { error: "슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다" },
          { status: 400 },
        );
      }
      const existing = await prisma.workspace.findUnique({ where: { slug } });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "이미 사용 중인 슬러그입니다" },
          { status: 409 },
        );
      }
      updateData.slug = slug;
    }

    const workspace = await prisma.workspace.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { rooms: true, members: true } },
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Not a member of this workspace") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const member = await requireWorkspaceMember(id, user.id!);

    if (!hasPermission(member.role, "OWNER")) {
      return NextResponse.json(
        { error: "OWNER 권한이 필요합니다" },
        { status: 403 },
      );
    }

    await prisma.workspace.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Not a member of this workspace") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
