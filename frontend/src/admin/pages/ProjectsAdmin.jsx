import { useEffect, useState } from "react";
import { getProjects, deleteProject } from "../../services/api";

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const loadProjects = () => {
    setLoading(true);
    getProjects()
      .then((res) => {
        const items = res.data?.projects || (Array.isArray(res.data) ? res.data : []);
        setProjects(items);
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteProject(id);
      setStatusMessage(`Deleted "${title}" successfully.`);
      loadProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      setStatusMessage(`Error deleting project: ${err.response?.data?.message || err.message}`);
    }
  };

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

        {statusMessage && (
          <div className="p-3 mb-4 rounded bg-gray-800 text-sm text-yellow-300">
            {statusMessage}
          </div>
        )}

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <div className="scb-card-list">
            {projects.map((p, i) => (
              <div key={p.projectId || i} className="scb-panel mb-4">
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="text-gray-300 mt-1">{p.description}</p>
                {p.techStack && p.techStack.length > 0 && (
                  <p className="text-xs text-blue-400 mt-2">
                    Stack: {p.techStack.join(", ")}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleDelete(p.projectId, p.title)}
                    className="btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}