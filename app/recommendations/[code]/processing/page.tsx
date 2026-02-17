'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const STEPS = [
  { text: 'Analyzing 300 conferences...', icon: '📊' },
  { text: 'Matching your focus areas...', icon: '🎯' },
  { text: 'Scoring geographic accessibility...', icon: '🌍' },
  { text: 'Evaluating networking potential...', icon: '🤝' },
  { text: 'Calculating value scores...', icon: '💎' },
  { text: 'Ranking and filtering results...', icon: '📈' },
];

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const [activeStep, setActiveStep] = useState(-1);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  useEffect(() => {
    // Load analysis to get focus areas for display
    try {
      const stored = localStorage.getItem(`analysis-${code}`);
      if (stored) {
        const analysis = JSON.parse(stored);
        setFocusAreas(analysis.profile?.focus_areas || []);
      }
    } catch {}

    // Animate steps
    let current = 0;
    const interval = setInterval(() => {
      setActiveStep(current);
      current++;
      if (current >= STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          router.push(`/recommendations/${code}`);
        }, 800);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [code, router]);

  const progress = Math.min(((activeStep + 1) / STEPS.length) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <div className="max-w-lg w-full px-6">
        {/* Code display */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <span className="text-cyan-400 font-mono font-bold text-lg tracking-wider">{code}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Analyzing Your Profile</h1>
          <p className="text-gray-400">Finding the best conferences for you...</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">{Math.round(progress)}%</div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 ${
                i <= activeStep
                  ? 'bg-cyan-500/10 border border-cyan-500/20'
                  : 'bg-white/[0.02] border border-transparent'
              } ${i > activeStep ? 'opacity-30' : 'opacity-100'}`}
            >
              <span className={`text-lg transition-all duration-300 ${
                i <= activeStep ? 'scale-100' : 'scale-75'
              }`}>
                {i < activeStep ? '✅' : i === activeStep ? step.icon : '⏳'}
              </span>
              <span className={`text-sm font-medium ${
                i <= activeStep ? 'text-white' : 'text-gray-600'
              }`}>
                {step.text}
              </span>
              {i === 1 && i <= activeStep && focusAreas.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-auto">
                  {focusAreas.slice(0, 3).map(area => (
                    <span key={area} className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                      {area}
                    </span>
                  ))}
                  {focusAreas.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                      +{focusAreas.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pulsing dot */}
        {activeStep < STEPS.length - 1 && (
          <div className="flex justify-center mt-8">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
