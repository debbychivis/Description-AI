
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AnimationStyle, AppView } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { settings, currentView, setCurrentView } = useApp();
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  // Logic to determine transform/opacity based on animation style
  const getContainerStyle = () => {
    if (!settings.slideEnabled) return {};

    const viewOrder = [AppView.HOME, AppView.STUDIO, AppView.USER];
    const index = viewOrder.indexOf(currentView);
    
    let transform = `translateX(-${index * 100}vw)`;
    let transition = 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';

    if (settings.animationStyle === AnimationStyle.FREE_FALL) {
        transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Bouncy fall effect
    } else if (settings.animationStyle === AnimationStyle.ELASTIC_SLIDE) {
        // Original Idea: Elastic Snap (overshoots and snaps back)
        transition = 'transform 0.8s cubic-bezier(0.68, -0.6, 0.32, 1.6)'; 
    }

    return { transform, transition };
  };

  // Swipe Handling
  const onTouchStart = (e: React.TouchEvent) => {
    if (!settings.slideEnabled) return;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!settings.slideEnabled) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!settings.slideEnabled || !touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    const viewOrder = [AppView.HOME, AppView.STUDIO, AppView.USER];
    const currentIndex = viewOrder.indexOf(currentView);

    if (isLeftSwipe && currentIndex < viewOrder.length - 1) {
      // Move Next
      setCurrentView(viewOrder[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      // Move Prev
      setCurrentView(viewOrder[currentIndex - 1]);
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // If slide is disabled, we just render the current view with a fade
  if (!settings.slideEnabled) {
     return (
         <div className="w-full h-full relative overflow-hidden">
             {React.Children.map(children, (child) => {
                 if (React.isValidElement(child) && child.props['data-view'] === currentView) {
                    return (
                        <div className="animate-fadeIn w-full h-full absolute inset-0">
                            {child}
                        </div>
                    )
                 }
                 return null;
             })}
         </div>
     )
  }

  return (
    <div 
      className="w-full h-full overflow-hidden relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div 
        className="flex w-[300vw] h-full will-change-transform"
        style={getContainerStyle()}
      >
        {children}
      </div>
    </div>
  );
};
