export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-card">
        <div className="hero-content">
          <div className="hero-copy">
            <span className="hero-chip">Локальный маркетплейс Нарына</span>

            <h1>
              Найдите надёжного мастера
              <br />
              для любых услуг
            </h1>

            <p>
              В городе Нарын и близлежащих сёлах — от бытовых задач
              до IT, дизайна и других сервисов.
            </p>

            <form className="hero-search">
              <input type="text" placeholder="Какая услуга вам нужна?" />
              <select defaultValue="naryn">
                <option value="naryn">Нарын</option>
                <option value="at_bashy">Ат-Башы</option>
                <option value="ak_talaa">Ак-Талаа</option>
                <option value="jumgal">Жумгал</option>
                <option value="kochkor">Кочкор</option>
              </select>
              <button type="submit">Найти</button>
            </form>
          </div>

          <div className="hero-visual">
            <img
              src="/images/hero-marketplace-light.jpg"
              alt="Иллюстрация маркетплейса услуг"
            />
          </div>
        </div>

        <div className="hero-categories">
          <button>Сантехника</button>
          <button>Электрика</button>
          <button>Уборка</button>
          <button>Ремонт</button>
          <button>IT услуги</button>
          <button>Дизайн</button>
          <button>Маркетинг</button>
          <button>Другие</button>
        </div>
      </div>
    </section>
  )
}