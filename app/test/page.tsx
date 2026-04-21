'use client';
import { useState, useEffect, useCallback } from 'react';
import { TestOrder, VideoEngagement, RatingData } from '@/lib/types';
import VideoPlayer from '@/components/VideoPlayer';
import RatingForm from '@/components/RatingForm';
import FinalQuestion from '@/components/FinalQuestion';
import { supabase } from '@/lib/supabase';

type Step = 'video1' | 'rating1' | 'video2' | 'rating2' | 'final' | 'complete';

const VIDEO_A_URL = process.env.NEXT_PUBLIC_VIDEO_A_URL ?? '/videos/version-a.mp4';
const VIDEO_B_URL = process.env.NEXT_PUBLIC_VIDEO_B_URL ?? '/videos/version-b.mp4';

const STEP_NUMBER: Record<Step, number> = {
  video1: 1,
  rating1: 2,
  video2: 3,
  rating2: 4,
  final: 5,
  complete: 5,
};

const STEP_LABELS = ['Watch Video 1', 'Rate Video 1', 'Watch Video 2', 'Rate Video 2', 'Preference'];

function ProgressBar({ step }: { step: Step }) {
  const current = STEP_NUMBER[step];
  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-8">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center flex-1">
            <div className="flex flex-col items-center w-full">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                  ${done ? 'bg-[#EF0107] text-white' : active ? 'bg-[#EF0107] text-white ring-4 ring-red-200' : 'bg-gray-200 text-gray-400'}`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : n}
              </div>
              <span className={`hidden sm:block text-[10px] mt-1 font-medium text-center leading-tight
                ${active ? 'text-[#EF0107]' : done ? 'text-gray-400' : 'text-gray-300'}`}>
                {label}
              </span>
            </div>
            {n < STEP_LABELS.length && (
              <div className={`h-0.5 flex-1 mx-1 transition-all ${done ? 'bg-[#EF0107]' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function VideoScreen({
  videoNumber,
  src,
  onEngagementChange,
  onContinue,
}: {
  videoNumber: 1 | 2;
  src: string;
  onEngagementChange: (e: VideoEngagement) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-1">Video {videoNumber} of 2</h1>
      <p className="text-gray-500 mb-6">
        {videoNumber === 1
          ? 'Watch the video below. You can replay it as many times as you like.'
          : 'Now watch this second video. Take your time.'}
      </p>
      <VideoPlayer key={`video${videoNumber}`} src={src} onEngagementChange={onEngagementChange} />
      <button
        type="button"
        onClick={onContinue}
        className="mt-6 w-full bg-[#EF0107] text-white py-4 rounded-xl font-black text-lg hover:bg-[#C40106] transition-colors shadow-sm"
      >
        Continue to Questions →
      </button>
    </div>
  );
}

function ThankYouScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">Thank you!</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Your responses have been recorded. Your feedback directly shapes the campaign.
        </p>
        <div className="mt-10 inline-block bg-[#EF0107] rounded-2xl px-6 py-3">
          <span className="text-white font-black text-lg tracking-wide">Arsenal FC</span>
        </div>
      </div>
    </div>
  );
}

export default function TestPage() {
  const [step, setStep] = useState<Step>('video1');
  const [order, setOrder] = useState<TestOrder>('A_first');
  const [engagement1, setEngagement1] = useState<VideoEngagement>({
    didPlay: false,
    replayCount: 0,
    watchedToEnd: false,
  });
  const [engagement2, setEngagement2] = useState<VideoEngagement>({
    didPlay: false,
    replayCount: 0,
    watchedToEnd: false,
  });
  const [rating1, setRating1] = useState<RatingData | null>(null);
  const [rating2, setRating2] = useState<RatingData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOrder(Math.random() < 0.5 ? 'A_first' : 'B_first');
  }, []);

  const video1Src = order === 'A_first' ? VIDEO_A_URL : VIDEO_B_URL;
  const video2Src = order === 'A_first' ? VIDEO_B_URL : VIDEO_A_URL;

  const handleEngagement1Change = useCallback((e: VideoEngagement) => setEngagement1(e), []);
  const handleEngagement2Change = useCallback((e: VideoEngagement) => setEngagement2(e), []);

  const handleRating1Submit = (data: RatingData) => {
    setRating1(data);
    setStep('video2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRating2Submit = (data: RatingData) => {
    setRating2(data);
    setStep('final');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (preference: 'video1' | 'video2', finalComment: string) => {
    if (!rating1 || !rating2) return;
    setSubmitting(true);
    setSubmitError(null);

    // Map position (video1/video2) to actual version (A/B)
    const finalPreference =
      (preference === 'video1') === (order === 'A_first') ? 'A' : 'B';

    // Map engagement and ratings to their actual versions
    const engagementA = order === 'A_first' ? engagement1 : engagement2;
    const engagementB = order === 'A_first' ? engagement2 : engagement1;
    const ratingA = order === 'A_first' ? rating1 : rating2;
    const ratingB = order === 'A_first' ? rating2 : rating1;

    const { error } = await supabase.from('sessions').insert({
      order_shown: order,
      // Version A (vocal crowd)
      emotional_response_a: ratingA.emotionalResponse,
      share_intent_a: ratingA.shareIntent,
      purchase_intent_a: ratingA.purchaseIntent,
      open_comment_a: ratingA.openComment || null,
      did_play_a: engagementA.didPlay,
      replay_count_a: engagementA.replayCount,
      watched_to_end_a: engagementA.watchedToEnd,
      // Version B (instrumental)
      emotional_response_b: ratingB.emotionalResponse,
      share_intent_b: ratingB.shareIntent,
      purchase_intent_b: ratingB.purchaseIntent,
      open_comment_b: ratingB.openComment || null,
      did_play_b: engagementB.didPlay,
      replay_count_b: engagementB.replayCount,
      watched_to_end_b: engagementB.watchedToEnd,
      // Final
      final_preference: finalPreference,
      final_comment: finalComment || null,
      completed: true,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError('Something went wrong saving your responses. Please try again.');
      return;
    }

    setStep('complete');
  };

  if (step === 'complete') return <ThankYouScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#EF0107]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <p className="text-white font-black tracking-wide">Get Parade Ready</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-16">
        <ProgressBar step={step} />

        {step === 'video1' && (
          <VideoScreen
            videoNumber={1}
            src={video1Src}
            onEngagementChange={handleEngagement1Change}
            onContinue={() => {
              setStep('rating1');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {step === 'rating1' && (
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Your thoughts on Video 1</h1>
            <p className="text-gray-500 mb-8">
              Please answer each question about the video you just watched.
            </p>
            <RatingForm onSubmit={handleRating1Submit} submitLabel="Continue to Video 2 →" />
          </div>
        )}

        {step === 'video2' && (
          <VideoScreen
            videoNumber={2}
            src={video2Src}
            onEngagementChange={handleEngagement2Change}
            onContinue={() => {
              setStep('rating2');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {step === 'rating2' && (
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Your thoughts on Video 2</h1>
            <p className="text-gray-500 mb-8">Now tell us about the second video.</p>
            <RatingForm onSubmit={handleRating2Submit} submitLabel="Continue to Final Question →" />
          </div>
        )}

        {step === 'final' && (
          <FinalQuestion
            onSubmit={handleFinalSubmit}
            submitting={submitting}
            error={submitError}
          />
        )}
      </main>
    </div>
  );
}
