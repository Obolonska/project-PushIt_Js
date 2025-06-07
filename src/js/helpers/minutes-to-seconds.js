export function msToMinutesSeconds(ms) {
  const totalSeconds = Math.floor(ms / 1000); // переводим в секунды
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
  return `${minutes}:${formattedSeconds}`;
}