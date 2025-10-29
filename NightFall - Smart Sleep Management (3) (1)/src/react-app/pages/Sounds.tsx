import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import { Play, Pause, Volume2, Clock, Star, Timer } from 'lucide-react';
import type { SoundCategory, SoundTrack } from '@/shared/types';

// Audio synthesis utilities for realistic sounds
class SoundSynthesizer {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private isPlaying: boolean = false;
  private sources: AudioBufferSourceNode[] = [];

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  setVolume(volume: number) {
    this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }

  stop() {
    this.isPlaying = false;
    this.sources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    this.sources = [];
  }

  // Generate realistic rain sound - Enhanced for maximum relaxation
  async playRain() {
    this.isPlaying = true;
    const playDroplet = () => {
      if (!this.isPlaying) return;

      const oscillator = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      // Softer, lower frequency droplets (80-400 Hz) for calming effect
      const frequency = 80 + Math.random() * 320;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      // Gentler low-pass filter for smoother sound
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
      filter.Q.setValueAtTime(0.3, this.audioContext.currentTime);

      // Softer, longer envelope for gentle droplets
      envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
      envelope.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.02);
      envelope.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.5);

      oscillator.connect(filter);
      filter.connect(envelope);
      envelope.connect(this.gainNode);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.5);

      // More varied timing for natural feel
      const nextDelay = 15 + Math.random() * 60;
      setTimeout(playDroplet, nextDelay);
    };

    // Enhanced pink noise for smoother rain background
    const bufferSize = this.audioContext.sampleRate * 2;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Pink noise algorithm for warmer, more natural sound
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const noiseSource = this.audioContext.createBufferSource();
    const noiseFilter = this.audioContext.createBiquadFilter();
    const noiseGain = this.audioContext.createGain();

    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    // Gentle bandpass for smooth rain sound
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(350, this.audioContext.currentTime);
    noiseFilter.Q.setValueAtTime(0.4, this.audioContext.currentTime);
    
    noiseGain.gain.setValueAtTime(0.12, this.audioContext.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.gainNode);

    noiseSource.start();
    this.sources.push(noiseSource);

    // Add low rumble for depth and warmth
    const rumbleOsc = this.audioContext.createOscillator();
    const rumbleGain = this.audioContext.createGain();
    const rumbleLfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    rumbleOsc.frequency.setValueAtTime(50, this.audioContext.currentTime);
    rumbleOsc.type = 'sine';
    
    rumbleLfo.frequency.setValueAtTime(0.08, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(8, this.audioContext.currentTime);
    
    rumbleGain.gain.setValueAtTime(0.06, this.audioContext.currentTime);

    rumbleLfo.connect(lfoGain);
    lfoGain.connect(rumbleOsc.frequency);
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(this.gainNode);

    rumbleOsc.start();
    rumbleLfo.start();
    
    this.sources.push(rumbleOsc as any);
    this.sources.push(rumbleLfo as any);

    // Start gentle droplet effects
    for (let i = 0; i < 4; i++) {
      setTimeout(playDroplet, i * 150);
    }
  }

  // Generate realistic ocean waves - Enhanced for deep relaxation
  async playOcean() {
    this.isPlaying = true;
    
    // Create gentle wave crash sounds
    const createWave = () => {
      if (!this.isPlaying) return;

      // Create smooth wave crash
      const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 4, this.audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Generate smooth wave crash with gentle envelope
      for (let i = 0; i < output.length; i++) {
        const t = i / this.audioContext.sampleRate;
        const attack = Math.min(1, t * 3);
        const release = Math.exp(-t / 1.2);
        const envelope = attack * release;
        output[i] = (Math.random() * 2 - 1) * envelope * 0.18;
      }

      const waveSource = this.audioContext.createBufferSource();
      const waveFilter1 = this.audioContext.createBiquadFilter();
      const waveFilter2 = this.audioContext.createBiquadFilter();
      const waveGain = this.audioContext.createGain();

      waveSource.buffer = noiseBuffer;
      
      // Dual filtering for ultra-smooth waves
      waveFilter1.type = 'lowpass';
      waveFilter1.frequency.setValueAtTime(280, this.audioContext.currentTime);
      waveFilter1.Q.setValueAtTime(0.5, this.audioContext.currentTime);
      
      waveFilter2.type = 'highpass';
      waveFilter2.frequency.setValueAtTime(60, this.audioContext.currentTime);
      waveFilter2.Q.setValueAtTime(0.3, this.audioContext.currentTime);
      
      waveGain.gain.setValueAtTime(0.25 + Math.random() * 0.15, this.audioContext.currentTime);

      waveSource.connect(waveFilter1);
      waveFilter1.connect(waveFilter2);
      waveFilter2.connect(waveGain);
      waveGain.connect(this.gainNode);

      waveSource.start();

      // Natural wave timing
      const nextWave = 4000 + Math.random() * 5000;
      setTimeout(createWave, nextWave);
    };

    // Create deep, calming ocean background
    const oceanOsc1 = this.audioContext.createOscillator();
    const oceanOsc2 = this.audioContext.createOscillator();
    const oceanOsc3 = this.audioContext.createOscillator();
    const oceanOsc4 = this.audioContext.createOscillator();
    
    const lfo1 = this.audioContext.createOscillator();
    const lfo2 = this.audioContext.createOscillator();
    const lfo3 = this.audioContext.createOscillator();
    const lfoGain1 = this.audioContext.createGain();
    const lfoGain2 = this.audioContext.createGain();
    const lfoGain3 = this.audioContext.createGain();
    
    const oceanFilter = this.audioContext.createBiquadFilter();
    const oceanGain = this.audioContext.createGain();

    // Deep, soothing bass frequencies
    oceanOsc1.frequency.setValueAtTime(35, this.audioContext.currentTime);
    oceanOsc2.frequency.setValueAtTime(52, this.audioContext.currentTime);
    oceanOsc3.frequency.setValueAtTime(70, this.audioContext.currentTime);
    oceanOsc4.frequency.setValueAtTime(105, this.audioContext.currentTime);
    
    oceanOsc1.type = 'sine';
    oceanOsc2.type = 'sine';
    oceanOsc3.type = 'triangle';
    oceanOsc4.type = 'triangle';

    // Slow, gentle LFOs for natural wave motion
    lfo1.frequency.setValueAtTime(0.06, this.audioContext.currentTime);
    lfo2.frequency.setValueAtTime(0.09, this.audioContext.currentTime);
    lfo3.frequency.setValueAtTime(0.12, this.audioContext.currentTime);
    lfoGain1.gain.setValueAtTime(8, this.audioContext.currentTime);
    lfoGain2.gain.setValueAtTime(12, this.audioContext.currentTime);
    lfoGain3.gain.setValueAtTime(15, this.audioContext.currentTime);

    // Smooth ocean filter
    oceanFilter.type = 'lowpass';
    oceanFilter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oceanFilter.Q.setValueAtTime(0.5, this.audioContext.currentTime);

    oceanGain.gain.setValueAtTime(0.16, this.audioContext.currentTime);

    // Connect LFOs for gentle modulation
    lfo1.connect(lfoGain1);
    lfo2.connect(lfoGain2);
    lfo3.connect(lfoGain3);
    lfoGain1.connect(oceanOsc1.frequency);
    lfoGain2.connect(oceanOsc2.frequency);
    lfoGain3.connect(oceanOsc3.frequency);
    
    oceanOsc1.connect(oceanFilter);
    oceanOsc2.connect(oceanFilter);
    oceanOsc3.connect(oceanFilter);
    oceanOsc4.connect(oceanFilter);
    oceanFilter.connect(oceanGain);
    oceanGain.connect(this.gainNode);

    oceanOsc1.start();
    oceanOsc2.start();
    oceanOsc3.start();
    oceanOsc4.start();
    lfo1.start();
    lfo2.start();
    lfo3.start();

    this.sources.push(oceanOsc1 as any);
    this.sources.push(oceanOsc2 as any);
    this.sources.push(oceanOsc3 as any);
    this.sources.push(oceanOsc4 as any);
    this.sources.push(lfo1 as any);
    this.sources.push(lfo2 as any);
    this.sources.push(lfo3 as any);

    // Start gentle wave crashes
    setTimeout(createWave, 2000);
  }

  // Generate forest ambience
  async playForest() {
    this.isPlaying = true;

    // Create multiple layers for forest ambience
    const createLayer = (freq: number, type: OscillatorType, volume: number) => {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      oscillator.type = type;
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3, this.audioContext.currentTime);
      
      gain.gain.setValueAtTime(volume, this.audioContext.currentTime);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(this.gainNode);

      oscillator.start();
      this.sources.push(oscillator as any);
    };

    // Multiple frequency layers for richness
    createLayer(150, 'sine', 0.2);
    createLayer(250, 'triangle', 0.15);
    createLayer(400, 'sine', 0.1);
    createLayer(80, 'sawtooth', 0.05);
  }

  // Generate white noise variations - Enhanced for comfort
  async playWhiteNoise(type: 'white' | 'pink' | 'brown') {
    this.isPlaying = true;

    const bufferSize = this.audioContext.sampleRate * 2;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'white') {
      // Smoother white noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.7;
      }
    } else if (type === 'pink') {
      // Warmer pink noise
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.09; // Softer output
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      // Deep, soothing brown noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.015 * white)) / 1.015;
        lastOut = output[i];
        output[i] *= 2.8; // Gentler output
      }
    }

    const noiseSource = this.audioContext.createBufferSource();
    const noiseFilter = this.audioContext.createBiquadFilter();
    const noiseGain = this.audioContext.createGain();
    
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    // Gentle filtering for smoother sound
    noiseFilter.type = 'lowpass';
    if (type === 'white') {
      noiseFilter.frequency.setValueAtTime(8000, this.audioContext.currentTime);
    } else if (type === 'pink') {
      noiseFilter.frequency.setValueAtTime(5000, this.audioContext.currentTime);
    } else {
      noiseFilter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    }
    noiseFilter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
    
    noiseGain.gain.setValueAtTime(1, this.audioContext.currentTime);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.gainNode);
    noiseSource.start();

    this.sources.push(noiseSource);
  }
}

export default function Sounds() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const synthesizerRef = useRef<SoundSynthesizer | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SoundTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [playTime, setPlayTime] = useState(0);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  // Initialize synthesizer
  useEffect(() => {
    synthesizerRef.current = new SoundSynthesizer();
    return () => {
      if (synthesizerRef.current) {
        synthesizerRef.current.stop();
      }
    };
  }, []);

  // Play time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sleep timer effect
  useEffect(() => {
    if (sleepTimer) {
      const timer = setTimeout(() => {
        stopSound();
        setSleepTimer(null);
      }, sleepTimer * 60 * 1000);

      return () => clearTimeout(timer);
    }
  }, [sleepTimer]);

  // Enhanced sound categories with real audio synthesis
  const soundCategories: SoundCategory[] = [
    {
      id: 'nature',
      nameAr: 'Nature Sounds',
      nameEn: 'Nature Sounds',
      sounds: [
        {
          id: 'rain',
          nameAr: 'Realistic Rain',
          nameEn: 'Realistic Rain',
          url: '',
          duration: 3600,
          category: 'nature'
        },
        {
          id: 'ocean',
          nameAr: 'Realistic Ocean Waves',
          nameEn: 'Realistic Ocean Waves',
          url: '',
          duration: 3600,
          category: 'nature'
        },
        {
          id: 'forest',
          nameAr: 'Forest Ambience',
          nameEn: 'Forest Ambience',
          url: '',
          duration: 3600,
          category: 'nature'
        }
      ]
    },
    {
      id: 'white-noise',
      nameAr: 'White Noise',
      nameEn: 'White Noise',
      sounds: [
        {
          id: 'white-noise',
          nameAr: 'White Noise',
          nameEn: 'White Noise',
          url: '',
          duration: 3600,
          category: 'white-noise'
        },
        {
          id: 'pink-noise',
          nameAr: 'Pink Noise',
          nameEn: 'Pink Noise',
          url: '',
          duration: 3600,
          category: 'white-noise'
        },
        {
          id: 'brown-noise',
          nameAr: 'Brown Noise',
          nameEn: 'Brown Noise',
          url: '',
          duration: 3600,
          category: 'white-noise'
        }
      ]
    }
  ];

  const playSound = useCallback(async (track: SoundTrack) => {
    if (!synthesizerRef.current) return;

    if (currentTrack?.id === track.id && isPlaying) {
      // Stop current track
      stopSound();
      return;
    }

    try {
      // Stop any currently playing sound
      stopSound();

      // Set new track and volume
      setCurrentTrack(track);
      setPlayTime(0);
      synthesizerRef.current.setVolume(volume);

      // Play the appropriate synthesized sound
      switch (track.id) {
        case 'rain':
          await synthesizerRef.current.playRain();
          break;
        case 'ocean':
          await synthesizerRef.current.playOcean();
          break;
        case 'forest':
          await synthesizerRef.current.playForest();
          break;
        case 'white-noise':
          await synthesizerRef.current.playWhiteNoise('white');
          break;
        case 'pink-noise':
          await synthesizerRef.current.playWhiteNoise('pink');
          break;
        case 'brown-noise':
          await synthesizerRef.current.playWhiteNoise('brown');
          break;
        default:
          // For other sounds, use white noise
          await synthesizerRef.current.playWhiteNoise('white');
      }

      setIsPlaying(true);

      // Log the sound session
      await fetch('/api/sound-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sound_type: track.category,
          sound_name: track.nameEn,
          duration_minutes: Math.round(track.duration / 60),
        }),
      });
      
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }, [currentTrack, isPlaying, volume]);

  const stopSound = useCallback(() => {
    if (synthesizerRef.current) {
      synthesizerRef.current.stop();
      setIsPlaying(false);
      setPlayTime(0);
    }
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (synthesizerRef.current) {
      synthesizerRef.current.setVolume(newVolume);
    }
  }, []);

  const startSleepTimer = () => {
    setSleepTimer(timerMinutes);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimerRemaining = () => {
    if (!sleepTimer) return '';
    const remaining = Math.max(0, sleepTimer);
    return `${remaining} minutes remaining`;
  };

  const timerOptions = [
    { value: 15, ar: '15 minutes', en: '15 minutes' },
    { value: 30, ar: '30 minutes', en: '30 minutes' },
    { value: 60, ar: '1 hour', en: '1 hour' },
    { value: 120, ar: '2 hours', en: '2 hours' },
    { value: 180, ar: '3 hours', en: '3 hours' },
    { value: 300, ar: '5 hours', en: '5 hours' },
    { value: 480, ar: '8 hours', en: '8 hours' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Enhanced Sleep Sounds</h1>
          <p className="text-purple-200">
            Real sounds crafted with advanced technology for better sleep
          </p>
        </div>

        {/* Audio Player */}
        {currentTrack && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {currentTrack.nameEn}
                </h3>
                <p className="text-green-400 text-xs mt-1">
                  🎵 AI-Enhanced Sound
                </p>
                {sleepTimer && (
                  <p className="text-green-400 text-xs mt-1">
                    <Timer className="w-3 h-3 inline mr-1" />
                    {formatTimerRemaining()}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-purple-300" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 accent-purple-500"
                  />
                  <span className="text-purple-200 text-xs w-8">{Math.round(volume * 100)}%</span>
                </div>
                <button
                  onClick={() => playSound(currentTrack)}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  )}
                </button>
                <button
                  onClick={stopSound}
                  className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200"
                >
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </button>
              </div>
            </div>
            
            {/* Play Time Display */}
            <div className="flex items-center justify-between text-sm text-purple-200">
              <span>Play Time: {formatTime(playTime)}</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>{isPlaying ? 'Playing' : 'Stopped'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sleep Timer */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Timer className="w-5 h-5 mr-2" />
              Smart Sleep Timer
            </h3>
            <p className="text-purple-200 mb-4">
              Set a timer to automatically stop the sound after a specified period
            </p>
            <div className="flex items-center space-x-4">
              <select 
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
              >
                {timerOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-purple-900">
                    {option.en}
                  </option>
                ))}
              </select>
              <button 
                onClick={startSleepTimer}
                disabled={!isPlaying}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sleepTimer ? 'Restart Timer' : 'Activate Timer'}
              </button>
              {sleepTimer && (
                <button 
                  onClick={() => setSleepTimer(null)}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200"
                >
                  Cancel Timer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sound Categories */}
        <div className="space-y-8">
          {soundCategories.map((category) => (
            <div key={category.id}>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 text-purple-400 mr-2" />
                {category.nameEn}
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full ml-2">
                  AI Enhanced
                </span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.sounds.map((sound) => (
                  <div
                    key={sound.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-purple-500/20"
                    onClick={() => playSound(sound)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold text-sm">
                        {sound.nameEn}
                      </h3>
                      <button className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full group-hover:bg-purple-500/30 transition-all duration-200">
                        {currentTrack?.id === sound.id && isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-purple-300">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Continuous Play</span>
                      </div>
                      {currentTrack?.id === sound.id && (
                        <span className="text-green-400 font-semibold flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1"></div>
                          {isPlaying ? 'Playing' : 'Stopped'}
                        </span>
                      )}
                    </div>
                    {sound.id === 'rain' && (
                      <div className="mt-2 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                        🌧️ 100% Realistic Rain
                      </div>
                    )}
                    {sound.id === 'ocean' && (
                      <div className="mt-2 text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                        🌊 Natural Ocean Waves
                      </div>
                    )}
                    {sound.id === 'forest' && (
                      <div className="mt-2 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                        🌲 Peaceful Forest Ambience
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Instructions */}
        <div className="mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3">
              ✨ Enhanced Sound Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="text-purple-200 space-y-2 text-sm">
                <li>• 🌧️ <strong>Realistic Rain Sound:</strong> Designed with realistic rain droplets</li>
                <li>• 🌊 <strong>Realistic Ocean Waves:</strong> Natural graduated wave sounds</li>
                <li>• 🌲 <strong>Forest Ambience:</strong> Soothing natural sounds</li>
                <li>• ⏰ <strong>Smart Timer:</strong> Auto-stop up to 8 hours</li>
              </ul>
              <ul className="text-purple-200 space-y-2 text-sm">
                <li>• 🔄 <strong>Continuous Play:</strong> Without interruption</li>
                <li>• 🎧 <strong>High Quality:</strong> Optimized for headphones</li>
                <li>• 🌐 <strong>English Interface:</strong> Clean and modern design</li>
                <li>• 🎵 <strong>AI Technology:</strong> Technically enhanced sounds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
