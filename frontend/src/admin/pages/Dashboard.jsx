import { useEffect, useState } from "react";
import { getVisitors, getProjects } from "../../services/api";

export default function Dashboard() {
  const [visitors, setVisitors] = useState(0);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getVisitors().then(res => setVisitors(res.data.total));
    getProjects().then(res => setProjects(res.data));
  }, []);

  return (
    <div className="scb-page-section">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>
      <section className="scb-panel mb-8">
        <div className="scb-page-header">
          <div>
            <p className="scb-page-meta">Admin overview</p>
            <h1 className="scb-page-title">Dashboard</h1>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="scb-panel">
            <h3>Total Visitors</h3>
            <p>{visitors}</p>
          </div>
          <div className="scb-panel">
            <h3>Total Projects</h3>
            <p>{projects.length}</p>
          </div>
        </div>
      </section>
    </div>
  );
}