import { NextResponse } from "next/server";
import {
  getStoreKV,
  newStoreId,
  nowIso,
  readStoreList,
  writeStoreList,
} from "@/lib/cloudflare-store";

type StoredContactMessage = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

const CONTACT_KEY = "contact:list";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and message are required.",
        },
        { status: 400 }
      );
    }

    const contactData = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : "",
      message: String(message).trim(),
    };

    const kv = await getStoreKV();

    if (kv) {
      const messages = await readStoreList<StoredContactMessage>(
        kv,
        CONTACT_KEY
      );
      const timestamp = nowIso();
      const savedMessage: StoredContactMessage = {
        _id: newStoreId(),
        ...contactData,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await writeStoreList(kv, CONTACT_KEY, [savedMessage, ...messages]);

      return NextResponse.json({
        success: true,
        message: "Message sent successfully.",
        contact: savedMessage,
      });
    }

    const [{ connectDB }, { default: ContactMessage }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/ContactMessage"),
    ]);

    await connectDB();
    const savedMessage = await ContactMessage.create(contactData);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
      contact: savedMessage,
    });
  } catch (error) {
    console.error("POST /api/contact error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const kv = await getStoreKV();

    if (kv) {
      const messages = await readStoreList<StoredContactMessage>(
        kv,
        CONTACT_KEY
      );

      return NextResponse.json({
        success: true,
        messages: messages.sort((a, b) =>
          String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
        ),
      });
    }

    const [{ connectDB }, { default: ContactMessage }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/ContactMessage"),
    ]);

    await connectDB();
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("GET /api/contact error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}
