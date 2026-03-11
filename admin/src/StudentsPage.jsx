import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson, getStudentDisplayName } from './api';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await fetchJson('/api/students');
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  if (loading) {
    return <div>Загрузка учеников...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div>
      <h2>Список учеников</h2>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', maxWidth: '900px' }}>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
                <Link to={`/students/${student.id}`}>{getStudentDisplayName(student)}</Link>
              </td>
              <td>{student.phone || '-'}</td>
              <td>{student.email || '-'}</td>
              <td>{student.status || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
