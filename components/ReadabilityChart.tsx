import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ReadabilityMetrics } from '../utils/readability';

interface ReadabilityChartProps {
  originalMetrics: ReadabilityMetrics;
  simplifiedMetrics: ReadabilityMetrics;
}

export const ReadabilityChart: React.FC<ReadabilityChartProps> = ({ originalMetrics, simplifiedMetrics }) => {
  const data = [
    {
      name: 'Grade Level',
      Original: originalMetrics.fleschKincaidGrade,
      Simplified: simplifiedMetrics.fleschKincaidGrade,
    },
    {
      name: 'Sentence Length',
      Original: originalMetrics.avgSentenceLength,
      Simplified: simplifiedMetrics.avgSentenceLength,
    },
    {
      name: 'Complex Words',
      Original: originalMetrics.complexWordCount,
      Simplified: simplifiedMetrics.complexWordCount,
    }
  ];

  return (
    <div className="w-full mt-4" style={{ height: 300, minWidth: 0, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#000000', fontSize: 12}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#000000', fontSize: 12}} />
          <Tooltip 
            cursor={{fill: '#f1f5f9'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Bar dataKey="Original" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Simplified" fill="#0d9488" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};