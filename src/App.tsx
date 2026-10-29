/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { GlossaryView } from './components/GlossaryView';
import { ExperienceBankView } from './components/ExperienceBankView';
import { AnswerBuilderView } from './components/AnswerBuilderView';
import { MockInterviewView } from './components/MockInterviewView';
import { TeacherCoachingView } from './components/TeacherCoachingView';
import { PortfolioView } from './components/PortfolioView';

import { INITIAL_GLOSSARY } from './data/initialGlossary';
import { INITIAL_QUESTIONS } from './data/initialQuestions';
import { INITIAL_EXPERIENCES } from './data/initialExperiences';
import { INITIAL_ANSWERS } from './data/initialAnswers';

import { ExperienceCard, StudentAnswer, TeacherFeedback } from './types/interview';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('builder');
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);

  // Persistent or In-Memory State
  const [experiences, setExperiences] = useState<ExperienceCard[]>(() => {
    const saved = localStorage.getItem('deoksin_experiences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_EXPERIENCES;
  });

  const [answers, setAnswers] = useState<StudentAnswer[]>(() => {
    const saved = localStorage.getItem('deoksin_answers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_ANSWERS;
  });

  const [selectedExpForAnswer, setSelectedExpForAnswer] = useState<ExperienceCard | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('deoksin_experiences', JSON.stringify(experiences));
  }, [experiences]);

  useEffect(() => {
    localStorage.setItem('deoksin_answers', JSON.stringify(answers));
  }, [answers]);

  // Handlers for Experience Cards
  const handleAddExperience = (newExp: Omit<ExperienceCard, 'id' | 'updatedAt'>) => {
    const card: ExperienceCard = {
      ...newExp,
      id: `exp-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setExperiences((prev) => [card, ...prev]);
  };

  const handleUpdateExperience = (updatedExp: ExperienceCard) => {
    setExperiences((prev) => prev.map((exp) => (exp.id === updatedExp.id ? updatedExp : exp)));
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleSelectExpForAnswer = (exp: ExperienceCard) => {
    setSelectedExpForAnswer(exp);
    setCurrentTab('builder');
  };

  // Handlers for Answers
  const handleSaveAnswer = (savedAnswer: StudentAnswer) => {
    setAnswers((prev) => {
      const exists = prev.some((a) => a.id === savedAnswer.id || a.questionId === savedAnswer.questionId);
      if (exists) {
        return prev.map((a) =>
          a.id === savedAnswer.id || a.questionId === savedAnswer.questionId ? savedAnswer : a
        );
      }
      return [savedAnswer, ...prev];
    });
  };

  // Handlers for Teacher Feedback
  const handleSaveTeacherFeedback = (answerId: string, feedback: TeacherFeedback) => {
    setAnswers((prev) =>
      prev.map((a) => {
        if (a.id === answerId) {
          return {
            ...a,
            teacherFeedback: feedback,
            status: a.revisedAnswer ? 'revised_complete' : 'needs_revision',
            updatedAt: new Date().toISOString(),
          };
        }
        return a;
      })
    );
  };

  // Import full portfolio data
  const handleImportData = (data: { answers: StudentAnswer[]; experiences: ExperienceCard[] }) => {
    setAnswers(data.answers);
    setExperiences(data.experiences);
  };

  const revisedCount = answers.filter((a) => a.status === 'revised_complete').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isTeacherMode={isTeacherMode}
        onToggleTeacherMode={(mode) => {
          setIsTeacherMode(mode);
          if (mode && currentTab !== 'coaching') {
            setCurrentTab('coaching');
          }
        }}
        answerCount={answers.length}
        revisedCount={revisedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {currentTab === 'glossary' && (
          <GlossaryView
            terms={INITIAL_GLOSSARY}
            onNavigateToBuilder={() => setCurrentTab('builder')}
          />
        )}

        {currentTab === 'experiences' && (
          <ExperienceBankView
            experiences={experiences}
            onAddExperience={handleAddExperience}
            onUpdateExperience={handleUpdateExperience}
            onDeleteExperience={handleDeleteExperience}
            onSelectForAnswer={handleSelectExpForAnswer}
          />
        )}

        {currentTab === 'builder' && (
          <AnswerBuilderView
            questions={INITIAL_QUESTIONS}
            experiences={experiences}
            answers={answers}
            onSaveAnswer={handleSaveAnswer}
            selectedExpForAnswer={selectedExpForAnswer}
            onClearSelectedExp={() => setSelectedExpForAnswer(null)}
            onNavigateToMock={() => setCurrentTab('mock')}
          />
        )}

        {currentTab === 'mock' && (
          <MockInterviewView
            questions={INITIAL_QUESTIONS}
            answers={answers}
          />
        )}

        {currentTab === 'coaching' && (
          <TeacherCoachingView
            answers={answers}
            onSaveFeedback={handleSaveTeacherFeedback}
          />
        )}

        {currentTab === 'portfolio' && (
          <PortfolioView
            answers={answers}
            experiences={experiences}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            덕신고등학교 2027학년도 대입 면접 지도실 · 고3 면접 연습실
          </p>
          <p>
            본 프로그램은 고3 학생의 학교생활기록부 기반 면접 역량 강화와 교사의 체계적인 루브릭 피드백 지도를 지원합니다.
          </p>
          <p className="text-2xs text-slate-400">
            © 2026-2027 Deoksin High School College Admission Interview Coaching Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
