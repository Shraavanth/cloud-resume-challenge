import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-black text-white h-screen p-4">
      <h2 className="text-xl mb-6">Admin</h2>

      <ul>
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/projects">Projects</Link></li>
        <li><Link to="/admin/contacts">Contacts</Link></li>
      </ul>
    </div>
  );
}