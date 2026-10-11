import { useEffect, useState } from "react";
import { getContacts } from "../../services/api";

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContacts = () => {
    setLoading(true);
    getContacts()
      .then((res) => {
        const items = res.data?.contacts || (Array.isArray(res.data) ? res.data : []);
        setContacts(items);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load contacts:", err);
        setError("Failed to load contact messages. Please ensure you are logged in as an Administrator.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadContacts();
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

        {loading ? (
          <p>Loading messages...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : contacts.length === 0 ? (
          <p>No messages received yet.</p>
        ) : (
          <div className="scb-card-list">
            {contacts.map((c, i) => (
              <div key={c.contactId || i} className="scb-panel mb-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-white">{c.name}</h3>
                  <span className="text-xs text-gray-400">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                <p className="text-sm text-blue-400 mb-2">{c.email}</p>
                <p className="text-gray-300 whitespace-pre-wrap">{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}