import React from 'react';
import { BookOpen, Award, CheckCircle2, User, GraduationCap, Mic, Sparkles, FileText } from 'lucide-react';

export type TabType = 'glossary' | 'experiences' | 'builder' | 'mock' | 'coaching' | 'portfolio';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isTeacherMode: boolean;
  onToggleTeacherMode: (isTeacher: boolean) => void;
  answerCount: number;
  revisedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isTeacherMode,
  onToggleTeacherMode,
  answerCount,
  revisedCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-blue-600/60 border border-blue-400/40 text-blue-100 px-2 py-0.5 rounded text-xs font-semibold tracking-wide">
              덕신고등학교
            </span>
            <span className="text-slate-200">2027학년도 대입 수시 면접 지도 플랫폼</span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-blue-200">학생부종합 · 학생부교과 실전 대비</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-blue-200 bg-white/10 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>완성 답변: <strong className="text-white">{revisedCount}</strong>/{answerCount}개</span>
            </div>

            {/* Teacher vs Student Mode Toggle */}
            <div className="inline-flex p-0.5 bg-black/30 rounded-lg border border-white/20">
              <button
                type="button"
                onClick={() => onToggleTeacherMode(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  !isTeacherMode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                aria-pressed={!isTeacherMode}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>학생 모드</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleTeacherMode(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isTeacherMode
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                aria-pressed={isTeacherMode}
              >
                <User className="w-3.5 h-3.5" />
                <span>교사/코칭 모드</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Title & Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            면
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                고3 면접 연습실
              </h1>
              <span className="bg-indigo-50 text-indigo-700 text-2xs px-2 py-0.5 rounded-full font-bold border border-indigo-200">
                2027 대입
              </span>
              {isTeacherMode && (
                <span className="bg-amber-100 text-amber-900 text-2xs px-2 py-0.5 rounded-full font-bold border border-amber-300">
                  교사 코칭 모드
                </span>
              )}
            </div>
            <p className="text-2xs text-slate-500 hidden sm:block">
              {isTeacherMode
                ? '학생 루브릭 심사 · 꼬리질문 코칭 · 피드백 점검'
                : 'STAR 경험 정리 ➔ 질문 의도 파악 ➔ 꼬리질문 대응 ➔ 피드백 수정'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 xl:pb-0 scrollbar-none" aria-label="메인 메뉴">
          <button
            type="button"
            onClick={() => onSelectTab('glossary')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'glossary'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>면접 사전</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('experiences')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'experiences'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>경험 정리(STAR)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('builder')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'builder'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>답변 빌더·꼬리질문</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('mock')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'mock'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>실전 모의면접</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('coaching')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'coaching'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>교사 피드백</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('portfolio')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentTab === 'portfolio'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>포트폴리오 출력</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
