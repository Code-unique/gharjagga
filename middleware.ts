import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
])

// Define public routes that should bypass protection
const isPublicRoute = createRouteMatcher([
  '/',
  '/properties(.*)',
  '/api/properties(.*)',
  '/api/webhooks(.*)',
  '/api/upload(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/contact',
])

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware for public routes
  if (isPublicRoute(req)) {
    return
  }
  
  // Protect dashboard and admin routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}