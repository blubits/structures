import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Sidebar from '@/components/Sidebar.motion'

/**
 * Root route for the application, providing the main layout with sidebar and outlet for nested routes.
 */
export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 relative">
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </div>
  ),
})
