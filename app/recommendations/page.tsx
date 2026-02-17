'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FOCUS_AREAS = [
  'AI/ML', 'Computer Vision', 'NLP', 'Robotics', 'Healthcare AI',
  'Enterprise AI', 'Creator Economy', 'Video AI', 'Autonomous Vehicles',
  'Climate/Energy AI', 'Fintech AI', 'Generative AI', 'LLMs',
  'Multimodal AI', 'AI Safety', 'Edge AI/IoT',
];

const GOALS = [
  'Fundraising', 'Partnerships', 'Hiring', 'Learning',
  'Networking', 'Speaking opportunities', 'Product feedback', 'Market research',
];

const REGIONS = ['North America', 'Europe', 'Middle East', 'Asia', 'Global'];

const LOCATIONS = [
  'San Francisco, USA', 'New York, USA', 'London, UK', 'Berlin, Germany',
  'Paris, France', 'Dubai, UAE', 'Singapore', 'Tokyo, Japan',
  'Toronto, Canada', 'Sydney, Australia', 'Amsterdam, Netherlands',
  'Riyadh, Saudi Arabia', 'Mumbai, India', 'São Paulo, Brazil',
  'Tel Aviv, Israel', 'Seoul, South Korea', 'Shanghai, China',
  'Zürich, Switzerland', 'Stockholm, Sweden', 'Other',
];

const DATE_RANGES = [
  { label: 'Next 3 months', value: 3 },
  { label: 'Next 6 months', value: 6 },
  { label: 'Next 12 months', value: 12 },
];

const STEPS = ['About You', 'Focus Areas', 'Goals', 'Preferences', 'Target People'];

interface FormData {
  name: string;
  company: string;
  role: string;
  location: string;
  focusAreas: string[];
  otherInterests: string;
  goals: string[];
  budget: number;
  regions: string[];
  dateRange: number;
  maxTravel: string;
  targetPeopleOrgs: string;
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              i < step ? 'bg-cyan-500 text-white' :
              i === step ? 'bg-cyan-500/30 text-cyan-400 ring-2 ring-cyan-500' :
              'bg-white/5 text-gray-600'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 hidden sm:block ${i <= step ? 'text-cyan-400' : 'text-gray-600'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function StepAboutYou({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Tell us about yourself</h2>
        <p className="text-gray-400">We&apos;ll use this to personalize your conference recommendations.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={data.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
          <input
            type="text"
            value={data.company}
            onChange={e => onChange({ company: e.target.value })}
            placeholder="Your company"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Role / Title</label>
          <input
            type="text"
            value={data.role}
            onChange={e => onChange({ role: e.target.value })}
            placeholder="e.g. CTO, Product Manager, Investor"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Base Location</label>
          <select
            value={data.location}
            onChange={e => onChange({ location: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="" className="bg-gray-900">Select your city</option>
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc} className="bg-gray-900">{loc}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepFocusAreas({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const toggle = (area: string) => {
    const areas = data.focusAreas.includes(area)
      ? data.focusAreas.filter(a => a !== area)
      : [...data.focusAreas, area];
    onChange({ focusAreas: areas });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">What are you focused on?</h2>
        <p className="text-gray-400">Select all areas that matter to you. We&apos;ll match conferences to your interests.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FOCUS_AREAS.map(area => (
          <button
            key={area}
            onClick={() => toggle(area)}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
              data.focusAreas.includes(area)
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            {data.focusAreas.includes(area) && '✓ '}{area}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Other interests</label>
        <input
          type="text"
          value={data.otherInterests}
          onChange={e => onChange({ otherInterests: e.target.value })}
          placeholder="e.g. quantum computing, biotech, space tech (comma separated)"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function StepGoals({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const toggle = (goal: string) => {
    const goals = data.goals.includes(goal)
      ? data.goals.filter(g => g !== goal)
      : [...data.goals, goal];
    onChange({ goals });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">What do you want to achieve?</h2>
        <p className="text-gray-400">Your goals help us prioritize the right types of conferences.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map(goal => {
          const icons: Record<string, string> = {
            'Fundraising': '💰', 'Partnerships': '🤝', 'Hiring': '👥', 'Learning': '📚',
            'Networking': '🌐', 'Speaking opportunities': '🎤', 'Product feedback': '💬', 'Market research': '📊',
          };
          return (
            <button
              key={goal}
              onClick={() => toggle(goal)}
              className={`px-4 py-4 rounded-lg text-sm font-medium transition-all duration-200 border text-left ${
                data.goals.includes(goal)
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <span className="text-lg mr-2">{icons[goal]}</span>
              {goal}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPreferences({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const toggleRegion = (region: string) => {
    const regions = data.regions.includes(region)
      ? data.regions.filter(r => r !== region)
      : [...data.regions, region];
    onChange({ regions });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Your preferences</h2>
        <p className="text-gray-400">Help us filter for conferences that fit your constraints.</p>
      </div>
      
      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Budget per conference: <span className="text-cyan-400 font-bold">${data.budget.toLocaleString()}</span>
        </label>
        <input
          type="range"
          min={0}
          max={5000}
          step={100}
          value={data.budget}
          onChange={e => onChange({ budget: parseInt(e.target.value) })}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>$0 (Free only)</span>
          <span>$5,000+</span>
        </div>
      </div>

      {/* Regions */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Preferred regions</label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(region => (
            <button
              key={region}
              onClick={() => toggleRegion(region)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                data.regions.includes(region)
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Date range */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Time horizon</label>
        <div className="flex gap-3">
          {DATE_RANGES.map(dr => (
            <button
              key={dr.value}
              onClick={() => onChange({ dateRange: dr.value })}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                data.dateRange === dr.value
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Travel willingness */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Travel willingness</label>
        <div className="flex gap-3">
          {['Local only', 'Regional', 'International', 'Anywhere'].map(level => (
            <button
              key={level}
              onClick={() => onChange({ maxTravel: level })}
              className={`flex-1 px-3 py-3 rounded-lg text-sm font-medium transition-all border ${
                data.maxTravel === level
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepTargets({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Who do you want to meet?</h2>
        <p className="text-gray-400">Optional — list specific people or companies you want to connect with.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Target speakers & organizations
        </label>
        <textarea
          value={data.targetPeopleOrgs}
          onChange={e => onChange({ targetPeopleOrgs: e.target.value })}
          rows={6}
          placeholder={`One per line, e.g.:\nJensen Huang\nSam Altman\nNVIDIA\nOpenAI\nSequoia Capital`}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          We&apos;ll match these against 155 confirmed speakers across 300 conferences.
        </p>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FormData>({
    name: '',
    company: '',
    role: '',
    location: '',
    focusAreas: [],
    otherInterests: '',
    goals: [],
    budget: 2000,
    regions: [],
    dateRange: 12,
    maxTravel: 'International',
    targetPeopleOrgs: '',
  });

  const update = (partial: Partial<FormData>) => setData(prev => ({ ...prev, ...partial }));

  const canProceed = () => {
    if (step === 0) return data.name.trim().length > 0;
    if (step === 1) return data.focusAreas.length > 0;
    if (step === 2) return data.goals.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      // Store in localStorage for the results page
      localStorage.setItem(`analysis-${result.code}`, JSON.stringify(result.analysis));
      
      // Navigate to processing page
      router.push(`/recommendations/${result.code}/processing`);
    } catch (err) {
      console.error('Failed to submit:', err);
      setLoading(false);
    }
  };

  const stepComponents = [
    <StepAboutYou key="about" data={data} onChange={update} />,
    <StepFocusAreas key="focus" data={data} onChange={update} />,
    <StepGoals key="goals" data={data} onChange={update} />,
    <StepPreferences key="prefs" data={data} onChange={update} />,
    <StepTargets key="targets" data={data} onChange={update} />,
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 inline-block">
            ← Back to conferences
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Find Your Perfect Conferences
          </h1>
          <p className="text-gray-400">
            Answer a few questions and we&apos;ll analyze 300+ AI conferences to find the best matches for you.
          </p>
        </div>

        {/* Progress */}
        <ProgressBar step={step} total={STEPS.length} />

        {/* Form card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm p-6 sm:p-8">
          {stepComponents[step]}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                step === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              ← Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  canProceed()
                    ? 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/25'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : '🔍 Analyze Conferences'}
              </button>
            )}
          </div>
        </div>

        {/* Demo CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Want to see an example first?{' '}
            <Link href="/recommendations/demo" className="text-cyan-400 hover:text-cyan-300 underline">
              View demo analysis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
