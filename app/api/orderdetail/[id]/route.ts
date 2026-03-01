import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';

const prisma = new PrismaClient();

type Params = { params: { id: string } }; // ✅ fully typed

export async function GET(
  req: NextRequest,
  context: Params
) {
  const { id } = context.params; // ✅ typed, no casting needed

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
  }
}