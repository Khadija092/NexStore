import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Update the type - params is now a Promise
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ params is now a Promise
) {
  try {
    // Await the params before using them
    const { id } = await context.params; // ✅ MUST await now
    
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id },
    });
    
    if (!existingVariant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }
    
    const variant = await prisma.productVariant.update({
      where: { id },
      data: { availabilityStatus: 'INACTIVE' },
    });
    
    return NextResponse.json({ success: true, variant }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}