// Next.js API route to proxy requests to the backend
export default async function handler(req, res) {
  try {
    const response = await fetch('http://localhost:5000/api/products?all=true')
    const data = await response.json()
    
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
