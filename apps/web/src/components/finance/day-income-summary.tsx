import { formatSoles } from "@life-manager/shared/finance/constants";
import type { JobDayIncome } from "@life-manager/shared/finance/ledger";

export function DayIncomeSummary({ jobs }: { jobs: JobDayIncome[] }) {
  const totalNet = jobs.reduce((s, j) => s + j.net, 0);

  return (
    <section className="rounded-xl border border-line bg-panel p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-forest">
          Ingresos del día
        </h2>
        <p className="text-sm font-semibold tabular-nums text-forest">{formatSoles(totalNet)}</p>
      </div>
      {jobs.length === 0 ? (
        <p className="text-sm text-muted">Sin ingresos este día.</p>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li
              key={job.jobCode}
              className="flex items-start justify-between gap-3 rounded-lg border border-line bg-sand/40 px-3 py-2"
            >
              <div>
                <p className="font-medium capitalize text-ink">{job.label}</p>
                {job.isTaxi ? (
                  <p className="text-xs text-muted">
                    Bruto {formatSoles(job.gross)} − gastos taxi {formatSoles(job.jobExpenses)}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 font-semibold tabular-nums text-forest">
                {job.isTaxi ? (
                  <>
                    <span className="block text-[10px] font-normal text-muted">líquido</span>
                    {formatSoles(job.net)}
                  </>
                ) : (
                  formatSoles(job.net)
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
