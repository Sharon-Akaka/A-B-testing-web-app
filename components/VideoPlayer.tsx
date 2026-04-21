'use client';
import { useEffect, useRef } from 'react';
import { VideoEngagement } from '@/lib/types';

interface VideoPlayerProps {
  src: string;
  onEngagementChange: (engagement: VideoEngagement) => void;
}

export default function VideoPlayer({ src, onEngagementChange }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hasPlayedOnce = false;
    let hasEndedOnce = false;
    let replayCount = 0;

    const emit = (partial: Partial<VideoEngagement>) => {
      onEngagementChange({
        didPlay: hasPlayedOnce,
        replayCount,
        watchedToEnd: hasEndedOnce,
        ...partial,
      });
    };

    const handlePlay = () => {
      if (!hasPlayedOnce) {
        hasPlayedOnce = true;
        emit({ didPlay: true });
      } else if (hasEndedOnce) {
        // Only count as replay if played again after ending
        hasEndedOnce = false;
        replayCount++;
        emit({ watchedToEnd: false });
      }
    };

    const handleEnded = () => {
      hasEndedOnce = true;
      emit({ watchedToEnd: true });
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onEngagementChange]);

  return (
    <div className="w-full rounded-xl overflow-hidden bg-black shadow-lg">
      <video
        ref={videoRef}
        src={src}
        controls
        playsInline
        className="w-full aspect-video"
        onError={() => {
          // handled gracefully by browser native error UI
        }}
      />
      <p className="text-xs text-gray-400 text-center py-2 bg-gray-900">
        You can replay the video as many times as you like before continuing.
      </p>
    </div>
  );
}
