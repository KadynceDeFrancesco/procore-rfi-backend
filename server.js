const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const qs = require('qs');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let accessToken = null; // 🔐 Stored in memory (reset on restart)

app.post('/exchange-token', async (req, res) => {
  const authToken = req.body.auth_token;

  if (!authToken) {
    return res.status(400).json({ error: 'Missing auth_token in body' });
  }

  try {
    const response = await axios.post('https://login.procore.com/oauth/token', qs.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: authToken,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    accessToken = response.data.access_token;
    console.log('✅ Access token exchanged from JWT');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to exchange auth_token:', err.response?.data || err.message);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});




app.get('/rfis', async (req, res) => {
  const companyId = req.query.companyId;
  const projectId = req.query.projectId;

  console.log('👉 /rfis called with:', req.query);
  console.log('👉 accessToken:', accessToken?.slice(0, 10));

  if (!accessToken || !companyId) {
    console.warn('⚠️ Missing access token or companyId');
    return res.status(400).json({ error: 'Missing access token or companyId' });
  }

  try {
    const rfiRes = await axios.get(`https://api.procore.com/rest/v1.0/projects/${projectId}/rfis`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Procore-Company-Id': companyId
      }
    });

    const rfisWithProjectId = rfiRes.data.map(rfi => ({
      ...rfi,
      project_id: projectId,
    }));

    res.json(rfisWithProjectId);
  } catch (err) {
    console.error('❌ Failed to fetch RFIs:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch RFIs' });
  }
});


app.get('/health', (req, res) => {
  res.send('✅ Server is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
