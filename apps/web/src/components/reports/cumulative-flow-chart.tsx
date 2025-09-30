'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CumulativeFlowData {
  date: string;
  open: number;
  inProgress: number;
  review: number;
  done: number;
}

interface CumulativeFlowChartProps {
  data: CumulativeFlowData[];
}

export function CumulativeFlowChart({ data }: CumulativeFlowChartProps) {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ color: string; name: string; value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} tasks
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} />
          <YAxis
            stroke="#666"
            fontSize={12}
            label={{ value: 'Tasks', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="done"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="review"
            stackId="1"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="inProgress"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="open"
            stackId="1"
            stroke="#6b7280"
            fill="#6b7280"
            fillOpacity={0.8}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
