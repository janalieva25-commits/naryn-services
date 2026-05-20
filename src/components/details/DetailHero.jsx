export default function DetailHero({
  image,
  placeholder = 'Объявление',
  badge,
  title,
  description,
  meta = [],
}) {
  return (
    <section className="section-card dark-card detail-hero-card">
      <div className="detail-hero">
        <div
          className="detail-cover"
          style={
            image
              ? {
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          {!image && (
            <div className="detail-cover-placeholder">
              <span>{placeholder}</span>
            </div>
          )}
        </div>

        <div className="detail-summary">
          <span className="detail-badge">{badge}</span>
          <h1>{title}</h1>
          <p className="detail-lead">{description}</p>

          <div className="detail-meta-grid">
            {meta.map((item) => (
              <div className="detail-meta-box" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}