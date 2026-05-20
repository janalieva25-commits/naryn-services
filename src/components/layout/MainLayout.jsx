import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="page-container main-with-mobile-nav">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}