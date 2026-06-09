export const config = {
  matcher: ['/'],
}

// Serve the Farsi document (with Farsi OG tags + preview image) for ?lang=fa,
// so link-preview crawlers (WhatsApp / Facebook) get the Farsi description.
export default async function middleware(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.get('lang') !== 'fa') return

  const faUrl = new URL('/index-fa.html', url.origin)
  const response = await fetch(faUrl.toString())
  const html = await response.text()

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  })
}
