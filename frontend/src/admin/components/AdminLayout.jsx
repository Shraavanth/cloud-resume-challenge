import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <header className="admin-header scb-panel">
          <div className="scb-brand">
            <span className="scb-cloud-logo" aria-hidden="true">☁</span>
            <div>
              <h1>Admin Console</h1>
              <p className="scb-page-meta">Cloud management dashboard</p>
            </div>
          </div>
        </header>
        <main className="scb-main scb-page-section admin-content">{children}</main>
      </div>
    </div>
  );
}