import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  salesChart: Array<{
    week: string;
    sales_amount: string;
    sales_count: number;
  }>;
  vehicleTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  salesChart,
  vehicleTypeDistribution,
}) => {
  // Sales Trend Line Chart
  const salesData = {
    labels: salesChart.map(item => {
      const date = new Date(item.week);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Sales Amount ($)',
        data: salesChart.map(item => parseFloat(item.sales_amount)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const salesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Vehicle Type Distribution Pie Chart
  const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(37, 99, 235, 0.8)',
    'rgba(22, 163, 74, 0.8)',
    'rgba(96, 165, 250, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(107, 114, 128, 0.8)',
  ];

  const borderColors = [
    'rgb(59, 130, 246)',
    'rgb(34, 197, 94)',
    'rgb(37, 99, 235)',
    'rgb(22, 163, 74)',
    'rgb(96, 165, 250)',
    'rgb(16, 185, 129)',
    'rgb(139, 92, 246)',
    'rgb(245, 158, 11)',
    'rgb(239, 68, 68)',
    'rgb(107, 114, 128)',
  ];

  const vehicleTypeData = {
    labels: vehicleTypeDistribution.map(item => item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
    datasets: [
      {
        data: vehicleTypeDistribution.map(item => item.count),
        backgroundColor: colors.slice(0, vehicleTypeDistribution.length),
        borderColor: borderColors.slice(0, vehicleTypeDistribution.length),
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const vehicleTypeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales Trend Chart */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
          <p className="text-sm text-gray-500">Weekly revenue performance</p>
        </div>
        <div className="p-6">
          <div className="h-64">
            <Line data={salesData} options={salesOptions} />
          </div>
        </div>
      </div>

      {/* Vehicle Type Distribution Chart */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Type Distribution</h2>
          <p className="text-sm text-gray-500">Inventory by body type</p>
        </div>
        <div className="p-6">
          <div className="h-64">
            <Doughnut data={vehicleTypeData} options={vehicleTypeOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts; 