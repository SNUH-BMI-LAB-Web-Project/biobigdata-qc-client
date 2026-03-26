'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Database, 
  Users, 
  Calendar, 
  HardDrive, 
  TrendingUp,
  User,
  MapPin,
  Stethoscope,
  Pill,
  FlaskConical,
  Scissors,
  Eye,
  FileText,
  Activity,
  AlertCircle,
  Syringe,
  TestTube,
  Scan,
  Heart
} from 'lucide-react'

type PatientTab = 'summary' | 'person' | 'encounter' | 'condition' | 'procedure' | 'medication' | 'laboratory' | 'pathology' | 'imaging' | 'functional' | 'vital' | 'allergy' | 'immunization'
type ClinicalTab = 'summary' | 'person' | 'visit' | 'condition' | 'drug' | 'measurement' | 'procedure' | 'observation'

export default function DataDashboardPage() {
  const [activeDb, setActiveDb] = useState<'patient' | 'clinical'>('patient')
  const [patientTab, setPatientTab] = useState<PatientTab>('summary')
  const [clinicalTab, setClinicalTab] = useState<ClinicalTab>('summary')

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold">데이터 대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'데이터베이스 통계 및 현황'}
          </p>
        </div>

        {/* DB Selection Tabs */}
        <Tabs value={activeDb} onValueChange={(v) => setActiveDb(v as 'patient' | 'clinical')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="patient" className="text-xs sm:text-sm truncate">환자 진료 DB (KR-CDI)</TabsTrigger>
            <TabsTrigger value="clinical" className="text-xs sm:text-sm truncate">임상시험 DB (통합 DB)</TabsTrigger>
          </TabsList>

          {/* Patient DB Content */}
          <TabsContent value="patient" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Tabs value={patientTab} onValueChange={(v) => setPatientTab(v as PatientTab)}>
                  <div className="overflow-x-auto -mx-2 px-2 mb-4">
                    <TabsList className="inline-flex w-auto min-w-full h-auto">
                      <TabsTrigger value="summary" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>요약</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Summary)</span>
                      </TabsTrigger>
                      <TabsTrigger value="person" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>환자</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Person)</span>
                      </TabsTrigger>
                      <TabsTrigger value="encounter" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>내원</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Encounter)</span>
                      </TabsTrigger>
                      <TabsTrigger value="condition" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          <span>진단</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Condition)</span>
                      </TabsTrigger>
                      <TabsTrigger value="procedure" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Scissors className="w-3 h-3" />
                          <span>수술/처치</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Procedure)</span>
                      </TabsTrigger>
                      <TabsTrigger value="medication" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          <span>약물</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Medication)</span>
                      </TabsTrigger>
                      <TabsTrigger value="laboratory" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" />
                          <span>진단검사</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Laboratory)</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="overflow-x-auto -mx-2 px-2 mb-4">
                    <TabsList className="inline-flex w-auto min-w-full h-auto">
                      <TabsTrigger value="pathology" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <TestTube className="w-3 h-3" />
                          <span>병리검사</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Pathology)</span>
                      </TabsTrigger>
                      <TabsTrigger value="imaging" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Scan className="w-3 h-3" />
                          <span>영상검사</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Imaging)</span>
                      </TabsTrigger>
                      <TabsTrigger value="functional" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>기능검사</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Functional)</span>
                      </TabsTrigger>
                      <TabsTrigger value="vital" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>활력징후</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Vital Signs)</span>
                      </TabsTrigger>
                      <TabsTrigger value="allergy" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>알레르기</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Allergy)</span>
                      </TabsTrigger>
                      <TabsTrigger value="immunization" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Syringe className="w-3 h-3" />
                          <span>예방접종</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Immunization)</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Patient Tab Contents */}
                  <TabsContent value="summary">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 환자 수</div>
                          <div className="text-2xl font-bold mt-1">15,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 내원 수</div>
                          <div className="text-2xl font-bold mt-1">48,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 진단 수</div>
                          <div className="text-2xl font-bold mt-1">32,891</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 처방 수</div>
                          <div className="text-2xl font-bold mt-1">95,432</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="person">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">등록 환자 수</div>
                          <div className="text-2xl font-bold mt-1">15,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">남성</div>
                          <div className="text-2xl font-bold mt-1">7,523</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">여성</div>
                          <div className="text-2xl font-bold mt-1">7,711</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="encounter">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 내원 수</div>
                          <div className="text-2xl font-bold mt-1">48,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">외래</div>
                          <div className="text-2xl font-bold mt-1">42,345</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">입원</div>
                          <div className="text-2xl font-bold mt-1">6,222</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="condition">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 진단 수</div>
                          <div className="text-2xl font-bold mt-1">32,891</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">주진단</div>
                          <div className="text-2xl font-bold mt-1">15,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">부진단</div>
                          <div className="text-2xl font-bold mt-1">17,657</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="procedure">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 수술/처치 수</div>
                          <div className="text-2xl font-bold mt-1">8,456</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">수술</div>
                          <div className="text-2xl font-bold mt-1">3,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">처치</div>
                          <div className="text-2xl font-bold mt-1">5,222</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="medication">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 처방 수</div>
                          <div className="text-2xl font-bold mt-1">95,432</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">경구제</div>
                          <div className="text-2xl font-bold mt-1">78,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">주사제</div>
                          <div className="text-2xl font-bold mt-1">17,198</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="laboratory">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 검사 수</div>
                          <div className="text-2xl font-bold mt-1">124,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">혈액검사</div>
                          <div className="text-2xl font-bold mt-1">56,789</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">기타 검사</div>
                          <div className="text-2xl font-bold mt-1">67,778</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="pathology">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 병리검사 수</div>
                          <div className="text-2xl font-bold mt-1">3,456</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">조직검사</div>
                          <div className="text-2xl font-bold mt-1">2,345</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">세포검사</div>
                          <div className="text-2xl font-bold mt-1">1,111</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="imaging">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 영상검사 수</div>
                          <div className="text-2xl font-bold mt-1">15,678</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">X-ray</div>
                          <div className="text-2xl font-bold mt-1">8,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">CT</div>
                          <div className="text-2xl font-bold mt-1">4,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">MRI</div>
                          <div className="text-2xl font-bold mt-1">2,877</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="functional">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 기능검사 수</div>
                          <div className="text-2xl font-bold mt-1">12,345</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">심전도</div>
                          <div className="text-2xl font-bold mt-1">6,789</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">폐기능</div>
                          <div className="text-2xl font-bold mt-1">5,556</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="vital">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">측정 횟수</div>
                          <div className="text-2xl font-bold mt-1">156,789</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">혈압</div>
                          <div className="text-2xl font-bold mt-1">48,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">체온</div>
                          <div className="text-2xl font-bold mt-1">48,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">맥박</div>
                          <div className="text-2xl font-bold mt-1">48,567</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="allergy">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">알레르기 기록 수</div>
                          <div className="text-2xl font-bold mt-1">2,345</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">약물 알레르기</div>
                          <div className="text-2xl font-bold mt-1">1,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">음식 알레르기</div>
                          <div className="text-2xl font-bold mt-1">778</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="immunization">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 접종 수</div>
                          <div className="text-2xl font-bold mt-1">8,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">독감 백신</div>
                          <div className="text-2xl font-bold mt-1">4,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">기타 백신</div>
                          <div className="text-2xl font-bold mt-1">3,667</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical DB Content */}
          <TabsContent value="clinical" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Tabs value={clinicalTab} onValueChange={(v) => setClinicalTab(v as ClinicalTab)}>
                  <div className="overflow-x-auto -mx-2 px-2 mb-4">
                    <TabsList className="inline-flex w-auto min-w-full h-auto">
                      <TabsTrigger value="summary" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>요약</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Summary)</span>
                      </TabsTrigger>
                      <TabsTrigger value="person" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>사람</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Person)</span>
                      </TabsTrigger>
                      <TabsTrigger value="visit" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>방문</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Visit)</span>
                      </TabsTrigger>
                      <TabsTrigger value="condition" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          <span>진단</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Condition)</span>
                      </TabsTrigger>
                      <TabsTrigger value="drug" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          <span>약물</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Drug)</span>
                      </TabsTrigger>
                      <TabsTrigger value="measurement" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" />
                          <span>검사</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Measurement)</span>
                      </TabsTrigger>
                      <TabsTrigger value="procedure" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Scissors className="w-3 h-3" />
                          <span>수술/처치</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Procedure)</span>
                      </TabsTrigger>
                      <TabsTrigger value="observation" className="text-xs py-2 flex-col h-auto gap-0 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>관찰정보</span>
                        </div>
                        <span className="text-[10px] opacity-60">(Observation)</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Clinical Tab Contents */}
                  <TabsContent value="summary">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 피험자 수</div>
                          <div className="text-2xl font-bold mt-1">3,456</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 방문 수</div>
                          <div className="text-2xl font-bold mt-1">12,890</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">진행중인 시험</div>
                          <div className="text-2xl font-bold mt-1">23</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">완료된 시험</div>
                          <div className="text-2xl font-bold mt-1">45</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="person">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">등록 피험자 수</div>
                          <div className="text-2xl font-bold mt-1">3,456</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">남성</div>
                          <div className="text-2xl font-bold mt-1">1,789</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">여성</div>
                          <div className="text-2xl font-bold mt-1">1,667</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="visit">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 방문 수</div>
                          <div className="text-2xl font-bold mt-1">12,890</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">스크리닝</div>
                          <div className="text-2xl font-bold mt-1">3,456</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">추적 방문</div>
                          <div className="text-2xl font-bold mt-1">9,434</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="condition">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 진단 기록 수</div>
                          <div className="text-2xl font-bold mt-1">8,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">기저질환</div>
                          <div className="text-2xl font-bold mt-1">4,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">이상반응</div>
                          <div className="text-2xl font-bold mt-1">3,667</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="drug">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 투약 기록 수</div>
                          <div className="text-2xl font-bold mt-1">25,678</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">시험약</div>
                          <div className="text-2xl font-bold mt-1">15,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">병용약물</div>
                          <div className="text-2xl font-bold mt-1">10,444</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="measurement">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 검사 수</div>
                          <div className="text-2xl font-bold mt-1">45,678</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">실험실 검사</div>
                          <div className="text-2xl font-bold mt-1">32,456</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">바이탈 측정</div>
                          <div className="text-2xl font-bold mt-1">13,222</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="procedure">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 시술 수</div>
                          <div className="text-2xl font-bold mt-1">2,345</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">생검</div>
                          <div className="text-2xl font-bold mt-1">1,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">영상유도 시술</div>
                          <div className="text-2xl font-bold mt-1">1,111</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="observation">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">총 관찰 기록 수</div>
                          <div className="text-2xl font-bold mt-1">18,234</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">효능 평가</div>
                          <div className="text-2xl font-bold mt-1">9,567</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-xs text-muted-foreground">안전성 평가</div>
                          <div className="text-2xl font-bold mt-1">8,667</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
