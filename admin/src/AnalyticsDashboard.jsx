import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchJson } from './api';

const PERIODS = ['week', 'month', 'year', 'custom'];

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRangeForPeriod(period) {
  const toDate = new Date();
  const fromDate = new Date(toDate);

  if (period === 'week') {
    fromDate.setDate(toDate.getDate() - 6);
  } else if (period === 'month') {
    fromDate.setMonth(toDate.getMonth() - 1);
  } else if (period === 'year') {
    fromDate.setFullYear(toDate.getFullYear() - 1);
  }

  return {
    from: formatDate(fromDate),
    to: formatDate(toDate),
  };
}

function AnalyticsChart({ title, data, color }) {
  const hasData = data.length > 0;

  return (
    <div className="analytics-chart card">
      <h3>{title}</h3>
      {!hasData ? (
        <div className="analytics-empty">Нет данных за выбранный период</div>
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('week');
  const [customRange, setCustomRange] = useState(getRangeForPeriod('week'));
  const [analytics, setAnalytics] = useState({ revenue: [], lessons: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const range = useMemo(() => (period === 'custom' ? customRange : getRangeForPeriod(period)), [period, customRange]);

  useEffect(() => {
    async function loadAnalytics() {
      if (!range.from || !range.to) {
        return;
      }

      setLoading(true);

      try {
        const data = await fetchJson(`/api/analytics?from=${range.from}&to=${range.to}`);
        setAnalytics(data);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [range.from, range.to]);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2>Аналитика</h2>

      <div className="analytics-periods">
        {PERIODS.map((periodValue) => (
          <button
            key={periodValue}
            type="button"
            className={`button ${period === periodValue ? '' : 'button-secondary'}`}
            onClick={() => setPeriod(periodValue)}
          >
            {periodValue}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="analytics-custom-range">
          <label>
            От
            <input
              className="input"
              type="date"
              value={customRange.from}
              onChange={(event) => setCustomRange((prev) => ({ ...prev, from: event.target.value }))}
            />
          </label>
          <label>
            До
            <input
              className="input"
              type="date"
              value={customRange.to}
              onChange={(event) => setCustomRange((prev) => ({ ...prev, to: event.target.value }))}
            />
          </label>
        </div>
      )}

      {loading && <div>Загрузка аналитики...</div>}
      {error && <div>Ошибка загрузки аналитики: {error}</div>}

      {!loading && !error && (
        <div className="analytics-grid">
          <AnalyticsChart title="Revenue" data={analytics.revenue} color="#2AABEE" />
          <AnalyticsChart title="Lessons" data={analytics.lessons} color="#10b981" />
          <AnalyticsChart title="Students" data={analytics.students} color="#f59e0b" />
        </div>
      )}
    </div>
  );
}
