import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';

const prisma = new PrismaClient();

// Update the type definition - params is now a Promise
type Params = { params: Promise<{ id: string }> };

export async function GET(
  req: NextRequest,
  context: Params
) {
  // Await the params before using them
  const { id } = await context.params; // ✅ MUST await the Promise

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { fullname: true }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: id },
      include: {
        product: true,
        variant: true,
      },
    });

    const orderInfo = {
      id: order.id,
      name: order.user.fullname,
      total: order.total,
      date: order.createdAt,
    };

    const products = orderItems.map((item) => ({
      Title: item.product.title,
      Price: item.price,
      Quantity: item.quantity,
      image: item.variant.img,
    }));

    return NextResponse.json({ orderInfo, products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}