export default function ProjectCard({ project }) {
  const title = project.title || project.Title || "Project";
  const description = project.description || project.Description || "";
  const techStack = project.techStack || project.Technologies || [];
  const githubUrl = project.githubUrl || project.GitHubURL || project.github;
  const liveUrl = project.liveUrl || project.LiveURL || project.live;

  const techBadges = Array.isArray(techStack)
    ? techStack
    : typeof techStack === "string"
    ? techStack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="card border border-gray-200 p-5 mb-4 rounded-lg shadow-sm bg-white hover:shadow-md transition">
      <h3 className="text-xl font-bold text-gray-900">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-gray-700 text-sm leading-relaxed">
          {description}
        </p>
      )}

      {techBadges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <strong className="text-xs text-gray-500 mr-1">Stack:</strong>
          {techBadges.map((tech, i) => (
            <span
              key={i}
              className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-4 text-sm font-semibold">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <span>GitHub Repository</span> &rarr;
          </a>
        )}
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            <span>Live Demo</span> &rarr;
          </a>
        )}
      </div>
    </div>
  );
}