// Next.js API route to proxy requests to the backend
export default async function handler(req, res) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/products?all=true`)
    const data = await response.json()
    
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
