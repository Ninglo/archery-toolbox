import { Session, SessionConfig, ArrowScore } from '@/types'

const STORAGE_KEY = 'archery-sessions'

export const getStoredSessions = (): Session[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const saveSession = (session: Session): void => {
  if (typeof window === 'undefined') return
  
  const sessions = getStoredSessions()
  const existingIndex = sessions.findIndex(s => s.id === session.id)
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session
  } else {
    sessions.push(session)
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export const deleteSession = (sessionId: string): void => {
  if (typeof window === 'undefined') return
  
  const sessions = getStoredSessions().filter(s => s.id !== sessionId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export const generateSessionId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const calculateArrowScore = (arrow: ArrowScore): number => {
  if (arrow.value === 'X' || arrow.value === '10') return 10
  if (arrow.value === 'M') return 0
  return parseInt(arrow.value)
}

export const calculateSetTotal = (arrows: ArrowScore[]): number => {
  return arrows.reduce((sum, arrow) => sum + calculateArrowScore(arrow), 0)
}

export const calculateSessionTotal = (session: Session): number => {
  return session.sets.reduce((sum, set) => sum + set.total, 0)
}

export const calculateAverageScore = (session: Session): number => {
  const totalArrows = session.sets.reduce((sum, set) => sum + set.arrows.length, 0)
  return totalArrows > 0 ? session.totalScore / totalArrows : 0
}

export const formatSessionData = (session: Session): string => {
  const { config } = session
  const header = `${config.bowType} - ${config.distance} - ${config.sets}组 - ${config.arrowsPerSet}支/组`
  const summary = `${session.totalScore} - ${session.averageScore.toFixed(2)}`
  const date = new Date(session.createdAt).toLocaleDateString('zh-CN')
  
  let details = ''
  session.sets.forEach((set, index) => {
    const setNum = index + 1
    const arrows = set.arrows.map(arrow => arrow.value).join(' ')
    const setTotal = set.total
    const note = set.note || ''
    details += `${setNum} - ${arrows} - ${setTotal} - ${note}\n`
  })
  
  return `${header}\n${summary}\n${date}\n${details}`
}