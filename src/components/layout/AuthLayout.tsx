import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Arena for Creatives</h1>
          <p className="text-text-secondary">Where Filipino artists compete and shine</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
