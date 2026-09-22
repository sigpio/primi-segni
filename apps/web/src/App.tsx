import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { TeacherLogin } from './pages/TeacherLogin';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ChildAvatar } from './pages/ChildAvatar';
import { ChildToday } from './pages/ChildToday';
import { Exercise } from './pages/Exercise';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/maestra/login" element={<TeacherLogin />} />
      <Route path="/maestra" element={<TeacherDashboard />} />
      <Route path="/bambino" element={<ChildAvatar />} />
      <Route path="/bambino/:childId" element={<ChildToday />} />
      <Route path="/bambino/:childId/esercizio" element={<Exercise />} />
    </Routes>
  );
}
