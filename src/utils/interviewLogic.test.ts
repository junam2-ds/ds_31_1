import test from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateSpeechSeconds,
  evaluateDurationSuitability,
  calculateRubricSummary,
  analyzeAnswerQuality,
  generateDynamicTailQuestions,
  calculatePortfolioStats,
} from './interviewLogic';
import { RubricScores, StudentAnswer, ExperienceCard } from '../types/interview';

test('estimateSpeechSeconds calculates realistic speech duration for Korean', () => {
  assert.equal(estimateSpeechSeconds(0), 0);
  // ~480 chars should be approx 100 seconds
  const approx100 = estimateSpeechSeconds(480);
  assert.equal(approx100, 100);
});

test('evaluateDurationSuitability evaluates properly based on seconds', () => {
  assert.equal(evaluateDurationSuitability(20).suitability, '너무 짧음');
  assert.equal(evaluateDurationSuitability(65).suitability, '적정');
  assert.equal(evaluateDurationSuitability(100).suitability, '다소 김');
  assert.equal(evaluateDurationSuitability(125).suitability, '시간 초과 위험');
});

test('calculateRubricSummary computes total, percentage, tiers and diagnosis', () => {
  const perfectScores: RubricScores = {
    academicCompetence: 5,
    careerFit: 5,
    communitySpirit: 5,
    logicalCoherence: 5,
    deliveryAttitude: 5,
  };
  const summary = calculateRubricSummary(perfectScores);
  assert.equal(summary.total, 25);
  assert.equal(summary.percentage, 100);
  assert.equal(summary.tier, '탁월');

  const mixedScores: RubricScores = {
    academicCompetence: 4,
    careerFit: 4,
    communitySpirit: 4,
    logicalCoherence: 2, // lowest
    deliveryAttitude: 3,
  };
  const mixedSummary = calculateRubricSummary(mixedScores);
  assert.equal(mixedSummary.total, 17);
  assert.equal(mixedSummary.tier, '보통');
  assert.equal(mixedSummary.lowestFactor, '논리적 구성');
  assert.match(mixedSummary.feedbackSuggestion, /두괄식/);
});

test('analyzeAnswerQuality evaluates two-gwal, action keywords, and insights', () => {
  const goodAnswer = {
    twoGwal: '제가 가장 의미 있게 여긴 활동은 덕신고 과학탐구실험에서 진행한 효소 반응 분석 경험입니다.',
    bodyAction:
      '저는 실험 설계 단계에서 발생한 온도 제어 오차를 스스로 분석하고, 추가 논문 자료를 조사하여 직접 항온 수조의 조건을 재설계하여 비교 검증했습니다.',
    closingLearned:
      '이 과정을 통해 단순 암기된 과학 지식을 넘어 현상의 원인을 끝까지 파고드는 학업적 태도를 배웠으며, 대학 입학 후에도 이러한 융합적 탐구 역량을 발전시키겠습니다.',
  };
  const analysis = analyzeAnswerQuality(goodAnswer);
  assert.equal(analysis.score, 100);
  assert.equal(analysis.checks.every((c) => c.passed), true);
});

test('generateDynamicTailQuestions generates tailored questions based on keywords', () => {
  const answerWithConflict = '친구들과 팀 활동 중 의견 갈등이 발생하여 회의를 가졌습니다.';
  const tailQuestions = generateDynamicTailQuestions(answerWithConflict, '공동체역량');
  assert.ok(tailQuestions.length >= 2);
  assert.ok(tailQuestions.some((q) => q.includes('갈등') || q.includes('설득') || q.includes('입장')));
});

test('calculatePortfolioStats accurately aggregates counts and revision rates', () => {
  const mockExperiences: ExperienceCard[] = [
    {
      id: 'e1',
      category: '과목세특',
      title: '통합사회 복지제도 탐구',
      subjectOrClub: '통합사회',
      gradeLevel: '2학년',
      keywords: ['복지'],
      situation: '상황',
      task: '과제',
      action: '행동',
      resultLearned: '배운점',
      updatedAt: '2026-10-01',
    },
  ];

  const mockAnswers: StudentAnswer[] = [
    {
      id: 'a1',
      questionId: 'q1',
      questionText: '지원동기',
      evaluationCategory: '진로역량',
      field: '공통',
      draft: {
        twoGwal: '첫 문장',
        bodyAction: '본문',
        closingLearned: '결론',
        fullText: '전체 답변 텍스트',
        charCount: 10,
        estimatedSeconds: 2,
      },
      tailAnswers: [],
      status: 'revised_complete',
      createdAt: '2026-10-01',
      updatedAt: '2026-10-02',
      teacherFeedback: {
        teacherName: '김덕신 선생님',
        evaluatedAt: '2026-10-01',
        scores: {
          academicCompetence: 4,
          careerFit: 5,
          communitySpirit: 4,
          logicalCoherence: 4,
          deliveryAttitude: 4,
        },
        overallComment: '좋음',
        praisePoints: ['자신감'],
        improvementPoints: ['시간관리'],
        revisionChecklist: [],
      },
    },
  ];

  const stats = calculatePortfolioStats(mockAnswers, mockExperiences);
  assert.equal(stats.totalAnswers, 1);
  assert.equal(stats.revisedCount, 1);
  assert.equal(stats.revisionRate, 100);
  assert.equal(stats.experiencesCount, 1);
  assert.equal(stats.overallAverageScore, 84); // (21/25) * 100 = 84%
});
