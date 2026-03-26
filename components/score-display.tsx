import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/** 점수 텍스트 — 프로그레스 바(emerald/sky/amber/rose 600·700)와 같은 구간·색상 계열, 한 단계 진한 톤 */
export function getScoreColor(score: number) {
  if (score >= 95) return 'text-emerald-800 dark:text-emerald-400'
  if (score >= 90) return 'text-sky-800 dark:text-sky-400'
  if (score >= 85) return 'text-amber-800 dark:text-amber-400'
  return 'text-rose-800 dark:text-rose-400'
}

export function getScoreBgColor(score: number) {
  if (score >= 95) return 'bg-emerald-200/85 dark:bg-emerald-950/45'
  if (score >= 90) return 'bg-sky-200/85 dark:bg-sky-950/45'
  if (score >= 85) return 'bg-amber-200/85 dark:bg-amber-950/45'
  return 'bg-rose-200/85 dark:bg-rose-950/45'
}

export function getScoreLabel(score: number) {
  if (score >= 95) return '우수'
  if (score >= 90) return '양호'
  return '보통'
}

/** 프로그레스 바 채움 — 구간별 색 구분, 500 대신 600·700 톤으로 채도(어두운 색상) 사용 */
export function getScoreProgressIndicatorClass(score: number) {
  if (score >= 95) return 'bg-emerald-700/55 dark:bg-emerald-600/50'
  if (score >= 90) return 'bg-sky-700/55 dark:bg-sky-600/50'
  if (score >= 85) return 'bg-amber-700/52 dark:bg-amber-600/48'
  return 'bg-rose-700/55 dark:bg-rose-600/50'
}

interface ScoreTextProps {
  score: number
  className?: string
}

export function ScoreText({ score, className }: ScoreTextProps) {
  return (
    <span className={cn('font-bold', getScoreColor(score), className)}>
      {score}
    </span>
  )
}

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <Badge className={cn(getScoreBgColor(score), 'text-xs px-1.5 py-0', className)}>
      <span className={getScoreColor(score)}>{getScoreLabel(score)}</span>
    </Badge>
  )
}

interface ScoreWithProgressProps {
  score: number
  progressClassName?: string
}

export function ScoreWithProgress({ score, progressClassName }: ScoreWithProgressProps) {
  return (
    <div className="flex items-center gap-2">
      <ScoreText score={score} className="text-xl" />
      <ScoreBadge score={score} />
      <Progress value={score} className={cn('h-1 flex-1', progressClassName)} />
    </div>
  )
}
