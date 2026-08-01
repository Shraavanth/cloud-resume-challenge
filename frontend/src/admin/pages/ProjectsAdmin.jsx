import { useEffect, useState } from "react";
import { getProjects } from "../../services/api";

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then(res => setProjects(res.data));
  }, []);

  return (
    <div className="scb-page-section">
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Projects</h1>
      <section className="scb-panel">
        <div className="scb-page-header">
          <div>
            <p className="scb-page-meta">Project administration</p>
            <h1 className="scb-page-title">Manage Projects</h1>
          </div>
        </div>

        {projects.length === 0 ? (
          <p>Loading projects...</p>
        ) : (
          <div className="scb-card-list">
            {projects.map((p, i) => (
              <div key={i} className="scb-panel mb-4">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="mt-3">
                  <button className="btn mr-2">Edit</button>
                  <button className="btn bg-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}