import { createContext, useEffect, useState } from "react";
import { recordVisitor, getVisitors } from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    // Record visit on page load and update visitor counter
    recordVisitor()
      .then((res) => {
        const count = res.data?.totalVisits ?? res.data?.total ?? 0;
        setVisitors(count);
      })
      .catch(() => {
        // Fallback to GET visitor if POST fails
        getVisitors()
          .then((res) => {
            const count = res.data?.totalVisits ?? res.data?.total ?? 0;
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