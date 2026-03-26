import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCardSimple } from '@/components/stat-card'
import type { TabDef } from '../_data/tabs'

function TabTriggerItem({ tab }: { tab: TabDef }) {
  const Icon = tab.icon
  return (
    <TabsTrigger value={tab.value} className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        <span>{tab.label}</span>
      </div>
      <span className="text-[10px] opacity-60">({tab.sublabel})</span>
    </TabsTrigger>
  )
}

function TabContentGrid({ tab }: { tab: TabDef }) {
  const cols = tab.cols ?? 3
  const gridClass = cols === 4
    ? 'grid grid-cols-2 sm:grid-cols-4 gap-3'
    : 'grid grid-cols-1 sm:grid-cols-3 gap-3'

  return (
    <TabsContent value={tab.value}>
      <div className={gridClass}>
        {tab.stats.map((stat) => (
          <StatCardSimple key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </TabsContent>
  )
}

interface DataTabPanelProps {
  tabs: TabDef[]
  tabRows?: TabDef[][]
}

export function DataTabPanel({ tabs, tabRows }: DataTabPanelProps) {
  const rows = tabRows ?? [tabs]

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="summary">
          {rows.map((row, i) => (
            <div key={i} className="overflow-x-auto -mx-2 px-2 mb-4">
              <TabsList className="inline-flex w-auto min-w-full h-auto">
                {row.map(tab => <TabTriggerItem key={tab.value} tab={tab} />)}
              </TabsList>
            </div>
          ))}
          {tabs.map(tab => <TabContentGrid key={tab.value} tab={tab} />)}
        </Tabs>
      </CardContent>
    </Card>
  )
}
