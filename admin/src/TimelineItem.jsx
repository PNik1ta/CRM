function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return `${value} ₼`;
}

export default function TimelineItem({ event, onEdit, onDelete }) {
  const icon = event.type === 'lesson' ? '📘' : event.type === 'payment' ? '💰' : '🗂️';

  if (event.type === 'lesson') {
    return (
      <div>
        <div><strong><span style={{ marginRight: 6 }}>{icon}</span>Урок</strong></div>
        <div>Дата: {formatDate(event.data?.start_at || event.date)}</div>
        <div>Предмет: {event.data?.subject || '-'}</div>
        <div>Формат: {event.data?.format || '-'}</div>
        <div>Цена: {formatMoney(event.data?.price)}</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => onEdit && onEdit(event)}
          >
            Редактировать
          </button>
          <button
            className="button button-danger"
            type="button"
            onClick={() => onDelete && onDelete(event.id, 'lesson')}
          >
            Удалить
          </button>
        </div>
      </div>
    );
  }

  if (event.type === 'payment') {
    return (
      <div>
        <div><strong><span style={{ marginRight: 6 }}>{icon}</span>Оплата</strong></div>
        <div>Дата: {formatDate(event.data?.paid_at || event.date)}</div>
        <div>Сумма: {formatMoney(event.data?.amount)}</div>
        <div>Метод: {event.data?.method || '-'}</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => onEdit && onEdit(event)}
          >
            Редактировать
          </button>
          <button
            className="button button-danger"
            type="button"
            onClick={() => onDelete && onDelete(event.id, 'payment')}
          >
            Удалить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div><strong><span style={{ marginRight: 6 }}>{icon}</span>Тип:</strong> {event.type}</div>
      <div><strong>Дата:</strong> {new Date(event.date).toLocaleString()}</div>
    </div>
  );
}
