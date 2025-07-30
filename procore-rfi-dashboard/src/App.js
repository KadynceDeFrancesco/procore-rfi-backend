import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';

function App() {
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get('auth_token');
    const companyId = params.get('companyId');

    if (!authToken || !companyId) {
      console.warn('⚠️ Missing auth_token or companyId');
      return;
    }

    fetch('http://localhost:3001/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth_token: authToken }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('✅ Token exchange response:', data);
        setTokenReady(true); // ✅ Only render Dashboard after token is ready
      })
      .catch(err => {
        console.error('❌ Token exchange failed:', err);
      });
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            tokenReady ? <Dashboard /> : <p style={{ padding: '20px' }}>🔄 Exchanging token...</p>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
