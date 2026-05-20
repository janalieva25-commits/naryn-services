export default function DetailSection({ title, children }) {
  return (
    <section className="section-card dark-card detail-section-card">
      <div className="section-head">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}