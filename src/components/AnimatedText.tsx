import { useState, useEffect } from 'react';

interface AnimatedTextProps {
  words: string[];
  className?: string;
  interval?: number;
}

export const AnimatedText = ({ words, className = "", interval = 3000 }: AnimatedTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={className}>
      {words[currentWordIndex]}
    </span>
  );
};