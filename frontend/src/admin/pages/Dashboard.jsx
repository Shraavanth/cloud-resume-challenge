import { useEffect, useState } from "react";
import { getVisitors, getProjects } from "../../services/api";

export default function Dashboard() {
  const [visitors, setVisitors] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getVisitors(), getProjects()]).then(([visRes, projRes]) => {
      if (visRes.status === "fulfilled") {
        const count = visRes.value.data?.totalVisits ?? visRes.value.data?.total ?? 0;
        setVisitors(count);
      }
      if (projRes.status === "fulfilled") {
        const items = projRes.value.data?.projects || (Array.isArray(projRes.value.data) ? projRes.value.data : []);
        setProjects(items);
      }
      setLoading(false);
    });
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
        {loading ? (
          <p>Loading dashboard metrics...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="scb-panel">
              <h3>Total Visitors</h3>
              <p className="text-2xl font-bold text-blue-400">{visitors}</p>
            </div>
            <div className="scb-panel">
              <h3>Total Projects</h3>
              <p className="text-2xl font-bold text-green-400">{projects.length}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}