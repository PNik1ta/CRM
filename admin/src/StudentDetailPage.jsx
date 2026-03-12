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

function formatMoney(value) {
  return `${Number(value || 0)} ₼`;
}

function toIsoString(localDateTime) {
  if (!localDateTime) {
    return null;
  }

  const parsed = new Date(localDateTime);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function toDateTimeLocalValue(isoDateTime) {
  if (!isoDateTime) {
    return '';
  }

  const parsed = new Date(isoDateTime);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const lessons = timeline.filter((event) => event.type === 'lesson');
  const payments = timeline.filter((event) => event.type === 'payment');

  const lessonCount = lessons.length;
  const paymentCount = payments.length;

  const totalLessonsCost = lessons.reduce(
    (sum, lesson) => sum + Number(lesson.data?.price || 0),
    0,
  );

  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.data?.amount || 0),
    0,
  );
  const debt = totalLessonsCost - totalPaid;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState(initialLessonForm);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [lessonError, setLessonError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [paymentError, setPaymentError] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function loadTimeline() {
    const timelineData = await fetchJson(`/api/students/${id}/timeline`);

    const sortedTimeline = [...timelineData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    setTimeline(sortedTimeline);
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

  function closeLessonForm() {
    setShowLessonForm(false);
    setLessonForm(initialLessonForm);
    setEditingLessonId(null);
    setLessonError('');
  }

  function closePaymentForm() {
    setShowPaymentForm(false);
    setPaymentForm(initialPaymentForm);
    setEditingPaymentId(null);
    setPaymentError('');
  }

  async function handleLessonSubmit(event) {
    event.preventDefault();
    setIsSubmittingLesson(true);
    setLessonError('');

    const studentIdFromRoute = id || null;

    if (!studentIdFromRoute) {
      setLessonError('student_id is required');
      setIsSubmittingLesson(false);
      return;
    }

    const startAtIso = toIsoString(lessonForm.start_at);
    const endAtIso = toIsoString(lessonForm.end_at);

    if (!startAtIso || !endAtIso) {
      setLessonError('Укажите корректные start_at и end_at');
      setIsSubmittingLesson(false);
      return;
    }

    if (new Date(endAtIso) <= new Date(startAtIso)) {
      setLessonError('end_at должен быть позже start_at');
      setIsSubmittingLesson(false);
      return;
    }

    const lessonPayload = {
      student_id: studentIdFromRoute,
      start_at: startAtIso,
      end_at: endAtIso,
      subject: lessonForm.subject,
      format: lessonForm.format,
      price: lessonForm.price ? Number(lessonForm.price) : null,
      notes: lessonForm.notes,
    };

    try {
      if (editingLessonId) {
        await fetchJson(`/api/lessons/${editingLessonId}`, {
          method: 'PUT',
          body: JSON.stringify(lessonPayload),
        });
      } else {
        await postJson('/api/lessons', lessonPayload);
      }

      await loadTimeline();
      closeLessonForm();
    } catch (err) {
      setLessonError(err.message);
    } finally {
      setIsSubmittingLesson(false);
    }
  }


  function handleEdit(event) {
    if (event.type === 'lesson') {
      setEditingLessonId(event.id);

      setLessonForm({
        start_at: toDateTimeLocalValue(event.data?.start_at),
        end_at: toDateTimeLocalValue(event.data?.end_at),
        subject: event.data?.subject || '',
        format: event.data?.format || 'online',
        price: event.data?.price || '',
        notes: event.data?.notes || '',
      });

      setShowLessonForm(true);
    }

    if (event.type === 'payment') {
      setEditingPaymentId(event.id);

      setPaymentForm({
        amount: event.data?.amount || '',
        method: event.data?.method || 'cash',
        paid_at: toDateTimeLocalValue(event.data?.paid_at),
        notes: event.data?.notes || '',
      });

      setShowPaymentForm(true);
    }
  }

  function handleDelete(itemId, type) {
    setPendingDelete({ itemId, type });
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    if (!['lesson', 'payment'].includes(pendingDelete.type)) {
      alert('Неизвестный тип события');
      return;
    }

    const endpoint =
      pendingDelete.type === 'lesson'
        ? `/api/lessons/${pendingDelete.itemId}`
        : `/api/payments/${pendingDelete.itemId}`;

    try {
      await fetchJson(endpoint, { method: 'DELETE' });
      await loadTimeline();
      setPendingDelete(null);
    } catch (err) {
      alert('Ошибка удаления записи');
      console.error(err);
    }
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();
    setIsSubmittingPayment(true);
    setPaymentError('');

    const studentIdFromRoute = id || null;

    if (!studentIdFromRoute) {
      setPaymentError('student_id is required');
      setIsSubmittingPayment(false);
      return;
    }

    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setPaymentError('Сумма должна быть больше 0');
      setIsSubmittingPayment(false);
      return;
    }

    const paidAtIso = toIsoString(paymentForm.paid_at);

    if (!paidAtIso) {
      setPaymentError('Укажите корректный paid_at');
      setIsSubmittingPayment(false);
      return;
    }

    const paymentPayload = {
      student_id: studentIdFromRoute,
      amount: Number(paymentForm.amount),
      method: paymentForm.method,
      paid_at: paidAtIso,
      notes: paymentForm.notes,
    };

    try {
      if (editingPaymentId) {
        await fetchJson(`/api/payments/${editingPaymentId}`, {
          method: 'PUT',
          body: JSON.stringify(paymentPayload),
        });
      } else {
        await postJson('/api/payments', paymentPayload);
      }

      await loadTimeline();
      closePaymentForm();
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
    <>
    <div>
      <div className="breadcrumb">
        CRM Admin / Ученики / {getStudentDisplayName(student)}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <Link className="back-link" to="/students">
          ← Назад
        </Link>
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
            marginTop: '12px',
            borderTop: '1px solid #eee',
            paddingTop: '10px',
          }}
        >
          <div><strong>Lessons:</strong> {lessonCount}</div>
          <div><strong>Payments:</strong> {paymentCount}</div>
          <div><strong>Total lessons cost:</strong> {formatMoney(totalLessonsCost)}</div>
          <div><strong>Total paid:</strong> {formatMoney(totalPaid)}</div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h3>Финансы ученика</h3>
          <div>Всего уроков: {formatMoney(totalLessonsCost)}</div>
          <div>Оплачено: {formatMoney(totalPaid)}</div>
          <div
            style={{
              color: debt > 0 ? 'red' : 'green',
              fontWeight: 'bold',
            }}
          >
            {debt > 0 ? 'Долг' : 'Переплата'}: {formatMoney(Math.abs(debt))}
          </div>
        </div>
      </div>

      <h3>Actions</h3>
      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
        <button
          className="button"
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
          className="button"
          type="button"
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
          <div className="form-header">
            <strong>{editingLessonId ? 'Редактировать урок' : 'Создать урок'}</strong>
            <button className="icon-button" type="button" onClick={closeLessonForm} aria-label="Закрыть форму урока">
              ✕
            </button>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="start_at">Дата начала (start_at)</label>
            <input className="input"
              id="start_at"
              name="start_at"
              type="datetime-local"
              value={lessonForm.start_at}
              onChange={handleLessonChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="end_at">Дата окончания (end_at)</label>
            <input className="input"
              id="end_at"
              name="end_at"
              type="datetime-local"
              value={lessonForm.end_at}
              onChange={handleLessonChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="subject">Предмет (subject)</label>
            <input className="input" id="subject" name="subject" value={lessonForm.subject} onChange={handleLessonChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="format">Формат (format)</label>
            <select className="select" id="format" name="format" value={lessonForm.format} onChange={handleLessonChange}>
              <option value="online">online</option>
              <option value="offline">offline</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="price">Цена (price)</label>
            <input className="input" id="price" name="price" type="number" min="0" value={lessonForm.price} onChange={handleLessonChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes">Заметки (notes)</label>
            <input className="input" id="notes" name="notes" value={lessonForm.notes} onChange={handleLessonChange} />
          </div>

          <div style={{ marginTop: '10px', display: 'flex', gap: 8 }}>
            <button className="button" type="submit" disabled={isSubmittingLesson}>
              {isSubmittingLesson ? 'Сохранение...' : 'Сохранить урок'}
            </button>
            <button className="button button-secondary" type="button" onClick={closeLessonForm}>
              Отмена
            </button>
          </div>

          {lessonError && <div style={{ marginTop: '8px' }}>Ошибка создания урока: {lessonError}</div>}
        </form>
      )}

      {showPaymentForm && (
        <form onSubmit={handlePaymentSubmit} style={{ marginTop: '12px' }}>
          <div className="form-header">
            <strong>{editingPaymentId ? 'Редактировать оплату' : 'Создать оплату'}</strong>
            <button className="icon-button" type="button" onClick={closePaymentForm} aria-label="Закрыть форму оплаты">
              ✕
            </button>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="amount">Сумма (amount)</label>
            <input className="input"
              id="amount"
              name="amount"
              type="number"
              min="0"
              value={paymentForm.amount}
              onChange={handlePaymentChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="method">Метод (method)</label>
            <select className="select"
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

          <div className="form-group">
            <label className="form-label" htmlFor="paid_at">Дата оплаты (paid_at)</label>
            <input className="input"
              id="paid_at"
              name="paid_at"
              type="datetime-local"
              value={paymentForm.paid_at}
              onChange={handlePaymentChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="payment_notes">Заметки (notes)</label>
            <textarea className="input"
              id="payment_notes"
              name="notes"
              value={paymentForm.notes}
              onChange={handlePaymentChange}
            />
          </div>

          <div style={{ marginTop: '10px', display: 'flex', gap: 8 }}>
            <button className="button" type="submit" disabled={isSubmittingPayment}>
              {isSubmittingPayment ? 'Сохранение...' : 'Сохранить оплату'}
            </button>
            <button className="button button-secondary" type="button" onClick={closePaymentForm}>
              Отмена
            </button>
          </div>

          {paymentError && <div style={{ marginTop: '8px' }}>Ошибка создания оплаты: {paymentError}</div>}
        </form>
      )}

      <h3>Timeline</h3>

      <div className="timeline">
        {timeline.length === 0 ? (
          <div className="timeline-meta">Событий пока нет</div>
        ) : (
          timeline.map((event) => (
            <div
              key={`${event.type}-${event.id}`}
              className="timeline-item"
            >
              <TimelineItem
                event={event}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          ))
        )}
      </div>
    </div>
    {pendingDelete && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content card">
            <div style={{ marginBottom: 16 }}>Вы уверены, что хотите удалить?</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="button button-secondary" type="button" onClick={() => setPendingDelete(null)}>
                Отмена
              </button>
              <button className="button button-danger" type="button" onClick={confirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
