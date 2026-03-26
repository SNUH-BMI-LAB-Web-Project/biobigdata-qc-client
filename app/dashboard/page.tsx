'use client'

import { useState, useCallback } from 'react'
import { qualityData, buildIndicatorDetail } from './_data/quality-data'
import type { IndicatorDetail } from './_data/quality-data'
import { DatabaseSection } from './_components/database-section'
import { IndicatorDetailDialog } from './_components/indicator-detail-dialog'

export default function DashboardPage() {
  const [expandedDb, setExpandedDb] = useState<Record<string, number | null>>({
    db1: null,
    db2: null,
  })
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorDetail | null>(null)

  const toggleCategory = useCallback((dbKey: string, categoryIndex: number) => {
    setExpandedDb(prev => ({
      ...prev,
      [dbKey]: prev[dbKey] === categoryIndex ? null : categoryIndex,
    }))
  }, [])

  const handleIndicatorClick = useCallback((dbKey: 'db1' | 'db2', categoryIndex: number, indicatorIndex: number) => {
    setSelectedIndicator(buildIndicatorDetail(dbKey, categoryIndex, indicatorIndex))
  }, [])

  return (
    <>
      <main className="container mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <DatabaseSection
            dbKey="db1"
            data={qualityData.db1}
            expandedCategory={expandedDb.db1 ?? null}
            onToggleCategory={(idx) => toggleCategory('db1', idx)}
            onIndicatorClick={(catIdx, indIdx) => handleIndicatorClick('db1', catIdx, indIdx)}
          />
          <DatabaseSection
            dbKey="db2"
            data={qualityData.db2}
            expandedCategory={expandedDb.db2 ?? null}
            onToggleCategory={(idx) => toggleCategory('db2', idx)}
            onIndicatorClick={(catIdx, indIdx) => handleIndicatorClick('db2', catIdx, indIdx)}
          />
        </div>
      </main>

      <IndicatorDetailDialog
        indicator={selectedIndicator}
        onClose={() => setSelectedIndicator(null)}
      />
    </>
  )
}
