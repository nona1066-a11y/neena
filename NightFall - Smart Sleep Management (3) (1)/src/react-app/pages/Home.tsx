import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Moon, Star, Sparkles, Play, Shield, BarChart3, Brain } from 'lucide-react';

export default function Home() {
  const { user, redirectToLogin, isPending } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isPending && user) {
      navigate('/dashboard');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    await redirectToLogin();
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="animate-pulse">
          <Moon className="w-12 h-12 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 animate-pulse">
          <Star className="w-4 h-4 text-purple-300 opacity-60" />
        </div>
        <div className="absolute top-32 right-32 animate-pulse delay-1000">
          <Star className="w-3 h-3 text-pink-300 opacity-40" />
        </div>
        <div className="absolute bottom-40 left-16 animate-pulse delay-500">
          <Star className="w-5 h-5 text-indigo-300 opacity-50" />
        </div>
        <div className="absolute top-1/2 right-20 animate-pulse delay-700">
          <Sparkles className="w-6 h-6 text-purple-200 opacity-30" />
        </div>
      </div>

      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Moon className="w-8 h-8 text-white" />
                <div className="absolute inset-0 animate-pulse rounded-full bg-purple-400 opacity-20 scale-150"></div>
              </div>
              <h1 className="text-2xl font-bold text-white">NightFall</h1>
            </div>
            <button
              onClick={handleLogin}
              className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Sleep Better
                <br />
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Live Better
                </span>
                <span className="text-4xl ml-4">🌙</span>
              </h2>
              <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                A comprehensive smart sleep management app with AI-powered sleep quality analysis, soothing sounds, and smart alarms
              </p>
              <button
                onClick={handleLogin}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Your Better Sleep Journey
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
                  <Brain className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Smart Sleep Analysis</h3>
                <p className="text-purple-200">AI-powered sleep quality analysis with personalized recommendations</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-pink-500/20 rounded-full mb-4">
                  <Play className="w-6 h-6 text-pink-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Relaxing Sounds</h3>
                <p className="text-purple-200">Comprehensive library of soothing sounds tailored to your mood</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-500/20 rounded-full mb-4">
                  <Shield className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Do Not Disturb Mode</h3>
                <p className="text-purple-200">Automatically block apps before bedtime for better rest</p>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold text-white text-center mb-6">
                Discover Your Sleep Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Sleep Quality Score</span>
                      <span className="text-white text-2xl font-bold">85</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Deep Sleep Hours</span>
                      <span className="text-white text-2xl font-bold">2.5</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">This Week Improvement</span>
                      <span className="text-green-400 text-xl font-bold">+15%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="relative">
                    <BarChart3 className="w-32 h-32 text-purple-300 mx-auto opacity-60" />
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10"></div>
                  </div>
                  <p className="text-purple-200 mt-4">
                    Detailed daily reports and personalized recommendations
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <p className="text-purple-200 text-lg mb-6">
                Join thousands of users who have improved their sleep quality
              </p>
              <button
                onClick={handleLogin}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-4 rounded-full text-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Free Now
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8">
          <p className="text-purple-300 text-lg font-semibold">
            "Sleep Better, Live Better 🌙"
          </p>
        </footer>
      </div>
    </div>
  );
}
