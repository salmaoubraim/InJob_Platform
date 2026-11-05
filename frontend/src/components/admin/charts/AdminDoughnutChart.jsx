import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#4361EE', '#6B8CFF', '#06D6A0', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#F97316', '#64748B', '#EC4899'];

export default function AdminDoughnutChart({ data = [], className = '' }) {
  const chartData = useMemo(() => ({
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { animateRotate: true, animateScale: true, duration: 900 },
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, padding: 12 } },
      tooltip: { backgroundColor: '#1A1A2E', padding: 12, cornerRadius: 8 },
    },
    cutout: '62%',
  }), []);

  if (!data.length) {
    return null;
  }

  return (
    <div className={`h-64 sm:h-80 ${className}`}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
