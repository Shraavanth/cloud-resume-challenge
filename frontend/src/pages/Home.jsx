import { useEffect, useState } from "react";
import { getSkills } from "../services/api";
import SkillCard from "../components/SkillCard";

export default function Home() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkills()
      .then((res) => {
        const items = res.data?.skills || (Array.isArray(res.data) ? res.data : []);
        setSkills(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load skills:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="scb-main scb-page-section">
      <h1 className="text-3xl font-bold mb-6 text-white">Home</h1>
      <section className="scb-panel mb-8">
        <div className="scb-page-header">
          <div>
            <p className="scb-page-meta">Cloud-first software engineer</p>
            <h1 className="scb-page-title">Building modern web apps with React, AWS, and secure cloud architecture.</h1>
          </div>
        </div>
        <p className="mb-4">
          I design and deliver full-stack solutions that are scalable, maintainable, and aligned with enterprise cloud best practices.
          From API development and serverless workflows to polished frontend experiences, I help ideas become production-ready products.
        </p>
        <div className="scb-nav-links">
          <a href="/projects" className="scb-nav-link">View Projects</a>
          <a href="/contact" className="scb-nav-link">Get in Touch</a>
        </div>
      </section>

      <section className="scb-panel">
        <div className="scb-page-header">
          <h2 className="scb-page-title">Core Skills</h2>
        </div>

        {loading ? (
          <p>Loading skills...</p>
        ) : skills.length === 0 ? (
          <p>No skills listed yet.</p>
        ) : (
          <div className="scb-card-list">
            {skills.map((skill, index) => (
              <SkillCard key={skill.skillId || index} skill={skill} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}