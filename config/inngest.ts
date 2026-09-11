// src/inngest/client.ts

import { Inngest } from "inngest";
import dbConnect from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

export const inngest = new Inngest({
  id: "quickcart-next",
});

// Inngest function to save user data to database
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: {
      event: "clerk/user.created",
    },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    await dbConnect();
    await User.create(userData);
  },
);

// Inngest function to update user data to database
export const syncUserUpdate = inngest.createFunction(
  {
    id: "user-update-from-clerk",
    triggers: {
      event: "clerk/user.updated",
    },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    await dbConnect();
    await User.updateOne({ _id: id }, userData);
  },
);

// Inngest function to delete user data from database
export const syncUserDeletion = inngest.createFunction(
  {
    id: "user-deletion-from-clerk",
    triggers: {
      event: "clerk/user.deleted",
    },
  },
  async ({ event }) => {
    const { id } = event.data;

    await dbConnect();
    await User.deleteOne({ _id: id });
  },
);

// inngest function to create user order in db
export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
    triggers: {
      event: "order/created",
    },
  },
  async ({ events }) => {
    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        status: event.data.status,
        created_at: event.data.created_at,
      };
    });
    await dbConnect();
    await Order.insertMany(orders);
    return { success: true, processed: orders.length };
  },
);
