import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SleepAnalysis } from '@/shared/types';

interface SleepStatsProps {
  analysis: SleepAnalysis | null;
}

export default function SleepStats({ analysis }: SleepStatsProps) {
  const stats = [
    {
      label: 'أفضل نوم',
      value: analysis?.bestSleepDay ? new Date(analysis.bestSleepDay).toLocaleDateString('ar-SA') : 'لا توجد بيانات',
      description: 'أفضل ليلة نوم مسجلة'
    },
    {
      label: 'الأسبوع الماضي',
      value: analysis?.weeklyComparison.lastWeek || 0,
      description: 'متوسط النقاط الأسبوع الماضي'
    },
    {
      label: 'التغيير',
      value: analysis?.weeklyComparison.change || 0,
      description: 'التغيير مقارنة بالأسبوع الماضي',
      isChange: true
    }
  ];

  const getTrendIcon = (trend: string | undefined) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getTrendText = (trend: string | undefined) => {
    switch (trend) {
      case 'improving':
        return { text: 'يتحسن', color: 'text-green-400' };
      case 'declining':
        return { text: 'ينخفض', color: 'text-red-400' };
      default:
        return { text: 'مستقر', color: 'text-yellow-400' };
    }
  };

  const trendInfo = getTrendText(analysis?.sleepTrend);

  return (
    <div className="space-y-4">
      {/* Overall Trend */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-purple-200 text-sm">اتجاه النوم</span>
          {getTrendIcon(analysis?.sleepTrend)}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-semibold ${trendInfo.color}`}>
            {trendInfo.text}
          </span>
        </div>
      </div>

      {/* Individual Stats */}
      {stats.map((stat, index) => (
        <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-purple-200 text-sm">{stat.label}</span>
            {stat.isChange && (
              <div className={`flex items-center space-x-1 ${
                (stat.value as number) > 0 ? 'text-green-400' :
                (stat.value as number) < 0 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {(stat.value as number) > 0 ? <TrendingUp className="w-4 h-4" /> :
                 (stat.value as number) < 0 ? <TrendingDown className="w-4 h-4" /> :
                 <Minus className="w-4 h-4" />}
              </div>
            )}
          </div>
          <div className="text-white font-semibold text-lg">
            {stat.isChange 
              ? `${(stat.value as number) > 0 ? '+' : ''}${stat.value}`
              : stat.value}
          </div>
          <p className="text-purple-300 text-xs mt-1">{stat.description}</p>
        </div>
      ))}

      {/* Sleep Quality Breakdown */}
      {analysis && analysis.averageSleepScore > 0 && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="text-white font-semibold mb-3">تفصيل الجودة</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-200">النوم العميق</span>
              <div className="flex items-center space-x-2">
                <div className="w-12 bg-white/20 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-white">75%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-200">النوم الخفيف</span>
              <div className="flex items-center space-x-2">
                <div className="w-12 bg-white/20 rounded-full h-2">
                  <div className="bg-pink-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-white">60%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-200">نوم الأحلام</span>
              <div className="flex items-center space-x-2">
                <div className="w-12 bg-white/20 rounded-full h-2">
                  <div className="bg-indigo-400 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-white">40%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-white/10">
        <h4 className="text-white font-semibold mb-2">💡 نصائح لتحسين النوم</h4>
        <ul className="space-y-1 text-purple-200 text-sm">
          <li>• تجنب الكافيين قبل 6 ساعات من النوم</li>
          <li>• حافظ على برودة الغرفة (18-22°م)</li>
          <li>• استخدم أصوات الطبيعة للاسترخاء</li>
        </ul>
      </div>
    </div>
  );
}
