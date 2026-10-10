export const CATEGORIES = ['Electrical', 'Water Leak', 'Classroom Equipment', 'Cleanliness', 'Other'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const STATUSES = ['Pending', 'In Progress', 'Resolved'];
export const LOCATION_HINTS = ['Main Library', 'Science Block', 'Engineering Block', 'Hostel', 'Cafeteria', 'Sports Complex', 'Admin Building', 'Parking Area'];

export const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

export function timeAgo(iso) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return 'just now';
}
