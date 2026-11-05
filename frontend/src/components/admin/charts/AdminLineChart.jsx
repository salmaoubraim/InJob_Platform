import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function formatPeriod(period, locale) {
  if (!period) return '';
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { month: 'short', year: 'numeric' });
}

export default function AdminLineChart({ series = [], className = '' }) {
  const { i18n } = useTranslation('admin');
  const locale = i18n.language;

  const labels = series[0]?.data?.map((d) => formatPeriod(d.period, locale)) || [];

  const chartData = useMemo(() => ({
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.data.map((d) => d.count),
      borderColor: s.color,
      backgroundColor: `${s.color}22`,
      tension: 0.35,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  }), [series, labels]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } },
      tooltip: { backgroundColor: '#1A1A2E', padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.06)' } },
    },
  }), []);

  return (
    <div className={`h-64 sm:h-72 ${className}`}>
      <Line data={chartData} options={options} />
    </div>
  );
}
