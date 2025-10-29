import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Music, Shield, Plus, Clock, Star } from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [sleepDuration, setSleepDuration] = useState('8');
  const [notes, setNotes] = useState('');

  const handleLogSleep = async () => {
    try {
      const response = await fetch('/api/sleep-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sleep_quality_rating: sleepQuality,
          sleep_duration_minutes: parseFloat(sleepDuration) * 60,
          sleep_score: Math.round(sleepQuality * 20 + Math.random() * 20), // Simple scoring algorithm
          notes: notes || undefined,
          bedtime_at: new Date(Date.now() - parseFloat(sleepDuration) * 60 * 60 * 1000).toISOString(),
          wake_time_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setShowSleepForm(false);
        setSleepQuality(5);
        setSleepDuration('8');
        setNotes('');
        // Refresh page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to log sleep:', error);
    }
  };

  const quickActions = [
    {
      icon: Music,
      label: 'تشغيل أصوات النوم',
      description: 'أصوات مهدئة لنوم أفضل',
      color: 'from-pink-500/20 to-purple-500/20',
      action: () => navigate('/sounds')
    },
    {
      icon: Shield,
      label: 'تفعيل وضع النوم',
      description: 'حظر التطبيقات المشتتة',
      color: 'from-indigo-500/20 to-purple-500/20',
      action: () => {
        // In a real app, this would integrate with system APIs
        alert('تم تفعيل وضع النوم! 🌙\nسيتم حظر التطبيقات المشتتة حتى الصباح.');
      }
    },
    {
      icon: Plus,
      label: 'تسجيل النوم',
      description: 'سجل كيف كان نومك',
      color: 'from-purple-500/20 to-pink-500/20',
      action: () => setShowSleepForm(true)
    },
    {
      icon: Clock,
      label: 'ضبط المنبه الذكي',
      description: 'استيقظ في أفضل توقيت',
      color: 'from-green-500/20 to-blue-500/20',
      action: () => {
        const wakeTime = prompt('متى تريد الاستيقاظ؟ (مثال: 07:00)', '07:00');
        if (wakeTime) {
          alert(`تم ضبط المنبه الذكي على ${wakeTime} ⏰\nسيتم إيقاظك في أفضل مرحلة نوم خفيف.`);
        }
      }
    }
  ];

  return (
    <div className="space-y-4">
      {quickActions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className={`w-full bg-gradient-to-r ${action.color} backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 text-left group`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <action.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{action.label}</h3>
              <p className="text-purple-200 text-sm">{action.description}</p>
            </div>
          </div>
        </button>
      ))}

      {/* Sleep Form Modal */}
      {showSleepForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">تسجيل النوم</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm mb-2">كيف كان نومك؟</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSleepQuality(rating)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        sleepQuality >= rating 
                          ? 'text-yellow-400 scale-110' 
                          : 'text-gray-400 hover:text-yellow-300'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-purple-300 text-xs mt-1">
                  {sleepQuality === 1 ? 'سيء جداً' :
                   sleepQuality === 2 ? 'سيء' :
                   sleepQuality === 3 ? 'متوسط' :
                   sleepQuality === 4 ? 'جيد' : 'ممتاز'}
                </p>
              </div>

              <div>
                <label className="block text-purple-200 text-sm mb-2">كم ساعة نمت؟</label>
                <select
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
                >
                  {[4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12].map(hours => (
                    <option key={hours} value={hours} className="bg-purple-900">
                      {hours} ساعة
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-purple-200 text-sm mb-2">ملاحظات (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات حول نومك؟"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none resize-none h-20"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSleepForm(false)}
                className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleLogSleep}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
