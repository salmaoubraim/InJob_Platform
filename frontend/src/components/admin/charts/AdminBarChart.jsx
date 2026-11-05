import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function formatPeriod(period, locale) {
  if (!period) return '';
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { month: 'short', year: 'numeric' });
}

export default function AdminBarChart({ data = [], label, color = '#4361EE', className = '' }) {
  const { i18n } = useTranslation('admin');
  const locale = i18n.language;

  const chartData = useMemo(() => ({
    labels: data.map((d) => formatPeriod(d.period, locale)),
    datasets: [
      {
        label,
        data: data.map((d) => d.count),
        backgroundColor: color,
        borderRadius: 8,
        maxBarThickness: 48,
      },
    ],
  }), [data, label, color, locale]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1A1A2E', padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 0 } },
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.06)' } },
    },
  }), []);

  return (
    <div className={`h-64 sm:h-72 ${className}`}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
