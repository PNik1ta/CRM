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
    <div>
      <h2>Список учеников</h2>

      <button type="button" onClick={() => setShowCreateForm((prev) => !prev)}>
        Создать ученика
      </button>

      {showCreateForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '12px', marginBottom: '16px' }}>
          <div>
            <label htmlFor="first_name">Имя (first_name)</label>
            <br />
            <input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="last_name">Фамилия (last_name)</label>
            <br />
            <input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="phone">Телефон (phone)</label>
            <br />
            <input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="email">Email (email)</label>
            <br />
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="status">Статус (status)</label>
            <br />
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="archived">archived</option>
            </select>
          </div>

          <div style={{ marginTop: '10px' }}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить ученика'}
            </button>
          </div>

          {submitError && <div style={{ marginTop: '8px' }}>Ошибка создания: {submitError}</div>}
        </form>
      )}

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
