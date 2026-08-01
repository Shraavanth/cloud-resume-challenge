import { useEffect, useState } from "react";
import { getProjects } from "../services/api";
import ProjectCard from "../components/ProjectCard";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then(res => setProjects(res.data));
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

        {projects.length === 0 ? (
          <p>Loading projects...</p>
        ) : (
          <div className="scb-card-list">
            {projects.map((p, i) => (
              <ProjectCard key={i} project={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}