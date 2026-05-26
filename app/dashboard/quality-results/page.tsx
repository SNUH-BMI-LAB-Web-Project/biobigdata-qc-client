'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, AlertCircle, Database, TrendingUp, TrendingDown, FileDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

// DB별 상세 데이터
const dbDetailData = {
  '수집DB': {
    avgScore: 91.9,
    datasetCount: 4,
    lastRun: '2024-01-15 14:35',
    trend: 'up',
    datasets: [
      { 
        name: '1차생성_문검진', 
        score: 95.2, 
        status: '통과', 
        lastRun: '2024-01-15 14:30',
        duration: '5분 12초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 96.5, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 98.2, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 94.1, status: '통과' },
          { name: '정확성 - 범위 검증', score: 92.3, status: '통과' },
          { name: '일관성 - 코드값 매핑', score: 94.9, status: '통과' },
        ]
      },
      { 
        name: '1차생성_기초임상(KR-CDI)', 
        score: 88.5, 
        status: '경고', 
        lastRun: '2024-01-15 14:32',
        duration: '8분 45초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 92.1, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 95.3, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 85.2, status: '경고' },
          { name: '정확성 - 범위 검증', score: 78.5, status: '실패' },
          { name: '일관성 - 코드값 매핑', score: 91.4, status: '통과' },
        ]
      },
      { 
        name: '2차연계_의무기록(PHR)', 
        score: 92.1, 
        status: '통과', 
        lastRun: '2024-01-15 14:35',
        duration: '3분 28초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 94.2, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 96.8, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 91.5, status: '통과' },
          { name: '정확성 - 범위 검증', score: 88.3, status: '경고' },
          { name: '일관성 - 코드값 매핑', score: 89.7, status: '경고' },
        ]
      },
      { 
        name: '2차연계_공공데이터', 
        score: 94.3, 
        status: '통과', 
        lastRun: '2024-01-15 14:28',
        duration: '4분 15초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 97.1, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 98.5, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 93.2, status: '통과' },
          { name: '정확성 - 범위 검증', score: 90.1, status: '통과' },
          { name: '일관성 - 코드값 매핑', score: 92.6, status: '통과' },
        ]
      },
    ],
  },
  '전처리DB': {
    avgScore: 88.1,
    datasetCount: 4,
    lastRun: '2024-01-15 15:10',
    trend: 'down',
    datasets: [
      { 
        name: '1차생성_문검진', 
        score: 97.8, 
        status: '통과', 
        lastRun: '2024-01-15 15:00',
        duration: '4분 32초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 98.5, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 99.1, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 97.2, status: '통과' },
          { name: '정확성 - 범위 검증', score: 96.5, status: '통과' },
          { name: '일관성 - 코드값 매핑', score: 97.7, status: '통과' },
        ]
      },
      { 
        name: '1차생성_기초임상(KR-CDI)', 
        score: 91.2, 
        status: '통과', 
        lastRun: '2024-01-15 15:02',
        duration: '7분 18초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 93.2, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 95.1, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 90.5, status: '통과' },
          { name: '정확성 - 범위 검증', score: 87.2, status: '경고' },
          { name: '일관성 - 코드값 매핑', score: 90.0, status: '통과' },
        ]
      },
      { 
        name: '1차생성_기초임상(CDM)', 
        score: 78.3, 
        status: '실패', 
        lastRun: '2024-01-15 15:05',
        duration: '12분 05초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 85.2, status: '경고' },
          { name: '완전성 - 필수값 존재', score: 82.1, status: '경고' },
          { name: '정확성 - 데이터 타입', score: 72.5, status: '실패' },
          { name: '정확성 - 범위 검증', score: 68.3, status: '실패' },
          { name: '일관성 - 코드값 매핑', score: 83.4, status: '경고' },
        ]
      },
      { 
        name: '1차생성_희귀질환(eCRF)', 
        score: 85.1, 
        status: '경고', 
        lastRun: '2024-01-15 15:10',
        duration: '6분 42초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 88.5, status: '경고' },
          { name: '완전성 - 필수값 존재', score: 90.2, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 82.3, status: '경고' },
          { name: '정확성 - 범위 검증', score: 79.5, status: '실패' },
          { name: '일관성 - 코드값 매핑', score: 85.0, status: '경고' },
        ]
      },
    ],
  },
  '통합DB': {
    avgScore: 94.2,
    datasetCount: 2,
    lastRun: '2024-01-15 16:15',
    trend: 'up',
    datasets: [
      { 
        name: '1차생성_기초임상(CDM)', 
        score: 94.6, 
        status: '통과', 
        lastRun: '2024-01-15 16:00',
        duration: '9분 22초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 96.2, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 97.5, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 93.8, status: '통과' },
          { name: '정확성 - 범위 검증', score: 91.5, status: '통과' },
          { name: '일관성 - 코드값 매핑', score: 94.0, status: '통과' },
        ]
      },
      { 
        name: '1차생성_희귀질환(eCRF)', 
        score: 93.8, 
        status: '통과', 
        lastRun: '2024-01-15 16:15',
        duration: '5분 48초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 95.5, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 96.2, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 92.1, status: '통과' },
          { name: '정확성 - 범위 검증', score: 90.8, status: '통과' },
          { name: '일관성 - 코드값 매핑', score: 94.4, status: '통과' },
        ]
      },
    ],
  },
  '개방DB': {
    avgScore: 96.5,
    datasetCount: 2,
    lastRun: '2024-01-15 17:00',
    trend: 'up',
    datasets: [
      { 
        name: '1차생성_기초임상(CDM)', 
        score: 96.5, 
        status: '통과', 
        lastRun: '2024-01-15 17:00',
        duration: '8분 15초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 98.2, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 99.1, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 96.5, status: '통과' },
          { name: '정확성 - 범위 검증', score: 94.2, status: '통과' },
          { name: '일관성 - 코드값 매핑', score: 94.5, status: '통과' },
        ]
      },
      { 
        name: '1차생성_희귀질환(eCRF)', 
        score: 95.8, 
        status: '통과', 
        lastRun: '2024-01-15 16:50',
        duration: '6분 33초',
        indicators: [
          { name: '완전성 - NULL 비율', score: 97.5, status: '통과' },
          { name: '완전성 - 필수값 존재', score: 98.2, status: '통과' },
          { name: '정확성 - 데이터 타입', score: 95.1, status: '통과' },
          { name: '정확성 - 범위 검증', score: 93.5, status: '통과' },
          { name: '일관성 - 코드값 매핑', score: 94.7, status: '통과' },
        ]
      },
    ],
  },
}

const dbList = ['수집DB', '전처리DB', '통합DB', '개방DB'] as const

export default function QualityResultsPage() {
  const [selectedDb, setSelectedDb] = useState<keyof typeof dbDetailData>('수집DB')
  const [selectedDataset, setSelectedDataset] = useState<number>(0)

  const currentData = dbDetailData[selectedDb]
  const currentDataset = currentData.datasets[selectedDataset]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '통과':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case '경고':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case '실패':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const [selectedVerification, setSelectedVerification] = useState(0)
  const [viewMode, setViewMode] = useState<'current' | 'compare'>('current')

  // 이전 실행 비교 데이터 (각 지표별 이전 3회 실행 점수)
  const getHistoricalData = (indicators: typeof currentData.datasets[0]['indicators']) => {
    return indicators.map(indicator => ({
      ...indicator,
      history: [
        { date: '01-13', score: indicator.score - Math.random() * 5 + 2 },
        { date: '01-12', score: indicator.score - Math.random() * 8 + 3 },
        { date: '01-11', score: indicator.score - Math.random() * 10 + 4 },
      ]
    }))
  }

  const handleDbChange = (db: keyof typeof dbDetailData) => {
    setSelectedDb(db)
    setSelectedDataset(0)
    setSelectedVerification(0)
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">{'데이터 품질 결과'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'품질지표 검증 결과를 확인합니다'}
          </p>
        </div>

        {/* DB Selection Cards - Compact */}
        <div className="grid grid-cols-4 gap-2">
          {dbList.map((db) => {
            const data = dbDetailData[db]
            const isSelected = selectedDb === db
            return (
              <div
                key={db}
                className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => handleDbChange(db)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{db}</span>
                  <span className={`text-lg font-bold ${getScoreColor(data.avgScore)}`}>
                    {data.avgScore}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {'대상 데이터 '}{data.datasetCount}{'개'}
                  </span>
                  {data.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Verification History Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{selectedDb}{' 검증 실행 내역'}</CardTitle>
                <CardDescription className="text-xs">{'검증 내역을 선택하여 결과를 확인하세요'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-2 font-medium">{'번호'}</th>
                  <th className="text-left p-2 font-medium">{'실행자'}</th>
                  <th className="text-left p-2 font-medium">{'시작 일시'}</th>
                  <th className="text-left p-2 font-medium">{'종료 일시'}</th>
                  <th className="text-left p-2 font-medium">{'상태'}</th>
                  <th className="text-left p-2 font-medium">{'점수'}</th>
                  <th className="text-left p-2 font-medium">{'리포트'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, executor: '홍길동', startedAt: '2024-01-15 14:30', endedAt: '2024-01-15 14:45', status: '완료', score: 91.9 },
                  { id: 2, executor: '김철수', startedAt: '2024-01-14 10:00', endedAt: '2024-01-14 10:22', status: '완료', score: 89.5 },
                  { id: 3, executor: '이영희', startedAt: '2024-01-13 16:30', endedAt: '2024-01-13 16:48', status: '완료', score: 95.2 },
                  { id: 4, executor: '박민수', startedAt: '2024-01-12 09:00', endedAt: '2024-01-12 09:18', status: '완료', score: 87.3 },
                  { id: 5, executor: '홍길동', startedAt: '2024-01-11 14:00', endedAt: '2024-01-11 14:15', status: '오류', score: 0 },
                ].map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`border-b cursor-pointer transition-all ${
                      selectedVerification === idx 
                        ? 'bg-primary/10 border-l-2 border-l-primary' 
                        : 'hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedVerification(idx)}
                  >
                    <td className="p-2">{row.id}</td>
                    <td className="p-2">{row.executor}</td>
                    <td className="p-2 font-mono">{row.startedAt}</td>
                    <td className="p-2 font-mono">{row.endedAt}</td>
                    <td className="p-2">
                      <Badge 
                        variant={row.status === '완료' ? 'secondary' : 'destructive'} 
                        className={`text-xs ${row.status === '완료' ? 'bg-green-100 text-green-800' : ''}`}
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <span className={`font-bold ${row.score >= 90 ? 'text-green-600' : row.score >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {row.score > 0 ? row.score : '-'}
                      </span>
                    </td>
                    <td className="p-2">
                      {row.status === '완료' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            alert(`검증 ${row.id} 리포트 PDF 다운로드`)
                          }}
                        >
                          <FileDown className="w-3 h-3" />
                          {'PDF'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Selected DB Dashboard */}
        <div className="grid grid-cols-3 gap-4">
          {/* Dataset Selection Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4" />
                {selectedDb} {'대상 데이터'}
              </CardTitle>
              <CardDescription className="text-xs">
                {'데이터를 선택하여 지표별 점수를 확인하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentData.datasets.map((dataset, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedDataset === idx
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onClick={() => setSelectedDataset(idx)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{dataset.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold ${getScoreColor(dataset.score)}`}>
                        {dataset.score}
                      </span>
                      {getStatusIcon(dataset.status)}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{dataset.lastRun}</span>
                    <span className="text-muted-foreground/70">{'|'}</span>
                    <span>{dataset.duration}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Indicator Scores for Selected Dataset */}
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{'지표별 점수'}</CardTitle>
                  <CardDescription className="text-xs">
                    {currentDataset.name}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'current' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setViewMode('current')}
                  >
                    {'현재 실행'}
                  </Button>
                  <Button
                    variant={viewMode === 'compare' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setViewMode('compare')}
                  >
                    {'이전 비교'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'current' ? (
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
                  {currentDataset.indicators.map((indicator, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">{indicator.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${getScoreColor(indicator.score)}`}>
                              {indicator.score}
                            </span>
                            {getStatusIcon(indicator.status)}
                          </div>
                        </div>
                        <Progress value={indicator.score} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                  {getHistoricalData(currentDataset.indicators).map((indicator, idx) => {
                    const chartData = [
                      ...indicator.history.reverse().map(h => ({ date: h.date, score: Number(h.score.toFixed(1)) })),
                      { date: '현재', score: indicator.score }
                    ]
                    const diff = indicator.score - indicator.history[indicator.history.length - 1].score
                    
                    return (
                      <div key={idx} className="p-3 rounded border bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">{indicator.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${getScoreColor(indicator.score)}`}>
                              {indicator.score}
                            </span>
                            <span className={`text-xs flex items-center gap-0.5 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {diff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="h-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 9 }} 
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                domain={[60, 100]} 
                                hide 
                              />
                              <Tooltip 
                                contentStyle={{ fontSize: '11px', padding: '4px 8px' }}
                                formatter={(value: number) => [`${value}점`, '점수']}
                              />
                              <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
                              <ReferenceLine y={80} stroke="#eab308" strokeDasharray="3 3" strokeOpacity={0.5} />
                              <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                                activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
                <div className="text-center p-2 rounded bg-muted/50">
                  <div className={`text-lg font-bold ${getScoreColor(currentDataset.score)}`}>
                    {currentDataset.score}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{'평균 점수'}</div>
                </div>
                <div className="text-center p-2 rounded bg-green-50">
                  <div className="text-lg font-bold text-green-600">
                    {currentDataset.indicators.filter(i => i.status === '통과').length}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{'통과'}</div>
                </div>
                <div className="text-center p-2 rounded bg-yellow-50">
                  <div className="text-lg font-bold text-yellow-600">
                    {currentDataset.indicators.filter(i => i.status === '경고').length}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{'경고'}</div>
                </div>
                <div className="text-center p-2 rounded bg-red-50">
                  <div className="text-lg font-bold text-red-600">
                    {currentDataset.indicators.filter(i => i.status === '실패').length}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{'실패'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
