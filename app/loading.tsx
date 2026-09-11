export default function Loading() {
  return (
    <div
      className="route-loading-overlay"
      role="status"
      aria-live="polite"
      aria-label="Se încarcă pagina"
    >
      <div className="route-loading-card">
        <div className="route-loading-track" aria-hidden="true">
          <div className="route-loading-bar" />
        </div>
        <p className="mt-3 text-sm font-semibold" style={{ color: "var(--kit-text-2)" }}>
          Se încarcă pagina...
        </p>
      </div>
    </div>
  );
}
