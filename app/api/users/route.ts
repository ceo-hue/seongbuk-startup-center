/**
 * Users API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { logInfo } from "@/lib/core/error/error-logger";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  await logInfo('Users fetched', { count: users.length });

  return NextResponse.json(users);
});
