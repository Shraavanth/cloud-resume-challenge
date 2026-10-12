export default function SkillCard({ skill }) {
  const name = skill.name || skill.skillName || "Skill";
  const category = skill.category;
  const rawValue = skill.proficiency !== undefined ? skill.proficiency : skill.value;
  const numericValue =
    typeof rawValue === "number"
      ? Math.min(100, Math.max(0, rawValue))
      : parseInt(rawValue, 10) || 85;
  const widthStr = `${numericValue}%`;

  return (
    <div className="card p-3 mb-3 border border-gray-150 rounded bg-white shadow-sm">
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-semibold text-gray-800">{name}</span>
        {category && <span className="text-xs text-gray-500 font-normal">({category})</span>}
        <span className="text-xs font-bold text-blue-600">{widthStr}</span>
      </div>
      <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: widthStr }}
        ></div>
      </div>
    </div>
  );
}