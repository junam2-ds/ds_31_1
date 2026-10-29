import React, { useState } from 'react';
import { StudentAnswer, ExperienceCard } from '../types/interview';
import { calculatePortfolioStats, calculateRubricSummary } from '../utils/interviewLogic';
import {
  Award,
  Printer,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  User,
  Filter,
} from 'lucide-react';

interface PortfolioViewProps {
  answers: StudentAnswer[];
  experiences: ExperienceCard[];
  onImportData: (data: { answers: StudentAnswer[]; experiences: ExperienceCard[] }) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  answers,
  experiences,
  onImportData,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const stats = calculatePortfolioStats(answers, experiences);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const data = {
      school: '덕신고등학교',
      year: '2027학년도 대입 수시 면접 대비',
      exportedAt: new Date().toISOString(),
      experiences,
      answers,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `덕신고_고3_면접포트폴리오_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.answers && parsed.experiences) {
          onImportData({ answers: parsed.answers, experiences: parsed.experiences });
          alert('데이터가 성공적으로 복원되었습니다!');
        } else {
          alert('올바른 면접 포트폴리오 데이터 형식이 아닙니다.');
        }
      } catch (err) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const filteredAnswers = answers.filter((a) => {
    if (filterStatus === 'revised') return a.status === 'revised_complete';
    if (filterStatus === 'feedback') return !!a.teacherFeedback;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden in print) */}
      <div className="no-print bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-200 border border-purple-400/30">
              <Award className="w-3.5 h-3.5 text-purple-300" />
              <span>수시 면접 최종 합격 포트폴리오</span>
            </div>
            <h2 className="text-xl font-bold">나의 대입 면접 포트폴리오 & 인쇄 출력</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              작성한 STAR 경험과 질문별 1차 답변, 꼬리질문 대응, 교사 피드백, 2차 수정 완성본을 한눈에 조회하고 인쇄합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl transition shadow-xs"
            >
              <Printer className="w-4 h-4 text-purple-600" />
              <span>A4 포트폴리오 인쇄</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition shadow-xs"
              title="데이터 백업"
            >
              <Download className="w-3.5 h-3.5" />
              <span>내보내기</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>불러오기</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print-only text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-black">덕신고등학교 2027학년도 대입 수시 면접 지도 포트폴리오</h1>
        <p className="text-sm text-gray-600 mt-1">
          작성자: 고3 수험생 · 지도교사 피드백 및 2차 수정 완성본 모음집 · 출력일: {new Date().toLocaleDateString('ko-KR')}
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-2xs font-semibold text-slate-500">답변 작성 문항</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {stats.totalAnswers}개
          </div>
          <div className="text-2xs text-slate-400 mt-1">STAR 경험: {stats.experiencesCount}개</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-2xs font-semibold text-slate-500">피드백 반영 완성률</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
            {stats.revisionRate}%
          </div>
          <div className="text-2xs text-slate-400 mt-1">2차 수정본: {stats.revisedCount}건</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-2xs font-semibold text-slate-500">교사 피드백 완료</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-0.5">
            {stats.feedbackReceivedCount}건
          </div>
          <div className="text-2xs text-slate-400 mt-1">전문 루브릭 심사</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-2xs font-semibold text-slate-500">루브릭 평균 점수</div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 mt-0.5">
            {stats.overallAverageScore}점
          </div>
          <div className="text-2xs text-slate-400 mt-1">100점 만점 기준</div>
        </div>
      </div>

      {/* Filter tabs (no print) */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">보기 필터:</span>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              filterStatus === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            전체 ({answers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('revised')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              filterStatus === 'revised'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            2차 수정 완성본만 ({stats.revisedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('feedback')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              filterStatus === 'feedback'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            교사 피드백 완료 ({stats.feedbackReceivedCount})
          </button>
        </div>
      </div>

      {/* Answer Cards Full Listing */}
      <div className="space-y-6">
        {filteredAnswers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            조건에 맞는 답변이 없습니다.
          </div>
        ) : (
          filteredAnswers.map((ans, idx) => {
            const hasRevised = !!ans.revisedAnswer;
            const hasTeacher = !!ans.teacherFeedback;
            const rubric = hasTeacher ? calculateRubricSummary(ans.teacherFeedback!.scores) : null;

            return (
              <div
                key={ans.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 card-print"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {ans.field}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {ans.evaluationCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasRevised ? (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>2차 수정 완성본</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        <span>1차 초안 상태</span>
                      </span>
                    )}

                    {rubric && (
                      <span className="text-2xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900">
                        교사 심사: {rubric.percentage}점 ({rubric.tier})
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <div>
                  <div className="text-2xs font-bold text-slate-400">면접 질문</div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {ans.questionText}
                  </h3>
                </div>

                {/* Final Revised Answer (Highlighted) or 1st Draft */}
                {hasRevised ? (
                  <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>피드백 반영 2차 수정 완성본 (실전 발화용)</span>
                      </span>
                      <span className="text-2xs font-semibold text-emerald-700">
                        {ans.revisedAnswer!.charCount}자
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                      {ans.revisedAnswer!.fullText}
                    </p>
                    {ans.revisedAnswer!.reflectionNotes && (
                      <div className="text-2xs text-emerald-800 bg-white/70 p-2 rounded-lg border border-emerald-200">
                        <strong>학생 회고: </strong> {ans.revisedAnswer!.reflectionNotes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800">1차 초안</span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {ans.draft.fullText}
                    </p>
                  </div>
                )}

                {/* Tail Questions Answered */}
                {ans.tailAnswers && ans.tailAnswers.length > 0 && (
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                    <div className="font-bold text-amber-950">심층 꼬리질문 대응 기록:</div>
                    {ans.tailAnswers.map((t, i) => (
                      <div key={i} className="space-y-0.5">
                        <div className="font-semibold text-amber-900">Q: {t.tailQuestion}</div>
                        <div className="text-slate-700 pl-3 border-l-2 border-amber-300">
                          {t.answer || '(답변 작성 전)'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Teacher Feedback Summary */}
                {hasTeacher && (
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-indigo-700" />
                        <span>지도교사 평가 ({ans.teacherFeedback!.teacherName})</span>
                      </span>
                      <span className="text-2xs text-slate-500">{ans.teacherFeedback!.evaluatedAt}</span>
                    </div>
                    <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-indigo-100">
                      "{ans.teacherFeedback!.overallComment}"
                    </p>
                    <div className="flex flex-wrap gap-2 text-2xs pt-1">
                      <span className="text-emerald-800 font-semibold">
                        강점: {ans.teacherFeedback!.praisePoints.join(', ')}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-rose-800 font-semibold">
                        보완: {ans.teacherFeedback!.improvementPoints.join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
