export type TermCategory = '평가요소' | '면접방식' | '답변기법' | '면접규칙' | '입시용어';

export interface GlossaryTerm {
  id: string;
  term: string;
  category: TermCategory;
  easySummary: string; // 쉬운 한 줄 요약
  detailedExplanation: string; // 친절한 설명
  goodExample: string; // 실전 예시 (학생의 좋은 발화)
  badExample: string; // 흔한 실수 (피해야 할 발화)
  interviewerIntent: string; // 면접관의 속마음
  tags: string[];
}

export type ActivityCategory = '과목세특' | '동아리' | '자율활동' | '진로활동' | '봉사/독서' | '개인탐구';

export interface ExperienceCard {
  id: string;
  category: ActivityCategory;
  title: string;
  subjectOrClub: string; // 과목명 또는 동아리명
  gradeLevel: '1학년' | '2학년' | '3학년';
  keywords: string[];
  // STAR Framework
  situation: string; // 상황 (계기, 당시 문제 상황)
  task: string; // 과제 (해결해야 했던 목표, 내 역할)
  action: string; // 구체적 행동 (내가 직접 읽은 책, 실험, 시도, 극복 방법)
  resultLearned: string; // 결과 및 배운 점 (내적 성장, 변화, 대학 진학 후 확장 계획)
  updatedAt: string;
}

export type QuestionField = '공통' | '인문/사회/경영' | '자연/공학/IT' | '의약/바이오/보건' | '교육/사범' | '예체능/자유';
export type EvaluationCategory = '학업역량' | '진로역량' | '공동체역량' | '발전가능성';

export interface QuestionItem {
  id: string;
  field: QuestionField;
  evaluationCategory: EvaluationCategory;
  questionText: string;
  intent: string; // 질문의 의도 (면접관이 진짜 보고 싶은 것)
  coreCheckpoints: string[]; // 반드시 담아야 할 핵심 3가지
  suggestedTailQuestions: string[]; // 예상 꼬리질문 3개
  deoksinTip?: string; // 덕신고 학생을 위한 맞춤 조언
  sampleGoodAnswer?: {
    twoGwal: string;
    bodyAction: string;
    conclusion: string;
  };
}

export interface RubricScores {
  academicCompetence: number; // 학업역량 (1~5)
  careerFit: number; // 진로역량/전공적합성 (1~5)
  communitySpirit: number; // 공동체역량/인성 (1~5)
  logicalCoherence: number; // 논리적 구성(두괄식/구체성) (1~5)
  deliveryAttitude: number; // 전달력 및 면접 태도 (1~5)
}

export interface TeacherFeedback {
  teacherName: string;
  evaluatedAt: string;
  scores: RubricScores;
  overallComment: string;
  praisePoints: string[];
  improvementPoints: string[];
  teacherTailQuestion?: string; // 교사가 던진 날카로운 추가 꼬리질문
  revisionChecklist: {
    id: string;
    text: string;
    checkedByStudent: boolean;
  }[];
}

export interface StudentAnswer {
  id: string;
  questionId: string;
  questionText: string;
  evaluationCategory: EvaluationCategory;
  field: QuestionField;
  // 1차 답변 (초안)
  draft: {
    twoGwal: string; // 두괄식 첫 문장
    bodyAction: string; // 구체적 행동과 극복 과정
    closingLearned: string; // 배운 점 및 느낀 점
    fullText: string;
    charCount: number;
    estimatedSeconds: number; // 읽기 예상 시간(초)
  };
  // 꼬리질문 대응
  tailAnswers: {
    id: string;
    tailQuestion: string;
    answer: string;
  }[];
  // 2차 수정 완성본
  revisedAnswer?: {
    twoGwal: string;
    bodyAction: string;
    closingLearned: string;
    fullText: string;
    charCount: number;
    reflectionNotes: string; // 무엇을 보완했는가
  };
  teacherFeedback?: TeacherFeedback;
  status: 'draft' | 'tail_practicing' | 'needs_revision' | 'revised_complete';
  createdAt: string;
  updatedAt: string;
}
