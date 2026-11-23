export const formatReason = (reason: string): string => {
  // Adds emojis based on keywords in the reason
  const lowerReason = reason.toLowerCase();
  
  if (lowerReason.includes('because you liked')) {
    return `✨ ${reason}`;
  }
  
  if (lowerReason.includes('director')) {
    return `🎬 ${reason}`;
  }
  
  if (lowerReason.includes('features')) {
    return `🎭 ${reason}`;
  }
  
  if (lowerReason.includes('watch')) {
    return `📺 ${reason}`;
  }
  
  if (lowerReason.includes('new release')) {
    return `🔥 ${reason}`;
  }
  
  return `👉 ${reason}`;
};
