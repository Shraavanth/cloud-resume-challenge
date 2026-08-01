export default function ProjectCard({ project }) {
  return (
    <div className="border p-4 mb-3 rounded-lg shadow bg-white">
      <h3 className="text-xl font-bold">
        {project.Title}
      </h3>

      <p className="mt-2">
        {project.Description}
      </p>

      <p className="mt-2 text-gray-600">
        <strong>Technologies:</strong> {project.Technologies}
      </p>

      <a
        href={project.GitHubURL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline mt-3 inline-block"
      >
        GitHub
      </a>
    </div>
  );
}