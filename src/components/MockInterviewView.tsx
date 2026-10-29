import React, { useState, useEffect, useRef } from 'react';
import { QuestionItem, StudentAnswer } from '../types/interview';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Shuffle,
  Eye,
  EyeOff,
  Mic,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface MockInterviewViewProps {
  questions: QuestionItem[];
  answers: StudentAnswer[];
  onFinishPractice?: (questionId: string, durationSec: number) => void;
}

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({
  questions,
  answers,
  onFinishPractice,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(questions[0]?.id || '');
  const [timeLeft, setTimeLeft] = useState<number>(100); // 100 seconds timer
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState<boolean>(false);
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);
  const [memoNote, setMemoNote] = useState<string>('');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [recordedSpeech, setRecordedSpeech] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQuestion = questions.find((q) => q.id === selectedQuestionId) || questions[0];
  const matchingAnswer = answers.find((a) => a.questionId === currentQuestion.id);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (isMicActive) stopMic();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isMicActive]);

  // Korean Speech Synthesis (TTS)
  const handleSpeakTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('현재 브라우저에서는 음성 합성(TTS)을 지원하지 않습니다.');
      return;
    }

    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95; // slightly deliberate pace like an interviewer
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeakingTTS(true);
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Web Speech API)
  const startMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsMicActive(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setRecordedSpeech((prev) => `${prev} ${transcript}`.trim());
      };

      recognition.onerror = () => {
        setIsMicActive(false);
      };

      recognition.onend = () => {
        if (isRunning) {
          try {
            recognition.start();
          } catch {}
        } else {
          setIsMicActive(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsMicActive(true);
    } catch {
      setIsMicActive(true);
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsMicActive(false);
  };

  const handleStartTimer = () => {
    setIsRunning(true);
    startMic();
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
    stopMic();
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    stopMic();
    setTimeLeft(100);
    setRecordedSpeech('');
  };

  const handleRandomQuestion = () => {
    handleResetTimer();
    const randomIndex = Math.floor(Math.random() * questions.length);
    setSelectedQuestionId(questions[randomIndex].id);
  };

  // Timer visual indicators
  const progressPercent = (timeLeft / 100) * 100;
  let timerBadge = 'text-emerald-600 border-emerald-400 bg-emerald-50';
  if (timeLeft <= 25) {
    timerBadge = 'text-rose-600 border-rose-400 bg-rose-50 animate-pulse';
  } else if (timeLeft <= 50) {
    timerBadge = 'text-amber-600 border-amber-400 bg-amber-50';
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/30 text-rose-200 border border-rose-400/30">
              <Mic className="w-3.5 h-3.5 text-rose-300" />
              <span>실전 100초 면접 시뮬레이션</span>
            </div>
            <h2 className="text-xl font-bold">실전 면접관 시뮬레이터</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              면접관 음성으로 질문을 듣고, 100초 타이머에 맞춰 실제 목소리로 답변하는 실전 훈련입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRandomQuestion}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition shadow-xs"
          >
            <Shuffle className="w-4 h-4" />
            <span>실전 무작위 기출 추첨</span>
          </button>
        </div>
      </div>

      {/* Blind Interview Warning Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-center justify-between text-xs text-amber-950">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>블라인드 면접 주의: </strong> 답변 시 본인의 출신 고교명(덕신고), 수험번호 외 실명, 부모님의 직업 발설은 감점 사유입니다!
          </span>
        </div>
      </div>

      {/* Main Interview Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interviewer & Question & Speech */}
        <div className="lg:col-span-2 space-y-5">
          {/* Virtual Interviewer Visual Box */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white text-center space-y-4 relative overflow-hidden shadow-lg border border-slate-800">
            {/* Background subtle effect */}
            <div className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
              <span>{currentQuestion.field} 분야 면접관</span>
              <span>·</span>
              <span className="text-amber-400">{currentQuestion.evaluationCategory} 평가</span>
            </div>

            {/* Question Display */}
            <div className="py-2 space-y-2">
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                Question
              </p>
              <h3 className="text-lg sm:text-2xl font-bold leading-relaxed text-slate-100 max-w-2xl mx-auto">
                "{currentQuestion.questionText}"
              </h3>
            </div>

            {/* Audio TTS Button */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSpeakTTS}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  isSpeakingTTS
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                {isSpeakingTTS ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeakingTTS ? '음성 중지' : '면접관 질문 음성 듣기 (TTS)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCheatSheet(!showCheatSheet)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition"
              >
                {showCheatSheet ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showCheatSheet ? '내 답변 가리기' : '내 답변 참고하기'}</span>
              </button>
            </div>
          </div>

          {/* Cheat Sheet (Toggleable) */}
          {showCheatSheet && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>내가 준비한 답변 ({matchingAnswer?.revisedAnswer ? '2차 수정본' : '1차 초안'})</span>
                <span className="text-emerald-600 font-semibold">참고 모드 활성화됨</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal bg-slate-50 p-3 rounded-lg border border-slate-100">
                {matchingAnswer?.revisedAnswer?.fullText ||
                  matchingAnswer?.draft?.fullText ||
                  '아직 이 질문에 대한 답변이 작성되지 않았습니다. [답변 빌더]에서 먼저 작성해 보세요.'}
              </p>
            </div>
          )}

          {/* Speech Recording / Transcription Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isMicActive ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  실전 발화 음성 인식 / 실시간 스크립트
                </h4>
              </div>
              <span className="text-2xs text-slate-500">
                {isMicActive ? '음성 인식 진행 중...' : '마이크 대기 상태'}
              </span>
            </div>

            <textarea
              rows={4}
              value={recordedSpeech}
              onChange={(e) => setRecordedSpeech(e.target.value)}
              placeholder="타이머를 시작하고 실제 면접처럼 소리 내어 말해보세요. 음성이 텍스트로 자동 기록되거나 직접 메모할 수 있습니다."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 font-normal leading-relaxed"
            />
          </div>
        </div>

        {/* Right 1 Col: 100s Timer HUD & Teacher Observation Notes */}
        <div className="space-y-5">
          {/* Timer HUD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>답변 타이머</span>
              </span>
              <span>기준: 100초 (적정 60~85초)</span>
            </div>

            {/* Big Countdown Number */}
            <div
              className={`text-5xl sm:text-6xl font-black py-4 rounded-2xl border-2 transition-all ${timerBadge}`}
            >
              {timeLeft}
              <span className="text-base font-bold ml-1 text-slate-500">초</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 25
                    ? 'bg-rose-500'
                    : timeLeft <= 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-xs"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>시작 (답변 발화)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition shadow-xs"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>일시정지</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetTimer}
                className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                title="100초 초기화"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Observation Notes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>교사/학생 실전 관찰 메모</span>
              <span className="text-2xs font-normal text-slate-500">시선, 태도, 말속도</span>
            </h4>
            <div className="text-2xs text-slate-500 space-y-1">
              <div>✓ 시선 분산 및 천장/바닥 응시 여부 확인</div>
              <div>✓ 말끝 흐림(“~인 것 같습니다”) 지양 여부</div>
              <div>✓ 두괄식 첫 문장으로 15초 내 치고 나갔는가</div>
            </div>
            <textarea
              rows={3}
              value={memoNote}
              onChange={(e) => setMemoNote(e.target.value)}
              placeholder="모의면접 중 느낀 점(예: 손동작이 너무 잦음, 70초 지점에서 적절히 끊음 등)을 기록하세요."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
