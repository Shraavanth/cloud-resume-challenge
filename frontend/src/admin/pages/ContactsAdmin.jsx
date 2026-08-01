import { useEffect, useState } from "react";

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    // Replace with API later
    setContacts([
      { name: "John", message: "Hello!" }
    ]);
  }, []);

  return (
    <div className="scb-page-section">
      <h1 className="text-3xl font-bold mb-6 text-white">Contact Messages</h1>
      <section className="scb-panel">
        <div className="scb-page-header">
          <div>
            <p className="scb-page-meta">Admin inbox</p>
            <h1 className="scb-page-title">Contact Messages</h1>
          </div>
        </div>

        {contacts.length === 0 ? (
          <p>Loading messages...</p>
        ) : (
          <div className="scb-card-list">
            {contacts.map((c, i) => (
              <div key={i} className="scb-panel mb-4">
                <h3>{c.name}</h3>
                <p>{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}