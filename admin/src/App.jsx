import { Link, Navigate, Route, Routes } from 'react-router-dom';
import StudentsPage from './StudentsPage';
import StudentDetailPage from './StudentDetailPage';

export default function App() {
  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '40px auto',
        padding: '0 20px',
        fontFamily: 'sans-serif',
      }}
    >
      <h1>CRM Admin</h1>
      <div style={{ marginBottom: '20px' }}>
        <Link className="nav-link" to="/students">
          Ученики
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/students" replace />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
      </Routes>
    </div>
  );
}
