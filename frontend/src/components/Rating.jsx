import { useEffect, useState } from "react";
import { getRating, postRating } from "../services/api";

export default function Rating() {
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    getRating().then(res => setAvg(res.data.avg));
  }, []);

  const rate = async () => {
    await postRating({ rating: 5 });
    const res = await getRating();
    setAvg(res.data.avg);
  };

  return (
    <div>
      <button onClick={rate}>★★★★★</button>
      <p>Average: {avg}</p>
    </div>
  );
}