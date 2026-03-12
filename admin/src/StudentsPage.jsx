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
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await postJson('/api/students', formData);
      await loadStudents();
      setFormData(initialForm);
      setShowCreateForm(false);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
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

      <button className="button" type="button" onClick={() => setShowCreateForm((prev) => !prev)}>
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
          <div className="form-group">
            <label className="form-label" htmlFor="first_name">
              Имя
            </label>
            <input className="input" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="last_name">
              Фамилия
            </label>
            <input className="input" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
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

          <div style={{ marginTop: '10px' }}>
            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить ученика'}
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
            </tr>
          ))}

          {filteredStudents.length === 0 && (
            <tr>
              <td colSpan="4">Ничего не найдено</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </>
  );
}
