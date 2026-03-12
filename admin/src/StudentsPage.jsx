import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson, getStudentDisplayName, postJson } from './api';

const initialForm = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  status: 'active',
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [pendingDeleteStudentId, setPendingDeleteStudentId] = useState(null);

  const query = search.trim().toLowerCase();

  const filteredStudents = query
    ? students.filter((student) => {
        const name = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
        return name.includes(query);
      })
    : students;

  async function loadStudents() {
    try {
      const data = await fetchJson('/api/students');
      setStudents(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.first_name.trim()) {
      nextErrors.first_name = 'Заполните поле';
    }

    if (!formData.last_name.trim()) {
      nextErrors.last_name = 'Заполните поле';
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleCancelCreate() {
    setShowCreateForm(false);
    setFormData(initialForm);
    setSubmitError('');
    setValidationErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await postJson('/api/students', formData);
      await loadStudents();
      setFormData(initialForm);
      setShowCreateForm(false);
      setValidationErrors({});
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDeleteStudent() {
    if (!pendingDeleteStudentId) {
      return;
    }

    try {
      await fetchJson(`/api/students/${pendingDeleteStudentId}`, { method: 'DELETE' });
      await loadStudents();
      setPendingDeleteStudentId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div>Загрузка учеников...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <>
      <div className="breadcrumb">
        CRM Admin / Ученики
      </div>

      <div className="card">
      <h2>Список учеников</h2>

      <button
        className="button"
        type="button"
        onClick={() => {
          setShowCreateForm((prev) => !prev);
          setValidationErrors({});
          setSubmitError('');
        }}
      >
        Создать ученика
      </button>

      <div style={{ marginTop: '12px' }}>
        <input
          className="input"
          type="text"
          placeholder="Поиск ученика..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{
            marginBottom: '12px',
            padding: '6px',
            width: '100%',
            maxWidth: '300px',
          }}
        />
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '12px', marginBottom: '16px' }}>
          <div className="form-header">
            <strong>Создать ученика</strong>
            <button className="icon-button" type="button" onClick={handleCancelCreate} aria-label="Закрыть форму">
              ✕
            </button>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="first_name">
              Имя
            </label>
            <input
              className={`input ${validationErrors.first_name ? 'input-error' : ''}`}
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
            {validationErrors.first_name && <div className="error-text">{validationErrors.first_name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="last_name">
              Фамилия
            </label>
            <input
              className={`input ${validationErrors.last_name ? 'input-error' : ''}`}
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
            {validationErrors.last_name && <div className="error-text">{validationErrors.last_name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Телефон
            </label>
            <input className="input" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input className="input" id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Статус
            </label>
            <select className="select" id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="archived">archived</option>
            </select>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', gap: 8 }}>
            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить ученика'}
            </button>
            <button className="button button-secondary" type="button" onClick={handleCancelCreate}>
              Отмена
            </button>
          </div>

          {submitError && <div style={{ marginTop: '8px' }}>Ошибка создания: {submitError}</div>}
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.id}>
              <td>
                <Link className="link" to={`/students/${student.id}`}>{getStudentDisplayName(student)}</Link>
              </td>
              <td>{student.phone || '-'}</td>
              <td>{student.email || '-'}</td>
              <td>
                <span className={`badge badge-${student.status}`}>
                  {student.status}
                </span>
              </td>
              <td>
                <button
                  className="button button-danger"
                  type="button"
                  onClick={() => setPendingDeleteStudentId(student.id)}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}

          {filteredStudents.length === 0 && (
            <tr>
              <td colSpan="5">Ничего не найдено</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      {pendingDeleteStudentId && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content card">
            <div style={{ marginBottom: 16 }}>Вы уверены, что хотите удалить?</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="button button-secondary" type="button" onClick={() => setPendingDeleteStudentId(null)}>
                Отмена
              </button>
              <button className="button button-danger" type="button" onClick={confirmDeleteStudent}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
