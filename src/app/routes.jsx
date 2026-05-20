import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'

import LandingPage from '../pages/LandingPage'
import ServicesPage from '../pages/ServicesPage'
import ServiceDetailsPage from '../pages/ServiceDetailsPage'
import MastersPage from '../pages/MastersPage'
import OrdersPage from '../pages/OrdersPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import DashboardPage from '../pages/DashboardPage'
import CreateListingPage from '../pages/CreateListingPage'
import MyAdsPage from '../pages/MyAdsPage'
import NotificationsPage from '../pages/NotificationsPage'
import MessagesPage from '../pages/MessagesPage'
import SettingsPage from '../pages/SettingsPage'
import ReviewsPage from '../pages/ReviewsPage'
import JobDetailsPage from '../pages/JobDetailsPage'
import ProfilePage from '../pages/ProfilePage'
import AboutPage from '../pages/AboutPage'
import HowItWorksPage from '../pages/HowItWorksPage'
import RulesPage from '../pages/RulesPage'
import ContactsPage from '../pages/ContactsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route path="/masters" element={<MastersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/contacts" element={<ContactsPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create" element={<CreateListingPage />} />
          <Route path="/my-ads" element={<MyAdsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}