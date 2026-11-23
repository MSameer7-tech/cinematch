export const getMatchColor = (score: number): string => {
  // Score is between 0.0 and 1.0. We want percentages.
  const percentage = Math.round(score * 100);
  
  if (percentage >= 90) return 'text-green-500';
  if (percentage >= 80) return 'text-blue-500';
  if (percentage >= 70) return 'text-purple-500';
  if (percentage >= 50) return 'text-yellow-500';
  return 'text-gray-400';
};
