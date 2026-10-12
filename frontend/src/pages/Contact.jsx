import { useState } from "react";
import { sendContact } from "../services/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields (name, email, and message).");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      await sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Failed to submit contact message:", err);
      setStatus("error");
      setErrorMessage(
        err.response?.data?.message ||
          "Unable to send message at this time. Please try again later or reach out via LinkedIn/GitHub."
      );
    }
  };

  return (
    <div className="scb-main scb-page-section">
      <h1 className="text-3xl font-bold mb-6 text-white">Contact Me</h1>
      <section className="scb-panel mb-8">
        <div className="scb-page-header">
          <div>
            <p className="scb-page-meta">Let's build something great.</p>
            <h1 className="scb-page-title">Send a message and I’ll get back to you fast.</h1>
          </div>
        </div>
        <p className="mb-4">
          Whether you want to discuss a new project, need help with cloud architecture, or are exploring collaboration opportunities, I’m here to help.
        </p>
      </section>

      <section className="scb-panel">
        <div className="scb-page-header">
          <h2 className="scb-page-title">Contact Form</h2>
        </div>

        {status === "success" && (
          <div className="p-4 mb-4 rounded bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-sm">
            Thank you! Your message has been sent successfully. I will get back to you shortly.
          </div>
        )}

        {status === "error" && (
          <div className="p-4 mb-4 rounded bg-red-900/60 border border-red-500 text-red-200 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="scb-form">
          <input
            className="scb-input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={status === "submitting"}
          />
          <input
            className="scb-input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={status === "submitting"}
          />
          <textarea
            className="scb-textarea"
            placeholder="Message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            disabled={status === "submitting"}
          />
          <button
            type="submit"
            className="btn w-full disabled:opacity-50"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </div>
  );
}