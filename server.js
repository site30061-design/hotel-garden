
import express from "express";
import cors from "cors";
import { Resend } from "resend";

const app = express();

app.use(cors({
  origin: "https://hotelgreengarden.in"
}));

app.use(express.json());

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing");
}

const resend = new Resend(process.env.RESEND_API_KEY);

app.get("/", (req, res) => {
  res.send("Hotel Green Garden API is running");
});

app.post("/send-booking", async (req, res) => {
  const { name, email, phone, room, guests, date } = req.body;

  if (!name || !email || !phone || !room || !guests || !date) {
    return res.status(400).json({
      error: "All booking fields are required"
    });
  }

  try {
    const result = await resend.emails.send({
      from: "Hotel Booking <onboarding@resend.dev>",
      to: ["hotelgreengarden0112@gmail.com"],
      replyTo: email,
      subject: "New Room Booking",
      html: `
        <h2>New Booking Received</h2>
        <p>Name: ${escapeHtml(name)}</p>
        <p>Email: ${escapeHtml(email)}</p>
        <p>Phone: ${escapeHtml(phone)}</p>
        <p>Room: ${escapeHtml(room)}</p>
        <p>Guests: ${escapeHtml(guests)}</p>
        <p>Date: ${escapeHtml(date)}</p>
      `
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Email error:", error.message);

    res.status(500).json({
      error: "Unable to send booking email"
    });
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Hotel Green Garden API running on port ${PORT}`);
});
