import React, { useState } from 'react';

// 1. Revenue 7-Day Area Chart
interface RevenuePoint {
  day: string;
  date: string;
  revenue: number;
}

export const RevenueAreaChart: React.FC<{ data: RevenuePoint[] }> = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-neutral-500">Sem dados no período</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.revenue), 100);
  const paddingY = 24;
  const paddingX = 32;
  const width = 500;
  const height = 180;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = height - paddingY - (d.revenue / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="text-neutral-400">Evolução diária (R$)</span>
        <span className="text-[#C49A5A] font-medium tabular-nums">
          Máx: R$ {maxVal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
        </span>
      </div>

      <div className="w-full h-48 relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C49A5A" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#C49A5A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = height - paddingY - ratio * chartHeight;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#292929"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          {/* Fill Area */}
          <path d={areaD} fill="url(#goldGradient)" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#C49A5A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === i ? 6 : 3.5}
                className={`transition-all duration-200 cursor-pointer ${
                  hoverIndex === i ? 'fill-[#C49A5A] stroke-white stroke-2' : 'fill-[#090909] stroke-[#C49A5A] stroke-2'
                }`}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && (
          <div
            className="absolute -top-3 z-20 pointer-events-none transform -translate-x-1/2 bg-[#1B1B1B] border border-[#C49A5A]/40 px-2.5 py-1.5 rounded-lg shadow-xl text-center"
            style={{ left: `${(points[hoverIndex].x / width) * 100}%` }}
          >
            <p className="text-[10px] text-neutral-400 font-medium">{points[hoverIndex].day}</p>
            <p className="text-xs font-bold text-white tabular-nums">
              R$ {points[hoverIndex].revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {/* X Labels */}
      <div className="flex justify-between items-center px-4 pt-2 text-[11px] text-neutral-400 font-medium">
        {data.map((d, i) => (
          <span key={i} className={hoverIndex === i ? 'text-[#C49A5A]' : ''}>
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
};

// 2. Daily Appointments Bar Chart
interface AppointmentBarData {
  day: string;
  count: number;
}

export const AppointmentsBarChart: React.FC<{ data: AppointmentBarData[] }> = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const maxCount = Math.max(...data.map((d) => d.count), 6);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="text-neutral-400">Atendimentos agendados</span>
        <span className="text-neutral-300 font-medium tabular-nums">
          Total 7 dias: {data.reduce((acc, curr) => acc + curr.count, 0)}
        </span>
      </div>

      <div className="h-48 flex items-end gap-2.5 sm:gap-4 pt-6 px-2 border-b border-[#292929]">
        {data.map((d, i) => {
          const heightPercent = Math.max((d.count / maxCount) * 100, 8);
          const isHovered = hoverIndex === i;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center group cursor-pointer relative h-full justify-end"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-7 bg-[#1B1B1B] border border-[#292929] px-2 py-0.5 rounded text-[10px] font-semibold text-white whitespace-nowrap shadow-lg">
                  {d.count} agendamento{d.count !== 1 ? 's' : ''}
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${
                  isHovered
                    ? 'bg-[#C49A5A]'
                    : 'bg-neutral-800 hover:bg-neutral-700'
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Day label */}
              <span className={`text-[11px] mt-2 pt-1 font-medium transition-colors ${
                isHovered ? 'text-[#C49A5A]' : 'text-neutral-400'
              }`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. Popular Services Breakdown
interface PopularServiceItem {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

export const PopularServicesList: React.FC<{ items: PopularServiceItem[] }> = ({ items }) => {
  return (
    <div className="space-y-3.5">
      {items.map((item, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-200 truncate pr-2">{item.name}</span>
            <div className="flex items-center gap-2 shrink-0 tabular-nums">
              <span className="text-neutral-400">{item.count} un.</span>
              <span className="font-semibold text-[#C49A5A]">
                R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-[#1B1B1B] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C49A5A] rounded-full transition-all duration-500"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
