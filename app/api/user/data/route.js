import dbConnect from "@/config/db";
import User from "@/models/User";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await dbConnect();

    let user = await User.findById(userId);

    if (!user) {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Clerk user not found",
          },
          { status: 404 },
        );
      }

      user = await User.create({
        _id: userId,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress,
        imageUrl: clerkUser.imageUrl,
        cartItems: {},
      });
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
