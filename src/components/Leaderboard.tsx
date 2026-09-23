import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Printer, 
  Award, 
  CheckCircle2, 
  User, 
  Sparkles, 
  Download,
  FileText,
  Loader2
} from 'lucide-react';
import { Participant, Language } from '../types';
import { generateFinalResultsPDF } from '../utils/pdfExport';

interface LeaderboardProps {
  lang: Language;
  participants: Participant[];
  schoolName: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  lang,
  participants,
  schoolName
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Sort participants by total score descending
  const scoredParticipants = participants
    .filter(p => p.scores !== undefined)
    .sort((a, b) => (b.scores?.total || 0) - (a.scores?.total || 0));

  const firstPlace = scoredParticipants[0];
  const secondPlace = scoredParticipants[1];
  const thirdPlace = scoredParticipants[2];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExportingPDF(true);
      await generateFinalResultsPDF({
        schoolName,
        lang,
        participants
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export PDF from leaderboard:', err);
      alert(lang === 'kn' ? 'PDF ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಯಿತು.' : 'Failed to download PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-none print:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4 text-amber-700" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {lang === 'kn' ? 'ಸ್ಪರ್ಧೆಯ ಫಲಿತಾಂಶ ಮತ್ತು ಶ್ರೇಯಾಂಕ ಪಟ್ಟಿ' : 'Competition Results & Leaderboard'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {schoolName} • {lang === 'kn' ? 'ಆರಿಸಿ ಮಾತನಾಡು ಸ್ಪರ್ಧೆ' : 'Pick and Speech Competition'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap print:hidden">
          {pdfSuccess && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'kn' ? 'PDF ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!' : 'PDF Downloaded!'}</span>
            </span>
          )}

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-700 text-white hover:bg-rose-800 shadow-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            title="ಅಧಿಕೃತ ಫಲಿತಾಂಶ PDF ಡೌನ್‌ಲೋಡ್"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{lang === 'kn' ? 'PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ...' : 'Generating PDF...'}</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>{lang === 'kn' ? 'ಅಂತಿಮ ಫಲಿತಾಂಶ PDF' : 'Download PDF'}</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-700 text-white hover:bg-amber-800 shadow-xs transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'kn' ? 'ಮುದ್ರಿಸಿ (Print)' : 'Print Scorecard'}</span>
          </button>
        </div>
      </div>

      {/* Podium for Top 3 Winners (if at least 1 scored) */}
      {scoredParticipants.length > 0 && (
        <div className="bg-gradient-to-b from-amber-50/70 to-stone-50 rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xs">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              {lang === 'kn' ? 'ವಿಜೇತರ ಪೀಠ' : 'Winners Podium'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 sm:gap-6 pt-4 max-w-2xl mx-auto">
            
            {/* 2nd Place */}
            {secondPlace && (
              <div className="order-2 sm:order-1 w-full sm:w-44 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-stone-200 border-2 border-stone-400 text-stone-700 flex items-center justify-center font-black text-base shadow-sm mb-2">
                  🥈 ೨
                </div>
                <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs w-full text-center flex flex-col justify-between h-36">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400">
                      {lang === 'kn' ? 'ದ್ವಿತೀಯ ಬಹುಮಾನ' : '2nd Prize'}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm line-clamp-1 mt-0.5">
                      {secondPlace.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">
                      {secondPlace.schoolOrClass}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-lg font-mono font-bold text-stone-800">
                      {secondPlace.scores?.total}
                    </span>
                    <span className="text-xs text-stone-400"> / 50</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place (Tallest / Highlighted) */}
            {firstPlace && (
              <div className="order-1 sm:order-2 w-full sm:w-52 flex flex-col items-center -mt-4 sm:-mt-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-amber-600 text-amber-950 flex items-center justify-center font-black text-2xl shadow-md mb-2 animate-bounce">
                  🥇 ೧
                </div>
                <div className="bg-white rounded-3xl p-5 border-2 border-amber-400 shadow-md w-full text-center flex flex-col justify-between h-44 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    {lang === 'kn' ? 'ಪ್ರಥಮ ಬಹುಮಾನ' : 'Champion'}
                  </div>
                  <div className="mt-1">
                    <h4 className="font-extrabold text-stone-900 text-base line-clamp-1">
                      {firstPlace.name}
                    </h4>
                    <p className="text-xs text-amber-800 font-medium line-clamp-1">
                      {firstPlace.schoolOrClass}
                    </p>
                    {firstPlace.assignedTopic && (
                      <p className="text-[10px] text-stone-500 italic line-clamp-1 mt-1">
                        #{firstPlace.assignedTopic.number}: {lang === 'kn' ? firstPlace.assignedTopic.titleKn : firstPlace.assignedTopic.titleEn}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-amber-100">
                    <span className="text-2xl font-mono font-extrabold text-amber-700">
                      {firstPlace.scores?.total}
                    </span>
                    <span className="text-xs text-stone-500"> / 50</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {thirdPlace && (
              <div className="order-3 w-full sm:w-44 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-700/20 border-2 border-amber-700/50 text-amber-900 flex items-center justify-center font-black text-base shadow-sm mb-2">
                  🥉 ೩
                </div>
                <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs w-full text-center flex flex-col justify-between h-32">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400">
                      {lang === 'kn' ? 'ತೃತೀಯ ಬಹುಮಾನ' : '3rd Prize'}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm line-clamp-1 mt-0.5">
                      {thirdPlace.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">
                      {thirdPlace.schoolOrClass}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-lg font-mono font-bold text-stone-800">
                      {thirdPlace.scores?.total}
                    </span>
                    <span className="text-xs text-stone-400"> / 50</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Comprehensive Results Table */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs overflow-hidden print:border-stone-300">
        <div className="p-4 sm:p-5 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">
            {lang === 'kn' ? 'ಸಂಪೂರ್ಣ ಶ್ರೇಯಾಂಕ ಪಟ್ಟಿ ಮತ್ತು ಅಂಕಗಳ ವಿವರ' : 'Full Evaluation Rankings & Mark Breakdown'}
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            {lang === 'kn' ? `ಮೌಲ್ಯಮಾಪನಗೊಂಡ ಸ್ಪರ್ಧಿಗಳು: ${scoredParticipants.length}` : `Scored Participants: ${scoredParticipants.length}`}
          </span>
        </div>

        {scoredParticipants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3 sm:px-4">{lang === 'kn' ? 'ಶ್ರೇಯಾಂಕ' : 'Rank'}</th>
                  <th className="py-3 px-3 sm:px-4">{lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂ.' : 'Chest #'}</th>
                  <th className="py-3 px-3 sm:px-4">{lang === 'kn' ? 'ಸ್ಪರ್ಧಿಯ ಹೆಸರು' : 'Name'}</th>
                  <th className="py-3 px-3 sm:px-4">{lang === 'kn' ? 'ತರಗತಿ / ಶಾಲೆ' : 'Class / School'}</th>
                  <th className="py-3 px-3 sm:px-4 text-center">{lang === 'kn' ? 'ವಿಷಯ (೧೦)' : 'Content'}</th>
                  <th className="py-3 px-3 sm:px-4 text-center">{lang === 'kn' ? 'ಭಾಷೆ (೧೦)' : 'Fluency'}</th>
                  <th className="py-3 px-3 sm:px-4 text-center">{lang === 'kn' ? 'ಹಾವಭಾವ (೧೦)' : 'Body Lang'}</th>
                  <th className="py-3 px-3 sm:px-4 text-center">{lang === 'kn' ? 'ಸಮಯ (೧೦)' : 'Time'}</th>
                  <th className="py-3 px-3 sm:px-4 text-center">{lang === 'kn' ? 'ಪ್ರಭಾವ (೧೦)' : 'Impact'}</th>
                  <th className="py-3 px-3 sm:px-4 text-center font-bold text-amber-900">{lang === 'kn' ? 'ಒಟ್ಟು (೫೦)' : 'Total (/50)'}</th>
                  <th className="py-3 px-3 sm:px-4">{lang === 'kn' ? 'ಷರಾ' : 'Remarks'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {scoredParticipants.map((p, index) => {
                  const rank = index + 1;
                  const s = p.scores!;
                  return (
                    <tr key={p.id} className={rank <= 3 ? 'bg-amber-50/30 font-medium' : 'hover:bg-stone-50'}>
                      <td className="py-3 px-3 sm:px-4 font-bold text-stone-900">
                        {rank === 1 ? '🥇 ೧' : rank === 2 ? '🥈 ೨' : rank === 3 ? '🥉 ೩' : `#${rank}`}
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-amber-800">
                        #{p.chestNo}
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-bold text-stone-900">
                        {p.name}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-stone-600">
                        {p.schoolOrClass}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">{s.content}</td>
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">{s.language}</td>
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">{s.presentation}</td>
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">{s.timeManagement}</td>
                      <td className="py-3 px-3 sm:px-4 text-center font-mono">{s.impact}</td>
                      <td className="py-3 px-3 sm:px-4 text-center font-mono font-extrabold text-base text-amber-700">
                        {s.total}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-stone-500 text-xs italic max-w-xs truncate">
                        {s.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-stone-500 text-sm">
            {lang === 'kn'
              ? 'ಇನ್ನೂ ಯಾವುದೇ ಸ್ಪರ್ಧಿಗೆ ಅಂಕಗಳನ್ನು ನೀಡಿಲ್ಲ. "ಸ್ಪರ್ಧಾ ಗಡಿಯಾರ" ಅಥವಾ "ಸ್ಪರ್ಧಿಗಳು" ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಅಂಕಗಳನ್ನು ನಮೂದಿಸಿ.'
              : 'No evaluations completed yet. Record judging scores to generate the leaderboard.'}
          </div>
        )}
      </div>

    </div>
  );
};
