import React, { useEffect, useState } from 'react';
import './Dashboard.css'; // Make sure this file exists

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

    const fetchRFIs = async () => {
      try {
        console.log('📡 Fetching RFIs...');
        const res = await fetch(`http://localhost:3001/rfis?companyId=${companyId}&projectId=${projectId}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('❌ Invalid response:', data);
          setError(data.error || 'Failed to fetch RFIs');
          return;
        }

        console.log('✅ RFIs:', data);
        setRfis(data);
      } catch (err) {
        console.error('❌ Error fetching RFIs:', err);
        setError('Failed to fetch RFIs');
      }
    };

    fetchRFIs();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Request For Information (RFIs)</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
                <td>
                  <a href="/" className="rfi-link">{rfi.id}</a>
                </td>
                <td>
                  <a href="/" className="rfi-link">{rfi.subject}</a>
                </td>
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
