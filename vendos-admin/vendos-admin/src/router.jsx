import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout    from './components/layout/AppLayout';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import SlotManager  from './pages/SlotManager';
import Analytics    from './pages/Analytics';
import Restock      from './pages/Restock';
import Alerts       from './pages/Alerts';
import Settings     from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const isAuth = useAuthStore(s => s.isAuthenticated);
  return isAuth ? children : <Navigate to="/login" replace />;
};

const AppRouter = ({ onSlotClick, onAddSlot }) => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={
      <PrivateRoute>
        <AppLayout onAddSlot={onAddSlot} />
      </PrivateRoute>
    }>
      <Route index              element={<Dashboard   onSlotClick={onSlotClick} />} />
      <Route path="slots"       element={<SlotManager onSlotClick={onSlotClick} />} />
      <Route path="analytics"   element={<Analytics />} />
      <Route path="restock"     element={<Restock />} />
      <Route path="alerts"      element={<Alerts />} />
      <Route path="settings"    element={<Settings />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;
