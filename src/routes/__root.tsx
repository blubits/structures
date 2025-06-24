import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Sidebar from '../components/Sidebar.motion'

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </div>
  ),
})
