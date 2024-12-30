import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TourStep from './TourStep';

const TOUR_STEPS = [
  {
    title: 'Welcome to Admin Dashboard',
    content: 'This tour will guide you through the key features of the admin interface.',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    path: '/admin',
  },
  {
    title: 'Overview',
    content: 'The overview dashboard shows key metrics and system status at a glance.',
    position: { top: '120px', left: '300px' },
    path: '/admin',
  },
  {
    title: 'Application Management',
    content: 'Review and process trademark applications. Update statuses and add processing notes.',
    position: { top: '120px', left: '300px' },
    path: '/admin/applications',
  },
  {
    title: 'User Management',
    content: 'Manage user accounts, roles, and permissions. Add new users or modify existing ones.',
    position: { top: '120px', left: '300px' },
    path: '/admin/users',
  },
  {
    title: 'Agent Management',
    content: 'Oversee IP agents and their client portfolios. Monitor agent activities and performance.',
    position: { top: '120px', left: '300px' },
    path: '/admin/agents',
  },
  {
    title: 'Settings',
    content: 'Configure system settings, including demo mode and other administrative options.',
    position: { top: '120px', left: '300px' },
    path: '/admin/settings',
  },
];

export default function AdminTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is the first time viewing the admin panel
    const hasSeenTour = localStorage.getItem('adminTourComplete');
    if (!hasSeenTour) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible && TOUR_STEPS[currentStep]) {
      navigate(TOUR_STEPS[currentStep].path);
    }
  }, [currentStep, isVisible, navigate]);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('adminTourComplete', 'true');
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  if (!step) return null;

  return (
    <TourStep
      title={step.title}
      content={step.content}
      onNext={handleNext}
      onPrev={handlePrev}
      onClose={handleClose}
      isFirst={currentStep === 0}
      isLast={currentStep === TOUR_STEPS.length - 1}
      position={step.position}
    />
  );
}