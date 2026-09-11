import dbConnect from "@/config/db";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    const { cartItems } = user;
    return NextResponse.json({
      success: true,
      message: "Cart retrieved successfully",
      cartItems: cartItems,
    });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
