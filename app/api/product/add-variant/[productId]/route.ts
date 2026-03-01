import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // singleton import

// Update the type - params is now a Promise
type Params = { params: Promise<{ productId: string }> };

export async function POST(
  req: NextRequest,
  { params }: Params
) {
  // Await the params before using them
  const { productId } = await params; // ✅ MUST await now

  try {
    const body = await req.json();

    const existingVariant = await prisma.productVariant.findUnique({
      where: {
        productId_colour_size: {
          productId,
          colour: body.colour,
          size: body.size,
        },
      },
    });

    if (existingVariant) {
      return NextResponse.json(
        {
          success: false,
          error: `Variant with colour "${body.colour}" and size "${body.size}" already exists.`,
          code: 'DUPLICATE_VARIANT',
        },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        colour: body.colour,
        colourcode: body.colourcode,
        size: body.size,
        stock: body.stock,
        price: body.price,
        img: body.img,
      },
    });

    return NextResponse.json({ success: true, variant }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add variant';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}