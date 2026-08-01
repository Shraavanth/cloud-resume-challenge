import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function VisitorCounter() {
  const { visitors } = useContext(AppContext);

  return <p>Total Visitors: {visitors}</p>;
}