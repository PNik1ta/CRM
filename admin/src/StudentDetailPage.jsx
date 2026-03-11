import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchJson, getStudentDisplayName, postJson } from './api';
import TimelineItem from './TimelineItem';

const initialLessonForm = {
  start_at: '',
  end_at: '',
  subject: '',
  format: 'online',
  price: '',
  notes: '',
};

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState(initialLessonForm);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [lessonError, setLessonError] = useState('');

  async function loadTimeline() {
    const timelineData = await fetchJson(`/api/students/${id}/timeline`);
    setTimeline(timelineData);
  }

  useEffect(() => {
    async function loadStudentData() {
      try {
        const studentData = await fetchJson(`/api/students/${id}`);
        setStudent(studentData);
        await loadTimeline();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [id]);

  function handleLessonChange(event) {
    const { name, value } = event.target;
    setLessonForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLessonSubmit(event) {
    event.preventDefault();
    setIsSubmittingLesson(true);
    setLessonError('');

    try {
      await postJson('/api/lessons', {
        student_id: Number(id),
        start_at: new Date(lessonForm.start_at).toISOString(),
        end_at: lessonForm.end_at ? new Date(lessonForm.end_at).toISOString() : null,
        subject: lessonForm.subject,
        format: lessonForm.format,
        price: lessonForm.price ? Number(lessonForm.price) : null,
        notes: lessonForm.notes,
      });

      await loadTimeline();
      setLessonForm(initialLessonForm);
      setShowLessonForm(false);
    } catch (err) {
      setLessonError(err.message);
    } finally {
      setIsSubmittingLesson(false);
    }
  }

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

      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => {
            setShowLessonForm((prev) => {
              if (!prev) {
                setLessonError('');
              }

              return !prev;
            });
          }}
        >
          Добавить урок
        </button>
      </div>

      {showLessonForm && (
        <form onSubmit={handleLessonSubmit} style={{ marginTop: '12px' }}>
          <div>
            <label htmlFor="start_at">Дата начала (start_at)</label>
            <br />
            <input
              id="start_at"
              name="start_at"
              type="datetime-local"
              value={lessonForm.start_at}
              onChange={handleLessonChange}
              required
            />
          </div>

          <div>
            <label htmlFor="end_at">Дата окончания (end_at)</label>
            <br />
            <input
              id="end_at"
              name="end_at"
              type="datetime-local"
              value={lessonForm.end_at}
              onChange={handleLessonChange}
            />
          </div>

          <div>
            <label htmlFor="subject">Предмет (subject)</label>
            <br />
            <input id="subject" name="subject" value={lessonForm.subject} onChange={handleLessonChange} />
          </div>

          <div>
            <label htmlFor="format">Формат (format)</label>
            <br />
            <select id="format" name="format" value={lessonForm.format} onChange={handleLessonChange}>
              <option value="online">online</option>
              <option value="offline">offline</option>
            </select>
          </div>

          <div>
            <label htmlFor="price">Цена (price)</label>
            <br />
            <input id="price" name="price" type="number" min="0" value={lessonForm.price} onChange={handleLessonChange} />
          </div>

          <div>
            <label htmlFor="notes">Заметки (notes)</label>
            <br />
            <input id="notes" name="notes" value={lessonForm.notes} onChange={handleLessonChange} />
          </div>

          <div style={{ marginTop: '10px' }}>
            <button type="submit" disabled={isSubmittingLesson}>
              {isSubmittingLesson ? 'Сохранение...' : 'Сохранить урок'}
            </button>
          </div>

          {lessonError && <div style={{ marginTop: '8px' }}>Ошибка создания урока: {lessonError}</div>}
        </form>
      )}

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
