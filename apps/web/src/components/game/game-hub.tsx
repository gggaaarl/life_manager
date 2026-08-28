"use client";

import { useTransition } from "react";
import {
  activateDriverJob,
  unlockDriverJob,
  unlockMedal,
} from "@/app/game/actions";
import {
  jobStatusLabel,
  MEDAL_CODES,
  type MedalRow,
  type UserJobRow,
} from "@life-manager/shared/game/constants";
import Link from "next/link";

type Props = {
  jobs: UserJobRow[];
  medals: MedalRow[];
  unlockedMedalCodes: string[];
};

export function GameHub({ jobs, medals, unlockedMedalCodes }: Props) {
  const driverJob = jobs.find((job) => job.code === "DRIVER");
  const hasManejar = unlockedMedalCodes.includes(MEDAL_CODES.MANEJAR);
  const canUnlockDriver = hasManejar && driverJob?.status === "locked";
  const canActivateDriver = driverJob?.status === "unlocked";
  const driverActive = driverJob?.status === "active" || driverJob?.status === "unlocked";

  return (
    <div className="space-y-8">
      <section>
        <p className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-teal">
          MEDALLAS
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {medals.map((medal) => (
            <MedalCard
              key={medal.code}
              medal={medal}
              onUnlock={
                medal.code === MEDAL_CODES.MANEJAR && !medal.unlocked
                  ? MEDAL_CODES.MANEJAR
                  : null
              }
            />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-teal">
          JOBS
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.code} job={job} driverActive={driverActive && job.code === "DRIVER"} />
          ))}
        </div>
        {canUnlockDriver ? <UnlockDriverButton /> : null}
        {canActivateDriver ? <ActivateDriverButton /> : null}
        {!hasManejar && driverJob?.status === "locked" ? (
          <p className="mt-3 text-sm text-muted">
            Desbloquea la medalla Manejar para acceder al job Chofer.
          </p>
        ) : null}
      </section>

      <section>
        <p className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-teal">
          DASHBOARDS
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <DashLink href="/nutrition" title="Nutrición" subtitle="Kcal del día" />
          <DashLink href="/finance" title="Finanzas" subtitle="Gastos e ingresos" />
          {driverActive ? (
            <DashLink href="/driver" title="Chofer" subtitle="Taxi y vehículo" />
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-panel/60 p-5 opacity-70">
              <p className="font-semibold text-ink">Chofer</p>
              <p className="mt-1 text-sm text-muted">Desbloquea el job DRIVER</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MedalCard({
  medal,
  onUnlock,
}: {
  medal: MedalRow;
  onUnlock: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl bg-panel p-5 border border-line/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">Medalla</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-ink">
            {medal.name}
          </p>
          <p className="mt-1 text-sm text-muted">{medal.description}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            medal.unlocked ? "bg-teal/15 text-teal" : "bg-sand text-muted"
          }`}
        >
          {medal.unlocked ? "Obtenida" : "Disponible"}
        </span>
      </div>
      {onUnlock ? (
        <form
          className="mt-4"
          action={(formData) => {
            formData.set("medal_code", onUnlock);
            startTransition(async () => {
              await unlockMedal(formData);
            });
          }}
        >
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Desbloqueando…" : "Desbloquear medalla"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function JobCard({ job, driverActive }: { job: UserJobRow; driverActive?: boolean }) {
  const status = jobStatusLabel(job.status);

  return (
    <div className="rounded-2xl bg-panel p-5 border border-line/60">
      <p className="text-xs uppercase tracking-widest text-muted">Job</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-ink">
        {job.name}
      </p>
      <p className="mt-2 text-sm text-muted">{status}</p>
      {job.code === "PLAYER" ? (
        <Link href="/player/citas" className="mt-4 inline-flex text-sm font-semibold text-teal">
          Abrir salidas →
        </Link>
      ) : null}
      {job.code === "DRIVER" && driverActive ? (
        <Link href="/driver" className="mt-4 inline-flex text-sm font-semibold text-teal">
          Abrir chofer →
        </Link>
      ) : null}
    </div>
  );
}

function DashLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-panel p-5 border border-line/60 transition hover:ring-2 hover:ring-teal/30"
    >
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </Link>
  );
}

function UnlockDriverButton() {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="mt-4"
      action={() => {
        startTransition(async () => {
          await unlockDriverJob();
        });
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Desbloqueando…" : "Desbloquear job Chofer"}
      </button>
    </form>
  );
}

function ActivateDriverButton() {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="mt-4"
      action={() => {
        startTransition(async () => {
          await activateDriverJob();
        });
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Activando…" : "Activar job Chofer"}
      </button>
    </form>
  );
}
