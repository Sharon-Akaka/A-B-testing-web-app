'use client';
import { useState } from 'react';

interface FinalQuestionProps {
  onSubmit: (preference: 'video1' | 'video2', comment: string) => void;
  submitting: boolean;
  error: string | null;
}

export default function FinalQuestion({ onSubmit, submitting, error }: FinalQuestionProps) {
  const [preference, setPreference] = useState<'video1' | 'video2' | null>(null);
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = () => {
    setTouched(true);
    if (!preference) return;
    onSubmit(preference, comment);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">One last question</h1>
      <p className="text-gray-600 mb-8 text-lg">
        Having watched both videos, which did you prefer overall?
      </p>

      <div className="space-y-4 mb-6">
        {(['video1', 'video2'] as const).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setPreference(v)}
            className={`w-full py-5 px-6 rounded-xl border-2 text-left font-bold text-xl transition-all
              ${preference === v
                ? 'bg-[#EF0107] border-[#EF0107] text-white shadow-md scale-[1.01]'
                : 'border-gray-300 text-gray-700 hover:border-[#EF0107] bg-white'
              }`}
          >
            {v === 'video1' ? 'Video 1' : 'Video 2'}
          </button>
        ))}
      </div>

      {touched && preference === null && (
        <p className="text-[#EF0107] text-sm mb-4">Please select a video before submitting</p>
      )}

      <div className="mb-8">
        <p className="text-base font-semibold text-gray-900 mb-2">
          Any other thoughts?{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </p>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Share any other thoughts about the two videos…"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EF0107] focus:border-transparent resize-none"
        />
      </div>

      {error && (
        <p className="text-[#EF0107] text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-[#EF0107] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#C40106] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting…' : 'Submit your responses →'}
      </button>
    </div>
  );
}
