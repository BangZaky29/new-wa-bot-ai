import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  scrollAmount?: number;
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({ 
  children, 
  className = "", 
  scrollAmount = 200 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 5);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`relative group/scroll ${className}`}>
      {/* Scroll Area */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="overflow-x-auto no-scrollbar scroll-smooth"
      >
        {children}
      </div>

      {/* Buttons */}
      <AnimatePresence>
        {showLeft && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition-colors md:flex hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRight && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition-colors md:flex hidden"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Fade Gradients (Desktop only visual aid) */}
      <div className={`absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0f172a] to-transparent pointer-events-none transition-opacity duration-300 ${showLeft ? 'opacity-100' : 'opacity-0'} md:block hidden`} />
      <div className={`absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0f172a] to-transparent pointer-events-none transition-opacity duration-300 ${showRight ? 'opacity-100' : 'opacity-0'} md:block hidden`} />
    </div>
  );
};
