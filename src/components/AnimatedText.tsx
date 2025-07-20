import { useState, useEffect } from 'react';

interface AnimatedTextProps {
  words: string[];
  className?: string;
  interval?: number;
}

export const AnimatedText = ({ words, className = "", interval = 3000 }: AnimatedTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 150); // Half of the flip animation duration
      
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={`flip-board ${className}`}>
      <span 
        className={`flip-board-text ${isAnimating ? 'animate-pulse' : ''}`}
        style={{
          animationDelay: isAnimating ? '0s' : `${Math.random() * 0.5}s`
        }}
      >
        {words[currentWordIndex]}
      </span>
    </span>
  );
};