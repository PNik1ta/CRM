import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchJson, getStudentDisplayName } from './api';

function TimelineItem({ event }) {
  return (
    <li style={{ marginBottom: '12px' }}>
      <div><strong>Тип:</strong> {event.type}</div>
      <div><strong>Дата:</strong> {new Date(event.date).toLocaleString()}</div>
      <div>
        <strong>Данные:</strong>
        <pre style={{ margin: '6px 0 0', padding: '8px', background: '#f4f4f4' }}>
          {JSON.stringify(event.data, null, 2)}
        </pre>
      </div>
    </li>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStudentData() {
      try {
        const [studentData, timelineData] = await Promise.all([
          fetchJson(`/api/students/${id}`),
          fetchJson(`/api/students/${id}/timeline`),
        ]);

        setStudent(studentData);
        setTimeline(timelineData.filter((item) => item.type === 'lesson' || item.type === 'payment'));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [id]);

  if (loading) {
    return <div>Загрузка ученика...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!student) {
    return <div>Ученик не найден.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <Link to="/students">← Назад к списку</Link>
      </div>

      <h2>{getStudentDisplayName(student)}</h2>
      <div><strong>Телефон:</strong> {student.phone || '-'}</div>
      <div><strong>Email:</strong> {student.email || '-'}</div>
      <div><strong>Статус:</strong> {student.status || '-'}</div>

      <h3 style={{ marginTop: '20px' }}>Таймлайн активности</h3>
      {timeline.length === 0 ? (
        <div>Событий пока нет.</div>
      ) : (
        <ul style={{ paddingLeft: '20px' }}>
          {timeline.map((event, index) => (
            <TimelineItem key={`${event.type}-${event.date}-${index}`} event={event} />
          ))}
        </ul>
      )}
    </div>
  );
}
