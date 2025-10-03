// Next.js API route to proxy profile requests to the backend
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    // Forward the authorization header for authentication
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    
    const response = await fetch(`${backendUrl}/api/auth/profile`, {
      method: req.method,
      headers,
      body: req.method === 'PUT' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json();
    res.status(response.status).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}