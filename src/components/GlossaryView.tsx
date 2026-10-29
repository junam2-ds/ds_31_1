import React, { useState, useMemo } from 'react';
import { GlossaryTerm, TermCategory } from '../types/interview';
import { Search, BookOpen, ThumbsUp, AlertTriangle, Eye, ArrowRight, Tag } from 'lucide-react';

interface GlossaryViewProps {
  terms: GlossaryTerm[];
  onNavigateToBuilder: () => void;
}

const CATEGORIES: ('전체' | TermCategory)[] = [
  '전체',
  '평가요소',
  '답변기법',
  '면접규칙',
  '면접방식',
];

export const GlossaryView: React.FC<GlossaryViewProps> = ({ terms, onNavigateToBuilder }) => {
  const [selectedCategory, setSelectedCategory] = useState<'전체' | TermCategory>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(terms[0]?.id || null);

  const filteredTerms = useMemo(() => {
    return terms.filter((item) => {
      const matchCat = selectedCategory === '전체' || item.category === selectedCategory;
      const matchQuery =
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.easySummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [terms, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white p-5 rounded-2xl border border-blue-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              <BookOpen className="w-3.5 h-3.5" />
              <span>쉽게 푸는 면접 개념 백과</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              어려운 면접 용어, 쉬운 설명과 합격 예시로 정복하기
            </h2>
            <p className="text-sm text-slate-600">
              블라인드 면접 규정부터 STAR 기법, 꼬리질문 대처법까지! 면접관의 속마음과 실전 예시를 확인하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToBuilder}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition shadow-xs"
          >
            <span>이 기법으로 답변 쓰기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="용어, 키워드 검색 (예: 블라인드, 세특)"
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Term Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTerms.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            검색 결과와 일치하는 면접 용어가 없습니다.
          </div>
        ) : (
          filteredTerms.map((term) => {
            const isExpanded = expandedTermId === term.id;
            return (
              <div
                key={term.id}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-blue-400 shadow-md ring-1 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Header (Click to toggle) */}
                <button
                  type="button"
                  onClick={() => setExpandedTermId(isExpanded ? null : term.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4"
                  aria-expanded={isExpanded}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {term.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {term.term}
                      </h3>
                    </div>
                    <p className="text-sm text-blue-700 font-medium">
                      💡 {term.easySummary}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 shrink-0">
                    {isExpanded ? '접기 ▲' : '상세보기 ▼'}
                  </span>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 space-y-4 border-t border-slate-100 pt-4 bg-slate-50/50">
                    {/* Detailed explanation */}
                    <div className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
                      {term.detailedExplanation}
                    </div>

                    {/* Interviewer Intent Box */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-1">
                        <Eye className="w-4 h-4 text-purple-700" />
                        <span>면접관의 진짜 속마음 (평가 포인트)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-purple-950 font-medium">
                        "{term.interviewerIntent}"
                      </p>
                    </div>

                    {/* Good vs Bad Examples */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>합격하는 좋은 예시</span>
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-normal">
                          {term.goodExample}
                        </p>
                      </div>

                      <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>흔히 하는 탈락 실수</span>
                        </div>
                        <p className="text-xs sm:text-sm text-rose-950 leading-relaxed font-normal">
                          {term.badExample}
                        </p>
                      </div>
                    </div>

                    {/* Tags & Action Button */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        {term.tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={onNavigateToBuilder}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <span>이 기법으로 실전 답변 구성하기</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
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
