import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import About from "./pages/About";
/** Admin Pages */
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import ProjectsAdmin from "./admin/pages/ProjectsAdmin";
import ContactsAdmin from "./admin/pages/ContactsAdmin";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminLayout from "./admin/components/AdminLayout";

export default function App() {
  return (
    <BrowserRouter>
      <div className="scb-layout">
        <Navbar />
        <main className="scb-page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/projects" element={
              <ProtectedRoute>
                <AdminLayout>
                  <ProjectsAdmin />
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/contacts" element={
              <ProtectedRoute>
                <AdminLayout>
                  <ContactsAdmin />
                </AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}