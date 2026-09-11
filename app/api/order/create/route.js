import dbConnect from "@/config/db";
import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = await auth();
    const { address, items } = await request.json();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (!address || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Data",
        },
        { status: 400 },
      );
    }

    let amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: "Product not found",
          },
          { status: 404 },
        );
      }

      const price = product.offerPrice;

      amount += price * item.quantity;

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: price,
      });
    }

    const totalAmount = amount + Math.floor(amount * 0.02);

    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items: orderItems,
        amount: totalAmount,
        created_at: Date.now(),
      },
    });

    // Clear user cart
    const user = await User.findById(userId);

    if (user) {
      user.cartItems = {};
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Orders Placed successfully",
    });
  } catch (error) {
    console.error("Error placing order:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
