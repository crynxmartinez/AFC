// Vercel Serverless Function for Prerender.io integration
export default async function handler(req, res) {
  const prerenderToken = process.env.PRERENDER_TOKEN
  
  if (!prerenderToken) {
    console.error('PRERENDER_TOKEN not set')
    return res.status(500).json({ error: 'Prerender token not configured' })
  }

  // Get the URL from query parameter (passed by Vercel rewrite)
  const targetUrl = req.query.url
  
  if (!targetUrl) {
    console.error('No URL provided')
    return res.status(400).json({ error: 'URL parameter required' })
  }

  console.log('Prerendering:', targetUrl)

  try {
    // Call Prerender.io service
    const prerenderUrl = `https://service.prerender.io/${targetUrl}`
    
    const response = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': prerenderToken,
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      }
    })

    if (!response.ok) {
      console.error('Prerender error:', response.status, response.statusText)
      return res.status(response.status).send('Prerender error')
    }

    const html = await response.text()
    
    // Return the pre-rendered HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(200).send(html)
  } catch (error) {
    console.error('Prerender fetch error:', error)
    res.status(500).json({ error: 'Failed to prerender' })
  }
}
