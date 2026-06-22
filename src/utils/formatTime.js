export const formatLocalTime = (isoString) => {
  if (!isoString) return '—';
  
  // Example Input: "2026-06-20T12:20:00"
  const parts = isoString.split('T');
  if (parts.length < 2) return isoString;
  
  const datePart = parts[0].split('-').reverse().join('/');
  const timePart = parts[1].substring(0, 5);
  
  return `${datePart} - ${timePart}`;
};