export const config = {
  matcher: ['/'],
}

// Serve the exact social-preview HTML for the root URL. This avoids stale static
// root previews and gives crawlers the Farsi tags when ?lang=fa is present.
export default async function middleware(request: Request) {
  const url = new URL(request.url)
  const entry = url.searchParams.get('lang') === 'fa' ? '/index-fa.html' : '/index.html'

  const entryUrl = new URL(entry, url.origin)
  const response = await fetch(entryUrl.toString())
  const html = await response.text()

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  })
}
