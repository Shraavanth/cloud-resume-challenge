import { useEffect, useState } from "react";
import { getRating, postRating } from "../services/api";

export default function Rating() {
  const [avg, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchRating = async () => {
    try {
      const res = await getRating();
      setAvg(res.data?.averageRating ?? res.data?.avg ?? 0);
      setTotal(res.data?.totalRatings ?? 0);
    } catch (err) {
      console.warn("Could not fetch ratings:", err);
    }
  };

  useEffect(() => {
    fetchRating();
  }, []);

  const rate = async (score = 5) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await postRating({ score, rating: score });
      await fetchRating();
    } catch (err) {
      console.error("Failed to submit rating:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => rate(5)}
        disabled={submitting}
        className="text-yellow-400 hover:scale-110 transition-transform"
        title="Rate 5 stars"
      >
        ★★★★★
      </button>
      <p className="text-sm text-gray-300">
        Average: <span className="font-semibold text-white">{avg}</span> ({total} {total === 1 ? "rating" : "ratings"})
      </p>
    </div>
  );
}