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
  if (event.type === 'lesson') {
    return (
      <li style={{ marginBottom: '12px' }}>
        <div><strong>📚 Урок</strong></div>
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
      </li>
    );
  }

  if (event.type === 'payment') {
    return (
      <li style={{ marginBottom: '12px' }}>
        <div><strong>💰 Оплата</strong></div>
        <div>Дата: {formatDate(event.data?.paid_at || event.date)}</div>
        <div>Сумма: {event.data?.amount ?? '-'}</div>
        <div>Метод: {event.data?.method || '-'}</div>
        <button
          type="button"
          onClick={() => onDelete && onDelete(event.id, 'payment')}
        >
          Удалить
        </button>
      </li>
    );
  }

  return (
    <li style={{ marginBottom: '12px' }}>
      <div><strong>Тип:</strong> {event.type}</div>
      <div><strong>Дата:</strong> {new Date(event.date).toLocaleString()}</div>
    </li>
  );
}
