import { useEffect, useState } from "react";
import { getProjects } from "../services/api";
import ProjectCard from "../components/ProjectCard";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProjects()
      .then((res) => {
        const items = res.data?.projects || (Array.isArray(res.data) ? res.data : []);
        setProjects(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
        setError("Failed to load projects. Please try again later.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="scb-main scb-page-section">
      <h1 className="text-3xl font-bold mb-6 text-white">Projects</h1>
      <section className="scb-panel mb-8">
        <div className="scb-page-header">
          <div>
            <p className="scb-page-meta">Selected work samples</p>
            <h1 className="scb-page-title">Projects built for cloud scale, performance, and clean user experiences.</h1>
          </div>
        </div>
        <p className="mb-4">
          Browse a curated set of web and cloud projects showcasing React frontends, AWS-backed APIs, security best practices, and modern deployment workflows.
        </p>
      </section>

      <section className="scb-panel">
        <div className="scb-page-header">
          <h2 className="scb-page-title">Project list</h2>
        </div>

        {loading ? (
          <p>Loading projects...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <div className="scb-card-list">
            {projects.map((p, i) => (
              <ProjectCard key={p.projectId || i} project={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}