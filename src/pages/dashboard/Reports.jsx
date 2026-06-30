import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

function Reports() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <section className="page">
          <div className="page-title">
            <h1>Reports</h1>
            <p>Monthly and yearly school reports</p>
          </div>

          <div className="content-card">
            <h2>Reports Section</h2>
            <p className="subtitle">Report features will be connected later.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Reports;