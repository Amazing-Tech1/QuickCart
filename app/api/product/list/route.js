import { NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/config/db";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({});
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
