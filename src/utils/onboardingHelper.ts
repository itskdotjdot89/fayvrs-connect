const ONBOARDING_KEY = 'fayvrs_onboarding_completed';

/**
 * Check if the user has completed onboarding
 * @returns true if onboarding has been completed, false otherwise
 */
export function hasSeenOnboarding(): boolean {
  try {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Track which slides were viewed during onboarding
 * @param slideIndex - The index of the slide being viewed
 */
export function trackOnboardingProgress(slideIndex: number): void {
  try {
    const progress = localStorage.getItem('fayvrs_onboarding_progress') || '[]';
    const slides = JSON.parse(progress);
    if (!slides.includes(slideIndex)) {
      slides.push(slideIndex);
      localStorage.setItem('fayvrs_onboarding_progress', JSON.stringify(slides));
    }
  } catch (error) {
    console.error('Error tracking onboarding progress:', error);
  }
}

/**
 * Mark onboarding as completed
 * @param method - How the user completed onboarding ('signup', 'guest', or 'skip')
 */
export function markOnboardingComplete(method: 'signup' | 'guest' | 'skip' = 'signup'): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    localStorage.setItem('fayvrs_onboarding_method', method);
    localStorage.setItem('fayvrs_onboarding_completed_at', new Date().toISOString());
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
  }
}

/**
 * Reset onboarding status (useful for testing)
 */
export function resetOnboarding(): void {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
}
