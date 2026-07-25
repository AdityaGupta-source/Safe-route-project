import { Routes, Route, Navigate } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MapView from '../pages/MapView';
import Profile from '../pages/Profile';
import Contacts from '../pages/Contacts';
import SavedPlaces from '../pages/SavedPlaces';
import History from '../pages/History';
import Notifications from '../pages/Notifications';
import Sos from '../pages/Sos';

export default function AppRoutes() {
  return (
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
  );
}
