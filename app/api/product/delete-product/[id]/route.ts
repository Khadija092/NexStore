import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Update the type - params is now a Promise
type Params = { params: Promise<{ id: string }> };

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  // Await the params before using them
  const { id } = await params; // ✅ MUST await now

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    const product = await prisma.product.update({
      where: { id },
      data: { isDeleted: 'deleted' },
    });

    await prisma.productVariant.updateMany({
      where: { productId: id },
      data: { availabilityStatus: 'INACTIVE' },
    });
    return NextResponse.json({
        success: true,
        message: 'Product and its variants marked inactive',
        product,
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}