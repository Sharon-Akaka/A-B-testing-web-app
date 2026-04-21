'use client';
import { useState } from 'react';
import { RatingData, ShareIntent } from '@/lib/types';

interface RatingFormProps {
  onSubmit: (data: RatingData) => void;
  submitLabel: string;
}

function ScaleButton({
  n,
  selected,
  onClick,
}: {
  n: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-12 h-12 rounded-full text-base font-semibold border-2 transition-all
        ${selected
          ? 'bg-[#EF0107] border-[#EF0107] text-white scale-110 shadow-md'
          : 'border-gray-300 text-gray-600 hover:border-[#EF0107] hover:text-[#EF0107]'
        }`}
    >
      {n}
    </button>
  );
}

export default function RatingForm({ onSubmit, submitLabel }: RatingFormProps) {
  const [emotionalResponse, setEmotionalResponse] = useState<number | null>(null);
  const [shareIntent, setShareIntent] = useState<ShareIntent | null>(null);
  const [purchaseIntent, setPurchaseIntent] = useState<number | null>(null);
  const [openComment, setOpenComment] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = () => {
    setTouched(true);
    if (emotionalResponse === null || shareIntent === null || purchaseIntent === null) return;
    onSubmit({ emotionalResponse, shareIntent, purchaseIntent, openComment });
  };

  const fieldError = (value: unknown) =>
    touched && value === null ? (
      <p className="text-[#EF0107] text-sm mt-2">Please make a selection</p>
    ) : null;

  return (
    <div className="space-y-8">
      {/* Emotional response */}
      <div>
        <p className="text-base font-semibold text-gray-900 mb-1">
          How emotionally moved did you feel watching this video?
        </p>
        <p className="text-sm text-gray-500 mb-4">1 = not moved at all &nbsp;·&nbsp; 5 = very moved</p>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map(n => (
            <ScaleButton
              key={n}
              n={n}
              selected={emotionalResponse === n}
              onClick={() => setEmotionalResponse(n)}
            />
          ))}
        </div>
        {fieldError(emotionalResponse)}
      </div>

      {/* Share / recreate intent */}
      <div>
        <p className="text-base font-semibold text-gray-900 mb-1">
          How likely would you be to share or recreate this video?
        </p>
        <div className="flex gap-3 mt-4">
          {(['Yes', 'Maybe', 'No'] as ShareIntent[]).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setShareIntent(option)}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all
                ${shareIntent === option
                  ? 'bg-[#EF0107] border-[#EF0107] text-white shadow-md'
                  : 'border-gray-300 text-gray-700 hover:border-[#EF0107] hover:text-[#EF0107]'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
        {fieldError(shareIntent)}
      </div>

      {/* Purchase intent */}
      <div>
        <p className="text-base font-semibold text-gray-900 mb-1">
          After watching this video, how likely would you be to purchase an Arsenal scarf?
        </p>
        <p className="text-sm text-gray-500 mb-4">1 = very unlikely &nbsp;·&nbsp; 5 = very likely</p>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map(n => (
            <ScaleButton
              key={n}
              n={n}
              selected={purchaseIntent === n}
              onClick={() => setPurchaseIntent(n)}
            />
          ))}
        </div>
        {fieldError(purchaseIntent)}
      </div>

      {/* Open comment */}
      <div>
        <p className="text-base font-semibold text-gray-900 mb-1">
          In one sentence, describe what this video made you feel{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </p>
        <textarea
          value={openComment}
          onChange={e => setOpenComment(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="e.g. It made me feel proud and excited…"
          className="w-full mt-3 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EF0107] focus:border-transparent resize-none"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-[#EF0107] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#C40106] transition-colors shadow-sm"
      >
        {submitLabel}
      </button>
    </div>
  );
}
