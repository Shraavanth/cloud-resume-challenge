export default function SkillCard({ skill }) {
  return (
    <div className="mb-4">
      <p>{skill.name}</p>
      <div className="bg-gray-200 h-2">
        <div
          className="bg-green-500 h-2"
          style={{ width: skill.value }}
        ></div>
      </div>
    </div>
  );
}