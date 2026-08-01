import { Link } from "react-router-dom";
import cloudIcon from "../assets/icons8-cloud-deve-50.png";
import cloudIcon2 from "../assets/icons8-cloud-dev-50.png";

export default function Navbar() {
  return (
    <nav className="scb-panel scb-nav scb-page-section scb-topbar">
      <div className="scb-brand">
        <span className="scb-cloud-logo" aria-hidden="true">
          <img src={cloudIcon} alt="Cloud icon" />
        </span>
        <div>
          <h1>Portfolio</h1>
          <p className="scb-page-meta">Cloud-first engineering portfolio</p>
        </div>
      </div>
      <div className="scb-nav-links">
        <Link to="/" className="scb-nav-link">Home</Link>
        <Link to="/about" className="scb-nav-link">About</Link>
        <Link to="/projects" className="scb-nav-link">Projects</Link>
        <Link to="/contact" className="scb-nav-link">Contact</Link>
      </div>
    </nav>
  );
}