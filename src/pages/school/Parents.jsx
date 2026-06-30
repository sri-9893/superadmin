import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiSearch, FiMail, FiPhone } from "react-icons/fi";

export default function Parents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem("school_students") || "[]");
    setStudents(storedStudents);
  }, []);

  // Filter unique parent list
  const uniqueParents = [];
  const usernamesSeen = new Set();

  students.forEach(student => {
    if (student.parentUsername && !usernamesSeen.has(student.parentUsername)) {
      usernamesSeen.add(student.parentUsername);
      uniqueParents.push({
        name: student.parentName,
        mobile: student.parentMobile,
        email: student.parentEmail,
        username: student.parentUsername,
        childName: student.name,
        className: student.className,
        section: student.section
      });
    }
  });

  const filteredParents = uniqueParents.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.childName.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Parents Directory</h3>
            <p>Access parent contact profiles and linked student accounts</p>
          </div>
        </header>

        <div className="page">
          <div className="card search-card">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search by parent name, child name, or login username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card mt-md">
            <div className="card-header">
              <h3>Parent Directory Contacts ({filteredParents.length})</h3>
            </div>

            {filteredParents.length === 0 ? (
              <div className="empty-state">
                <p>No parents contact cards found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Parent Name</th>
                      <th>Linked Child</th>
                      <th>Class & Section</th>
                      <th>Mobile Number</th>
                      <th>Email Address</th>
                      <th>Login Username</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.map((parent, idx) => (
                      <tr key={idx}>
                        <td data-label="Parent Name"><strong>{parent.name}</strong></td>
                        <td data-label="Linked Child">{parent.childName}</td>
                        <td data-label="Class & Section">
                          <span className="badge badge-info">{parent.className} - {parent.section}</span>
                        </td>
                        <td data-label="Mobile Number">
                          <a href={`tel:${parent.mobile}`} className="contact-link">
                            <FiPhone /> {parent.mobile}
                          </a>
                        </td>
                        <td data-label="Email Address">
                          {parent.email ? (
                            <a href={`mailto:${parent.email}`} className="contact-link">
                              <FiMail /> {parent.email}
                            </a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td data-label="Login Username"><code>{parent.username}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
