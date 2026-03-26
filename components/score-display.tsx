import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function getScoreColor(score: number) {
  if (score >= 95) return 'text-green-600'
  if (score >= 90) return 'text-blue-600'
  if (score >= 85) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreBgColor(score: number) {
  if (score >= 95) return 'bg-green-100'
  if (score >= 90) return 'bg-blue-100'
  if (score >= 85) return 'bg-yellow-100'
  return 'bg-red-100'
}

export function getScoreLabel(score: number) {
  if (score >= 95) return '우수'
  if (score >= 90) return '양호'
  return '보통'
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
