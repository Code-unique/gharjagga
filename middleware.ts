import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protected routes - require sign in
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
])

// API routes that require authentication
const isProtectedApiRoute = createRouteMatcher([
  '/api/properties/create',
  '/api/properties/update',
  '/api/properties/delete',
  '/api/admin(.*)',
  '/api/dashboard(.*)',
  '/api/upload(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Protect page routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}