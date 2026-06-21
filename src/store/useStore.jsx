import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { DEFAULT_STATE } from './defaults'

const STORAGE_KEY = 'nbf_state'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const saved = JSON.parse(raw)
    // merge defaults for new keys
    return { ...DEFAULT_STATE, ...saved }
  } catch {
    return DEFAULT_STATE
  }
}

function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_BABY_NAME':
      return { ...state, babyName: action.name }

    case 'ADD_LOG': {
      const log = {
        id: crypto.randomUUID(),
        categoryId: action.categoryId,
        timestamp: action.timestamp || new Date().toISOString(),
        amount: action.amount ?? null,
        note: action.note ?? '',
      }
      return { ...state, logs: [log, ...state.logs] }
    }

    case 'DELETE_LOG':
      return { ...state, logs: state.logs.filter(l => l.id !== action.id) }

    case 'TOGGLE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.id ? { ...c, enabled: !c.enabled } : c
        ),
      }

    case 'ADD_CATEGORY': {
      const cat = {
        id: crypto.randomUUID(),
        label: action.label,
        emoji: action.emoji,
        type: 'simple',
        enabled: true,
        builtin: false,
      }
      return { ...state, categories: [...state.categories, cat] }
    }

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.id),
      }

    case 'ADD_REMINDER': {
      const reminder = {
        id: crypto.randomUUID(),
        label: action.label,
        type: action.reminderType,
        intervalMinutes: action.intervalMinutes ?? null,
        datetime: action.datetime ?? null,
        enabled: true,
        lastFired: null,
      }
      return { ...state, reminders: [reminder, ...state.reminders] }
    }

    case 'TOGGLE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r =>
          r.id === action.id ? { ...r, enabled: !r.enabled } : r
        ),
      }

    case 'DELETE_REMINDER':
      return { ...state, reminders: state.reminders.filter(r => r.id !== action.id) }

    case 'FIRE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r =>
          r.id === action.id ? { ...r, lastFired: new Date().toISOString() } : r
        ),
      }

    case 'SET_NOTIFICATIONS_ENABLED':
      return { ...state, settings: { ...state.settings, notificationsEnabled: action.enabled } }

    case 'ADD_WEIGHT': {
      const weight = {
        id: crypto.randomUUID(),
        weight: action.weight,
        unit: 'kg',
        note: action.note ?? '',
        timestamp: action.timestamp || new Date().toISOString(),
      }
      return { ...state, weightLogs: [weight, ...state.weightLogs] }
    }

    case 'DELETE_WEIGHT':
      return { ...state, weightLogs: state.weightLogs.filter(w => w.id !== action.id) }

    case 'CLEAR_ALL':
      return { ...DEFAULT_STATE }

    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)

  useEffect(() => { save(state) }, [state])

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
