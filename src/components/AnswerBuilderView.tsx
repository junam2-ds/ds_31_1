import React, { useState, useEffect } from 'react';
import {
  QuestionItem,
  StudentAnswer,
  ExperienceCard,
  QuestionField,
  EvaluationCategory,
} from '../types/interview';
import {
  estimateSpeechSeconds,
  evaluateDurationSuitability,
  analyzeAnswerQuality,
  generateDynamicTailQuestions,
  calculateRubricSummary,
} from '../utils/interviewLogic';
import {
  FileText,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Send,
  MessageSquare,
  AlertCircle,
  Lightbulb,
  CheckSquare,
  Volume2,
} from 'lucide-react';

interface AnswerBuilderViewProps {
  questions: QuestionItem[];
  experiences: ExperienceCard[];
  answers: StudentAnswer[];
  onSaveAnswer: (answer: StudentAnswer) => void;
  selectedExpForAnswer?: ExperienceCard | null;
  onClearSelectedExp?: () => void;
  onNavigateToMock?: () => void;
}

const FIELDS: ('전체' | QuestionField)[] = [
  '전체',
  '공통',
  '자연/공학/IT',
  '인문/사회/경영',
  '의약/바이오/보건',
  '교육/사범',
];

export const AnswerBuilderView: React.FC<AnswerBuilderViewProps> = ({
  questions,
  experiences,
  answers,
  onSaveAnswer,
  selectedExpForAnswer,
  onClearSelectedExp,
}) => {
  const [selectedField, setSelectedField] = useState<'전체' | QuestionField>('전체');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(questions[0]?.id || '');
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Question Data
  const currentQuestion = questions.find((q) => q.id === selectedQuestionId) || questions[0];

  // Existing Answer for this Question (if any)
  const existingAnswer = answers.find((a) => a.questionId === currentQuestion.id);

  // Draft Form States
  const [twoGwal, setTwoGwal] = useState('');
  const [bodyAction, setBodyAction] = useState('');
  const [closingLearned, setClosingLearned] = useState('');

  // Tail Questions State
  const [tailAnswers, setTailAnswers] = useState<{ id: string; tailQuestion: string; answer: string }[]>(
    []
  );

  // Revised State
  const [revisedTwoGwal, setRevisedTwoGwal] = useState('');
  const [revisedBodyAction, setRevisedBodyAction] = useState('');
  const [revisedClosingLearned, setRevisedClosingLearned] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof analyzeAnswerQuality> | null>(
    null
  );

  // Sample answer toggle
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  // Sync state when switching questions or when an answer exists
  useEffect(() => {
    if (existingAnswer) {
      setTwoGwal(existingAnswer.draft.twoGwal);
      setBodyAction(existingAnswer.draft.bodyAction);
      setClosingLearned(existingAnswer.draft.closingLearned);
      setTailAnswers(existingAnswer.tailAnswers || []);
      if (existingAnswer.revisedAnswer) {
        setRevisedTwoGwal(existingAnswer.revisedAnswer.twoGwal);
        setRevisedBodyAction(existingAnswer.revisedAnswer.bodyAction);
        setRevisedClosingLearned(existingAnswer.revisedAnswer.closingLearned);
        setReflectionNotes(existingAnswer.revisedAnswer.reflectionNotes || '');
      } else {
        setRevisedTwoGwal(existingAnswer.draft.twoGwal);
        setRevisedBodyAction(existingAnswer.draft.bodyAction);
        setRevisedClosingLearned(existingAnswer.draft.closingLearned);
        setReflectionNotes('');
      }
    } else {
      // If coming from an experience card selection
      if (selectedExpForAnswer) {
        setTwoGwal(
          `제가 가장 의미 있게 여긴 활동은 ${selectedExpForAnswer.gradeLevel} 때 진행한 ‘${selectedExpForAnswer.title}’입니다.`
        );
        setBodyAction(selectedExpForAnswer.action);
        setClosingLearned(selectedExpForAnswer.resultLearned);
      } else {
        setTwoGwal('');
        setBodyAction('');
        setClosingLearned('');
      }
      setTailAnswers([]);
      setRevisedTwoGwal('');
      setRevisedBodyAction('');
      setRevisedClosingLearned('');
      setReflectionNotes('');
    }
    setAnalysisResult(null);
    setShowSampleAnswer(false);
  }, [selectedQuestionId, existingAnswer, selectedExpForAnswer]);

  // Combined full text & duration
  const fullDraftText = `${twoGwal} ${bodyAction} ${closingLearned}`.trim();
  const draftCharCount = fullDraftText.length;
  const draftSeconds = estimateSpeechSeconds(draftCharCount);
  const durationSuitability = evaluateDurationSuitability(draftSeconds);

  // Run Real-time Analysis
  const handleAnalyze = () => {
    if (!twoGwal.trim() && !bodyAction.trim()) {
      alert('분석을 위해 첫 문장 또는 본문 내용을 먼저 작성해 주세요.');
      return;
    }
    const result = analyzeAnswerQuality({ twoGwal, bodyAction, closingLearned });
    setAnalysisResult(result);
  };

  // Generate dynamic tail questions
  const handleGenerateTailQuestions = () => {
    const dynamicQuestions = generateDynamicTailQuestions(
      fullDraftText,
      currentQuestion.evaluationCategory
    );
    // Merge with preset suggested questions
    const allCandidates = Array.from(
      new Set([...dynamicQuestions, ...currentQuestion.suggestedTailQuestions])
    ).slice(0, 3);

    const newTails = allCandidates.map((q, idx) => {
      const existing = tailAnswers.find((t) => t.tailQuestion === q);
      return {
        id: `tail-${idx + 1}-${Date.now()}`,
        tailQuestion: q,
        answer: existing ? existing.answer : '',
      };
    });
    setTailAnswers(newTails);
  };

  // Save full answer
  const handleSave = () => {
    if (!twoGwal.trim() || !bodyAction.trim()) {
      alert('두괄식 첫 문장과 구체적 행동(Action)은 반드시 작성해야 저장할 수 있습니다.');
      return;
    }

    const hasRevised =
      revisedTwoGwal.trim().length > 0 || revisedBodyAction.trim().length > 0;

    const revisedFullText = hasRevised
      ? `${revisedTwoGwal} ${revisedBodyAction} ${revisedClosingLearned}`.trim()
      : undefined;

    const answerToSave: StudentAnswer = {
      id: existingAnswer?.id || `ans-${Date.now()}`,
      questionId: currentQuestion.id,
      questionText: currentQuestion.questionText,
      evaluationCategory: currentQuestion.evaluationCategory,
      field: currentQuestion.field,
      draft: {
        twoGwal,
        bodyAction,
        closingLearned,
        fullText: fullDraftText,
        charCount: draftCharCount,
        estimatedSeconds: draftSeconds,
      },
      tailAnswers,
      revisedAnswer: hasRevised
        ? {
            twoGwal: revisedTwoGwal,
            bodyAction: revisedBodyAction,
            closingLearned: revisedClosingLearned,
            fullText: revisedFullText!,
            charCount: revisedFullText!.length,
            reflectionNotes,
          }
        : undefined,
      teacherFeedback: existingAnswer?.teacherFeedback,
      status: hasRevised
        ? 'revised_complete'
        : tailAnswers.length > 0
        ? 'tail_practicing'
        : 'draft',
      createdAt: existingAnswer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveAnswer(answerToSave);
    alert('답변이 성공적으로 저장되었습니다! 포트폴리오에서 확인하거나 교사 피드백을 요청하세요.');
  };

  const filteredQuestions = questions.filter((q) =>
    selectedField === '전체' ? true : q.field === selectedField
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>4단계 체계적 답변 구성</span>
            </div>
            <h2 className="text-xl font-bold">
              질문 의도 파악 ➔ 두괄식 STAR 답변 ➔ 꼬리질문 대응 ➔ 피드백 수정
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              면접관이 왜 이 질문을 던졌는지 간파하고, 꼬리질문에 흔들리지 않는 단단한 답변을 완성하세요.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl shadow-xs transition"
            >
              <Send className="w-4 h-4" />
              <span>답변 저장하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Experience Card alert if passed from Experience Bank */}
      {selectedExpForAnswer && (
        <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-900">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              선택된 경험 카드 <strong>[{selectedExpForAnswer.title}]</strong>의 내용이 답변 입력란에 기본 반영되었습니다.
            </span>
          </div>
          {onClearSelectedExp && (
            <button
              type="button"
              onClick={onClearSelectedExp}
              className="text-xs text-amber-700 hover:text-amber-900 underline shrink-0 font-medium"
            >
              초기화
            </button>
          )}
        </div>
      )}

      {/* Question Selector & Field Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-700">계열 / 분야 필터:</span>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {FIELDS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedField(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  selectedField === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="question-select" className="block text-xs font-semibold text-slate-600 mb-1">
            연습할 면접 질문 선택:
          </label>
          <select
            id="question-select"
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
          >
            {filteredQuestions.map((q) => {
              const hasAns = answers.some((a) => a.questionId === q.id);
              return (
                <option key={q.id} value={q.id}>
                  [{q.field} / {q.evaluationCategory}] {q.questionText} {hasAns ? '✓ (작성됨)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 4-Step Process Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`p-3 rounded-xl border text-left transition ${
            activeStep === 1
              ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-2xs font-bold text-blue-600">STEP 1</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900">질문 의도 파악</div>
          <div className="text-2xs text-slate-500">평가요소 및 핵심 포인트</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`p-3 rounded-xl border text-left transition ${
            activeStep === 2
              ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-2xs font-bold text-indigo-600">STEP 2</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900">1차 STAR 답변 작성</div>
          <div className="text-2xs text-slate-500">두괄식 + 행동 + 배운점</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`p-3 rounded-xl border text-left transition ${
            activeStep === 3
              ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-2xs font-bold text-amber-600">STEP 3</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900">꼬리질문 대응 훈련</div>
          <div className="text-2xs text-slate-500">심층 질문 3가지 풀기</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(4)}
          className={`p-3 rounded-xl border text-left transition ${
            activeStep === 4
              ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-2xs font-bold text-emerald-600">STEP 4</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900">피드백 & 2차 수정본</div>
          <div className="text-2xs text-slate-500">루브릭 반영 완성본</div>
        </button>
      </div>

      {/* ================= STEP 1: 질문 의도 파악 ================= */}
      {activeStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                {currentQuestion.field}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                평가요소: {currentQuestion.evaluationCategory}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              Q. {currentQuestion.questionText}
            </h3>
          </div>

          {/* Intent Box */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>면접관이 이 질문을 던지는 진짜 이유 (출제 의도)</span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
              {currentQuestion.intent}
            </p>
          </div>

          {/* Checkpoints */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>답변에 반드시 담겨야 할 핵심 3가지 (합격 체크리스트)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentQuestion.coreCheckpoints.map((pt, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium flex items-start gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-2xs">
                    {i + 1}
                  </span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deoksin Tip */}
          {currentQuestion.deoksinTip && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-950">
                <strong className="font-bold text-amber-900">덕신고 학생을 위한 맞춤 조언: </strong>
                {currentQuestion.deoksinTip}
              </div>
            </div>
          )}

          {/* Sample Good Answer Toggle */}
          {currentQuestion.sampleGoodAnswer && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>{showSampleAnswer ? '모범 답변 예시 접기 ▲' : '모범 답변 예시 보기 ▼'}</span>
              </button>

              {showSampleAnswer && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs sm:text-sm text-slate-800">
                  <div className="text-xs font-bold text-blue-700">
                    [두괄식 결론] {currentQuestion.sampleGoodAnswer.twoGwal}
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    [구체적 행동] {currentQuestion.sampleGoodAnswer.bodyAction}
                  </div>
                  <div className="text-xs text-emerald-800 font-medium">
                    [배운 점/포부] {currentQuestion.sampleGoodAnswer.conclusion}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition"
            >
              <span>다음: 1차 답변 작성하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: 1차 STAR 답변 작성 ================= */}
      {activeStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-600">Q. {currentQuestion.questionText}</span>
            <h3 className="text-lg font-bold text-slate-900">
              두괄식 구조로 1차 초안 작성하기 (60초~90초 분량)
            </h3>
          </div>

          {/* Structured Draft Inputs */}
          <div className="space-y-4">
            {/* 1. 두괄식 결론 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>1. 결론부터 말하는 두괄식 첫 문장 (Point)</span>
                <span className="text-2xs font-normal text-slate-500">1~2문장 (약 15초)</span>
              </div>
              <textarea
                rows={2}
                value={twoGwal}
                onChange={(e) => setTwoGwal(e.target.value)}
                placeholder="예: 제가 가장 의미 있게 여긴 활동은 ~이며, 이를 통해 ~역량을 길렀습니다."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* 2. 구체적 행동 (Action) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span>2. 본인이 '직접' 수행한 구체적 행동 및 극복 과정 (Action & Task) ★핵심</span>
                <span className="text-2xs font-normal text-indigo-700">약 40~50초 분량</span>
              </div>
              <textarea
                rows={4}
                value={bodyAction}
                onChange={(e) => setBodyAction(e.target.value)}
                placeholder="예: 저는 실험 오차를 잡기 위해 직접 관련 논문을 찾아보고 항온 수조의 온도를 0.5도 단위로 재설계하며 3회 반복 검증했습니다."
                className="w-full text-xs sm:text-sm bg-indigo-50/20 border border-indigo-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 3. 배운 점 (Insight) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>3. 활동을 통해 깨달은 점 및 대학 진학 후 확장 포부 (Result & Insight)</span>
                <span className="text-2xs font-normal text-emerald-700">약 15~20초 분량</span>
              </div>
              <textarea
                rows={2}
                value={closingLearned}
                onChange={(e) => setClosingLearned(e.target.value)}
                placeholder="예: 이 경험을 통해 현상의 이면을 끈기 있게 파고드는 과학적 탐구 태도를 배웠으며, 귀교에서 빅데이터 모델링으로 발전시키겠습니다."
                className="w-full text-xs sm:text-sm bg-emerald-50/20 border border-emerald-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Duration & Speech Stats Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>총 공백 포함 {draftCharCount}자</span>
                <span>(예상 발화: <strong>약 {draftSeconds}초</strong>)</span>
              </div>
              <span
                className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${durationSuitability.badgeColor}`}
              >
                {durationSuitability.suitability}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAnalyze}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>실시간 답변 완성도 정밀 분석</span>
              </button>
            </div>
          </div>

          {/* Analysis Result Card */}
          {analysisResult && (
            <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-900">논리 구조 완성도:</span>
                  <span className="text-lg font-black text-indigo-600">{analysisResult.score}점</span>
                  <span className="text-xs text-slate-500">/ 100점</span>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  {analysisResult.activeVoiceRatioNotice}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {analysisResult.checks.map((c, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                      c.passed
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/60 border-amber-200 text-amber-950'
                    }`}
                  >
                    <span className="font-bold shrink-0">{c.passed ? '✓' : '▲'}</span>
                    <div>
                      <div className="font-bold">{c.title}</div>
                      <div className="text-2xs leading-relaxed mt-0.5 opacity-90">{c.feedback}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-indigo-900 font-semibold bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                💡 추천 다음 단계: {analysisResult.recommendedNextStep}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              이전 단계
            </button>
            <button
              type="button"
              onClick={() => {
                handleGenerateTailQuestions();
                setActiveStep(3);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition"
            >
              <span>다음: 꼬리질문 훈련하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: 꼬리질문 대응 훈련 ================= */}
      {activeStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-600">꼬리질문 훈련소</span>
              <h3 className="text-lg font-bold text-slate-900">
                면접관의 허를 찌르는 심층 꼬리질문에 답하기
              </h3>
              <p className="text-xs text-slate-500">
                최초 답변에서 언급한 특정 단어나 수치를 근거로 더 집요하게 들어오는 질문에 대비하세요.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateTailQuestions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>새 꼬리질문 추출</span>
            </button>
          </div>

          {/* Display original draft for reference */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
            <div className="font-bold text-slate-900 mb-1">내 1차 답변 요약:</div>
            <p className="line-clamp-2 italic text-slate-600">"{fullDraftText || '작성된 답변 없음'}"</p>
          </div>

          {/* Tail Questions List */}
          <div className="space-y-4">
            {tailAnswers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                꼬리질문을 불러오는 중입니다. [새 꼬리질문 추출] 버튼을 눌러보세요.
              </div>
            ) : (
              tailAnswers.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-2xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="font-bold text-xs sm:text-sm text-amber-950">
                      꼬리질문: {item.tailQuestion}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={item.answer}
                    onChange={(e) => {
                      const updated = [...tailAnswers];
                      updated[idx].answer = e.target.value;
                      setTailAnswers(updated);
                    }}
                    placeholder="당황하지 않고 이전 답변과의 일관성을 유지하며, 더 구체적인 수치나 경험을 들어 답변하세요."
                    className="w-full text-xs sm:text-sm bg-white border border-amber-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              이전 단계
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition"
            >
              <span>다음: 교사 피드백 & 2차 수정본</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: 교사 피드백 & 2차 수정본 ================= */}
      {activeStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600">피드백 반영 & 완성</span>
            <h3 className="text-lg font-bold text-slate-900">
              교사 피드백과 꼬리질문 경험을 반영하여 2차 수정 완성본 작성
            </h3>
            <p className="text-xs text-slate-500">
              피드백에서 지적받은 개선점을 체크리스트로 확인하고, 답변을 한 단계 더 높은 수준으로 업그레이드하세요.
            </p>
          </div>

          {/* Teacher Feedback Card (if any exists) */}
          {existingAnswer?.teacherFeedback ? (
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                    {existingAnswer.teacherFeedback.teacherName}
                  </span>
                  <span className="text-xs text-slate-500">
                    평가일: {existingAnswer.teacherFeedback.evaluatedAt}
                  </span>
                </div>
                <div className="text-xs font-bold text-indigo-900">
                  루브릭 총점:{' '}
                  <strong className="text-indigo-600 text-sm">
                    {calculateRubricSummary(existingAnswer.teacherFeedback.scores).percentage}점
                  </strong>
                  ({calculateRubricSummary(existingAnswer.teacherFeedback.scores).tier})
                </div>
              </div>

              {/* Overall Teacher Comment */}
              <div className="bg-white p-3.5 rounded-xl border border-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                "{existingAnswer.teacherFeedback.overallComment}"
              </div>

              {/* Praise & Improvement points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-900">👏 돋보였던 강점</div>
                  <ul className="list-disc list-inside space-y-0.5 text-emerald-950">
                    {existingAnswer.teacherFeedback.praisePoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-200 space-y-1">
                  <div className="font-bold text-rose-900">🛠️ 반드시 보완할 개선점</div>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-950">
                    {existingAnswer.teacherFeedback.improvementPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Teacher Revision Checklist */}
              {existingAnswer.teacherFeedback.revisionChecklist.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <span>선생님이 부여한 수정 체크리스트 (반영 후 체크하세요)</span>
                  </div>
                  <div className="space-y-1.5">
                    {existingAnswer.teacherFeedback.revisionChecklist.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={item.checkedByStudent}
                          onChange={(e) => {
                            if (existingAnswer.teacherFeedback) {
                              item.checkedByStudent = e.target.checked;
                              onSaveAnswer({ ...existingAnswer });
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className={item.checkedByStudent ? 'line-through text-slate-400' : 'font-medium'}>
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <span>
                아직 등록된 교사 피드백이 없습니다. 상단 [교사 모드]에서 학생의 답변에 루브릭 채점과 피드백을 직접 입력해 보거나, 스스로 꼬리질문 내용을 반영해 2차 수정본을 작성해 보세요.
              </span>
            </div>
          )}

          {/* 2nd Revised Draft Inputs */}
          <div className="space-y-4 bg-emerald-50/20 p-5 rounded-2xl border border-emerald-200">
            <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>최종 완성본 (2차 수정본 작성)</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                수정된 두괄식 첫 문장
              </label>
              <textarea
                rows={2}
                value={revisedTwoGwal}
                onChange={(e) => setRevisedTwoGwal(e.target.value)}
                placeholder="피드백을 반영하여 교과 연계성이나 결론을 더욱 선명하게 작성하세요."
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                수정된 본문 (구체적 행동 + 꼬리질문 극복 내용 포함)
              </label>
              <textarea
                rows={4}
                value={revisedBodyAction}
                onChange={(e) => setRevisedBodyAction(e.target.value)}
                placeholder="꼬리질문에서 답변했던 구체적 수치, 오차 극복 경험, 팀원 소통 방법을 본문에 압축해 녹여내세요."
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                수정된 배운 점 및 포부
              </label>
              <textarea
                rows={2}
                value={revisedClosingLearned}
                onChange={(e) => setRevisedClosingLearned(e.target.value)}
                placeholder="대학 입학 후 지원 학과에서의 발전 계획과 지적 성숙을 강조하세요."
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                학생 회고 메모 (어떤 피드백을 어떻게 반영하여 수정했나요?)
              </label>
              <input
                type="text"
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="예: 선생님 지적대로 정보 교과 연계 문장을 보완하고 발화 시간을 80초대로 맞춤."
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              이전 단계
            </button>
            <div className="flex items-center gap-2">
              {onNavigateToMock && (
                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    onNavigateToMock();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs sm:text-sm rounded-xl border border-rose-200 transition"
                >
                  <Volume2 className="w-4 h-4 text-rose-600" />
                  <span>저장 후 100초 실전 모의면접 하러 가기</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition"
              >
                <Send className="w-4 h-4" />
                <span>완성본 포트폴리오에 저장</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
