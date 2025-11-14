'use client';

import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  isPlaying: boolean;
  onFinished: () => void;
  type: 'completion' | 'interval';
}

const soundConfig = {
  completion: {
    notes: [
      { freq: 523.25, duration: 0.15, type: 'sine' }, // C5
      { freq: 659.25, duration: 0.15, type: 'sine' }, // E5
      { freq: 783.99, duration: 0.25, type: 'sine' }, // G5
    ],
    volume: 0.3,
  },
  interval: {
    notes: [{ freq: 440, duration: 0.2, type: 'triangle' }], // A4
    volume: 0.2,
  },
};

export function AudioPlayer({ isPlaying, onFinished, type }: AudioPlayerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on the client after a user interaction (handled by isPlaying)
    if (isPlaying && !audioContextRef.current) {
        if (typeof window !== 'undefined' && window.AudioContext) {
            audioContextRef.current = new window.AudioContext();
        }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && audioContextRef.current) {
      const audioContext = audioContextRef.current;
      
      // Resume context if it's suspended (required by modern browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const config = soundConfig[type];
      let currentTime = audioContext.currentTime;

      config.notes.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = note.type as OscillatorType;
        oscillator.frequency.setValueAtTime(note.freq, currentTime);
        
        gainNode.gain.setValueAtTime(config.volume, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + note.duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);

        currentTime += note.duration - 0.05; // Slightly overlap notes
      });

      // Notify parent component that sound has finished playing
      const totalDuration = config.notes.reduce((sum, note) => sum + note.duration, 0);
      const timeoutId = setTimeout(() => {
        onFinished();
      }, totalDuration * 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isPlaying, type, onFinished]);

  return null; // This component does not render anything
}
