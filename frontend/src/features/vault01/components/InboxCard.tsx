/**
 * InboxCard
 * One email row in the Gmail-style inbox list.
 *
 * REFACTOR CHANGES:
 * - Accepts `answerRecord` (AnswerRecord | undefined) from new answers map
 * - Shows live result tag badge (THREAT BLOCKED / SAFE VERIFIED / MISSED THREAT / FALSE ALARM)
 * - Answered rows: reduced opacity, disabled hover effects, locked cursor
 * - Uses email.id as key (never array index)
 */

import { Star } from 'lucide-react';
import type { LevelEmail } from '../types/vault01.types';
import type { AnswerRecord } from '../hooks/useVault01';

interface InboxCardProps {
  email: LevelEmail;
  isSelected: boolean;
  answerRecord?: AnswerRecord;
  onClick: () => void;
}

const TAG_STYLES: Record<AnswerRecord['tag'], string> = {
  'THREAT BLOCKED': 'text-green-400 bg-green-400/10 border border-green-400/30',
  'SAFE VERIFIED':  'text-green-400 bg-green-400/10 border border-green-400/30',
  'MISSED THREAT':  'text-red-400 bg-red-400/10 border border-red-400/30',
  'FALSE ALARM':    'text-amber-400 bg-amber-400/10 border border-amber-400/30',
};

export default function InboxCard({ email, isSelected, answerRecord, onClick }: InboxCardProps) {
  const isAnswered = !!answerRecord;
  const isUnread = !isAnswered;

  // Row background based on result
  let rowBg = 'bg-[#202124]';
  if (isSelected) {
    rowBg = 'bg-[#414549]';
  } else if (isAnswered) {
    if (answerRecord.tag === 'THREAT BLOCKED' || answerRecord.tag === 'SAFE VERIFIED') {
      rowBg = 'bg-green-900/20 border-l-2 border-l-green-500';
    } else {
      rowBg = 'bg-red-900/20 border-l-2 border-l-red-500';
    }
  }

  return (
    <div
      onClick={isAnswered ? undefined : onClick}
      className={`
        flex items-center px-2 h-[58px] border-b border-[#3c4043]/50 transition-all
        ${isAnswered
          ? 'opacity-60 cursor-default'
          : 'cursor-pointer group hover:shadow-[inset_1px_0_0_#dadce0,-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,0.3)]'
        }
        ${rowBg}
      `}
    >
      {/* Checkbox — hover only, hide on answered */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {!isAnswered && (
          <div className="w-4 h-4 border-2 border-[#9aa0a6] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Star */}
      <div className="w-6 flex items-center justify-center shrink-0 mr-2">
        <Star className={`w-4 h-4 ${isAnswered ? 'text-[#9aa0a6]/40' : 'text-[#9aa0a6] hover:text-[#fdd663] transition-colors cursor-pointer'}`} />
      </div>

      {/* Sender name */}
      <div className={`w-[160px] shrink-0 truncate text-sm ${isUnread ? 'font-bold text-[#e3e3e3]' : 'font-normal text-[#9aa0a6]'}`}>
        {email.sender}
      </div>

      {/* Subject + preview */}
      <div className="flex-1 truncate px-3 flex items-center min-w-0">
        <span className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'font-normal text-[#9aa0a6]'}`}>
          {email.subject}
        </span>
        <span className="text-sm text-[#5f6368] shrink-0 mx-1"> - </span>
        <span className="text-sm text-[#5f6368] truncate">{email.preview}</span>
      </div>

      {/* Live result tag badge */}
      {isAnswered && answerRecord && (
        <div className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded mr-2 ${TAG_STYLES[answerRecord.tag]}`}>
          {answerRecord.tag}
        </div>
      )}

      {/* Time */}
      <div className={`w-16 shrink-0 text-right text-xs ${isUnread ? 'font-semibold text-[#e3e3e3]' : 'text-[#9aa0a6]'}`}>
        {email.time}
      </div>
    </div>
  );
}