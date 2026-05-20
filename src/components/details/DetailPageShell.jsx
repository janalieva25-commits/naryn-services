export default function DetailPageShell({ children, sidebar }) {
  return (
    <div className="detail-page">
      <div className="detail-layout">
        <div className="detail-main-column">{children}</div>

        <aside className="detail-sidebar">
          {sidebar}
        </aside>
      </div>
    </div>
  )
}