"use client";
import { useState, useEffect } from "react";

const MENUS = [
  { id: "haircut", label: "💇 Haircut & Styling", price: "$45+" },
  { id: "color", label: "🎨 Hair Coloring", price: "$80+" },
  { id: "nails", label: "💅 Nail Art", price: "$35+" },
  { id: "facial", label: "✨ Facial Treatment", price: "$60+" },
  { id: "massage", label: "💆 Head Massage", price: "$40+" },
];

export default function BookingForm() {
  const [igId, setIgId] = useState("");
  const [form, setForm] = useState({ name: "", email: "", date: "", menu: "", refImage: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIgId(params.get("ig_id") || "");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
      if (!webhookUrl) throw new Error("Webhook URL not configured");
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ig_id: igId, ...form }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">💖</div>
          <p className="text-lg text-gray-700">Booking confirmed! Check your Instagram DMs for details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-5">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Book Your Appointment
        </h1>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Your Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Date & Time</label>
          <input
            type="datetime-local"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Service</label>
          <div className="space-y-2">
            {MENUS.map((m) => (
              <label
                key={m.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                  form.menu === m.id ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="menu"
                    value={m.id}
                    checked={form.menu === m.id}
                    onChange={(e) => setForm({ ...form, menu: e.target.value })}
                    className="accent-purple-500"
                  />
                  <span>{m.label}</span>
                </div>
                <span className="text-sm text-gray-400">{m.price}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Reference Image URL (optional)</label>
          <input
            type="url"
            placeholder="https://instagram.com/p/..."
            value={form.refImage}
            onChange={(e) => setForm({ ...form, refImage: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting" || !form.menu}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting..." : "Confirm Booking"}
        </button>

        {status === "error" && <p className="text-red-500 text-center text-sm">Something went wrong. Please try again.</p>}
      </form>
    </div>
  );
}
