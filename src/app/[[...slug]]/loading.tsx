export default function LoadingPage() {
  return (
    <div role="status" aria-live="polite">
      <div className="loader" />
      <p>Loading page…</p>
    </div>
  );
}
