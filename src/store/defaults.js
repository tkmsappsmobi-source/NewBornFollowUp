export const DEFAULT_CATEGORIES = [
  { id: 'feeding',     label: 'האכלה',    emoji: '🍼', type: 'feeding', enabled: true, builtin: true },
  { id: 'pee',         label: 'חיתול',    emoji: '🧷', type: 'simple',  enabled: true, builtin: true },
  { id: 'sleep',       label: 'שינה',     emoji: '🌙', type: 'simple',  enabled: true, builtin: true },
  { id: 'milestone',   label: 'אבן דרך', emoji: '⭐', type: 'simple',  enabled: true, builtin: true },
  { id: 'growth',      label: 'גדילה',    emoji: '👶', type: 'weight',  enabled: true, builtin: true },
  { id: 'bath',        label: 'מקלחת',   emoji: '🚿', type: 'simple',  enabled: true, builtin: true },
  { id: 'poop',        label: 'קקי',      emoji: '💩', type: 'simple',  enabled: true, builtin: true },
  { id: 'vaccination', label: 'חיסון',   emoji: '💉', type: 'simple',  enabled: true, builtin: true },
]

export const DEFAULT_FEEDING_AMOUNTS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 120, 150, 180, 200]

export const DEFAULT_STATE = {
  babyName: '',
  categories: DEFAULT_CATEGORIES,
  logs: [],
  reminders: [],
  weightLogs: [],
  feedingQuickAmounts: DEFAULT_FEEDING_AMOUNTS,
  settings: { notificationsEnabled: false },
}
