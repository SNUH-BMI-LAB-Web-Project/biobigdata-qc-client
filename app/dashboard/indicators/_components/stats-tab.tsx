import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const statsRows = [
  { id: 1, name: '일별 환자 수', desc: '일자별 신규 및 재진 환자 수', period: '매일', lastRun: '2024-01-15', status: '정상' },
  { id: 2, name: '진료과별 방문 현황', desc: '진료과별 일일 방문 환자 수', period: '매일', lastRun: '2024-01-15', status: '정상' },
  { id: 3, name: '월별 진단 분포', desc: '주요 진단 코드별 월간 분포', period: '매월', lastRun: '2024-01-01', status: '정상' },
  { id: 4, name: '검사 항목별 통계', desc: '검사 종류별 수행 건수 및 이상치', period: '매주', lastRun: '2024-01-14', status: '경고' },
  { id: 5, name: '임상시험 등록 현황', desc: '시험별 참여자 등록 추이', period: '매일', lastRun: '2024-01-15', status: '정상' },
  { id: 6, name: '이상반응 발생률', desc: '임상시험별 이상반응 발생 통계', period: '매주', lastRun: '2024-01-14', status: '정상' },
  { id: 7, name: '약물 처방 현황', desc: '의약품 처방 빈도 및 용량 분포', period: '매일', lastRun: '2024-01-15', status: '정상' },
  { id: 8, name: '입퇴원 통계', desc: '일별 입원/퇴원 환자 수', period: '매일', lastRun: '2024-01-15', status: '정상' },
] as const

export function StatsTab() {
  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-xs">ID</TableHead>
                <TableHead className="text-xs">통계 지표명</TableHead>
                <TableHead className="text-xs">설명</TableHead>
                <TableHead className="text-xs">산출 주기</TableHead>
                <TableHead className="w-28 text-xs">마지막 산출</TableHead>
                <TableHead className="w-24 text-xs">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statsRows.map(stat => (
                <TableRow key={stat.id} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell className="text-xs font-medium">{stat.id}</TableCell>
                  <TableCell className="text-xs font-medium">{stat.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{stat.desc}</TableCell>
                  <TableCell className="text-xs"><Badge variant="outline">{stat.period}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{stat.lastRun}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant={stat.status === '정상' ? 'secondary' : 'destructive'} className="text-xs">{stat.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
