export const DEFAULT_CATEGORIES = [
  { id: 'feeding',     label: 'האכלה',    emoji: '🍼', type: 'feeding',      enabled: true, builtin: true },
  { id: 'diaper',      label: 'חיתול',    emoji: '🚼', type: 'diaper',       enabled: true, builtin: true },
  { id: 'sleep',       label: 'שינה',     emoji: '🌙', type: 'sleep',        enabled: true, builtin: true },
  { id: 'bath',        label: 'מקלחת',   emoji: '🛁', type: 'simple',       enabled: true, builtin: true },
  { id: 'growth',      label: 'גדילה',    emoji: '📏', type: 'growth',       enabled: true, builtin: true },
  { id: 'milestone',   label: 'אבן דרך', emoji: '⭐', type: 'milestone',    enabled: true, builtin: true },
  { id: 'vaccination', label: 'חיסון',   emoji: '💉', type: 'vaccination',  enabled: true, builtin: true },
]

export const DEFAULT_FEEDING_AMOUNTS = [10,15,20,25,30,40,50,60,70,80,90,100,120,140,160,180,200,220,240,260,280]

export const DEFAULT_STATE = {
  babyName: '',
  birthDate: '',
  birthWeight: null,
  profileImage: null,
  colorTheme: 'blue',
  categories: DEFAULT_CATEGORIES,
  logs: [],
  weightLogs: [],
  milestoneLogs: [],
  sleepTimerStart: null,
  bottleTimerStart: null,
  feedingQuickAmounts: DEFAULT_FEEDING_AMOUNTS,
  settings: { notificationsEnabled: false },
}
