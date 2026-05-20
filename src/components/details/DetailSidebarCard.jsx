export default function DetailSidebarCard({ title, price, children }) {
  return (
    <div className="section-card dark-card detail-sidebar-card sticky-card">
      <div className="section-head">
        <h2>{title}</h2>
      </div>

      <div className="detail-sidebar-price">{price}</div>

      {children}
    </div>
  )
}