'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Session, ScoreDistribution } from '@/types'
import { getStoredSessions, formatSessionData, calculateArrowScore, deleteSession } from '@/utils/storage'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [distribution, setDistribution] = useState<ScoreDistribution>({})

  useEffect(() => {
    const sessionId = params.id as string
    const sessions = getStoredSessions()
    const foundSession = sessions.find(s => s.id === sessionId)
    
    if (foundSession) {
      setSession(foundSession)
      
      // 计算分数分布
      const dist: ScoreDistribution = {
        'X': 0, '10': 0, '9': 0, '8': 0, '7': 0, '6': 0,
        '5': 0, '4': 0, '3': 0, '2': 0, '1': 0, 'M': 0
      }
      
      foundSession.sets.forEach(set => {
        set.arrows.forEach(arrow => {
          dist[arrow.value] = (dist[arrow.value] || 0) + 1
        })
      })
      
      setDistribution(dist)
    } else {
      router.push('/')
    }
  }, [params.id, router])

  if (!session) {
    return <div>加载中...</div>
  }

  const handleExport = async () => {
    const data = formatSessionData(session)
    try {
      await navigator.clipboard.writeText(data)
      alert('数据已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败，请手动复制数据')
    }
  }

  const handleDelete = () => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteSession(session.id)
      router.push('/')
    }
  }

  const getScoreColor = (value: string) => {
    if (value === 'X' || value === '10' || value === '9') return 'bg-yellow-400 text-black'
    if (value === '8' || value === '7') return 'bg-red-500 text-white'
    if (value === '6' || value === '5') return 'bg-blue-500 text-white'
    if (value === '4' || value === '3') return 'bg-black text-white'
    return 'bg-gray-400 text-white'
  }

  const maxCount = Math.max(...Object.values(distribution))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="记分板"
        leftButton={<BackButton />}
        rightButton={
          <button onClick={handleDelete} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        }
      />

      <div className="p-4">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="grid grid-cols-4 gap-4 text-center text-sm text-gray-600 mb-4">
            <div>{session.config.bowType}</div>
            <div>{session.config.distance}</div>
            <div>{session.config.sets}组</div>
            <div>{session.config.arrowsPerSet}支/组</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {session.totalScore} / {session.averageScore.toFixed(2)}
            </div>
            <div className="text-gray-500 text-sm">
              {new Date(session.createdAt).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>

        {/* 分数分布图 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="text-center text-gray-600 mb-4">分布</h3>
          <div className="flex items-end justify-center space-x-1 h-32 mb-4">
            {['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'].map((score) => {
              const count = distribution[score] || 0
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0
              
              return (
                <div key={score} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-600 mb-1">{count}</div>
                  <div
                    className={`w-full rounded-t ${score === 'X' || score === '10' || score === '9' ? 'bg-yellow-400' : score === '8' || score === '7' ? 'bg-red-500' : 'bg-gray-400'}`}
                    style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                  />
                  <div className="text-xs text-gray-600 mt-1">{score}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 明细 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="text-center text-gray-600 mb-4">明细</h3>
          <div className="space-y-2">
            {session.sets.map((set, index) => (
              <div key={index} className="grid grid-cols-8 gap-2 items-center">
                <div className="text-center text-sm font-medium bg-gray-50 py-2 rounded">
                  {index + 1}.
                </div>
                {set.arrows.map((arrow, arrowIndex) => (
                  <div
                    key={arrowIndex}
                    className={`text-center text-sm py-2 rounded ${
                      arrow.value !== 'M' ? getScoreColor(arrow.value) : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {arrow.value}
                  </div>
                ))}
                <div className="text-center text-sm font-medium bg-gray-50 py-2 rounded">
                  {set.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 备注 */}
        {session.sets.some(set => set.note.trim()) && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="text-center text-gray-600 mb-4">备注</h3>
            <div className="space-y-2">
              {session.sets.map((set, index) => 
                set.note.trim() && (
                  <div key={index} className="text-sm">
                    <span className="font-medium">第{index + 1}组：</span>
                    <span className="text-gray-700">{set.note}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* 导出按钮 */}
        <button
          onClick={handleExport}
          className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          📋 导出到剪贴板
        </button>
      </div>
    </div>
  )
}