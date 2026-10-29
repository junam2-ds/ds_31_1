import React, { useState } from 'react';
import { ExperienceCard, ActivityCategory } from '../types/interview';
import { Sparkles, Plus, Edit2, Trash2, ArrowRight, CheckCircle2, BookmarkCheck, Lightbulb } from 'lucide-react';

interface ExperienceBankViewProps {
  experiences: ExperienceCard[];
  onAddExperience: (exp: Omit<ExperienceCard, 'id' | 'updatedAt'>) => void;
  onUpdateExperience: (exp: ExperienceCard) => void;
  onDeleteExperience: (id: string) => void;
  onSelectForAnswer: (exp: ExperienceCard) => void;
}

const CATEGORIES: ('전체' | ActivityCategory)[] = [
  '전체',
  '과목세특',
  '동아리',
  '자율활동',
  '진로활동',
  '봉사/독서',
  '개인탐구',
];

export const ExperienceBankView: React.FC<ExperienceBankViewProps> = ({
  experiences,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  onSelectForAnswer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'전체' | ActivityCategory>('전체');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ExperienceCard | null>(null);

  // Form State
  const [category, setCategory] = useState<ActivityCategory>('과목세특');
  const [title, setTitle] = useState('');
  const [subjectOrClub, setSubjectOrClub] = useState('');
  const [gradeLevel, setGradeLevel] = useState<'1학년' | '2학년' | '3학년'>('2학년');
  const [keywordsText, setKeywordsText] = useState('');
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [resultLearned, setResultLearned] = useState('');

  const openAddModal = () => {
    setEditingCard(null);
    setCategory('과목세특');
    setTitle('');
    setSubjectOrClub('');
    setGradeLevel('2학년');
    setKeywordsText('');
    setSituation('');
    setTask('');
    setAction('');
    setResultLearned('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: ExperienceCard) => {
    setEditingCard(exp);
    setCategory(exp.category);
    setTitle(exp.title);
    setSubjectOrClub(exp.subjectOrClub);
    setGradeLevel(exp.gradeLevel);
    setKeywordsText(exp.keywords.join(', '));
    setSituation(exp.situation);
    setTask(exp.task);
    setAction(exp.action);
    setResultLearned(exp.resultLearned);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !action.trim()) {
      alert('활동 제목과 구체적 행동(Action)은 필수 항목입니다.');
      return;
    }

    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (editingCard) {
      onUpdateExperience({
        ...editingCard,
        category,
        title,
        subjectOrClub,
        gradeLevel,
        keywords,
        situation,
        task,
        action,
        resultLearned,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    } else {
      onAddExperience({
        category,
        title,
        subjectOrClub,
        gradeLevel,
        keywords,
        situation,
        task,
        action,
        resultLearned,
      });
    }

    setIsModalOpen(false);
  };

  const filteredExperiences = experiences.filter((exp) =>
    selectedCategory === '전체' ? true : exp.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>학교생활기록부 경험 자산화</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              STAR 기법으로 나의 학교생활 경험을 강력한 무기로 만들기
            </h2>
            <p className="text-sm text-slate-600">
              “참여했다”라는 단순 나열은 NO! [상황-과제-나의 구체적 행동-배운 점]으로 구조화하여 면접관을 설득하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>새 경험 카드 작성</span>
          </button>
        </div>
      </div>

      {/* Guide Box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-blue-600 mb-0.5">S : 상황 (Situation)</div>
          <div className="text-xs text-slate-600">어떤 배경, 문제, 호기심에서 출발했는가?</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-indigo-600 mb-0.5">T : 과제 (Task)</div>
          <div className="text-xs text-slate-600">내가 해결해야 했던 목표와 내 역할은?</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-amber-600 mb-0.5">A : 행동 (Action) ★핵심</div>
          <div className="text-xs text-slate-600">내가 직접 실행한 탐구/실험/극복 조치는?</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-emerald-600 mb-0.5">R : 결과/배운점 (Result)</div>
          <div className="text-xs text-slate-600">무엇을 배웠고 어떻게 성장했는가?</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Experience Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExperiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {exp.category}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {exp.gradeLevel} · {exp.subjectOrClub}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {exp.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(exp)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
                    title="수정"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('이 경험 카드를 삭제하시겠습니까?')) {
                        onDeleteExperience(exp.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* STAR Blocks */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700 mr-1.5">[S·T 상황 및 목표]</span>
                  <span className="text-slate-600">{exp.situation} {exp.task}</span>
                </div>
                <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                  <span className="font-bold text-amber-900 mr-1.5">[A 나의 구체적 행동]</span>
                  <span className="text-amber-950 leading-relaxed font-medium">{exp.action}</span>
                </div>
                <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/60">
                  <span className="font-bold text-emerald-900 mr-1.5">[R 배운 점 및 변화]</span>
                  <span className="text-emerald-950 leading-relaxed">{exp.resultLearned}</span>
                </div>
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-1">
                {exp.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-2xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Action footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-2xs text-slate-400">최종 수정: {exp.updatedAt}</span>
              <button
                type="button"
                onClick={() => onSelectForAnswer(exp)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <span>이 경험으로 답변 만들기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCard ? '경험 카드 수정' : '새 STAR 경험 카드 작성'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                닫기 ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    활동 구분
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="과목세특">과목세특</option>
                    <option value="동아리">동아리</option>
                    <option value="자율활동">자율활동</option>
                    <option value="진로활동">진로활동</option>
                    <option value="봉사/독서">봉사/독서</option>
                    <option value="개인탐구">개인탐구</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    학년
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value as any)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="1학년">1학년</option>
                    <option value="2학년">2학년</option>
                    <option value="3학년">3학년</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    과목명 / 동아리명
                  </label>
                  <input
                    type="text"
                    value={subjectOrClub}
                    onChange={(e) => setSubjectOrClub(e.target.value)}
                    placeholder="예: 지구과학Ⅱ, 창의로봇반"
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  활동 제목 (학생부에 기재된 핵심 활동)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 강화도 갯벌 생태계의 탄소 흡수원 잠재력 분석"
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  핵심 키워드 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="블루카본, 데이터분석, 탄소중립"
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* STAR Form Fields */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                    <span>1. 상황 (Situation) - 계기 및 직면한 문제</span>
                  </label>
                  <textarea
                    rows={2}
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="어떤 수업이나 사건에서 호기심이 생겼는지, 어떤 문제가 있었는지 작성하세요."
                    className="w-full text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                    <span>2. 과제 (Task) - 해결해야 했던 목표와 내 역할</span>
                  </label>
                  <textarea
                    rows={2}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="조원들과 함께 무엇을 달성하고자 했으며, 나의 구체적 역할은 무엇이었나요?"
                    className="w-full text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200">
                  <label className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1">
                    <span>3. 나의 구체적 행동 (Action) ★ 가장 중요</span>
                    <span className="text-2xs font-normal text-amber-700">"참여했다" 대신 "직접 조사·실험·분석했다"</span>
                  </label>
                  <textarea
                    rows={3}
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="내가 직접 읽은 책/논문, 설계한 실험 변인, 오류를 분석해 다시 시도한 방법 등을 구체적으로 서술하세요."
                    className="w-full text-xs sm:text-sm bg-white border border-amber-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-200">
                  <label className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1">
                    <span>4. 결과 및 배운 점 (Result & Learned)</span>
                    <span className="text-2xs font-normal text-emerald-700">단순 "뿌듯함" 대신 "내적 변화와 사고의 확장"</span>
                  </label>
                  <textarea
                    rows={2}
                    value={resultLearned}
                    onChange={(e) => setResultLearned(e.target.value)}
                    placeholder="이 활동 전과 후 나의 생각/태도가 어떻게 달라졌고, 대학 입학 후 어떤 학업으로 연결하고 싶은가요?"
                    className="w-full text-xs sm:text-sm bg-white border border-emerald-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
