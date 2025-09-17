'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SessionConfig, Session, SetScore, ArrowScore, BowType, Distance, Sets, ArrowsPerSet } from '@/types'
import { generateSessionId, calculateSetTotal, saveSession } from '@/utils/storage'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'

const bowTypes: BowType[] = ['复合', '反曲']
const distances: Distance[] = ['18m', '30m', '50m', '70m', '90m']
const setSizes: Sets[] = [3, 4, 5, 6, 12]
const arrowCounts: ArrowsPerSet[] = [3, 6, 9, 12]

const scoreValues: ArrowScore['value'][] = ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M']

export default function RecordPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [selectedArrowIndex, setSelectedArrowIndex] = useState(0)
  const [currentNote, setCurrentNote] = useState('')
  const [config, setConfig] = useState<SessionConfig>({
    bowType: '复合',
    distance: '50m',
    sets: 12,
    arrowsPerSet: 6
  })

  const initializeSession = () => {
    const newSession: Session = {
      id: generateSessionId(),
      config,
      sets: Array.from({ length: config.sets }, () => ({
        arrows: Array.from({ length: config.arrowsPerSet }, () => ({ value: 'M' })),
        note: '',
        total: 0
      })),
      totalScore: 0,
      averageScore: 0,
      createdAt: new Date().toISOString()
    }
    setSession(newSession)
  }

  useEffect(() => {
    if (!session) {
      initializeSession()
    } else {
      // 当配置改变时，更新现有session的config和sets结构
      const updatedSets = Array.from({ length: config.sets }, (_, setIndex) => {
        const existingSet = session.sets[setIndex]
        if (existingSet) {
          // 保留现有数据，调整箭数
          const arrows = Array.from({ length: config.arrowsPerSet }, (_, arrowIndex) => {
            return existingSet.arrows[arrowIndex] || { value: 'M' as ArrowScore['value'] }
          })
          return {
            ...existingSet,
            arrows,
            total: calculateSetTotal(arrows)
          }
        } else {
          // 创建新组
          const arrows = Array.from({ length: config.arrowsPerSet }, () => ({ value: 'M' as ArrowScore['value'] }))
          return {
            arrows,
            note: '',
            total: 0
          }
        }
      })

      const updatedSession = {
        ...session,
        config, // 更新配置
        sets: updatedSets
      }
      updatedSession.totalScore = updatedSets.reduce((sum, set) => sum + set.total, 0)
      updatedSession.averageScore = updatedSession.totalScore / (config.sets * config.arrowsPerSet)

      setSession(updatedSession)
    }
  }, [config])

  // 单独处理索引调整，避免在config变化时造成无限循环
  useEffect(() => {
    if (session) {
      // 调整当前组索引，确保不超出范围
      if (currentSetIndex >= config.sets) {
        setCurrentSetIndex(Math.max(0, config.sets - 1))
      }
      
      // 调整当前箭索引，确保不超出范围
      if (selectedArrowIndex >= config.arrowsPerSet) {
        setSelectedArrowIndex(Math.max(0, config.arrowsPerSet - 1))
      }
    }
  }, [session, config.sets, config.arrowsPerSet, currentSetIndex, selectedArrowIndex])

  if (!session) return null

  const currentSet = session.sets[currentSetIndex]
  const selectedArrow = currentSet.arrows[selectedArrowIndex]

  const handleScoreSelect = (value: ArrowScore['value']) => {
    const newSets = [...session.sets]
    newSets[currentSetIndex].arrows[selectedArrowIndex] = { value }
    newSets[currentSetIndex].total = calculateSetTotal(newSets[currentSetIndex].arrows)
    
    const newSession = {
      ...session,
      config, // 确保使用最新的config
      sets: newSets,
      totalScore: newSets.reduce((sum, set) => sum + set.total, 0)
    }
    newSession.averageScore = newSession.totalScore / (config.sets * config.arrowsPerSet)
    
    setSession(newSession)
    
    if (selectedArrowIndex < config.arrowsPerSet - 1) {
      setSelectedArrowIndex(selectedArrowIndex + 1)
    }
  }

  const handleArrowSelect = (index: number) => {
    setSelectedArrowIndex(index)
  }

  const handleNoteChange = (note: string) => {
    setCurrentNote(note)
    const newSets = [...session.sets]
    newSets[currentSetIndex].note = note
    setSession({ 
      ...session, 
      config, // 确保使用最新的config
      sets: newSets 
    })
  }

  const handleSetNavigation = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentSetIndex - 1 : currentSetIndex + 1
    if (newIndex >= 0 && newIndex < config.sets) {
      setCurrentSetIndex(newIndex)
      setSelectedArrowIndex(0)
      setCurrentNote(session.sets[newIndex].note)
    }
  }

  const handleClearSet = () => {
    const newSets = [...session.sets]
    newSets[currentSetIndex] = {
      arrows: Array.from({ length: config.arrowsPerSet }, () => ({ value: 'M' })),
      note: '',
      total: 0
    }
    const newSession = {
      ...session,
      config, // 确保使用最新的config
      sets: newSets,
      totalScore: newSets.reduce((sum, set) => sum + set.total, 0)
    }
    newSession.averageScore = newSession.totalScore / (config.sets * config.arrowsPerSet)
    
    setSession(newSession)
    setCurrentNote('')
    setSelectedArrowIndex(0)
  }

  const handleDeleteArrow = () => {
    const newSets = [...session.sets]
    newSets[currentSetIndex].arrows[selectedArrowIndex] = { value: 'M' }
    newSets[currentSetIndex].total = calculateSetTotal(newSets[currentSetIndex].arrows)
    
    const newSession = {
      ...session,
      config, // 确保使用最新的config
      sets: newSets,
      totalScore: newSets.reduce((sum, set) => sum + set.total, 0)
    }
    newSession.averageScore = newSession.totalScore / (config.sets * config.arrowsPerSet)
    
    setSession(newSession)
  }

  const handleSave = () => {
    const completedSession = {
      ...session,
      config, // 确保使用最新的config
      completedAt: new Date().toISOString()
    }
    saveSession(completedSession)
    router.push(`/result/${session.id}`)
  }

  // 检查一组是否有记分数据
  const hasScoreData = (set: SetScore): boolean => {
    // 如果有非M的箭或者有备注，就算有数据
    return set.arrows.some(arrow => arrow.value !== 'M') || set.note.trim() !== ''
  }

  // 获取已有记分的组数
  const getCompletedSetsCount = (): number => {
    let completedCount = 0
    for (let i = 0; i < session.sets.length; i++) {
      if (hasScoreData(session.sets[i])) {
        completedCount = i + 1
      }
    }
    return completedCount
  }

  // 提前结束处理
  const handleEarlyFinish = () => {
    const completedSetsCount = getCompletedSetsCount()
    
    if (completedSetsCount === 0) {
      alert('至少需要完成一组记分才能保存')
      return
    }

    if (confirm(`确定要提前结束吗？将保存前 ${completedSetsCount} 组的记分数据。`)) {
      // 创建新的配置，设置实际完成的组数
      const newConfig = {
        ...config,
        sets: completedSetsCount as Sets
      }

      // 只保留已完成的组
      const completedSets = session.sets.slice(0, completedSetsCount)
      
      const finalSession = {
        ...session,
        config: newConfig,
        sets: completedSets,
        totalScore: completedSets.reduce((sum, set) => sum + set.total, 0),
        completedAt: new Date().toISOString()
      }
      
      // 重新计算平均分（基于实际完成的箭数）
      const totalArrows = completedSets.reduce((sum, set) => sum + set.arrows.length, 0)
      finalSession.averageScore = totalArrows > 0 ? finalSession.totalScore / totalArrows : 0

      saveSession(finalSession)
      router.push(`/result/${session.id}`)
    }
  }

  const getScoreColor = (value: ArrowScore['value']) => {
    if (value === 'X' || value === '10' || value === '9') return 'bg-yellow-400'
    if (value === '8' || value === '7') return 'bg-red-500'
    if (value === '6' || value === '5') return 'bg-blue-500'
    if (value === '4' || value === '3') return 'bg-black'
    return 'bg-gray-400'
  }

  const getScoreTextColor = (value: ArrowScore['value']) => {
    if (value === 'X' || value === '10' || value === '9') return 'text-black'
    return 'text-white'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={`总环数: ${session.totalScore}`}
        leftButton={<BackButton />}
      />

      <div className="p-4">
        {/* 配置选择 */}
        <div className="bg-white rounded-lg p-4 mb-4 grid grid-cols-4 gap-3">
          <select
            value={config.bowType}
            onChange={(e) => setConfig({ ...config, bowType: e.target.value as BowType })}
            className="text-center py-2 border border-gray-300 rounded text-sm"
          >
            {bowTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={config.distance}
            onChange={(e) => setConfig({ ...config, distance: e.target.value as Distance })}
            className="text-center py-2 border border-gray-300 rounded text-sm"
          >
            {distances.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
          
          <select
            value={config.sets}
            onChange={(e) => setConfig({ ...config, sets: parseInt(e.target.value) as Sets })}
            className="text-center py-2 border border-gray-300 rounded text-sm"
          >
            {setSizes.map(size => (
              <option key={size} value={size}>{size}组</option>
            ))}
          </select>
          
          <select
            value={config.arrowsPerSet}
            onChange={(e) => setConfig({ ...config, arrowsPerSet: parseInt(e.target.value) as ArrowsPerSet })}
            className="text-center py-2 border border-gray-300 rounded text-sm"
          >
            {arrowCounts.map(count => (
              <option key={count} value={count}>{count}支/组</option>
            ))}
          </select>
        </div>

        {/* 环值记录区域 */}
        <div className="bg-white rounded-lg mb-4">
          {/* 第一行 */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            <div className="p-3 text-center font-medium bg-gray-50">
              {currentSetIndex + 1}.
            </div>
            {currentSet.arrows.map((arrow, index) => (
              <button
                key={index}
                onClick={() => handleArrowSelect(index)}
                className={`p-3 text-center border-l border-gray-200 ${
                  selectedArrowIndex === index 
                    ? 'bg-purple-200' 
                    : arrow.value !== 'M' 
                    ? `${getScoreColor(arrow.value)} ${getScoreTextColor(arrow.value)}` 
                    : 'bg-gray-50'
                }`}
              >
                {arrow.value !== 'M' ? arrow.value : ''}
              </button>
            ))}
            <div className="p-3 text-center font-medium bg-gray-50 border-l border-gray-200">
              {currentSet.total}
            </div>
          </div>

          {/* 备注行 */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              value={currentNote}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="备注..."
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>

          {/* 导航按钮 */}
          <div className="p-4 flex justify-between">
            <button
              onClick={() => handleSetNavigation('prev')}
              disabled={currentSetIndex === 0}
              className="px-4 py-2 text-sm text-gray-600 disabled:text-gray-300"
            >
              上一组
            </button>
            <div className="text-sm text-gray-500">
              {currentSetIndex + 1} / {config.sets}
            </div>
            <button
              onClick={() => handleSetNavigation('next')}
              disabled={currentSetIndex === config.sets - 1}
              className="px-4 py-2 text-sm text-gray-600 disabled:text-gray-300"
            >
              下一组
            </button>
          </div>
        </div>

        {/* 数字键盘 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {scoreValues.slice(0, 8).map((value) => (
              <button
                key={value}
                onClick={() => handleScoreSelect(value)}
                className={`py-4 rounded text-lg font-medium ${getScoreColor(value)} ${getScoreTextColor(value)}`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {scoreValues.slice(8).map((value) => (
              <button
                key={value}
                onClick={() => handleScoreSelect(value)}
                className={`py-4 rounded text-lg font-medium ${getScoreColor(value)} ${getScoreTextColor(value)}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="space-y-2">
          {/* 第一行：主要操作 */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleSave}
              className="bg-cyan-400 text-white py-4 rounded-lg font-medium"
            >
              ✓ 保存
            </button>
            <button 
              onClick={handleEarlyFinish}
              className="bg-orange-400 text-white py-4 rounded-lg font-medium"
            >
              🏁 提前结束
            </button>
          </div>
          
          {/* 第二行：编辑操作 */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={handleClearSet}
              className="bg-pink-400 text-white py-3 rounded-lg font-medium text-sm"
            >
              🔄 清空
            </button>
            <button 
              onClick={handleDeleteArrow}
              className="bg-gray-400 text-white py-3 rounded-lg font-medium text-sm"
            >
              ↶ 删除
            </button>
            <button className="bg-yellow-400 text-black py-3 rounded-lg font-medium text-sm">
              📝 配箭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}