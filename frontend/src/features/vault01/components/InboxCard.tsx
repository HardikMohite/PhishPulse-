/**
 * InboxCard
 * One email row in the Gmail-style inbox list.
 * Answered emails show a faint colored tint (green = correct, red = wrong).
 * The is_phishing answer is never passed here — tinting uses session answers.
 */

import { Star } from 'lucide-react';
import type { LevelEmail, SessionAnswer } from '../types/vault01.types';

interface InboxCardProps {
  email: LevelEmail;
  isSelected: boolean;
  sessionAnswer?: SessionAnswer;
  onClick: () => void;
}

export default function InboxCard({ email, isSelected, sessionAnswer, onClick }: InboxCardProps) {
  const isAnswered = !!sessionAnswer;
  const wasCorrect = sessionAnswer?.is_correct;
  const isUnread = !isAnswered;

  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center px-2 h-[58px] cursor-pointer border-b border-[#3c4043]/50
        hover:shadow-[inset_1px_0_0_#dadce0,-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,0.3)]
        transition-all
        ${isSelected
          ? 'bg-[#414549]'
          : isAnswered
          ? wasCorrect
            ? 'bg-green-900/20 border-l-2 border-l-green-500'
            : 'bg-red-900/20 border-l-2 border-l-red-500'
          : 'bg-[#202124]'
        }
      `}
    >
      {/* Checkbox — hover only */}
      <div className="w-8 flex items-center justify-center shrink-0">
        <div className="w-4 h-4 border-2 border-[#9aa0a6] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Star */}
      <div className="w-6 flex items-center justify-center shrink-0 mr-2">
        <Star className="w-4 h-4 text-[#9aa0a6] hover:text-[#fdd663] transition-colors cursor-pointer" />
      </div>

      {/* Sender name */}
      <div className={`w-[160px] shrink-0 truncate text-sm ${isUnread ? 'font-bold text-[#e3e3e3]' : 'font-normal text-[#9aa0a6]'}`}>
        {email.sender}
      </div>

      {/* Subject + preview */}
      <div className="flex-1 truncate px-3 flex items-center min-w-0">
        <span className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'font-normal text-[#9aa0a6]'}`}>{email.subject}</span>
        <span className="text-sm text-[#5f6368] shrink-0 mx-1"> - </span>
        <span className="text-sm text-[#5f6368] truncate">{email.preview}</span>
      </div>

      {/* Answered indicator */}
      {isAnswered && (
        <div
          className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded mr-2 ${
            wasCorrect
              ? 'text-green-400 bg-green-400/10'
              : 'text-red-400 bg-red-400/10'
          }`}
        >
          {wasCorrect ? 'Correct' : 'Missed'}
        </div>
      )}

      {/* Time */}
      <div className={`w-16 shrink-0 text-right text-xs ${isUnread ? 'font-semibold text-[#e3e3e3]' : 'text-[#9aa0a6]'}`}>{email.time}</div>
    </div>
  );
}