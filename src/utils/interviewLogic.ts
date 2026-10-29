import { RubricScores, StudentAnswer, ExperienceCard } from '../types/interview';

/**
 * 한국어 말하기 속도: 1초당 약 4.8음절(글자)
 * 100초 기준 약 450~500자 권장
 */
export function estimateSpeechSeconds(charCount: number): number {
  if (charCount <= 0) return 0;
  return Math.round(charCount / 4.8);
}

export type DurationSuitability = '너무 짧음' | '적정' | '다소 김' | '시간 초과 위험';

export function evaluateDurationSuitability(seconds: number): {
  suitability: DurationSuitability;
  message: string;
  badgeColor: string;
} {
  if (seconds < 35) {
    return {
      suitability: '너무 짧음',
      message: '답변이 너무 짧습니다. 구체적인 나의 행동이나 느낀 점을 1~2문장 더 보강해 보세요.',
      badgeColor: 'bg-amber-100 text-amber-850 border-amber-300',
    };
  }
  if (seconds <= 85) {
    return {
      suitability: '적정',
      message: '면접관의 집중도를 유지하기에 가장 이상적인 답변 길이(45~85초)입니다.',
      badgeColor: 'bg-emerald-100 text-emerald-850 border-emerald-300',
    };
  }
  if (seconds <= 110) {
    return {
      suitability: '다소 김',
      message: '다소 긴 편입니다. 두괄식 요점을 앞세우고 중복되는 수식어를 간결히 다듬어 보세요.',
      badgeColor: 'bg-blue-100 text-blue-850 border-blue-300',
    };
  }
  return {
    suitability: '시간 초과 위험',
    message: '답변이 110초를 초과합니다. 실전 면접에서 말이 끊길 수 있으니 핵심 행동 중심으로 압축하세요.',
    badgeColor: 'bg-rose-100 text-rose-850 border-rose-300',
  };
}

export interface RubricSummary {
  total: number;
  maxScore: number;
  percentage: number;
  tier: '탁월' | '우수' | '보통' | '보완 필요';
  lowestFactor: string;
  highestFactor: string;
  feedbackSuggestion: string;
}

export function calculateRubricSummary(scores: RubricScores): RubricSummary {
  const maxScore = 25;
  const factors = [
    { key: 'academicCompetence', label: '학업역량', score: scores.academicCompetence },
    { key: 'careerFit', label: '진로역량', score: scores.careerFit },
    { key: 'communitySpirit', label: '공동체역량', score: scores.communitySpirit },
    { key: 'logicalCoherence', label: '논리적 구성', score: scores.logicalCoherence },
    { key: 'deliveryAttitude', label: '전달력/태도', score: scores.deliveryAttitude },
  ];

  const total = factors.reduce((sum, f) => sum + f.score, 0);
  const percentage = Math.round((total / maxScore) * 100);

  let tier: RubricSummary['tier'] = '보완 필요';
  if (percentage >= 88) tier = '탁월';
  else if (percentage >= 76) tier = '우수';
  else if (percentage >= 60) tier = '보통';

  const sortedByScore = [...factors].sort((a, b) => b.score - a.score);
  const highestFactor = sortedByScore[0]?.label || '학업역량';
  const lowestFactor = sortedByScore[sortedByScore.length - 1]?.label || '논리적 구성';

  let feedbackSuggestion = '';
  if (lowestFactor === '논리적 구성') {
    feedbackSuggestion = '결론부터 말하는 두괄식 첫 문장과 구체적 인과관계를 보강하세요.';
  } else if (lowestFactor === '학업역량') {
    feedbackSuggestion = '단순 활동 나열을 줄이고 개념 이해 및 지적 호기심을 파고든 과정을 강조하세요.';
  } else if (lowestFactor === '진로역량') {
    feedbackSuggestion = '희망 학과와의 접점 및 대학 입학 후 학업 계획과의 연계성을 보여주세요.';
  } else if (lowestFactor === '공동체역량') {
    feedbackSuggestion = '팀 활동에서의 소통, 경청, 갈등 조율 경험을 구체적인 일화로 담아보세요.';
  } else {
    feedbackSuggestion = '말끝을 흐리지 않고 또렷한 어조와 안정된 시선으로 전달하는 연습을 하세요.';
  }

  return {
    total,
    maxScore,
    percentage,
    tier,
    lowestFactor,
    highestFactor,
    feedbackSuggestion,
  };
}

export interface AnswerAnalysisResult {
  score: number; // 0 ~ 100
  checks: {
    title: string;
    passed: boolean;
    feedback: string;
  }[];
  activeVoiceRatioNotice: string;
  recommendedNextStep: string;
}

export function analyzeAnswerQuality(parts: {
  twoGwal: string;
  bodyAction: string;
  closingLearned: string;
}): AnswerAnalysisResult {
  const { twoGwal, bodyAction, closingLearned } = parts;
  const fullText = `${twoGwal} ${bodyAction} ${closingLearned}`.trim();
  const checks: AnswerAnalysisResult['checks'] = [];

  // 1. 두괄식 체크
  const twoGwalTrimmed = twoGwal.trim();
  const twoGwalPassed =
    twoGwalTrimmed.length >= 15 &&
    twoGwalTrimmed.length <= 150 &&
    (twoGwalTrimmed.includes('가장') ||
      twoGwalTrimmed.includes('저는') ||
      twoGwalTrimmed.includes('경험') ||
      twoGwalTrimmed.includes('역량') ||
      twoGwalTrimmed.includes('이유는') ||
      twoGwalTrimmed.includes('생각합니다') ||
      twoGwalTrimmed.includes('배웠습니다'));

  checks.push({
    title: '두괄식 첫 문장 (핵심 요약)',
    passed: twoGwalPassed,
    feedback: twoGwalPassed
      ? '첫 문장에서 질문에 대한 핵심 결론과 본인의 주안점을 명확하게 드러냈습니다.'
      : '첫 문장을 "제가 가장 의미 있게 여긴 활동은 ~이며, 이를 통해 ~를 길렀습니다"처럼 결론부터 말하는 두괄식으로 다듬어 보세요.',
  });

  // 2. 구체적 행동(Action) 체크
  const actionKeywords = [
    '직접',
    '스스로',
    '분석',
    '설계',
    '실험',
    '조사',
    '탐구',
    '토론',
    '제안',
    '개발',
    '기록',
    '극복',
    '수정',
    '비교',
    '검증',
  ];
  const matchedActions = actionKeywords.filter((k) => bodyAction.includes(k));
  const bodyPassed = bodyAction.trim().length >= 50 && matchedActions.length >= 2;

  checks.push({
    title: '구체적인 본인의 역할과 행동 (Action)',
    passed: bodyPassed,
    feedback: bodyPassed
      ? `구체적 실천 키워드(${matchedActions.slice(0, 3).join(', ')})를 활용하여 주도적 실행 과정을 설득력 있게 기술했습니다.`
      : '단순히 "참여했습니다"라는 나열 대신, 본인이 직접 읽은 자료, 실험한 절차, 문제를 해결한 구체적 조치를 적어주세요.',
  });

  // 3. 배운 점 / 성장 (Result & Insight) 체크
  const superficialClichés = ['뿌듯했습니다', '좋은 추억이 되었습니다', '재미있었습니다'];
  const hasCliché = superficialClichés.some((c) => closingLearned.includes(c));
  const insightKeywords = [
    '배웠',
    '깨달',
    '인식',
    '성장',
    '변화',
    '태도',
    '확장',
    '대학',
    '연계',
    '발전',
    '학업',
  ];
  const matchedInsights = insightKeywords.filter((k) => closingLearned.includes(k));
  const closingPassed =
    closingLearned.trim().length >= 30 && matchedInsights.length >= 1 && !hasCliché;

  checks.push({
    title: '내적 성장 및 배운 점 (Insight)',
    passed: closingPassed,
    feedback: closingPassed
      ? '활동 이후 자신의 사고방식이나 태도의 변화, 후속 탐구 의지를 진솔하게 담았습니다.'
      : '단순히 "뿌듯했다"는 감상 대신, 그 활동을 통해 학문적 또는 인간적으로 어떤 사고의 확장이 있었는지 적어보세요.',
  });

  // 4. 전체 분량
  const charLen = fullText.length;
  const lengthPassed = charLen >= 200 && charLen <= 700;
  checks.push({
    title: '답변 적정 분량 (약 1분~1분 20초)',
    passed: lengthPassed,
    feedback: lengthPassed
      ? `현재 공백 포함 ${charLen}자(약 ${estimateSpeechSeconds(charLen)}초)로 실전 발화에 알맞습니다.`
      : `현재 ${charLen}자입니다. 실전 면접 발화(450자 내외, 약 60~80초)에 맞게 분량을 조절해 보세요.`,
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  let activeVoiceRatioNotice = '';
  if (fullText.includes('저희 조는') || fullText.includes('친구들과 함께')) {
    activeVoiceRatioNotice =
      '‘우리/저희 조’ 표현이 많습니다. 협업 속에서 ‘내가 주도적으로 기여한 역할’을 1인칭(‘제가’, ‘저는’)으로 명시하면 더 돋보입니다.';
  } else {
    activeVoiceRatioNotice = '자신의 기여도와 주체적인 행동이 잘 부각되어 있습니다.';
  }

  let recommendedNextStep = '';
  if (score < 50) {
    recommendedNextStep = 'STAR 구조(상황-과제-행동-결과)를 활용하여 본인의 행동 파트를 더 구체화하세요.';
  } else if (score < 80) {
    recommendedNextStep = '이제 예상 꼬리질문에 답변해보면서 답변의 신뢰도를 한층 더 높여보세요.';
  } else {
    recommendedNextStep = '완성도 높은 답변입니다! [실전 모의면접실]에서 100초 타이머를 켜고 소리 내어 말해보세요.';
  }

  return {
    score,
    checks,
    activeVoiceRatioNotice,
    recommendedNextStep,
  };
}

export function generateDynamicTailQuestions(
  answerText: string,
  category: string = '학업역량'
): string[] {
  const questions: string[] = [];
  const text = answerText.toLowerCase();

  // Keyword-driven intelligent tail questions for Korean college admission
  if (text.includes('갈등') || text.includes('팀원') || text.includes('조원') || text.includes('친구')) {
    questions.push(
      '그 갈등 상황에서 상대방이 왜 그런 주장을 했는지 상대의 입장에서 생각해 본 적이 있나요?'
    );
    questions.push(
      '의견이 좁혀지지 않을 때 본인이 어떤 대안이나 타협안을 제시하여 설득했나요?'
    );
  }

  if (
    text.includes('실험') ||
    text.includes('조사') ||
    text.includes('통계') ||
    text.includes('분석') ||
    text.includes('코딩')
  ) {
    questions.push(
      '그 탐구 과정에서 예상치 못한 오차나 한계점이 발생했을 때 어떻게 대처하고 검증했나요?'
    );
    questions.push(
      '그 실험 또는 분석 결과를 도출하기 위해 참고한 공신력 있는 자료나 이론적 근거는 무엇이었나요?'
    );
  }

  if (text.includes('책') || text.includes('도서') || text.includes('논문') || text.includes('기사')) {
    questions.push(
      '그 저자의 주장이나 내용 중 본인의 기존 생각과 달랐거나 비판적으로 의문을 품었던 지점은 없었나요?'
    );
  }

  if (text.includes('어려움') || text.includes('실패') || text.includes('한계') || text.includes('포기')) {
    questions.push(
      '그 실패나 시행착오를 겪기 전과 겪은 후, 본인의 문제해결 접근 방식에 어떤 근본적인 변화가 생겼나요?'
    );
  }

  if (text.includes('리더') || text.includes('반장') || text.includes('부장') || text.includes('팀장')) {
    questions.push(
      '단순히 지시하거나 모범을 보이는 것 외에, 소외되거나 따라오기 힘들어하는 구성원을 어떻게 이끌었나요?'
    );
  }

  // Fallbacks if text was short or general
  if (questions.length < 3) {
    if (category === '학업역량') {
      questions.push(
        '그 활동을 통해 배운 원리를 고등학교 교과서의 어떤 단원이나 다른 과목 지식과 연결해 볼 수 있을까요?'
      );
      questions.push(
        '대학 입학 후 이 탐구 주제를 학부 과정에서 더 깊이 발전시킨다면 어떤 연구를 진행해보고 싶나요?'
      );
    } else if (category === '진로역량') {
      questions.push(
        '그 진로를 희망하게 된 계기가 된 고등학교 생활 중 가장 결정적인 순간 한 가지만 말씀해 주세요.'
      );
      questions.push(
        '해당 전공 분야에서 최근 주목받는 이슈 중 본인이 가장 관심 있게 지켜보고 있는 것은 무엇인가요?'
      );
    } else {
      questions.push(
        '그 과정에서 본인이 ‘직접’ 땀 흘려 실행한 가장 기억에 남는 행동 한 가지를 구체적으로 말씀해 주세요.'
      );
      questions.push(
        '그 경험을 겪기 전의 나와 겪은 후의 나를 비교했을 때, 가장 크게 달라진 가치관은 무엇인가요?'
      );
    }
  }

  return questions.slice(0, 3);
}

export interface PortfolioStats {
  totalAnswers: number;
  revisedCount: number;
  feedbackReceivedCount: number;
  experiencesCount: number;
  revisionRate: number; // 0 ~ 100%
  overallAverageScore: number;
}

export function calculatePortfolioStats(
  answers: StudentAnswer[],
  experiences: ExperienceCard[]
): PortfolioStats {
  const totalAnswers = answers.length;
  const revisedCount = answers.filter((a) => a.status === 'revised_complete').length;
  const feedbackReceivedCount = answers.filter((a) => a.teacherFeedback).length;
  const experiencesCount = experiences.length;

  const revisionRate = totalAnswers > 0 ? Math.round((revisedCount / totalAnswers) * 100) : 0;

  const feedbackScores = answers
    .filter((a) => a.teacherFeedback)
    .map((a) => calculateRubricSummary(a.teacherFeedback!.scores).percentage);

  const overallAverageScore =
    feedbackScores.length > 0
      ? Math.round(feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length)
      : 0;

  return {
    totalAnswers,
    revisedCount,
    feedbackReceivedCount,
    experiencesCount,
    revisionRate,
    overallAverageScore,
  };
}
