'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { RichTextViewer } from '@/components/RichTextViewer';
import { LocalDateTime } from '@/components/LocalDateTime';
import { getWeekLabelFromWeekNumber } from '@/lib/weekUtils';

export const RECENT_RECORDS = 3;
const PAGE_SIZE = 10;

const CONFIDENCE_LABEL: Record<string, string> = {
  GOOD: '😊 Bine',
  OK: '😐 OK',
  HARD: '😓 Greu',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfidenceLevel {
  id: number;
  day: Date | string;
  level: string;
}

interface CheckinAnswer {
  id: number;
  checked: boolean;
  stringValue: string | null;
  updatedAt: Date | string;
  flag: { label: string };
}

export interface CheckinDay {
  dayKey: string;
  answers: CheckinAnswer[];
}

interface DailyJournal {
  id: number;
  day: Date | string;
  myScore: number;
  whatDidGood: string | null;
  whatDidWrong: string | null;
  whatCanDoBetter: string | null;
  updatedAt: Date | string;
}

interface WeeklyScope {
  id: number;
  weekNumber: number;
  year: number;
  scope: string;
  accomplished: boolean | null;
  updatedAt: Date | string;
}

interface ImprovementRating {
  id: number;
  day: Date | string;
  score: number;
}

interface ImprovementWay {
  id: number;
  title: string;
  ratings: ImprovementRating[];
}

interface LibraryItem {
  id: number;
  name: string;
  reads: { readAt: Date | string }[];
}

export interface PlayerSectionsProps {
  confidenceLevels: ConfidenceLevel[];
  checkinsByDay: CheckinDay[];
  dailyJournals: DailyJournal[];
  weeklyScopes: WeeklyScope[];
  improvementWays: ImprovementWay[];
  libraryItems: LibraryItem[];
}

type ModalSection =
  | 'confidence'
  | 'checkin'
  | 'journal'
  | 'scope'
  | 'improvement'
  | 'library';

const MODAL_TITLES: Record<ModalSection, string> = {
  confidence: 'Nivelul de încredere — Istoric complet',
  checkin: 'Checkin — Istoric complet',
  journal: 'Jurnal — Istoric complet',
  scope: 'Obiective săptămânale — Istoric complet',
  improvement: 'Modalități de îmbunătățire — Evaluări',
  library: 'Bibliotecă — Toate materialele',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paginate<T>(arr: T[], page: number): T[] {
  return arr.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

function calcTotalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  totalCount,
  section,
  onOpen,
}: {
  title: string;
  totalCount: number;
  section: ModalSection;
  onOpen: (s: ModalSection) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-semibold">{title}</h2>
      {totalCount > RECENT_RECORDS && (
        <button
          type="button"
          onClick={() => onOpen(section)}
          className="text-xs text-blue-500 hover:underline"
        >
          Vezi tot ({totalCount})
        </button>
      )}
    </div>
  );
}

function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-40"
      >
        <ChevronLeft size={14} /> Anterior
      </button>
      <span className="text-sm text-gray-500">
        Pagina {page} din {total}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-40"
      >
        Următor <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PlayerSections({
  confidenceLevels,
  checkinsByDay,
  dailyJournals,
  weeklyScopes,
  improvementWays,
  libraryItems,
}: PlayerSectionsProps) {
  const [modal, setModal] = useState<{ section: ModalSection; page: number } | null>(null);

  const openModal = (section: ModalSection) => setModal({ section, page: 1 });
  const closeModal = () => setModal(null);
  const setPage = (p: number) => setModal((prev) => (prev ? { ...prev, page: p } : null));

  // Sliced previews
  const recentConfidence = confidenceLevels.slice(0, RECENT_RECORDS);
  const recentCheckins = checkinsByDay.slice(0, RECENT_RECORDS);
  const recentJournals = dailyJournals.slice(0, RECENT_RECORDS);
  const recentScopes = weeklyScopes.slice(0, RECENT_RECORDS);
  const recentLibrary = libraryItems.slice(0, RECENT_RECORDS);
  const recentImprovementWays = improvementWays.map((way) => ({
    ...way,
    ratings: way.ratings.slice(0, RECENT_RECORDS),
  }));

  // Flat ratings list for the improvement modal (all ways, all ratings, sorted by date desc)
  const allImprovementRatings = improvementWays
    .flatMap((way) =>
      way.ratings.map((r) => ({
        id: r.id,
        wayTitle: way.title,
        day: r.day,
        score: r.score,
      }))
    )
    .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime());

  // ─── Modal content renderer ─────────────────────────────────────────────────

  function renderModalContent() {
    if (!modal) return null;
    const { section, page } = modal;

    if (section === 'confidence') {
      const items = paginate(confidenceLevels, page);
      return (
        <>
          <div className="flex gap-2 flex-wrap">
            {items.map((c) => (
              <span key={c.id} className="text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
                {new Date(c.day).toLocaleDateString('ro-RO', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                {': '}
                {CONFIDENCE_LABEL[c.level]}
              </span>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-gray-400">Nicio înregistrare.</p>
            )}
          </div>
          <Pagination
            page={page}
            total={calcTotalPages(confidenceLevels.length)}
            onChange={setPage}
          />
        </>
      );
    }

    if (section === 'checkin') {
      const items = paginate(checkinsByDay, page);
      return (
        <>
          <div className="space-y-4">
            {items.length === 0 && (
              <p className="text-sm text-gray-400">Nicio înregistrare.</p>
            )}
            {items.map((group) => {
              const checkedCount = group.answers.filter((a) => a.checked).length;
              const latestUpdate = group.answers.reduce((latest, answer) =>
                new Date(answer.updatedAt).getTime() >
                new Date(latest.updatedAt).getTime()
                  ? answer
                  : latest
              );
              return (
                <div
                  key={group.dayKey}
                  className="border-l-4 border-gray-200 dark:border-gray-700 pl-4"
                >
                  <p className="text-xs font-medium text-gray-400 mb-2">
                    {new Date(group.dayKey).toLocaleDateString('ro-RO', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {' · '}
                    {checkedCount}/{group.answers.length} bifate
                    <br />
                    <LocalDateTime date={latestUpdate.updatedAt} />
                  </p>
                  <div className="space-y-1">
                    {group.answers.map((answer) => (
                      <div key={answer.id} className="text-sm flex items-start gap-2">
                        <span
                          className={
                            answer.checked ? 'text-green-500' : 'text-gray-400'
                          }
                        >
                          {answer.checked ? '✅' : '⬜'}
                        </span>
                        <div>
                          <span>{answer.flag.label}</span>
                          {answer.stringValue && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Detalii: {answer.stringValue}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination
            page={page}
            total={calcTotalPages(checkinsByDay.length)}
            onChange={setPage}
          />
        </>
      );
    }

    if (section === 'journal') {
      const items = paginate(dailyJournals, page);
      return (
        <>
          <div className="space-y-4">
            {items.length === 0 && (
              <p className="text-sm text-gray-400">Nicio înregistrare.</p>
            )}
            {items.map((j) => (
              <div key={j.id} className="border-l-4 border-blue-400 pl-4">
                <p className="text-xs font-medium text-gray-400 mb-2">
                  {new Date(j.day).toLocaleDateString('ro-RO', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  {' · '}Scor: {j.myScore}/5
                  <br />
                  <LocalDateTime date={j.updatedAt} />
                </p>
                {j.whatDidGood && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-green-600 mb-1">
                      Ce am făcut bine:
                    </p>
                    <RichTextViewer html={j.whatDidGood} className="text-sm" />
                  </div>
                )}
                {j.whatDidWrong && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-red-500 mb-1">
                      Ce am greșit:
                    </p>
                    <RichTextViewer html={j.whatDidWrong} className="text-sm" />
                  </div>
                )}
                {j.whatCanDoBetter && (
                  <div>
                    <p className="text-xs font-semibold text-orange-500 mb-1">
                      Ce pot face mai bine:
                    </p>
                    <RichTextViewer html={j.whatCanDoBetter} className="text-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            total={calcTotalPages(dailyJournals.length)}
            onChange={setPage}
          />
        </>
      );
    }

    if (section === 'scope') {
      const items = paginate(weeklyScopes, page);
      return (
        <>
          <div className="space-y-3">
            {items.length === 0 && (
              <p className="text-sm text-gray-400">Nicio înregistrare.</p>
            )}
            {items.map((s) => (
              <div key={s.id} className="flex items-start gap-3">
                <span className="text-xs text-gray-400 shrink-0 mt-1">
                  Săpt. {getWeekLabelFromWeekNumber(s.weekNumber, s.year)}
                  <br />
                  <span className="text-gray-500">
                    <LocalDateTime date={s.updatedAt} />
                  </span>
                </span>
                <div className="flex-1">
                  <RichTextViewer html={s.scope} className="text-sm" />
                </div>
                <span
                  className={`text-xs shrink-0 ${
                    s.accomplished === true
                      ? 'text-green-500'
                      : s.accomplished === false
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}
                >
                  {s.accomplished === true
                    ? '✅ Realizat'
                    : s.accomplished === false
                    ? '❌ Nerealizat'
                    : '—'}
                </span>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            total={calcTotalPages(weeklyScopes.length)}
            onChange={setPage}
          />
        </>
      );
    }

    if (section === 'improvement') {
      const items = paginate(allImprovementRatings, page);
      return (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left pb-2 pr-4">Modalitate</th>
                  <th className="text-left pb-2 pr-4">Data</th>
                  <th className="text-left pb-2">Scor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-gray-400 text-center">
                      Nicio evaluare.
                    </td>
                  </tr>
                )}
                {items.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {r.wayTitle}
                    </td>
                    <td className="py-2 pr-4 text-gray-500">
                      {new Date(r.day).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2 font-semibold text-blue-600">
                      {r.score}/5
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            total={calcTotalPages(allImprovementRatings.length)}
            onChange={setPage}
          />
        </>
      );
    }

    if (section === 'library') {
      const items = paginate(libraryItems, page);
      return (
        <>
          <div className="space-y-2">
            {items.length === 0 && (
              <p className="text-sm text-gray-400">
                Nu există materiale în bibliotecă.
              </p>
            )}
            {items.map((item) => {
              const read = item.reads.length > 0;
              return (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className={read ? 'text-green-500' : 'text-gray-400'}>
                    {read ? '✅' : '⬜'}
                  </span>
                  <span>{item.name}</span>
                  {read && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(item.reads[0].readAt).toLocaleDateString('ro-RO')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination
            page={page}
            total={calcTotalPages(libraryItems.length)}
            onChange={setPage}
          />
        </>
      );
    }

    return null;
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Nivelul de încredere */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <SectionHeader
          title="Nivelul de încredere"
          totalCount={confidenceLevels.length}
          section="confidence"
          onOpen={openModal}
        />
        <div className="flex gap-2 flex-wrap">
          {recentConfidence.map((c) => (
            <span
              key={c.id}
              className="text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1"
            >
              {new Date(c.day).toLocaleDateString('ro-RO', {
                day: 'numeric',
                month: 'short',
              })}
              {': '}
              {CONFIDENCE_LABEL[c.level]}
            </span>
          ))}
          {recentConfidence.length === 0 && (
            <p className="text-sm text-gray-400">Nicio înregistrare.</p>
          )}
        </div>
      </div>

      {/* Checkin */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <SectionHeader
          title="Checkin"
          totalCount={checkinsByDay.length}
          section="checkin"
          onOpen={openModal}
        />
        <div className="space-y-4">
          {recentCheckins.length === 0 && (
            <p className="text-sm text-gray-400">Nicio înregistrare.</p>
          )}
          {recentCheckins.map((group) => {
            const checkedCount = group.answers.filter((a) => a.checked).length;
            const latestUpdate = group.answers.reduce((latest, answer) =>
              new Date(answer.updatedAt).getTime() >
              new Date(latest.updatedAt).getTime()
                ? answer
                : latest
            );
            return (
              <div
                key={group.dayKey}
                className="border-l-4 border-gray-200 dark:border-gray-700 pl-4"
              >
                <p className="text-xs font-medium text-gray-400 mb-2">
                  {new Date(group.dayKey).toLocaleDateString('ro-RO', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {' · '}
                  {checkedCount}/{group.answers.length} bifate
                  <br />
                  <LocalDateTime date={latestUpdate.updatedAt} />
                </p>
                <div className="space-y-1">
                  {group.answers.map((answer) => (
                    <div key={answer.id} className="text-sm flex items-start gap-2">
                      <span
                        className={
                          answer.checked ? 'text-green-500' : 'text-gray-400'
                        }
                      >
                        {answer.checked ? '✅' : '⬜'}
                      </span>
                      <div>
                        <span>{answer.flag.label}</span>
                        {answer.stringValue && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Detalii: {answer.stringValue}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jurnal */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <SectionHeader
          title="Jurnal"
          totalCount={dailyJournals.length}
          section="journal"
          onOpen={openModal}
        />
        <div className="space-y-4">
          {recentJournals.length === 0 && (
            <p className="text-sm text-gray-400">Nicio înregistrare.</p>
          )}
          {recentJournals.map((j) => (
            <div key={j.id} className="border-l-4 border-blue-400 pl-4">
              <p className="text-xs font-medium text-gray-400 mb-2">
                {new Date(j.day).toLocaleDateString('ro-RO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                {' · '}Scor: {j.myScore}/5
                <br />
                <LocalDateTime date={j.updatedAt} />
              </p>
              {j.whatDidGood && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-green-600 mb-1">
                    Ce am făcut bine:
                  </p>
                  <RichTextViewer html={j.whatDidGood} className="text-sm" />
                </div>
              )}
              {j.whatDidWrong && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-red-500 mb-1">
                    Ce am greșit:
                  </p>
                  <RichTextViewer html={j.whatDidWrong} className="text-sm" />
                </div>
              )}
              {j.whatCanDoBetter && (
                <div>
                  <p className="text-xs font-semibold text-orange-500 mb-1">
                    Ce pot face mai bine:
                  </p>
                  <RichTextViewer html={j.whatCanDoBetter} className="text-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Obiective săptămânale */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <SectionHeader
          title="Obiective săptămânale"
          totalCount={weeklyScopes.length}
          section="scope"
          onOpen={openModal}
        />
        <div className="space-y-3">
          {recentScopes.length === 0 && (
            <p className="text-sm text-gray-400">Nicio înregistrare.</p>
          )}
          {recentScopes.map((s) => (
            <div key={s.id} className="flex items-start gap-3">
              <span className="text-xs text-gray-400 shrink-0 mt-1">
                Săpt. {getWeekLabelFromWeekNumber(s.weekNumber, s.year)}
                <br />
                <span className="text-gray-500">
                  <LocalDateTime date={s.updatedAt} />
                </span>
              </span>
              <div className="flex-1">
                <RichTextViewer html={s.scope} className="text-sm" />
              </div>
              <span
                className={`text-xs shrink-0 ${
                  s.accomplished === true
                    ? 'text-green-500'
                    : s.accomplished === false
                    ? 'text-red-500'
                    : 'text-gray-400'
                }`}
              >
                {s.accomplished === true
                  ? '✅ Realizat'
                  : s.accomplished === false
                  ? '❌ Nerealizat'
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modalități de îmbunătățire */}
      {improvementWays.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
          <SectionHeader
            title="Modalități de îmbunătățire"
            totalCount={allImprovementRatings.length}
            section="improvement"
            onOpen={openModal}
          />
          <div className="space-y-5">
            {recentImprovementWays.map((way) => (
              <div key={way.id}>
                <p className="text-sm font-medium mb-2">{way.title}</p>
                {way.ratings.length === 0 ? (
                  <p className="text-xs text-gray-400">Nicio evaluare.</p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {way.ratings.map((r) => (
                      <span
                        key={r.id}
                        className="text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1"
                      >
                        {new Date(r.day).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        {': '}
                        <span className="font-semibold text-blue-600">
                          {r.score}/5
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bibliotecă */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <SectionHeader
          title="Bibliotecă — status citire"
          totalCount={libraryItems.length}
          section="library"
          onOpen={openModal}
        />
        <div className="space-y-2">
          {recentLibrary.length === 0 && (
            <p className="text-sm text-gray-400">
              Nu există materiale în bibliotecă.
            </p>
          )}
          {recentLibrary.map((item) => {
            const read = item.reads.length > 0;
            return (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span className={read ? 'text-green-500' : 'text-gray-400'}>
                  {read ? '✅' : '⬜'}
                </span>
                <span>{item.name}</span>
                {read && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(item.reads[0].readAt).toLocaleDateString('ro-RO')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h3 className="font-semibold text-base">
                {MODAL_TITLES[modal.section]}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Închide"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 flex-1">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
