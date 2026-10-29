import React, { useState } from 'react';
import { StudentAnswer, TeacherFeedback, RubricScores } from '../types/interview';
import { calculateRubricSummary } from '../utils/interviewLogic';
import {
  UserCheck,
  CheckCircle2,
  Award,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TeacherCoachingViewProps {
  answers: StudentAnswer[];
  onSaveFeedback: (answerId: string, feedback: TeacherFeedback) => void;
}

const PRESET_PRAISES = [
  '자신감 있고 안정된 답변 태도',
  '첫 문장에서 명쾌하게 결론을 제시함',
  '정량적 수치와 구체적 실험 데이터를 제시함',
  '타인에 대한 깊은 공감과 배려의 자세가 돋보임',
  '꼬리질문에서도 흔들림 없이 논리적으로 방어함',
];

const PRESET_IMPROVEMENTS = [
  '첫 문장을 두괄식으로 더욱 간결하게 다듬을 것',
  '‘우리 조가 했다’ 대신 ‘내가 직접 주도한 행동’을 명시할 것',
  '고교 정규 교과목(수학/과학/사회 등) 지식과의 접점 보완 필요',
  '단순 활동 참여 나열을 줄이고 한 가지 활동을 깊이 있게 파고들 것',
  '말끝 흐림을 지양하고 발화 시간(70~80초)을 유지할 것',
];

export const TeacherCoachingView: React.FC<TeacherCoachingViewProps> = ({
  answers,
  onSaveFeedback,
}) => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>(answers[0]?.id || '');

  const activeAnswer = answers.find((a) => a.id === selectedAnswerId) || answers[0];

  // Feedback Form State
  const [teacherName, setTeacherName] = useState<string>(
    activeAnswer?.teacherFeedback?.teacherName || '김덕신 선생님 (진로진학부)'
  );
  const [scores, setScores] = useState<RubricScores>(
    activeAnswer?.teacherFeedback?.scores || {
      academicCompetence: 4,
      careerFit: 4,
      communitySpirit: 4,
      logicalCoherence: 4,
      deliveryAttitude: 4,
    }
  );
  const [overallComment, setOverallComment] = useState<string>(
    activeAnswer?.teacherFeedback?.overallComment || ''
  );
  const [praisePoints, setPraisePoints] = useState<string[]>(
    activeAnswer?.teacherFeedback?.praisePoints || [PRESET_PRAISES[0], PRESET_PRAISES[1]]
  );
  const [improvementPoints, setImprovementPoints] = useState<string[]>(
    activeAnswer?.teacherFeedback?.improvementPoints || [PRESET_IMPROVEMENTS[0]]
  );
  const [teacherTailQuestion, setTeacherTailQuestion] = useState<string>(
    activeAnswer?.teacherFeedback?.teacherTailQuestion || ''
  );
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; checkedByStudent: boolean }[]>(
    activeAnswer?.teacherFeedback?.revisionChecklist || [
      { id: 'chk-1', text: '두괄식 첫 문장에 학업 키워드 보강하기', checkedByStudent: false },
      { id: 'chk-2', text: '꼬리질문에서 설명한 구체적 수치를 본문에 축약해 넣기', checkedByStudent: false },
    ]
  );
  const [newChecklistText, setNewChecklistText] = useState('');

  // When switching answers
  const handleSelectAnswer = (id: string) => {
    setSelectedAnswerId(id);
    const ans = answers.find((a) => a.id === id);
    if (ans?.teacherFeedback) {
      setTeacherName(ans.teacherFeedback.teacherName);
      setScores(ans.teacherFeedback.scores);
      setOverallComment(ans.teacherFeedback.overallComment);
      setPraisePoints(ans.teacherFeedback.praisePoints);
      setImprovementPoints(ans.teacherFeedback.improvementPoints);
      setTeacherTailQuestion(ans.teacherFeedback.teacherTailQuestion || '');
      setChecklistItems(ans.teacherFeedback.revisionChecklist || []);
    } else {
      setTeacherName('김덕신 선생님 (진로진학부)');
      setScores({
        academicCompetence: 4,
        careerFit: 4,
        communitySpirit: 4,
        logicalCoherence: 3,
        deliveryAttitude: 4,
      });
      setOverallComment('');
      setPraisePoints([PRESET_PRAISES[0]]);
      setImprovementPoints([PRESET_IMPROVEMENTS[0]]);
      setTeacherTailQuestion('');
      setChecklistItems([
        { id: `chk-${Date.now()}-1`, text: '두괄식 첫 문장 결론 명확화', checkedByStudent: false },
        { id: `chk-${Date.now()}-2`, text: '나의 구체적 실행 행동 1문장 보강', checkedByStudent: false },
      ]);
    }
  };

  // Add checklist item
  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([
      ...checklistItems,
      { id: `chk-${Date.now()}`, text: newChecklistText.trim(), checkedByStudent: false },
    ]);
    setNewChecklistText('');
  };

  // Remove checklist item
  const handleRemoveChecklist = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id));
  };

  // Save Feedback
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overallComment.trim()) {
      alert('학생을 위한 총평 코멘트를 작성해 주세요.');
      return;
    }

    const feedback: TeacherFeedback = {
      teacherName,
      evaluatedAt: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      scores,
      overallComment,
      praisePoints,
      improvementPoints,
      teacherTailQuestion: teacherTailQuestion.trim() || undefined,
      revisionChecklist: checklistItems,
    };

    onSaveFeedback(activeAnswer.id, feedback);
    alert('교사 피드백 및 루브릭 평가가 저장되었습니다! 학생이 수정 단계에서 반영할 수 있습니다.');
  };

  const rubricSummary = calculateRubricSummary(scores);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>덕신고 교사용 면접 지도실</span>
            </div>
            <h2 className="text-xl font-bold">교사 루브릭 평가 & 학생 맞춤 피드백</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              5대 평가요소 루브릭 5점 척도 채점, 강점 칭찬, 보완 과제 및 날카로운 꼬리질문을 학생에게 전달합니다.
            </p>
          </div>
          <div className="text-xs text-indigo-200 bg-white/10 px-3 py-1.5 rounded-xl">
            총 제출된 답변: <strong>{answers.length}건</strong>
          </div>
        </div>
      </div>

      {/* Answer Selector List */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          피드백할 학생 답변 선택:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {answers.map((ans) => {
            const isSelected = ans.id === selectedAnswerId;
            const hasFb = !!ans.teacherFeedback;
            return (
              <button
                key={ans.id}
                type="button"
                onClick={() => handleSelectAnswer(ans.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {ans.field}
                  </span>
                  <span
                    className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                      hasFb
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {hasFb ? '피드백 완료' : '피드백 대기'}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 line-clamp-1">
                  {ans.questionText}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeAnswer ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Student's Answer Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700">학생 제출 답변서</span>
                <span className="text-2xs text-slate-400">{activeAnswer.updatedAt}</span>
              </div>

              <div className="space-y-1">
                <div className="text-2xs font-bold text-slate-500">면접 질문</div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {activeAnswer.questionText}
                </h4>
              </div>

              {/* 1st Draft */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="font-bold text-slate-700">1차 초안:</div>
                <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 space-y-1">
                  <div className="font-bold text-blue-900">[두괄식 첫 문장]</div>
                  <div className="text-blue-950 font-medium">{activeAnswer.draft.twoGwal}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">[본문 구체적 행동]</div>
                  <div className="text-slate-800 leading-relaxed">{activeAnswer.draft.bodyAction}</div>
                </div>
                <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 space-y-1">
                  <div className="font-bold text-emerald-900">[배운 점 및 포부]</div>
                  <div className="text-emerald-950">{activeAnswer.draft.closingLearned}</div>
                </div>
              </div>

              {/* Tail Questions Answered */}
              {activeAnswer.tailAnswers && activeAnswer.tailAnswers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="font-bold text-amber-800">학생의 꼬리질문 대응 답변:</div>
                  {activeAnswer.tailAnswers.map((t, idx) => (
                    <div key={idx} className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 space-y-1">
                      <div className="font-bold text-amber-950">Q: {t.tailQuestion}</div>
                      <div className="text-slate-800 italic">" {t.answer || '(미작성)'} "</div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2nd Revised Answer if available */}
              {activeAnswer.revisedAnswer && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="font-bold text-emerald-800">학생의 2차 수정 완성본:</div>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-950 leading-relaxed font-normal">
                    {activeAnswer.revisedAnswer.fullText}
                  </div>
                  {activeAnswer.revisedAnswer.reflectionNotes && (
                    <div className="text-2xs text-slate-600 bg-slate-50 p-2 rounded">
                      <strong>학생 회고: </strong> {activeAnswer.revisedAnswer.reflectionNotes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right 7 Cols: Teacher Feedback & Rubric Scoring Form */}
          <div className="lg:col-span-7 space-y-5">
            <form onSubmit={handleSubmitFeedback} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>5대 평가요소 루브릭 채점표</span>
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 font-medium">지도 교사명:</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-2 py-1 w-44"
                  />
                </div>
              </div>

              {/* Rubric Score Sliders */}
              <div className="space-y-3.5">
                {[
                  {
                    key: 'academicCompetence',
                    label: '1. 학업역량',
                    sub: '지적 호기심과 교과 지식 심화 탐구 능력',
                  },
                  {
                    key: 'careerFit',
                    label: '2. 진로역량',
                    sub: '전공 관련 교과 이수 노력과 진로 탐색의 깊이',
                  },
                  {
                    key: 'communitySpirit',
                    label: '3. 공동체역량',
                    sub: '타인 존중, 협업 태도, 갈등 조정 및 배려',
                  },
                  {
                    key: 'logicalCoherence',
                    label: '4. 논리적 구성',
                    sub: '두괄식 결론 제시, 원인-결과 인과관계 및 구체성',
                  },
                  {
                    key: 'deliveryAttitude',
                    label: '5. 전달력 및 태도',
                    sub: '안정된 시선, 적정 발화 속도(60~85초), 성실한 태도',
                  },
                ].map((factor) => {
                  const val = scores[factor.key as keyof RubricScores];
                  return (
                    <div key={factor.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{factor.label}</span>
                          <span className="text-2xs text-slate-400 ml-1.5">({factor.sub})</span>
                        </div>
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {val}점 / 5점
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={val}
                        onChange={(e) =>
                          setScores({
                            ...scores,
                            [factor.key]: Number(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Real-time Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-2xs text-slate-500 font-semibold">종합 루브릭 환산 점수</div>
                  <div className="text-xl font-black text-indigo-700">
                    {rubricSummary.total} / {rubricSummary.maxScore}점{' '}
                    <span className="text-sm font-bold text-slate-600">({rubricSummary.percentage}점)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                    평가 등급: {rubricSummary.tier}
                  </span>
                  <div className="text-2xs text-slate-500 mt-1">
                    취약 영역: <strong className="text-rose-600">{rubricSummary.lowestFactor}</strong>
                  </div>
                </div>
              </div>

              {/* Praise Points Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  칭찬 포인트 (클릭하여 추가/제거)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PRAISES.map((p) => {
                    const isSelected = praisePoints.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          if (isSelected) setPraisePoints(praisePoints.filter((x) => x !== p));
                          else setPraisePoints([...praisePoints, p]);
                        }}
                        className={`text-2xs px-2.5 py-1 rounded-lg border font-medium transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Improvement Points Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  개선 과제 (클릭하여 추가/제거)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMPROVEMENTS.map((imp) => {
                    const isSelected = improvementPoints.includes(imp);
                    return (
                      <button
                        key={imp}
                        type="button"
                        onClick={() => {
                          if (isSelected) setImprovementPoints(improvementPoints.filter((x) => x !== imp));
                          else setImprovementPoints([...improvementPoints, imp]);
                        }}
                        className={`text-2xs px-2.5 py-1 rounded-lg border font-medium transition ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {imp}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Tail Question */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  교사가 던지는 추가 꼬리질문 (심층 검증용)
                </label>
                <input
                  type="text"
                  value={teacherTailQuestion}
                  onChange={(e) => setTeacherTailQuestion(e.target.value)}
                  placeholder="예: 그 프로젝트에서 소프트웨어와 하드웨어 간 통신 프로토콜은 무엇을 썼나요?"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Overall Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  종합 지도 총평 (학생에게 전할 조언)
                </label>
                <textarea
                  rows={3}
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  placeholder="학생의 답변에 대한 총체적 강점과 실전 면접 시 주의할 점을 적어주세요."
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 leading-relaxed font-normal"
                  required
                />
              </div>

              {/* Revision Checklist Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  학생 수정 체크리스트 설정 (학생이 수정 시 체크해야 함)
                </label>
                <div className="space-y-1.5">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs"
                    >
                      <span className="text-slate-800 font-medium">• {item.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklist(item.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="새 체크 항목 추가 (예: 1문장에 교과서 키워드 추가)"
                    className="flex-1 text-xs bg-white border border-slate-200 rounded-lg p-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklist}
                    className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>피드백 전송 및 루브릭 저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          피드백할 답변이 없습니다. [답변 빌더]에서 답변을 먼저 작성해 주세요.
        </div>
      )}
    </div>
  );
};
