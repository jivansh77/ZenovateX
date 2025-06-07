import { useState, useEffect } from 'react';

const useTypewriter = (words, typingSpeed = 150, deletingSpeed = 100, pauseTime = 2000) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    
    const timer = setTimeout(() => {
      setText(prev => {
        if (!isDeleting) {
          // Typing
          if (prev === currentWord) {
            setTimeout(() => setIsDeleting(true), pauseTime);
            return prev;
          }
          return currentWord.substring(0, prev.length + 1);
        } else {
          // Deleting
          if (prev === '') {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
            return prev;
          }
          return currentWord.substring(0, prev.length - 1);
        }
      });
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
};

export default useTypewriter; 