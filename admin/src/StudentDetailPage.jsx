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

const initialPaymentForm = {
  amount: '',
  method: 'cash',
  paid_at: '',
  notes: '',
};

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const balance = timeline.reduce((acc, event) => {
    if (event.type === 'lesson') {
      return acc - Number(event.data?.price || 0);
    }

    if (event.type === 'payment') {
      return acc + Number(event.data?.amount || 0);
    }

    return acc;
  }, 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState(initialLessonForm);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [lessonError, setLessonError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [paymentError, setPaymentError] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

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

  function handlePaymentChange(event) {
    const { name, value } = event.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
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


  async function handleDelete(id, type) {
    const confirmed = window.confirm('Удалить запись?');

    if (!confirmed) {
      return;
    }

    if (!['lesson', 'payment'].includes(type)) {
      alert('Неизвестный тип события');
      return;
    }

    const endpoint =
      type === 'lesson'
        ? `/api/lessons/${id}`
        : `/api/payments/${id}`;

    try {
      await fetchJson(endpoint, { method: 'DELETE' });
      await loadTimeline();
    } catch (err) {
      alert('Ошибка удаления записи');
      console.error(err);
    }
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();
    setIsSubmittingPayment(true);
    setPaymentError('');

    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setPaymentError('Сумма должна быть больше 0');
      setIsSubmittingPayment(false);
      return;
    }

    try {
      await postJson('/api/payments', {
        student_id: Number(id),
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        paid_at: new Date(paymentForm.paid_at).toISOString(),
        notes: paymentForm.notes,
      });

      await loadTimeline();
      setPaymentForm(initialPaymentForm);
      setShowPaymentForm(false);
    } catch (err) {
      setPaymentError(err.message);
    } finally {
      setIsSubmittingPayment(false);
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

      <h3>Student card</h3>
      <div
        style={{
          border: '1px solid #ddd',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: '#fafafa',
        }}
      >
        <h2 style={{ marginTop: 0 }}>{getStudentDisplayName(student)}</h2>
        <div><strong>Телефон:</strong> {student.phone || '-'}</div>
        <div><strong>Email:</strong> {student.email || '-'}</div>
        <div><strong>Статус:</strong> {student.status || '-'}</div>
        <div
          style={{
            marginTop: '10px',
            fontWeight: 'bold',
            color: balance < 0 ? 'red' : balance > 0 ? 'green' : 'black',
          }}
        >
          Баланс: {balance}
        </div>

        {balance < 0 && (
          <div style={{ color: 'red', marginTop: '4px' }}>
            Долг ученика: {Math.abs(balance)}
          </div>
        )}
      </div>

      <h3>Actions</h3>
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

        <button
          type="button"
          style={{ marginLeft: '8px' }}
          onClick={() => {
            setShowPaymentForm((prev) => {
              if (!prev) {
                setPaymentError('');
              }

              return !prev;
            });
          }}
        >
          Добавить оплату
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

      {showPaymentForm && (
        <form onSubmit={handlePaymentSubmit} style={{ marginTop: '12px' }}>
          <div>
            <label htmlFor="amount">Сумма (amount)</label>
            <br />
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              value={paymentForm.amount}
              onChange={handlePaymentChange}
              required
            />
          </div>

          <div>
            <label htmlFor="method">Метод (method)</label>
            <br />
            <select
              id="method"
              name="method"
              value={paymentForm.method}
              onChange={handlePaymentChange}
            >
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
              <option value="transfer">Перевод</option>
            </select>
          </div>

          <div>
            <label htmlFor="paid_at">Дата оплаты (paid_at)</label>
            <br />
            <input
              id="paid_at"
              name="paid_at"
              type="datetime-local"
              value={paymentForm.paid_at}
              onChange={handlePaymentChange}
              required
            />
          </div>

          <div>
            <label htmlFor="payment_notes">Заметки (notes)</label>
            <br />
            <textarea
              id="payment_notes"
              name="notes"
              value={paymentForm.notes}
              onChange={handlePaymentChange}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <button type="submit" disabled={isSubmittingPayment}>
              {isSubmittingPayment ? 'Сохранение...' : 'Сохранить оплату'}
            </button>
          </div>

          {paymentError && <div style={{ marginTop: '8px' }}>Ошибка создания оплаты: {paymentError}</div>}
        </form>
      )}

      <h3 style={{ marginTop: '20px' }}>Timeline</h3>
      {timeline.length === 0 ? (
        <div>Событий пока нет.</div>
      ) : (
        <ul style={{ paddingLeft: '20px' }}>
          {timeline.map((event) => (
            <TimelineItem key={`${event.type}-${event.id}`} event={event} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}
