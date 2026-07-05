// Single source of truth for medicine tile colors/icons, shared by MedicineModal
// (the picker) and any screen that displays an already-logged medicine entry
// (History, Home recent-actions), so a specific medicine's artwork shows up
// everywhere its log appears, not just in the picker.
export const MEDICINES = [
  { name: 'סימיקול', bg: '#FCE7F3', badgeBg: '#FBCFE8', badgeColor: '#9D174D', icon: '/medicine-icon.png' },
  { name: 'נורופן',   bg: '#FFE4CC', badgeBg: '#FED7AA', badgeColor: '#9A3412', icon: '/medicine-icon.png' },
  { name: 'ויטמין D', bg: '#E8E0FF', badgeBg: '#DDD6FE', badgeColor: '#5B21B6', icon: '/vitaminD-icon.png' },
  { name: 'סטרימר',  bg: '#C8F0E8', badgeBg: '#99F6E4', badgeColor: '#115E59', icon: '/sterimar-icon.png' },
  { name: 'ברזל',    bg: '#FFF3CC', badgeBg: '#FDE68A', badgeColor: '#92400E', icon: '/medicine-icon.png' },
]

const BY_NAME = Object.fromEntries(MEDICINES.map(m => [m.name, m]))

export function getMedicineIcon(medicineName) {
  return BY_NAME[medicineName]?.icon || '/medicine-icon.png'
}
