export default function TimelineItem({ event }) {
  if (event.type === 'lesson') {
    return (
      <li style={{ marginBottom: '12px' }}>
        <div><strong>📚 Урок</strong></div>
        <div>Дата: {new Date(event.data?.start_at || event.date).toLocaleString()}</div>
        <div>Предмет: {event.data?.subject || '-'}</div>
        <div>Формат: {event.data?.format || '-'}</div>
        <div>Цена: {event.data?.price ?? '-'}</div>
      </li>
    );
  }

  if (event.type === 'payment') {
    return (
      <li style={{ marginBottom: '12px' }}>
        <div><strong>💰 Оплата</strong></div>
        <div>Дата: {new Date(event.data?.paid_at || event.date).toLocaleString()}</div>
        <div>Сумма: {event.data?.amount ?? '-'}</div>
        <div>Метод: {event.data?.method || '-'}</div>
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
