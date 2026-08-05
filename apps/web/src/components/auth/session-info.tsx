type SessionInfoProps = {
  userId: string;
  email?: string | null;
  role?: string | null;
  experimentalProfiles?: string[] | null;
};

export function SessionInfo({
  userId,
  email,
  role,
  experimentalProfiles,
}: SessionInfoProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Tu sesión
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-muted">Código de usuario</dt>
          <dd className="mt-0.5 break-all font-mono text-xs text-ink">{userId}</dd>
        </div>
        {email ? (
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-0.5 text-ink">{email}</dd>
          </div>
        ) : null}
        {role ? (
          <div>
            <dt className="text-muted">Rol</dt>
            <dd className="mt-0.5 text-ink">{role}</dd>
          </div>
        ) : null}
        {experimentalProfiles && experimentalProfiles.length > 0 ? (
          <div>
            <dt className="text-muted">Perfiles experimentales</dt>
            <dd className="mt-0.5 text-ink">{experimentalProfiles.join(", ")}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
