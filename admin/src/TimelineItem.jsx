function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
}

export default function TimelineItem({ event, onDelete, onEdit }) {
  const icon = event.type === 'lesson' ? '📚' : '💳';

  if (event.type === 'lesson') {
    return (
      <div>
        <div><strong><span style={{ marginRight: 6 }}>{icon}</span>Урок</strong></div>
        <div>Дата: {formatDate(event.data?.start_at || event.date)}</div>
        <div>Предмет: {event.data?.subject || '-'}</div>
        <div>Формат: {event.data?.format || '-'}</div>
        <div>Цена: {event.data?.price ?? '-'}</div>
        <button
          type="button"
          onClick={() => onEdit && onEdit(event)}
        >
          Редактировать
        </button>
        <button
          type="button"
          onClick={() => onDelete && onDelete(event.id, 'lesson')}
        >
          Удалить
        </button>
      </div>
    );
  }

  if (event.type === 'payment') {
    return (
      <div>
        <div><strong><span style={{ marginRight: 6 }}>{icon}</span>Оплата</strong></div>
        <div>Дата: {formatDate(event.data?.paid_at || event.date)}</div>
        <div>Сумма: {event.data?.amount ?? '-'}</div>
        <div>Метод: {event.data?.method || '-'}</div>
        <button
          type="button"
          onClick={() => onEdit && onEdit(event)}
        >
          Редактировать
        </button>
        <button
          type="button"
          onClick={() => onDelete && onDelete(event.id, 'payment')}
        >
          Удалить
        </button>
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
