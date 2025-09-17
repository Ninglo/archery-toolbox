'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session } from '@/types'
import { getStoredSessions } from '@/utils/storage'
import Header from '@/components/Header'

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const router = useRouter()

  useEffect(() => {
    setSessions(getStoredSessions())
  }, [])

  const handleStartNewSession = () => {
    router.push('/record')
  }

  const handleViewSession = (sessionId: string) => {
    router.push(`/result/${sessionId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="记分板" />
      
      <div className="p-4">
        <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center">
          <button
            onClick={handleStartNewSession}
            className="text-blue-600 text-lg font-medium hover:text-blue-700 transition-colors flex items-center justify-center mx-auto"
          >
            开始记分
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-6xl mb-4">🏹</div>
              <p>暂无记录</p>
              <p className="text-sm mt-2">点击"开始记分"开始您的第一次记录</p>
            </div>
          ) : (
            sessions
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleViewSession(session.id)}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {session.totalScore}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.config.bowType}/{session.config.distance}/{session.config.sets * session.config.arrowsPerSet}箭
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">
                        {formatDate(session.createdAt)}
                      </div>
                      <svg className="w-5 h-5 text-gray-400 ml-auto mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}