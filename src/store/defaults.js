export const DEFAULT_CATEGORIES = [
  { id: 'feeding', label: 'האכלה', emoji: '🍼', type: 'feeding', enabled: true, builtin: true },
  { id: 'pee', label: 'פיפי', emoji: '💧', type: 'simple', enabled: true, builtin: true },
  { id: 'poop', label: 'קקי', emoji: '💩', type: 'simple', enabled: true, builtin: true },
  { id: 'bath', label: 'מקלחת', emoji: '🛁', type: 'simple', enabled: true, builtin: true },
  { id: 'vitd', label: 'ויטמין D', emoji: '☀️', type: 'simple', enabled: true, builtin: true },
  { id: 'clothes', label: 'החלפת בגדים', emoji: '👕', type: 'simple', enabled: true, builtin: true },
]

export const DEFAULT_FEEDING_AMOUNTS = [10, 20, 40, 60, 80, 100, 120, 150, 180, 200]

export const DEFAULT_STATE = {
  babyName: '',
  categories: DEFAULT_CATEGORIES,
  logs: [],
  reminders: [],
  weightLogs: [],
  feedingQuickAmounts: DEFAULT_FEEDING_AMOUNTS,
  settings: { notificationsEnabled: false },
}
