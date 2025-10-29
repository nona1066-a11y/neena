import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import type { SleepSession } from '@/shared/types';

export default function SleepChart() {
  const [sleepData, setSleepData] = useState<SleepSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSleepData();
  }, []);

  const fetchSleepData = async () => {
    try {
      const response = await fetch('/api/sleep-sessions?limit=14');
      if (response.ok) {
        const data = await response.json();
        setSleepData(data);
      }
    } catch (error) {
      console.error('Failed to fetch sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data if no real data exists
  const chartData = sleepData.length > 0 
    ? sleepData.slice(0, 7).reverse().map((session, index) => ({
        day: `يوم ${index + 1}`,
        score: session.sleep_score || 0,
        duration: session.sleep_duration_minutes ? Math.round(session.sleep_duration_minutes / 60 * 10) / 10 : 0
      }))
    : [
        { day: 'الأحد', score: 75, duration: 7.2 },
        { day: 'الإثنين', score: 82, duration: 7.8 },
        { day: 'الثلاثاء', score: 68, duration: 6.5 },
        { day: 'الأربعاء', score: 90, duration: 8.1 },
        { day: 'الخميس', score: 85, duration: 7.6 },
        { day: 'الجمعة', score: 78, duration: 7.3 },
        { day: 'السبت', score: 88, duration: 8.2 },
      ];

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-purple-200">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="day" 
            stroke="rgba(255,255,255,0.7)"
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.7)"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
            labelStyle={{ color: 'white' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="url(#gradient1)" 
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#a855f7' }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
