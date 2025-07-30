import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [rfis, setRfis] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('companyId');
    const projectId = params.get('projectId');

    if (!companyId) {
      setError('Missing companyId in URL');
      return;
    }

    const backendBaseUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001'
        : 'https://procore-rfi-backend-eeefbdd22e44.herokuapp.com';

    const fetchRFIs = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/rfis?companyId=${companyId}&projectId=${projectId}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('❌ Invalid response:', data);
          setError(data.error || 'Failed to fetch RFIs');
          return;
        }

        setRfis(data);
      } catch (err) {
        console.error('❌ Error fetching RFIs:', err);
        setError('Failed to fetch RFIs');
      }
    };

    fetchRFIs();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Request For Information (RFIs)</h1>
      {error && <p className="error-message">{error}</p>}
      {rfis.length === 0 && !error && <p>🔄 Loading RFIs...</p>}

      {rfis.length > 0 && (
        <table className="rfi-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>#</th>
              <th>Subject</th>
              <th>Ball In Court</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {rfis.map((rfi) => (
              <tr key={rfi.id}>
                <td><span className="status-indicator" /></td>
                <td><a href="/" className="rfi-link">{rfi.id}</a></td>
                <td><a href="/" className="rfi-link">{rfi.subject}</a></td>
                <td>{rfi.ball_in_court || ''}</td>
                <td>{rfi.due_date || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
