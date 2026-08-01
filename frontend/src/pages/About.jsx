export default function About() {
  return (
    <div className="scb-main scb-page-section">

      <h1 className="text-3xl font-bold mb-6 text-white">About Me</h1>

      {/* Profile Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        <p>
          Passionate cloud and software developer with a strong interest in
          building scalable, secure, and serverless applications using modern
          technologies. Focused on AWS cloud architecture, DevOps practices,
          and full-stack development.
        </p>
      </div>

      {/* Education */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-2">Education</h2>
        <ul className="list-disc ml-5">
          <li>Bachelor's Degree in Computer Science</li>
          <li>Relevant Coursework: Cloud Computing, Cybersecurity, Data Structures</li>
        </ul>
      </div>

      {/* Career Objective */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-2">Career Objective</h2>
        <p>
          To work as a cloud engineer or full-stack developer where I can
          contribute to building secure and scalable applications while
          continuously improving my technical and problem-solving skills.
        </p>
      </div>

      {/* Technical Interests */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Technical Interests</h2>
        <ul className="list-disc ml-5">
          <li>AWS Cloud & Serverless Architecture</li>
          <li>Cybersecurity & Zero Trust Systems</li>
          <li>Full Stack Development</li>
          <li>DevOps & CI/CD Automation</li>
        </ul>
      </div>

    </div>
  );
}