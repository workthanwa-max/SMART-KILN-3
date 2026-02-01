import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages Import (เหมือนเดิม)
import Login from './pages/Login';
import ResearcherDashboard from './pages/Researcher/ResearcherDashboard';
import ExperimentList from './pages/Researcher/ExperimentList';
import ManageUsers from './pages/Researcher/ManageUsers';
import ManageKilns from './pages/Researcher/ManageKilns';
import AssignKilns from './pages/Researcher/AssignKilns';
import ResearcherExperimentDetail from './pages/Researcher/ResearcherExperimentDetail';
import AnnualReport from './pages/Researcher/AnnualReport';

import OperatorDashboard from './pages/Operator/OperatorDashboard';
import StartBurn from './pages/Operator/StartBurn';
import FinishBurn from './pages/Operator/FinishBurn';
import MyHistory from './pages/Operator/MyHistory';
import ExperimentDetail from './pages/Operator/ExperimentDetail';
import ChangePassword from './pages/ChangePassword';




import { useEffect } from 'react';
import { syncService } from './services/syncService';

function App() {
  useEffect(() => {
    // Initial sync
    const initSync = async () => {
      await syncService.pullFromServer();
      await syncService.syncPendingChanges();
    };
    initSync();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={
          <ProtectedRoute allowedRoles={['researcher', 'operator']}>
            <ChangePassword />
          </ProtectedRoute>
        } />


        {/* --- กลุ่มสำหรับนักวิจัย (Researcher Only) --- */}
        <Route path="/researcher-dashboard" element={
          <ProtectedRoute allowedRoles={['researcher']}>
            <ResearcherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/master-list" element={
          <ProtectedRoute allowedRoles={['researcher']}>
            <ExperimentList />
          </ProtectedRoute>
        } />
        <Route path="/researcher/experiment/:id" element={
          <ProtectedRoute allowedRoles={['researcher']}>
            <ResearcherExperimentDetail />
          </ProtectedRoute>
        } />
        <Route path="/manage-users" element={
          <ProtectedRoute allowedRoles={['researcher']}>
            <ManageUsers />
          </ProtectedRoute>
        } />
        <Route path="/manage-kilns" element={
          <ProtectedRoute allowedRoles={['researcher']}>
            <ManageKilns />
          </ProtectedRoute>
        } />
        <Route path="/assign-kilns" element={
          <ProtectedRoute allowedRoles={['researcher']}>
            <AssignKilns />
          </ProtectedRoute>
        } />
        <Route path="/annual-report" element={
          <ProtectedRoute allowedRoles={['researcher']}>
            <AnnualReport />
          </ProtectedRoute>
        } />

        {/* --- กลุ่มสำหรับคนเผา (Operator Only) --- */}
        <Route path="/operator/dashboard" element={
          <ProtectedRoute allowedRoles={['operator']}>
            <OperatorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/operator/start-burn" element={
          <ProtectedRoute allowedRoles={['operator']}>
            <StartBurn />
          </ProtectedRoute>
        } />
        <Route path="/operator/finish-burn/:id" element={
          <ProtectedRoute allowedRoles={['operator']}>
            <FinishBurn />
          </ProtectedRoute>
        } />
        <Route path="/operator/history" element={
          <ProtectedRoute allowedRoles={['operator']}>
            <MyHistory />
          </ProtectedRoute>
        } />
        <Route path="/operator/experiment/:id" element={
          <ProtectedRoute allowedRoles={['operator']}>
            <ExperimentDetail />
          </ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;