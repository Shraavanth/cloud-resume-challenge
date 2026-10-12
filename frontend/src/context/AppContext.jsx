import { createContext, useEffect, useState } from "react";
import { recordVisitor, getVisitors } from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    // Only increment visitor count once per browser session
    const hasVisited = sessionStorage.getItem("portfolio_visit_recorded");
    const fetchOrRecord = hasVisited ? getVisitors() : recordVisitor();

    fetchOrRecord
      .then((res) => {
        if (!hasVisited) {
          sessionStorage.setItem("portfolio_visit_recorded", "true");
        }
        const count = res.data?.totalVisits ?? res.data?.total ?? res.data?.count ?? 0;
        setVisitors(count);
      })
      .catch(() => {
        getVisitors()
          .then((res) => {
            const count = res.data?.totalVisits ?? res.data?.total ?? res.data?.count ?? 0;
            setVisitors(count);
          })
          .catch((err) => console.warn("Visitor analytics unavailable:", err));
      });
  }, []);

  return (
    <AppContext.Provider value={{ visitors }}>
      {children}
    </AppContext.Provider>
  );
};