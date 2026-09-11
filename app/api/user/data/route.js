import dbConnect from "@/config/db";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error fetching user data",
      },
      { status: 500 },
    );
  }
}
