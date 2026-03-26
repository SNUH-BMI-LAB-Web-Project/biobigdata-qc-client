import type { LucideIcon } from 'lucide-react'
import {
  User, Calendar, Stethoscope, Pill, FlaskConical, Scissors,
  Eye, FileText, Activity, AlertCircle, Syringe, TestTube,
  Scan, Heart, MapPin,
} from 'lucide-react'

export type TabDef = {
  value: string
  label: string
  sublabel: string
  icon: LucideIcon
  stats: { label: string; value: string | number }[]
  cols?: number
}

export const patientTabs: TabDef[] = [
  { value: 'summary', label: '요약', sublabel: 'Summary', icon: FileText, cols: 4, stats: [
    { label: '총 환자 수', value: '15,234' }, { label: '총 내원 수', value: '48,567' },
    { label: '총 진단 수', value: '32,891' }, { label: '총 처방 수', value: '95,432' },
  ]},
  { value: 'person', label: '환자', sublabel: 'Person', icon: User, stats: [
    { label: '등록 환자 수', value: '15,234' }, { label: '남성', value: '7,523' }, { label: '여성', value: '7,711' },
  ]},
  { value: 'encounter', label: '내원', sublabel: 'Encounter', icon: Calendar, stats: [
    { label: '총 내원 수', value: '48,567' }, { label: '외래', value: '42,345' }, { label: '입원', value: '6,222' },
  ]},
  { value: 'condition', label: '진단', sublabel: 'Condition', icon: Stethoscope, stats: [
    { label: '총 진단 수', value: '32,891' }, { label: '주진단', value: '15,234' }, { label: '부진단', value: '17,657' },
  ]},
  { value: 'procedure', label: '수술/처치', sublabel: 'Procedure', icon: Scissors, stats: [
    { label: '총 수술/처치 수', value: '8,456' }, { label: '수술', value: '3,234' }, { label: '처치', value: '5,222' },
  ]},
  { value: 'medication', label: '약물', sublabel: 'Medication', icon: Pill, stats: [
    { label: '총 처방 수', value: '95,432' }, { label: '경구제', value: '78,234' }, { label: '주사제', value: '17,198' },
  ]},
  { value: 'laboratory', label: '진단검사', sublabel: 'Laboratory', icon: FlaskConical, stats: [
    { label: '총 검사 수', value: '124,567' }, { label: '혈액검사', value: '56,789' }, { label: '기타 검사', value: '67,778' },
  ]},
  { value: 'pathology', label: '병리검사', sublabel: 'Pathology', icon: TestTube, stats: [
    { label: '총 병리검사 수', value: '3,456' }, { label: '조직검사', value: '2,345' }, { label: '세포검사', value: '1,111' },
  ]},
  { value: 'imaging', label: '영상검사', sublabel: 'Imaging', icon: Scan, cols: 4, stats: [
    { label: '총 영상검사 수', value: '15,678' }, { label: 'X-ray', value: '8,234' },
    { label: 'CT', value: '4,567' }, { label: 'MRI', value: '2,877' },
  ]},
  { value: 'functional', label: '기능검사', sublabel: 'Functional', icon: Heart, stats: [
    { label: '총 기능검사 수', value: '12,345' }, { label: '심전도', value: '6,789' }, { label: '폐기능', value: '5,556' },
  ]},
  { value: 'vital', label: '활력징후', sublabel: 'Vital Signs', icon: Activity, cols: 4, stats: [
    { label: '측정 횟수', value: '156,789' }, { label: '혈압', value: '48,567' },
    { label: '체온', value: '48,567' }, { label: '맥박', value: '48,567' },
  ]},
  { value: 'allergy', label: '알레르기', sublabel: 'Allergy', icon: AlertCircle, stats: [
    { label: '알레르기 기록 수', value: '2,345' }, { label: '약물 알레르기', value: '1,567' }, { label: '음식 알레르기', value: '778' },
  ]},
  { value: 'immunization', label: '예방접종', sublabel: 'Immunization', icon: Syringe, stats: [
    { label: '총 접종 수', value: '8,234' }, { label: '독감 백신', value: '4,567' }, { label: '기타 백신', value: '3,667' },
  ]},
]

export const clinicalTabs: TabDef[] = [
  { value: 'summary', label: '요약', sublabel: 'Summary', icon: FileText, cols: 4, stats: [
    { label: '총 피험자 수', value: '3,456' }, { label: '총 방문 수', value: '12,890' },
    { label: '진행중인 시험', value: 23 }, { label: '완료된 시험', value: 45 },
  ]},
  { value: 'person', label: '사람', sublabel: 'Person', icon: User, stats: [
    { label: '등록 피험자 수', value: '3,456' }, { label: '남성', value: '1,789' }, { label: '여성', value: '1,667' },
  ]},
  { value: 'visit', label: '방문', sublabel: 'Visit', icon: MapPin, stats: [
    { label: '총 방문 수', value: '12,890' }, { label: '스크리닝', value: '3,456' }, { label: '추적 방문', value: '9,434' },
  ]},
  { value: 'condition', label: '진단', sublabel: 'Condition', icon: Stethoscope, stats: [
    { label: '총 진단 기록 수', value: '8,234' }, { label: '기저질환', value: '4,567' }, { label: '이상반응', value: '3,667' },
  ]},
  { value: 'drug', label: '약물', sublabel: 'Drug', icon: Pill, stats: [
    { label: '총 투약 기록 수', value: '25,678' }, { label: '시험약', value: '15,234' }, { label: '병용약물', value: '10,444' },
  ]},
  { value: 'measurement', label: '검사', sublabel: 'Measurement', icon: FlaskConical, stats: [
    { label: '총 검사 수', value: '45,678' }, { label: '실험실 검사', value: '32,456' }, { label: '바이탈 측정', value: '13,222' },
  ]},
  { value: 'procedure', label: '수술/처치', sublabel: 'Procedure', icon: Scissors, stats: [
    { label: '총 시술 수', value: '2,345' }, { label: '생검', value: '1,234' }, { label: '영상유도 시술', value: '1,111' },
  ]},
  { value: 'observation', label: '관찰정보', sublabel: 'Observation', icon: Eye, stats: [
    { label: '총 관찰 기록 수', value: '18,234' }, { label: '효능 평가', value: '9,567' }, { label: '안전성 평가', value: '8,667' },
  ]},
]
