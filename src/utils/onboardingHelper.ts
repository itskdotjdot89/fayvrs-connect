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
 * Mark onboarding as completed
 */
export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
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
