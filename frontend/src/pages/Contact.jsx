import { useState } from "react";
import { sendContact } from "../services/api";

export default function Contact() {
  const [form, setForm] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendContact(form);
    alert("Message sent!");
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

        <form onSubmit={handleSubmit} className="scb-form">
          <input className="scb-input" placeholder="Name" onChange={e => setForm({...form, name:e.target.value})} />
          <input className="scb-input" placeholder="Email" onChange={e => setForm({...form, email:e.target.value})} />
          <textarea className="scb-textarea" placeholder="Message" onChange={e => setForm({...form, message:e.target.value})} />
          <button className="btn w-full">Send</button>
        </form>
      </section>
    </div>
  );
}