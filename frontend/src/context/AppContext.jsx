import { createContext, useEffect, useState } from "react";
import { getVisitors } from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    getVisitors().then(res => setVisitors(res.data.total));
  }, []);

  return (
    <AppContext.Provider value={{ visitors }}>
      {children}
    </AppContext.Provider>
  );
};