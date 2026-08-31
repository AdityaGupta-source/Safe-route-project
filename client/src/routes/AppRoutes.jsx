import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PageLoader from '../components/layout/PageLoader';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const MapView = lazy(() => import('../pages/MapView'));
const Profile = lazy(() => import('../pages/Profile'));
const Contacts = lazy(() => import('../pages/Contacts'));
const SavedPlaces = lazy(() => import('../pages/SavedPlaces'));
const History = lazy(() => import('../pages/History'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Sos = lazy(() => import('../pages/Sos'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/saved-places" element={<SavedPlaces />} />
        <Route path="/history" element={<History />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/sos" element={<Sos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
