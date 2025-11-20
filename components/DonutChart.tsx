"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  totalRent: number;
  totalCollected: number;
  reddiyatPending: number;
}

export default function DonutChart({
  totalRent,
  totalCollected,
  reddiyatPending,
}: DonutChartProps) {
  // Aktarılan = Tahsil Edilen - Reddiyat Bekleyen
  const aktarilan = Math.max(totalCollected - reddiyatPending, 0);
  
  // Tahsil Edilmemiş = Toplam - Tahsil Edilen
  const tahsilEdilmemis = Math.max(totalRent - totalCollected, 0);

  const data = {
    labels: ["Tahsil edilen", "Bekleyen kira", ""],
    datasets: [
      {
        data: [aktarilan, tahsilEdilmemis, reddiyatPending],
        backgroundColor: [
          "#3b82f6", // Mavi - Tahsil edilen (aktarılan)
          "#1e293b", // Koyu gri - Bekleyen kira
          "#dc2626"  // Kırmızı - Reddiyat bekleyen (görünmez ama veri var)
        ],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#94a3b8",
          padding: 15,
          font: {
            size: 12,
          },
          filter: (legendItem: any, chartData: any) => {
            // Boş label'ı (reddiyat) legend'da gösterme
            return legendItem.text !== "";
          }
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f1f5f9",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ₺${value.toLocaleString('tr-TR')}`;
          }
        }
      }
    },
  };

  return (
    <div className="relative">
      <Doughnut data={data} options={options} />
      
      {/* Merkez Bilgi */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-xs text-slate-500">Toplam Kira</div>
          <div className="text-xl font-bold text-white">
            ₺{totalRent.toLocaleString('tr-TR')}
          </div>
        </div>
      </div>
    </div>
  );
}