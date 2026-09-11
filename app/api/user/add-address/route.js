import dbConnect from "@/config/db";
import Address from "@/models/Address";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const { address } = await req.json();
    const newAddress = await Address.create({ ...address, userId, created_at: Date.now() });
    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
