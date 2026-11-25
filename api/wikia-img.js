export default async function handler(req, res) {
  const rawPath = typeof req.query?.path === 'string' ? req.query.path : ''
  const cleanPath = rawPath.replace(/^\/+/, '')

  // Restrict proxy strictly to Sword Art Online Fandom Wiki image assets
  if (!cleanPath.startsWith('swordartonline/images/')) {
    res.status(400).send('Invalid asset path')
    return
  }

  const targetUrl = `https://static.wikia.nocookie.net/${cleanPath}`
  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        Referer: 'https://swordartonline.fandom.com/',
      },
    })
    if (!upstream.ok) {
      res.status(upstream.status).send('Image fetch failed')
      return
    }
    const contentType = upstream.headers.get('content-type') || 'image/png'
    const buffer = Buffer.from(await upstream.arrayBuffer())
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800')
    res.status(200).send(buffer)
  } catch {
    res.status(502).send('Upstream error')
  }
}
