'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, ChevronLeft, ChevronRight, Save, ChevronDown, ChevronRight as ChevronRightIcon, Database, TableIcon, BarChart3 } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// 타입 정의 — BIKO_Data_Quality_DB(QC_SCHEMA) 구조 기반
// ─────────────────────────────────────────────────────────────

// dq_field — 컬럼 단위 정의 (※ 실데이터 미연동, 일부 테이블만 샘플)
type FieldInfo = {
  name: string      // 물리 컬럼명
  type: string      // Oracle 타입 (VARCHAR2/NUMBER/CLOB/TIMESTAMP ...)
  nullable: boolean
  description: string
}

// dq_table — 원천 테이블 정의 (§3.5 표시: 1~6, 16번 컬럼)
type TableInfo = {
  tableId: string         // table_id (T0000)
  tableName: string       // table_name (물리 테이블명)
  stage: string           // stage (LINK/PREP/COLL/OPEN)
  dataCategory: string    // data_category (1차생성_모집관리 등)
  tableRequired: string   // table_required (Y/R/R2/O)
  tableDescription: string// table_description (한글 설명)
  isEnable: boolean       // is_enable (사용 여부)
  columns?: FieldInfo[]   // dq_field 샘플 (확신 가능한 테이블만)
}

// dq_quality_metric — 품질 지표(구조적 검증) 정의
type QualityMetric = {
  id: number
  metricId: string  // QM000
  version: string   // version 관리
  category: string  // DQD 차원: 완전성/정합성/타당성
  checkLevel: '테이블' | '컬럼' | '컨셉'  // dq_table_check / dq_field_check / dq_concept_check
  name: string
  description: string
  targetTable: string
  // dq_quality_results 기반 최근 통과율 — 동일 지표를 단계별 DB에 수행 (§2.2 파이프라인)
  linkScore: number  // 연계DB(LINK) — QC1
  prepScore: number  // 전처리DB(PREP) — QC2/QC3
  threshold: number
  lastModified: string
  appliedDate: string
  isActive: boolean
}

// dq_statistics_metric + dq_achilles_analysis — 통계 지표(논리적 검증)
type StatMetric = {
  statId: string      // SI-<STAGE>-<DTYPE>-<METRIC>-<NN>
  category: string    // 데이터 유형 분류
  name: string
  description: string
  analysisId: string  // dq_achilles_analysis.analysis_id (QA00000000)
  distribution: boolean // 0=단순 count(dq_achilles_results) / 1=분포(dq_achilles_results_dist)
  version: string
  isActive: boolean
}

// ─────────────────────────────────────────────────────────────
// dq_table — 전체 테이블 목록 (실제 QC_SCHEMA.dq_table 적재 데이터)
//   columns 필드는 dq_field 미연동으로 일부 테이블만 샘플 제공
// ─────────────────────────────────────────────────────────────
const tablesData: TableInfo[] = [
  // 1차생성_모집관리 (RCM_*)
  { tableId: 'T1001', tableName: 'RCM_AGRE_RCNTT_RSRC_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_동의_철회_자원_정보', isEnable: true },
  { tableId: 'T1002', tableName: 'RCM_PRTPNT_APLCNT_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_참여자_신청자_정보', isEnable: true },
  { tableId: 'T1003', tableName: 'RCM_PRTPNT_APLY_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_참여자_신청_정보', isEnable: true,
    columns: [
      { name: 'PRTPNT_ID', type: 'VARCHAR2(20)', nullable: false, description: '참여자 ID' },
      { name: 'APLY_NO', type: 'VARCHAR2(30)', nullable: false, description: '신청번호' },
      { name: 'RCNTT_INST_CD', type: 'VARCHAR2(10)', nullable: false, description: '모집기관 코드' },
      { name: 'APLY_STTS_CD', type: 'VARCHAR2(10)', nullable: false, description: '신청상태 코드' },
      { name: 'APLY_DT', type: 'TIMESTAMP', nullable: false, description: '신청 일시' },
    ] },
  { tableId: 'T1004', tableName: 'RCM_PRTPNT_APLY_INST_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_참여자_신청_기관_정보', isEnable: true },
  { tableId: 'T1005', tableName: 'RCM_PRTPNT_APLY_WTCS_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_참여자_신청_동의서_정보', isEnable: true },
  { tableId: 'T1006', tableName: 'RCM_PRTPNT_FR_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_참여자_가족관계_정보', isEnable: true },
  { tableId: 'T1007', tableName: 'RCM_PRTPNT_WTCS_FILE_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_참여자_동의서_파일_정보', isEnable: true },
  { tableId: 'T1008', tableName: 'RCM_RCNTT_GNM_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_철회_유전체_정보', isEnable: true },
  { tableId: 'T1009', tableName: 'RCM_RCNTT_PRTPNT_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_철회_참여자_정보', isEnable: true },
  { tableId: 'T1010', tableName: 'RCM_RCNTT_RSRC_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_철회_자원_정보', isEnable: true },
  { tableId: 'T1011', tableName: 'RCM_RCNTT_SP_INFO', stage: 'LINK', dataCategory: '1차생성_모집관리', tableRequired: 'Y', tableDescription: '모집관리_철회_검체_정보', isEnable: true },

  // 1차생성_문검진 (HEALTH_CHECKUP_*, RCM_MEBI_*)
  { tableId: 'T1101', tableName: 'ETC_HEALTH_CHECKUP_RECORDS_RESPONSE', stage: 'LINK', dataCategory: '1차생성_문검진', tableRequired: 'Y', tableDescription: '기타건강검진기록지응답', isEnable: false },
  { tableId: 'T1102', tableName: 'HEALTH_CHECKUP_RECORDS', stage: 'LINK', dataCategory: '1차생성_문검진', tableRequired: 'Y', tableDescription: '건강검진기록지', isEnable: true,
    columns: [
      { name: 'RECORD_ID', type: 'VARCHAR2(20)', nullable: false, description: '기록지 ID' },
      { name: 'PRTPNT_ID', type: 'VARCHAR2(20)', nullable: false, description: '참여자 ID' },
      { name: 'CHECKUP_TYPE_CD', type: 'VARCHAR2(10)', nullable: false, description: '기록지 구분(일반/암/구강/생활습관)' },
      { name: 'CHECKUP_DT', type: 'TIMESTAMP', nullable: false, description: '검진 일시' },
    ] },
  { tableId: 'T1103', tableName: 'HEALTH_CHECKUP_RECORDS_ARTICLE', stage: 'LINK', dataCategory: '1차생성_문검진', tableRequired: 'Y', tableDescription: '건강검진기록지항목', isEnable: true },
  { tableId: 'T1104', tableName: 'HEALTH_CHECKUP_RECORDS_ARTICLE_RESPONSE_CATEGORY', stage: 'LINK', dataCategory: '1차생성_문검진', tableRequired: 'Y', tableDescription: '건강검진기록지항목응답범주', isEnable: true },
  { tableId: 'T1105', tableName: 'HEALTH_CHECKUP_RECORDS_RESPONSE', stage: 'LINK', dataCategory: '1차생성_문검진', tableRequired: 'Y', tableDescription: '건강검진기록지응답', isEnable: true,
    columns: [
      { name: 'RESPONSE_ID', type: 'VARCHAR2(24)', nullable: false, description: '응답 ID' },
      { name: 'RECORD_ID', type: 'VARCHAR2(20)', nullable: false, description: '기록지 ID(FK)' },
      { name: 'ARTICLE_CD', type: 'VARCHAR2(20)', nullable: false, description: '문항 코드' },
      { name: 'RESPONSE_VAL', type: 'CLOB', nullable: true, description: '응답 값(EAV)' },
    ] },
  { tableId: 'T1201', tableName: 'RCM_MEBI_EXCN_INFO', stage: 'LINK', dataCategory: '1차생성_문검진', tableRequired: 'Y', tableDescription: '모집관리_문진_실행_정보', isEnable: true },
  { tableId: 'T1202', tableName: 'RCM_MEBI_PTCP_INFO', stage: 'LINK', dataCategory: '1차생성_문검진', tableRequired: 'Y', tableDescription: '모집관리_문진_참여_정보', isEnable: true },

  // 공통 (COM_MEBI_*)
  { tableId: 'T1203', tableName: 'COM_MEBI_ANS_MST', stage: 'LINK', dataCategory: '공통', tableRequired: 'Y', tableDescription: '공통_문진_답변_마스터', isEnable: false },
  { tableId: 'T1204', tableName: 'COM_MEBI_ATCH_FILE_INFO', stage: 'LINK', dataCategory: '공통', tableRequired: 'Y', tableDescription: '공통_문진_첨부_파일_정보', isEnable: false },
  { tableId: 'T1205', tableName: 'COM_MEBI_LMT_MST', stage: 'LINK', dataCategory: '공통', tableRequired: 'Y', tableDescription: '공통_문진_제한_마스터', isEnable: false },
  { tableId: 'T1206', tableName: 'COM_MEBI_QSTN_MST', stage: 'LINK', dataCategory: '공통', tableRequired: 'Y', tableDescription: '공통_문진_질문_마스터', isEnable: false },
  { tableId: 'T1207', tableName: 'COM_MEBI_TYPE_MST', stage: 'LINK', dataCategory: '공통', tableRequired: 'Y', tableDescription: '공통_문진_유형_마스터', isEnable: false },

  // 1차생성_희귀질환(eCRF) (RDS_*)
  { tableId: 'T1301', tableName: 'RDS_PRTPNT_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_참여자_정보', isEnable: true },
  { tableId: 'T1302', tableName: 'RDS_PRTPNT_CRF_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_참여자_CRF_정보', isEnable: true,
    columns: [
      { name: 'PRTPNT_ID', type: 'VARCHAR2(20)', nullable: false, description: '참여자 ID' },
      { name: 'CRF_ID', type: 'VARCHAR2(20)', nullable: false, description: 'CRF ID' },
      { name: 'DISEASE_CD', type: 'VARCHAR2(20)', nullable: true, description: '질환 분류 코드' },
      { name: 'ENROLL_DT', type: 'TIMESTAMP', nullable: false, description: '등록 일시' },
    ] },
  { tableId: 'T1303', tableName: 'RDS_CLSF_CD_MST', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_분류_코드_마스터', isEnable: true },
  { tableId: 'T1304', tableName: 'RDS_CLSF_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_분류_정보', isEnable: true },
  { tableId: 'T1305', tableName: 'RDS_DRR_RSLT', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_진단참고용보고서_결과', isEnable: true },
  { tableId: 'T1306', tableName: 'RDS_DRR_RSLT_FILE', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_진단참고용보고서_결과_파일', isEnable: true },
  { tableId: 'T1307', tableName: 'RDS_DTL_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_상세_정보', isEnable: true },
  { tableId: 'T1308', tableName: 'RDS_FILE_RCPTN_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_파일_수신_정보', isEnable: true },
  { tableId: 'T1309', tableName: 'RDS_GENE_DRR_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_유전자_진단참고용보고서_정보', isEnable: true },
  { tableId: 'T1310', tableName: 'RDS_GENE_INSP_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_유전자_검사_정보', isEnable: true },
  { tableId: 'T1311', tableName: 'RDS_HPO_CD_MST', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_HPO_코드_마스터', isEnable: true },
  { tableId: 'T1312', tableName: 'RDS_PBD_CD_MST', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_추정진단_코드_마스터', isEnable: true },
  { tableId: 'T1313', tableName: 'RDS_PBD_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_추정진단_정보', isEnable: true },
  { tableId: 'T1314', tableName: 'RDS_PHA_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_표현형이상_정보', isEnable: true },
  { tableId: 'T1315', tableName: 'RDS_PRTPNT_GNM_FILE_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_참여자_유전체_파일_정보', isEnable: true },
  { tableId: 'T1316', tableName: 'RDS_PRTPNT_RCPTN_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_참여자_수신_정보', isEnable: true },
  { tableId: 'T1317', tableName: 'RDS_REG_CRTR_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_등록_기준_정보', isEnable: true },
  { tableId: 'T1318', tableName: 'RDS_VRTE_GENE_DRR_INFO', stage: 'LINK', dataCategory: '1차생성_희귀질환(eCRF)', tableRequired: 'Y', tableDescription: '희귀질환_진단_참고_보고_유전자_변종', isEnable: true },

  // 1차생성_기초임상(KR-CDI) (BIKO_*) — table_required 등급 R/R2/O
  { tableId: 'T1401', tableName: 'BIKO_INFO_PATIENT', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '환자 정보 (Patient Information)', isEnable: true,
    columns: [
      { name: 'PATIENT_ID', type: 'VARCHAR2(20)', nullable: false, description: '환자 ID(참여자ID)' },
      { name: 'BIRTH_DATE', type: 'VARCHAR2(8)', nullable: false, description: '생년월일(YYYYMMDD)' },
      { name: 'GENDER', type: 'CHAR(1)', nullable: false, description: '성별(M/F)' },
      { name: 'DEATH_DATE', type: 'VARCHAR2(8)', nullable: true, description: '사망일' },
    ] },
  { tableId: 'T1402', tableName: 'BIKO_INFO_ORGANIZATION', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '의료기관 정보 (Healthcare Facility Information)', isEnable: true },
  { tableId: 'T1403', tableName: 'BIKO_INFO_ENCOUNTER', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '내원 정보 (Encounter Information)', isEnable: true,
    columns: [
      { name: 'ENCOUNTER_ID', type: 'VARCHAR2(20)', nullable: false, description: '내원 ID' },
      { name: 'PATIENT_ID', type: 'VARCHAR2(20)', nullable: false, description: '환자 ID(FK)' },
      { name: 'ENCOUNTER_TYPE', type: 'VARCHAR2(10)', nullable: false, description: '진료 구분' },
      { name: 'START_DATE', type: 'TIMESTAMP', nullable: false, description: '내원 시작일자' },
      { name: 'END_DATE', type: 'TIMESTAMP', nullable: true, description: '내원 종료일자' },
    ] },
  { tableId: 'T1404', tableName: 'BIKO_CARE_CONDITION', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '진단 및 주호소 정보 (Diagnosis and Chief Complaint Information)', isEnable: true,
    columns: [
      { name: 'CONDITION_ID', type: 'VARCHAR2(20)', nullable: false, description: '진단 ID' },
      { name: 'PATIENT_ID', type: 'VARCHAR2(20)', nullable: false, description: '환자 ID(FK)' },
      { name: 'DIAGNOSIS_CD', type: 'VARCHAR2(10)', nullable: false, description: '진단명(KCD)' },
      { name: 'CONDITION_DATE', type: 'TIMESTAMP', nullable: false, description: '진단 일자' },
    ] },
  { tableId: 'T1405', tableName: 'BIKO_CARE_PROCEDURE', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '수술 및 처치 정보 (Surgical and Procedural Information)', isEnable: true },
  { tableId: 'T1406', tableName: 'BIKO_CARE_MEDICATION', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '약물 처방 정보 (Medication Information)', isEnable: true,
    columns: [
      { name: 'MEDICATION_ID', type: 'VARCHAR2(20)', nullable: false, description: '처방 ID' },
      { name: 'PATIENT_ID', type: 'VARCHAR2(20)', nullable: false, description: '환자 ID(FK)' },
      { name: 'DRUG_CD', type: 'VARCHAR2(20)', nullable: false, description: '약품 성분명(ATC/EDI)' },
      { name: 'DOSE', type: 'BINARY_DOUBLE', nullable: true, description: '1회량' },
      { name: 'PRESCRIBE_DATE', type: 'TIMESTAMP', nullable: false, description: '처방 일자' },
    ] },
  { tableId: 'T1407', tableName: 'BIKO_EXAM_LABORATORY', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '진단검사(핵의학검사 포함) 정보 (Laboratory Test)', isEnable: true,
    columns: [
      { name: 'LAB_ID', type: 'VARCHAR2(20)', nullable: false, description: '검사 ID' },
      { name: 'PATIENT_ID', type: 'VARCHAR2(20)', nullable: false, description: '환자 ID(FK)' },
      { name: 'TEST_CD', type: 'VARCHAR2(20)', nullable: false, description: '진단검사명(LOINC)' },
      { name: 'RESULT_VAL', type: 'BINARY_DOUBLE', nullable: true, description: '진단검사 결과' },
      { name: 'RESULT_UNIT', type: 'VARCHAR2(20)', nullable: true, description: '결과 단위(UCUM)' },
    ] },
  { tableId: 'T1408', tableName: 'BIKO_EXAM_PATHOLOGY', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '병리검사 정보 (Pathology Examination)', isEnable: true },
  { tableId: 'T1409', tableName: 'BIKO_EXAM_IMAGING', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '진단영상검사(핵의학검사 포함) 정보 (Diagnostic Imaging Test)', isEnable: true },
  { tableId: 'T1410', tableName: 'BIKO_EXAM_FUNCTIONAL', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '기능검사 정보 (Functional Test)', isEnable: true },
  { tableId: 'T1411', tableName: 'BIKO_HEALTH_VITAL_SIGN', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R', tableDescription: '활력징후 및 신체 계측 정보 (Vital Signs and Body Measurements)', isEnable: true },
  { tableId: 'T1412', tableName: 'BIKO_HEALTH_ALLERGY', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R2', tableDescription: '알레르기 불내성 정보 (Allergy and Intolerance)', isEnable: true },
  { tableId: 'T1413', tableName: 'BIKO_HEALTH_IMMUNIZATION', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'R2', tableDescription: '예방접종 내역 정보 (Immunization History)', isEnable: true },
  { tableId: 'T1414', tableName: 'BIKO_REF_IMAGING_STUDY', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'O', tableDescription: 'DICOM 이미지 정보 (Imaging Study Information)', isEnable: true },
  { tableId: 'T1415', tableName: 'BIKO_REF_MEDIA', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'O', tableDescription: '참고자료 정보 (Clinical Media Information)', isEnable: true },
  { tableId: 'T1416', tableName: 'BIKO_REF_DOCUMENT', stage: 'LINK', dataCategory: '1차생성_기초임상(KR-CDI)', tableRequired: 'O', tableDescription: '진료기록 및 기타문서 정보 (Clinical Document Information)', isEnable: true },

  // 2차연계_의무기록(TFN) (TFN_*) — PHR
  { tableId: 'T2001', tableName: 'TFN_ALGY', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_알러지및부작용', isEnable: true },
  { tableId: 'T2002', tableName: 'TFN_DIAG', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_진단', isEnable: true,
    columns: [
      { name: 'DIAG_ID', type: 'VARCHAR2(20)', nullable: false, description: '진단 ID' },
      { name: 'PATIENT_ID', type: 'VARCHAR2(20)', nullable: false, description: '환자 ID(FK)' },
      { name: 'DIAG_CD', type: 'VARCHAR2(10)', nullable: false, description: '진단 코드(KCD)' },
      { name: 'DIAG_DT', type: 'TIMESTAMP', nullable: true, description: '진단 일자' },
    ] },
  { tableId: 'T2003', tableName: 'TFN_INSP_FUNC', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_기타검사', isEnable: true },
  { tableId: 'T2004', tableName: 'TFN_INSP_LAB', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_진단검사', isEnable: true },
  { tableId: 'T2005', tableName: 'TFN_INSP_PATHO', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_병리검사', isEnable: true },
  { tableId: 'T2006', tableName: 'TFN_INSP_RADIO', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_영상검사', isEnable: true },
  { tableId: 'T2007', tableName: 'TFN_ORG', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_의료기관', isEnable: true },
  { tableId: 'T2008', tableName: 'TFN_PATIENT', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_환자', isEnable: true },
  { tableId: 'T2009', tableName: 'TFN_PRCTDR', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_진료의', isEnable: true },
  { tableId: 'T2010', tableName: 'TFN_PRCTDRRL', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_진료의역할', isEnable: true },
  { tableId: 'T2011', tableName: 'TFN_PSCRIP', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_약물처방', isEnable: true },
  { tableId: 'T2012', tableName: 'TFN_SURGERY', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_수술내역', isEnable: true },
  { tableId: 'T2013', tableName: 'TFN_VHOSP', stage: 'LINK', dataCategory: '2차연계_의무기록(TFN)', tableRequired: 'Y', tableDescription: 'PHR_내원', isEnable: true },

  // 2차연계_공공데이터(PUB) (PUB_*)
  { tableId: 'T2101', tableName: 'PUB_CLAIM_HISTORY', stage: 'LINK', dataCategory: '2차연계_공공데이터(PUB)', tableRequired: 'Y', tableDescription: '공공데이터_보험청구', isEnable: true,
    columns: [
      { name: 'CLAIM_ID', type: 'VARCHAR2(24)', nullable: false, description: '청구 ID' },
      { name: 'PATIENT_ID', type: 'VARCHAR2(20)', nullable: false, description: '환자 ID(FK)' },
      { name: 'CLAIM_DT', type: 'TIMESTAMP', nullable: false, description: '청구 일자' },
      { name: 'DIAG_CD', type: 'VARCHAR2(10)', nullable: true, description: '상병 코드' },
    ] },
  { tableId: 'T2102', tableName: 'PUB_DIAGNOSTIC_REPORT', stage: 'LINK', dataCategory: '2차연계_공공데이터(PUB)', tableRequired: 'Y', tableDescription: '공공데이터_건강검진', isEnable: true },
  { tableId: 'T2103', tableName: 'PUB_MEDICATION', stage: 'LINK', dataCategory: '2차연계_공공데이터(PUB)', tableRequired: 'Y', tableDescription: '공공데이터_투약', isEnable: true },
  { tableId: 'T2104', tableName: 'PUB_OBSERVATION', stage: 'LINK', dataCategory: '2차연계_공공데이터(PUB)', tableRequired: 'Y', tableDescription: '공공데이터_Observation', isEnable: true },
  { tableId: 'T2105', tableName: 'PUB_VACCINATION', stage: 'LINK', dataCategory: '2차연계_공공데이터(PUB)', tableRequired: 'Y', tableDescription: '공공데이터_예방접종', isEnable: true },
  { tableId: 'T2106', tableName: 'PUB_VISIT_HOSPITAL', stage: 'LINK', dataCategory: '2차연계_공공데이터(PUB)', tableRequired: 'Y', tableDescription: '공공데이터_내원', isEnable: true },

  // 2차연계_PGHD (PUB_PGHD*)
  { tableId: 'T2201', tableName: 'PUB_PGHD', stage: 'LINK', dataCategory: '2차연계_PGHD', tableRequired: 'Y', tableDescription: '공공_PGHD', isEnable: true },
  { tableId: 'T2202', tableName: 'PUB_PGHD_ITEM_MST', stage: 'LINK', dataCategory: '2차연계_PGHD', tableRequired: 'Y', tableDescription: '공공_PGHD_항목_마스터', isEnable: true },
  { tableId: 'T2203', tableName: 'PUB_PGHD_STATISTICS', stage: 'LINK', dataCategory: '2차연계_PGHD', tableRequired: 'Y', tableDescription: '공공_PGHD_통계', isEnable: true },
]

// ─────────────────────────────────────────────────────────────
// 품질 지표 데이터 (dq_quality_metric) — 구조적 검증
//   targetTable 은 dq_table.table_name 과 일치
// ─────────────────────────────────────────────────────────────
const qualityMetricsData: QualityMetric[] = [
  { id: 1, metricId: 'QM001', version: 'v1.3', category: '완전성', checkLevel: '컬럼', name: '환자 필수항목 결측 검증', description: 'BIKO_INFO_PATIENT 환자ID/성별/생년월일 결측 검사', targetTable: 'BIKO_INFO_PATIENT', linkScore: 99.2, prepScore: 99.6, threshold: 99, lastModified: '2026-05-11', appliedDate: '2026-05-12', isActive: true },
  { id: 2, metricId: 'QM002', version: 'v1.3', category: '완전성', checkLevel: '테이블', name: '내원 레코드 존재 검증', description: 'BIKO_INFO_ENCOUNTER 환자별 내원 기록 존재 여부', targetTable: 'BIKO_INFO_ENCOUNTER', linkScore: 97.8, prepScore: 98.4, threshold: 95, lastModified: '2026-05-11', appliedDate: '2026-05-12', isActive: true },
  { id: 3, metricId: 'QM003', version: 'v1.1', category: '정합성', checkLevel: '컬럼', name: '진단코드 표준 적합성', description: 'BIKO_CARE_CONDITION 진단코드 KCD 표준 코드 적합 여부', targetTable: 'BIKO_CARE_CONDITION', linkScore: 95.6, prepScore: 96.9, threshold: 95, lastModified: '2026-04-27', appliedDate: '2026-04-28', isActive: true },
  { id: 4, metricId: 'QM004', version: 'v1.1', category: '정합성', checkLevel: '컬럼', name: '약물코드 표준 적합성', description: 'BIKO_CARE_MEDICATION 약물코드 ATC/EDI 표준 적합 여부', targetTable: 'BIKO_CARE_MEDICATION', linkScore: 93.1, prepScore: 94.8, threshold: 93, lastModified: '2026-04-27', appliedDate: '2026-04-28', isActive: true },
  { id: 5, metricId: 'QM005', version: 'v1.2', category: '타당성', checkLevel: '컨셉', name: '진단 없는 약물 처방 검출', description: '고혈압 진단 없이 고혈압 약물이 처방된 케이스 검출', targetTable: 'BIKO_CARE_MEDICATION', linkScore: 88.4, prepScore: 90.2, threshold: 90, lastModified: '2026-05-03', appliedDate: '2026-05-04', isActive: true },
  { id: 6, metricId: 'QM006', version: 'v0.7', category: '완전성', checkLevel: '컬럼', name: '문검진 응답값 결측', description: 'HEALTH_CHECKUP_RECORDS_RESPONSE 필수 문항 응답 결측 검사', targetTable: 'HEALTH_CHECKUP_RECORDS_RESPONSE', linkScore: 96.3, prepScore: 97.1, threshold: 95, lastModified: '2026-04-27', appliedDate: '2026-04-28', isActive: true },
  { id: 7, metricId: 'QM007', version: 'v0.7', category: '정합성', checkLevel: '컬럼', name: 'CRF 참여자ID 형식 적합성', description: 'RDS_PRTPNT_CRF_INFO 참여자ID 형식/길이 적합 여부', targetTable: 'RDS_PRTPNT_CRF_INFO', linkScore: 98.9, prepScore: 99.1, threshold: 98, lastModified: '2026-04-27', appliedDate: '2026-04-28', isActive: true },
  { id: 8, metricId: 'QM008', version: 'v0.8', category: '타당성', checkLevel: '컨셉', name: '검사결과 정상범위 이탈', description: 'BIKO_EXAM_LABORATORY 검사결과값 LOINC 정상범위 이탈 검출', targetTable: 'BIKO_EXAM_LABORATORY', linkScore: 91.2, prepScore: 92.5, threshold: 90, lastModified: '2026-05-03', appliedDate: '2026-05-04', isActive: true },
  { id: 9, metricId: 'QM009', version: 'v0.3', category: '완전성', checkLevel: '테이블', name: '신청정보 누락 검증', description: 'RCM_PRTPNT_APLY_INFO 참여자별 신청정보 누락 여부', targetTable: 'RCM_PRTPNT_APLY_INFO', linkScore: 99.5, prepScore: 99.7, threshold: 99, lastModified: '2026-04-10', appliedDate: '2026-04-10', isActive: true },
  { id: 10, metricId: 'QM010', version: 'v1.1', category: '정합성', checkLevel: '컬럼', name: '검사 단위 적합성', description: 'BIKO_EXAM_LABORATORY 결과 단위 UCUM 표준 적합 여부', targetTable: 'BIKO_EXAM_LABORATORY', linkScore: 94.7, prepScore: 95.9, threshold: 93, lastModified: '2026-04-27', appliedDate: '2026-04-28', isActive: false },
  { id: 11, metricId: 'QM011', version: 'v1.2', category: '타당성', checkLevel: '컨셉', name: '사망일 이후 내원 검출', description: '사망일자 이후의 내원/진료 기록 존재 검출', targetTable: 'BIKO_INFO_ENCOUNTER', linkScore: 99.8, prepScore: 99.9, threshold: 99, lastModified: '2026-05-03', appliedDate: '2026-05-04', isActive: true },
  { id: 12, metricId: 'QM012', version: 'v0.3', category: '완전성', checkLevel: '컬럼', name: '진단일자 결측 검증', description: 'TFN_DIAG 진단일자 결측 검사', targetTable: 'TFN_DIAG', linkScore: 90.4, prepScore: 92.1, threshold: 90, lastModified: '2026-04-10', appliedDate: '2026-04-10', isActive: false },
  { id: 13, metricId: 'QM013', version: 'v0.3', category: '정합성', checkLevel: '컬럼', name: '청구일자 범위 적합성', description: 'PUB_CLAIM_HISTORY 청구일자 유효 범위 적합 여부', targetTable: 'PUB_CLAIM_HISTORY', linkScore: 97.2, prepScore: 97.8, threshold: 95, lastModified: '2026-04-10', appliedDate: '2026-04-10', isActive: true },
  { id: 14, metricId: 'QM014', version: 'v1.2', category: '타당성', checkLevel: '컨셉', name: '연령-진단 불일치 검출', description: '연령대와 부합하지 않는 진단(소아 vs 노인성 질환) 검출', targetTable: 'BIKO_CARE_CONDITION', linkScore: 89.6, prepScore: 91.3, threshold: 90, lastModified: '2026-05-03', appliedDate: '2026-05-04', isActive: true },
]

// ─────────────────────────────────────────────────────────────
// 통계 지표 데이터 (dq_statistics_metric + dq_achilles_analysis)
// ─────────────────────────────────────────────────────────────
const statMetricsData: StatMetric[] = [
  { statId: 'SI-LINK-HC-CNT-01', category: '문검진', name: '문검진 응답 건수', description: '문진·검진 항목별 응답 레코드 수', analysisId: 'QA00000001', distribution: false, version: 'v0.1', isActive: true },
  { statId: 'SI-LINK-HC-DIST-02', category: '문검진', name: '문항별 응답 분포', description: '문진 문항별 응답값 분포', analysisId: 'QA00000002', distribution: true, version: 'v0.1', isActive: true },
  { statId: 'SI-LINK-CDI-CNT-01', category: 'KR-CDI', name: '환자 수', description: 'BIKO_INFO_PATIENT 고유 환자 수', analysisId: 'QA00000010', distribution: false, version: 'v0.2', isActive: true },
  { statId: 'SI-LINK-CDI-CNT-02', category: 'KR-CDI', name: '내원 건수', description: 'BIKO_INFO_ENCOUNTER 내원 사건 수', analysisId: 'QA00000011', distribution: false, version: 'v0.2', isActive: true },
  { statId: 'SI-LINK-CDI-DIST-03', category: 'KR-CDI', name: '진단코드 분포', description: 'KCD 진단코드별 상위 분포', analysisId: 'QA00000012', distribution: true, version: 'v0.3', isActive: true },
  { statId: 'SI-LINK-CDI-DIST-04', category: 'KR-CDI', name: '연령대별 환자 분포', description: '10세 단위 연령대별 환자 분포', analysisId: 'QA00000013', distribution: true, version: 'v0.3', isActive: true },
  { statId: 'SI-LINK-CDI-DIST-05', category: 'KR-CDI', name: '검사결과값 분포', description: 'LOINC 검사항목별 결과값 분포', analysisId: 'QA00000014', distribution: true, version: 'v0.3', isActive: false },
  { statId: 'SI-LINK-EC-CNT-01', category: 'eCRF', name: 'eCRF 참여자 수', description: 'RDS_PRTPNT_CRF_INFO 고유 참여자 수', analysisId: 'QA00000020', distribution: false, version: 'v0.2', isActive: true },
  { statId: 'SI-LINK-EC-DIST-02', category: 'eCRF', name: 'HPO 표현형 분포', description: 'HPO 코드별 표현형 빈도 분포', analysisId: 'QA00000021', distribution: true, version: 'v0.3', isActive: true },
  { statId: 'SI-LINK-MEBI-DIST-01', category: '문검진', name: '성별 분포', description: '참여자 성별 분포', analysisId: 'QA00000030', distribution: true, version: 'v0.4', isActive: true },
]

// table_required 등급 배지 색
const requiredVariant = (req: string): 'default' | 'secondary' | 'outline' => {
  if (req === 'R') return 'default'
  if (req === 'R2' || req === 'O') return 'secondary'
  return 'outline'
}

export default function IndicatorsPage() {
  const router = useRouter()
  const [tableSearchTerm, setTableSearchTerm] = useState('')
  const [tableCategoryFilter, setTableCategoryFilter] = useState<string>('all')
  const [showDisabled, setShowDisabled] = useState(false)
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null)

  // 품질지표 목록 상태
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [metrics, setMetrics] = useState<QualityMetric[]>(qualityMetricsData)

  const categories = ['완전성', '정합성', '타당성']
  const uniqueCategories = Array.from(new Set(tablesData.map(t => t.dataCategory)))

  const handleMetricClick = (metricId: number) => {
    router.push(`/dashboard/indicators/${metricId}`)
  }

  const handleToggleActive = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setMetrics(prev => prev.map(item =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ))
  }

  // 테이블 필터링
  const filteredTables = tablesData.filter((table) => {
    const term = tableSearchTerm.toLowerCase()
    const matchesSearch = table.tableName.toLowerCase().includes(term) ||
                          table.tableDescription.toLowerCase().includes(term) ||
                          table.tableId.toLowerCase().includes(term)
    const matchesCategory = tableCategoryFilter === 'all' || table.dataCategory === tableCategoryFilter
    const matchesEnable = showDisabled || table.isEnable
    return matchesSearch && matchesCategory && matchesEnable
  })

  // 품질지표 필터링
  const filteredData = metrics.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.metricId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const getScoreColor = (score: number, threshold: number) => {
    if (score >= threshold + 3) return 'text-green-600'
    if (score >= threshold) return 'text-blue-600'
    if (score >= threshold - 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">{'지표DB 관리'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'원천 테이블 · 품질지표 · 통계지표 관리'}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tables">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tables" className="gap-1.5 text-sm">
              <Database className="w-3.5 h-3.5" />
              {'테이블 목록'}
            </TabsTrigger>
            <TabsTrigger value="indicators" className="gap-1.5 text-sm">
              <TableIcon className="w-3.5 h-3.5" />
              {'품질지표'}
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5 text-sm">
              <BarChart3 className="w-3.5 h-3.5" />
              {'통계지표'}
            </TabsTrigger>
          </TabsList>

          {/* Tables Tab — dq_table (§3.5: 1~6,16번) ⨝ dq_field */}
          <TabsContent value="tables" className="space-y-4 mt-4">
            {/* Search and Filter */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="테이블명, 설명 또는 테이블ID 검색..."
                      value={tableSearchTerm}
                      onChange={(e) => setTableSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={tableCategoryFilter}
                    onChange={(e) => setTableCategoryFilter(e.target.value)}
                    className="h-9 px-3 text-sm border rounded-md bg-background"
                  >
                    <option value="all">{'전체 분류'}</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
                    <Checkbox checked={showDisabled} onCheckedChange={(v) => setShowDisabled(!!v)} />
                    {'미사용 포함'}
                  </label>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">
              {'총 '}{filteredTables.length}{'개 테이블'}
            </p>

            {/* Table List */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8 text-xs"></TableHead>
                      <TableHead className="w-24 text-xs">{'테이블ID'}</TableHead>
                      <TableHead className="text-xs">{'테이블명'}</TableHead>
                      <TableHead className="w-20 text-center text-xs">{'단계'}</TableHead>
                      <TableHead className="w-44 text-xs">{'분류'}</TableHead>
                      <TableHead className="w-20 text-center text-xs">{'등급'}</TableHead>
                      <TableHead className="text-xs">{'설명'}</TableHead>
                      <TableHead className="w-20 text-center text-xs">{'사용'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTables.map((table) => (
                      <>
                        <TableRow
                          key={table.tableId}
                          className={`cursor-pointer hover:bg-muted/50 ${!table.isEnable ? 'opacity-50' : ''}`}
                          onClick={() => setExpandedTableId(expandedTableId === table.tableId ? null : table.tableId)}
                        >
                          <TableCell className="text-center">
                            {expandedTableId === table.tableId ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">{table.tableId}</TableCell>
                          <TableCell className="text-sm font-mono font-medium">{table.tableName}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">{table.stage}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{table.dataCategory}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={requiredVariant(table.tableRequired)} className="text-xs">{table.tableRequired}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{table.tableDescription}</TableCell>
                          <TableCell className="text-center text-xs">
                            {table.isEnable ? (
                              <span className="font-medium text-foreground">{'Y'}</span>
                            ) : (
                              <span className="text-muted-foreground">{'N'}</span>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Expanded Column Details (dq_field) */}
                        {expandedTableId === table.tableId && (
                          <TableRow key={`${table.tableId}-columns`}>
                            <TableCell colSpan={8} className="p-0 bg-muted/20">
                              <div className="px-8 py-3">
                                {table.columns && table.columns.length > 0 ? (
                                  <>
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                                      {'컬럼(dq_field) — 샘플 '}{table.columns.length}{'개'}
                                    </p>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="text-xs">{'컬럼명'}</TableHead>
                                          <TableHead className="text-xs">{'타입'}</TableHead>
                                          <TableHead className="w-20 text-center text-xs">{'NULL'}</TableHead>
                                          <TableHead className="text-xs">{'설명'}</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {table.columns.map((col) => (
                                          <TableRow key={col.name}>
                                            <TableCell className="text-xs font-mono font-medium">{col.name}</TableCell>
                                            <TableCell>
                                              <Badge variant="secondary" className="text-xs font-mono">
                                                {col.type}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-center text-xs">
                                              {col.nullable ? (
                                                <span className="text-muted-foreground">{'O'}</span>
                                              ) : (
                                                <span className="font-medium text-foreground">{'X'}</span>
                                              )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{col.description}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </>
                                ) : (
                                  <p className="text-xs text-muted-foreground py-2">
                                    {'컬럼 정의(dq_field)는 연동 예정입니다 — table_id 기준 dq_table ⨝ dq_field 조인'}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Metrics Tab — dq_quality_metric */}
          <TabsContent value="indicators" className="space-y-4 mt-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="지표명, 설명 또는 지표ID 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 px-3 text-sm border rounded-md bg-background"
                    >
                      <option value="all">{'전체 차원'}</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      className="h-9 gap-1.5"
                      onClick={() => alert('지표 적용 설정이 저장되었습니다.')}
                    >
                      <Save className="w-3.5 h-3.5" />
                      {'적용'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Count */}
            <p className="text-sm text-muted-foreground">
              {'총 '}{metrics.length}{'개 품질지표 (활성: '}{metrics.filter(i => i.isActive).length}{'개)'}
            </p>

            {/* Table */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{'페이지당 표시'}</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="h-8 px-3 py-1 text-sm border rounded-md bg-background"
                    >
                      <option value={5}>{'5개'}</option>
                      <option value={10}>{'10개'}</option>
                      <option value={20}>{'20개'}</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {startIndex + 1}-{Math.min(endIndex, filteredData.length)} / {filteredData.length}{'개'}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-7 px-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-7 px-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-xs">{'적용'}</TableHead>
                      <TableHead className="w-20 text-xs">{'지표ID'}</TableHead>
                      <TableHead className="w-16 text-xs">{'버전'}</TableHead>
                      <TableHead className="w-20 text-xs">{'차원'}</TableHead>
                      <TableHead className="w-20 text-xs">{'검증단위'}</TableHead>
                      <TableHead className="text-xs">{'지표명'}</TableHead>
                      <TableHead className="text-xs">{'적용 테이블'}</TableHead>
                      <TableHead className="w-20 text-center text-xs">{'기준값'}</TableHead>
                      <TableHead className="w-24 text-center text-xs">{'연계DB'}</TableHead>
                      <TableHead className="w-24 text-center text-xs">{'전처리DB'}</TableHead>
                      <TableHead className="w-28 text-xs">{'수정일'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleMetricClick(item.id)}
                      >
                        <TableCell onClick={(e) => handleToggleActive(item.id, e)}>
                          <Checkbox checked={item.isActive} />
                        </TableCell>
                        <TableCell className="text-xs font-mono font-medium">{item.metricId}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.version}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {item.checkLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{item.name}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{item.targetTable}</TableCell>
                        <TableCell className="text-center text-xs font-medium">
                          {item.threshold}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`text-sm font-bold ${getScoreColor(item.linkScore, item.threshold)}`}
                          >
                            {item.linkScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`text-sm font-bold ${getScoreColor(item.prepScore, item.threshold)}`}
                          >
                            {item.prepScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.lastModified}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab — dq_statistics_metric + dq_achilles_analysis */}
          <TabsContent value="stats" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {'총 '}{statMetricsData.length}{'개 통계지표 (Achilles 기반)'}
            </p>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-44 text-xs">{'통계지표 ID'}</TableHead>
                      <TableHead className="w-24 text-xs">{'분류'}</TableHead>
                      <TableHead className="text-xs">{'지표명'}</TableHead>
                      <TableHead className="text-xs">{'설명'}</TableHead>
                      <TableHead className="w-32 text-xs">{'분석 ID'}</TableHead>
                      <TableHead className="w-24 text-center text-xs">{'결과 유형'}</TableHead>
                      <TableHead className="w-16 text-xs">{'버전'}</TableHead>
                      <TableHead className="w-20 text-center text-xs">{'상태'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statMetricsData.map((stat) => (
                      <TableRow key={stat.statId} className="hover:bg-muted/50 cursor-pointer">
                        <TableCell className="text-xs font-mono font-medium">{stat.statId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{stat.category}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{stat.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{stat.description}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{stat.analysisId}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {stat.distribution ? '분포' : 'count'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{stat.version}</TableCell>
                        <TableCell className="text-center text-xs">
                          <Badge variant={stat.isActive ? 'secondary' : 'destructive'} className="text-xs">
                            {stat.isActive ? '활성' : '비활성'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
