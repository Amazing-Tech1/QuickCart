import dbConnect from "@/config/db";
import authSeller from "@/lib/authSeller";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import Product from "@/models/Product";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { userId } = await auth();

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 404 });
    }
    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");

    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one image is required" },
        { status: 400 },
      );
    }

    const images = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            },
          );

          stream.end(buffer);
        });
      }),
    );

    await dbConnect();
    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      images,
      date: Date.now(),
    });

    return NextResponse.json(
      { success: true, message: "Product added successfully" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
