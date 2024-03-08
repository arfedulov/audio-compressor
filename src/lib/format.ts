export const formatTime = (duration: number) => {
  const hours = Math.floor(duration / (60 * 60));
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration);

  return `${hours}:${minutes}:${seconds}`;
};
