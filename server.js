import { createServer } from 'node:http'
import handler from 'serve-handler'

const port = process.env.PORT || 3000

const server = createServer((request, response) => {
  const originalUrl = request.url || '/'
  const pathname = originalUrl.split('?')[0]

  if (pathname === '/natpaper' || pathname === '/natpaper/') {
    request.url = '/natpaper.html'
  }

  return handler(request, response, {
    public: 'dist',
    cleanUrls: false,
    rewrites: [
      { source: '**', destination: '/index.html' },
    ],
    headers: [
      {
        source: '**/*.@(html)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '**/*.@(png|jpg|jpeg|webp|svg|css|js|pdf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ],
  })
})

server.listen(port, () => {
  console.log(`NATGMI static server listening on ${port}`)
})
