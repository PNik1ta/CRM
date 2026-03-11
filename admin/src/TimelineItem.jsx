export default function TimelineItem({ event }) {
  return (
    <li style={{ marginBottom: '12px' }}>
      <div><strong>Тип:</strong> {event.type}</div>
      <div><strong>Дата:</strong> {new Date(event.date).toLocaleString()}</div>
      <div>
        <strong>Данные:</strong>
        <pre style={{ margin: '6px 0 0', padding: '8px', background: '#f4f4f4' }}>
          {JSON.stringify(event.data, null, 2)}
        </pre>
      </div>
    </li>
  );
}
