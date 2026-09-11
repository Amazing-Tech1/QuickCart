import authSeller from "@/lib/authSeller";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/config/db";
import Order from "@/models/Order";

export async function GET() {
  try {
    const { userId } = auth();
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 404 });
    }
    await dbConnect();
    const orders = await Order.find({}).populate("address").populate("items.product");
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
