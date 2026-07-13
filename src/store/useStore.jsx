import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, writeBatch, getDocs, getDocFromServer, query, orderBy
} from 'firebase/firestore'
import { DEFAULT_STATE, DEFAULT_CATEGORIES } from './defaults'

const StoreContext = createContext(null)

const SETTINGS_REF = () => doc(db, 'app', 'settings')

export function StoreProvider({ children }) {
  const [state, setState] = useState({ ...DEFAULT_STATE, loading: true })
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    // Seed defaults only once we have a server-confirmed answer that the doc
    // is really missing. onSnapshot's first callback can fire from an empty
    // local cache (no persistence is enabled) before the server responds —
    // treating that as "first run" would overwrite real data with blanks
    // the moment connectivity returns. If the server check fails (offline),
    // skip seeding and let the realtime listener pick up data once online.
    getDocFromServer(SETTINGS_REF())
      .then((snap) => {
        if (!snap.exists()) {
          return setDoc(SETTINGS_REF(), {
            babyName: '',
            birthDate: '',
            birthWeight: null,
            profileImage: null,
            colorTheme: 'blue',
            sleepTimerStart: null,
            bottleTimerStart: null,
            feedingQuickAmounts: DEFAULT_STATE.feedingQuickAmounts,
            categories: DEFAULT_CATEGORIES,
            reminders: [],
            settings: { notificationsEnabled: false },
          })
        }
      })
      .catch(() => {})

    // Settings (babyName, birthDate, birthWeight, profileImage, timers, categories, reminders, etc.)
    const unsubSettings = onSnapshot(SETTINGS_REF(), (snap) => {
      if (snap.exists()) {
        const d = snap.data()
        setState(prev => ({
          ...prev,
          babyName: d.babyName ?? prev.babyName,
          birthDate: d.birthDate ?? prev.birthDate,
          birthWeight: d.birthWeight ?? prev.birthWeight,
          profileImage: d.profileImage ?? prev.profileImage,
          colorTheme: d.colorTheme ?? prev.colorTheme,
          sleepTimerStart: d.sleepTimerStart ?? null,
          bottleTimerStart: d.bottleTimerStart ?? null,
          feedingQuickAmounts: d.feedingQuickAmounts ?? prev.feedingQuickAmounts,
          categories: d.categories ?? prev.categories,
          reminders: d.reminders ?? prev.reminders ?? [],
          settings: d.settings ?? prev.settings,
        }))
      }
    })

    // logs
    const unsubLogs = onSnapshot(
      query(collection(db, 'logs'), orderBy('timestamp', 'desc')),
      (snap) => {
        const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setState(prev => ({ ...prev, logs, loading: false }))
      },
      () => setState(prev => ({ ...prev, loading: false }))
    )

    // weightLogs
    const unsubWeight = onSnapshot(
      query(collection(db, 'weightLogs'), orderBy('timestamp', 'desc')),
      (snap) => {
        const weightLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setState(prev => ({ ...prev, weightLogs }))
      }
    )

    return () => {
      unsubSettings()
      unsubLogs()
      unsubWeight()
    }
  }, [])

  const patchSettings = (patch) =>
    setDoc(SETTINGS_REF(), patch, { merge: true })

  const dispatch = async (action) => {
    switch (action.type) {

      case 'SET_BABY_NAME':
        await patchSettings({ babyName: action.name })
        break

      case 'SET_BIRTH_DATE':
        await patchSettings({ birthDate: action.birthDate })
        break

      case 'SET_BIRTH_WEIGHT':
        await patchSettings({ birthWeight: action.weight })
        break

      case 'SET_PROFILE_IMAGE':
        await patchSettings({ profileImage: action.image })
        break

      case 'SET_COLOR_THEME':
        await patchSettings({ colorTheme: action.theme })
        break

      case 'SET_SLEEP_TIMER':
        await patchSettings({ sleepTimerStart: action.start ?? null })
        break

      case 'SET_BOTTLE_TIMER':
        await patchSettings({ bottleTimerStart: action.start ?? null })
        break

      case 'SET_NOTIFICATIONS_ENABLED':
        await patchSettings({ settings: { notificationsEnabled: action.enabled } })
        break

      case 'ADD_LOG':
        await addDoc(collection(db, 'logs'), {
          categoryId: action.categoryId,
          timestamp: action.timestamp || new Date().toISOString(),
          amount: action.amount ?? null,
          note: action.note ?? '',
          data: action.data ?? {},
        })
        break

      case 'EDIT_LOG':
        await updateDoc(doc(db, 'logs', action.id), action.patch)
        break

      case 'DELETE_LOG':
        await deleteDoc(doc(db, 'logs', action.id))
        break

      case 'ADD_WEIGHT':
        await addDoc(collection(db, 'weightLogs'), {
          weight: action.weight,
          height: action.height ?? null,
          headCircumference: action.headCircumference ?? null,
          unit: 'kg',
          note: action.note ?? '',
          timestamp: action.timestamp || new Date().toISOString(),
        })
        break

      case 'UPDATE_WEIGHT':
        await updateDoc(doc(db, 'weightLogs', action.id), action.patch)
        break

      case 'DELETE_WEIGHT':
        await deleteDoc(doc(db, 'weightLogs', action.id))
        break

      case 'TOGGLE_CATEGORY': {
        const cats = stateRef.current.categories.map(c =>
          c.id === action.id ? { ...c, enabled: !c.enabled } : c
        )
        await patchSettings({ categories: cats })
        break
      }

      case 'ADD_CATEGORY': {
        const newCat = {
          id: crypto.randomUUID(),
          label: action.label,
          emoji: action.emoji,
          type: 'simple',
          enabled: true,
          builtin: false,
        }
        await patchSettings({ categories: [...stateRef.current.categories, newCat] })
        break
      }

      case 'DELETE_CATEGORY': {
        const cats = stateRef.current.categories.filter(c => c.id !== action.id)
        await patchSettings({ categories: cats })
        break
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
        const reminders = [reminder, ...(stateRef.current.reminders || [])]
        await patchSettings({ reminders })
        break
      }

      case 'TOGGLE_REMINDER': {
        const reminders = (stateRef.current.reminders || []).map(r =>
          r.id === action.id ? { ...r, enabled: !r.enabled } : r
        )
        await patchSettings({ reminders })
        break
      }

      case 'DELETE_REMINDER': {
        const reminders = (stateRef.current.reminders || []).filter(r => r.id !== action.id)
        await patchSettings({ reminders })
        break
      }

      case 'FIRE_REMINDER': {
        const reminders = (stateRef.current.reminders || []).map(r =>
          r.id === action.id ? { ...r, lastFired: new Date().toISOString() } : r
        )
        await patchSettings({ reminders })
        break
      }

      case 'CLEAR_ALL': {
        const [logsSnap, weightSnap] = await Promise.all([
          getDocs(collection(db, 'logs')),
          getDocs(collection(db, 'weightLogs')),
        ])
        // Firestore batch max 500 ops
        const allDocs = [
          ...logsSnap.docs,
          ...weightSnap.docs,
        ]
        for (let i = 0; i < allDocs.length; i += 490) {
          const batch = writeBatch(db)
          allDocs.slice(i, i + 490).forEach(d => batch.delete(d.ref))
          await batch.commit()
        }
        await setDoc(SETTINGS_REF(), {
          babyName: '',
          birthDate: '',
          birthWeight: null,
          profileImage: null,
          colorTheme: 'blue',
          sleepTimerStart: null,
          bottleTimerStart: null,
          feedingQuickAmounts: DEFAULT_STATE.feedingQuickAmounts,
          categories: DEFAULT_CATEGORIES,
          reminders: [],
          settings: { notificationsEnabled: false },
        })
        break
      }

      case 'LOAD_STATE': {
        const payload = action.payload
        const [logsSnap, weightSnap] = await Promise.all([
          getDocs(collection(db, 'logs')),
          getDocs(collection(db, 'weightLogs')),
        ])
        const allOld = [...logsSnap.docs, ...weightSnap.docs]
        for (let i = 0; i < allOld.length; i += 490) {
          const batch = writeBatch(db)
          allOld.slice(i, i + 490).forEach(d => batch.delete(d.ref))
          await batch.commit()
        }
        const newDocs = [
          ...(payload.logs || []).map(l => ({ col: 'logs', data: l })),
          ...(payload.weightLogs || []).map(l => ({ col: 'weightLogs', data: l })),
        ]
        for (let i = 0; i < newDocs.length; i += 490) {
          const batch = writeBatch(db)
          newDocs.slice(i, i + 490).forEach(({ col, data }) => {
            const ref = doc(collection(db, col))
            batch.set(ref, data)
          })
          await batch.commit()
        }
        await setDoc(SETTINGS_REF(), {
          babyName: payload.babyName || '',
          birthDate: payload.birthDate || '',
          birthWeight: payload.birthWeight || null,
          profileImage: payload.profileImage || null,
          colorTheme: payload.colorTheme || 'blue',
          sleepTimerStart: null,
          bottleTimerStart: null,
          feedingQuickAmounts: payload.feedingQuickAmounts || DEFAULT_STATE.feedingQuickAmounts,
          categories: payload.categories || DEFAULT_CATEGORIES,
          reminders: payload.reminders || [],
          settings: payload.settings || { notificationsEnabled: false },
        })
        break
      }

      default:
        break
    }
  }

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
