import dbConnect from "@/config/db";
import Address from "@/models/Address";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const addresses = await Address.find({ userId });
    return NextResponse.json({
      success: true,
      message: "Addresses retrieved successfully",
      addresses,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
