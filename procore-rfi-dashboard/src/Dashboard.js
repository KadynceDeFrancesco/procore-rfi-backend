import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [rfis, setRfis] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('companyId');
    const projectId = params.get('projectId');
    const authToken = params.get('auth_token');

    const backendBaseUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001'
        : 'https://procore-rfi-backend-eeefbdd22e44.herokuapp.com';

    if (!companyId || !authToken) {
      setError('Missing required URL parameters (companyId or auth_token)');
      setLoading(false);
      return;
    }

    const fetchRFIs = async () => {
      try {
        console.log('🔄 Exchanging token...');
        const tokenRes = await fetch(`${backendBaseUrl}/exchange-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auth_token: authToken }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
          throw new Error(tokenData.error || 'Token exchange failed');
        }

        console.log('✅ Token exchanged. Fetching RFIs...');

        const rfiRes = await fetch(
          `${backendBaseUrl}/rfis?companyId=${companyId}&projectId=${projectId}`
        );

        const data = await rfiRes.json();

        if (!Array.isArray(data)) {
          throw new Error(data.error || 'Failed to fetch RFIs');
        }

        setRfis(data);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchRFIs();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Request For Information (RFIs)</h1>
      {error && <p className="error-message">{error}</p>}
      {loading && !error && <p>🔄 Exchanging token...</p>}

      {!loading && rfis.length > 0 && (
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
