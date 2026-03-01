import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Update the type - params is now a Promise
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ params is now a Promise
) {
  // Await the params before using them
  const { id } = await context.params; // ✅ MUST await now
  
  try {
    const existingVariant = await prisma.productVariant.findUnique({ where: { id } });
    if (!existingVariant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }
    const variant = await prisma.productVariant.update({
      where: { id },
      data: { availabilityStatus: 'ACTIVE' },
    });

    return NextResponse.json(variant, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reactivate variant';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}