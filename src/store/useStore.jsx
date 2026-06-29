import { createContext, useContext, useReducer, useEffect } from 'react'
import { DEFAULT_STATE } from './defaults'

// @ts-ignore
const isElectron = typeof window !== 'undefined' && !!window.electronAPI

function load() {
  if (!isElectron) {
    try {
      const saved = localStorage.getItem('nbf_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Merge missing new fields from DEFAULT_STATE
        return {
          ...DEFAULT_STATE,
          ...parsed,
          milestoneLogs: parsed.milestoneLogs ?? [],
          sleepTimerStart: parsed.sleepTimerStart ?? null,
          bottleTimerStart: parsed.bottleTimerStart ?? null,
          birthDate: parsed.birthDate ?? '',
          birthWeight: parsed.birthWeight ?? null,
          profileImage: parsed.profileImage ?? null,
          colorTheme: parsed.colorTheme ?? 'blue',
        }
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e)
    }
  }
  return DEFAULT_STATE
}

async function save(state) {
  try {
    if (isElectron) {
      await window.electronAPI.writeState(state)
    } else {
      localStorage.setItem('nbf_state', JSON.stringify(state))
    }
  } catch (error) {
    console.error('Error saving state:', error)
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_BABY_NAME':
      return { ...state, babyName: action.name }

    case 'SET_BIRTH_DATE':
      return { ...state, birthDate: action.birthDate }

    case 'SET_BIRTH_WEIGHT':
      return { ...state, birthWeight: action.weight }

    case 'SET_PROFILE_IMAGE':
      return { ...state, profileImage: action.image }

    case 'SET_COLOR_THEME':
      return { ...state, colorTheme: action.theme }

    case 'SET_SLEEP_TIMER':
      return { ...state, sleepTimerStart: action.start }

    case 'SET_BOTTLE_TIMER':
      return { ...state, bottleTimerStart: action.start }

    case 'ADD_LOG': {
      const log = {
        id: crypto.randomUUID(),
        categoryId: action.categoryId,
        timestamp: action.timestamp || new Date().toISOString(),
        amount: action.amount ?? null,
        note: action.note ?? '',
        data: action.data ?? {},
      }
      return { ...state, logs: [log, ...state.logs] }
    }

    case 'EDIT_LOG':
      return { ...state, logs: state.logs.map(l => l.id === action.id ? { ...l, ...action.patch } : l) }

    case 'DELETE_LOG':
      return { ...state, logs: state.logs.filter(l => l.id !== action.id) }

    case 'ADD_MILESTONE': {
      const m = {
        id: crypto.randomUUID(),
        description: action.description,
        category: action.category,
        timestamp: new Date().toISOString(),
      }
      return { ...state, milestoneLogs: [m, ...(state.milestoneLogs || [])] }
    }

    case 'DELETE_MILESTONE':
      return { ...state, milestoneLogs: (state.milestoneLogs || []).filter(m => m.id !== action.id) }

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
      return { ...state, reminders: [reminder, ...(state.reminders || [])] }
    }

    case 'TOGGLE_REMINDER':
      return {
        ...state,
        reminders: (state.reminders || []).map(r =>
          r.id === action.id ? { ...r, enabled: !r.enabled } : r
        ),
      }

    case 'DELETE_REMINDER':
      return { ...state, reminders: (state.reminders || []).filter(r => r.id !== action.id) }

    case 'FIRE_REMINDER':
      return {
        ...state,
        reminders: (state.reminders || []).map(r =>
          r.id === action.id ? { ...r, lastFired: new Date().toISOString() } : r
        ),
      }

    case 'SET_NOTIFICATIONS_ENABLED':
      return { ...state, settings: { ...state.settings, notificationsEnabled: action.enabled } }

    case 'ADD_WEIGHT': {
      const weight = {
        id: crypto.randomUUID(),
        weight: action.weight,
        height: action.height ?? null,
        headCircumference: action.headCircumference ?? null,
        unit: 'kg',
        note: action.note ?? '',
        timestamp: action.timestamp || new Date().toISOString(),
      }
      return { ...state, weightLogs: [weight, ...state.weightLogs] }
    }

    case 'UPDATE_WEIGHT':
      return { ...state, weightLogs: state.weightLogs.map(w => w.id === action.id ? { ...w, ...action.patch } : w) }

    case 'DELETE_WEIGHT':
      return { ...state, weightLogs: state.weightLogs.filter(w => w.id !== action.id) }

    case 'CLEAR_ALL':
      return { ...DEFAULT_STATE }

    case 'LOAD_STATE':
      return action.payload

    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)

  // Load from Electron file on mount
  useEffect(() => {
    async function loadState() {
      try {
        // @ts-ignore
        const saved = await window.electronAPI?.readState?.()
        if (saved) {
          const merged = {
            ...DEFAULT_STATE,
            ...saved,
            milestoneLogs: saved.milestoneLogs ?? [],
            sleepTimerStart: saved.sleepTimerStart ?? null,
            bottleTimerStart: saved.bottleTimerStart ?? null,
            birthDate: saved.birthDate ?? '',
            birthWeight: saved.birthWeight ?? null,
            profileImage: saved.profileImage ?? null,
            colorTheme: saved.colorTheme ?? 'blue',
          }
          const existingIds = new Set((merged.categories || []).map(c => c.id))
          const missing = DEFAULT_STATE.categories.filter(c => !existingIds.has(c.id))
          if (missing.length > 0) merged.categories = [...(merged.categories || []), ...missing]
          dispatch({ type: 'LOAD_STATE', payload: merged })
        }
      } catch (error) {
        console.error('Error loading state:', error)
      }
    }

    loadState()
  }, [])

  useEffect(() => {
    save(state)
  }, [state])

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
