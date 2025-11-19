import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-16 pb-20 md:pb-0 md:ml-64 flex flex-col">
          <div className="max-w-6xl mx-auto px-4 py-6 flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
