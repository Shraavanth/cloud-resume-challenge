import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function VisitorCounter() {
  const { visitors } = useContext(AppContext);

  return (
    <span className="scb-nav-link flex items-center gap-1.5 text-xs font-mono" title="Total Portfolio Visitors">
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>Visitors:</span>
      <strong className="text-white bg-blue-700/60 px-1.5 py-0.5 rounded">{visitors || 1}</strong>
    </span>
  );
}