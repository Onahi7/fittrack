import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface OnboardingTutorialProps {
  run: boolean;
  onComplete: () => void;
}

const OnboardingTutorial = ({ run, onComplete }: OnboardingTutorialProps) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="p-2">
          <h3 className="text-xl font-bold mb-2">Welcome to Intentional! 🎉</h3>
          <p className="text-muted-foreground">
            Let's take a quick tour to help you get started on your wellness journey.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="daily-checkin"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-bold mb-2">Daily Check-In 📝</h3>
          <p className="text-muted-foreground">
            Start your day here! Log your mood, energy, and notes to track your progress.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="meals"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-bold mb-2">Track Your Meals 🍱</h3>
          <p className="text-muted-foreground">
            Take photos of your meals and let AI estimate calories. Stay accountable!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="water"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-bold mb-2">Hydration Tracking 💧</h3>
          <p className="text-muted-foreground">
            Track your water intake to stay hydrated throughout the day.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="progress"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-bold mb-2">Monitor Progress 📊</h3>
          <p className="text-muted-foreground">
            View charts, stats, and visualizations of your wellness journey.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="community"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-bold mb-2">Join the Community 👥</h3>
          <p className="text-muted-foreground">
            Connect with others, share progress, and join challenges for motivation!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: 'body',
      content: (
        <div className="p-2">
          <h3 className="text-xl font-bold mb-2">You're All Set! 🚀</h3>
          <p className="text-muted-foreground mb-4">
            Remember: Consistency is key. Check in daily, track your meals, and celebrate every milestone!
          </p>
          <p className="text-sm text-primary font-semibold">
            Let's start your journey to better health! 💪
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onComplete();
    }

    setStepIndex(index);
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#667eea',
          textColor: '#333',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          arrowColor: '#fff',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '24px',
          padding: '20px',
        },
        buttonNext: {
          backgroundColor: '#667eea',
          borderRadius: '12px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
        },
        buttonBack: {
          color: '#667eea',
          marginRight: '10px',
        },
        buttonSkip: {
          color: '#6b7280',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};

export default OnboardingTutorial;
