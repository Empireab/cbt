import InfoCard from '../components/InfoCard'

function LandingPage({ stats, subjects, cards, onStart }) {
    return (
        <main className="page page-landing">
            <section className="hero">
                <div className="hero-copy">
                    <h2>
                        Post UTME CBT<br />Practice Portal
                    </h2>
                    <p>
                        Practice with real UniPort past questions from 2015–2025. Get exam-ready with timed CBT practice.
                    </p>

                    <div className="hero-stats">
                        {stats.map((item) => (
                            <div key={item.label} className="stat-box">
                                <div className="num">{item.value}</div>
                                <div className="lbl">{item.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="subjects-grid">
                        {subjects.map((subject) => (
                            <div key={subject} className="subj-chip">
                                {subject}
                            </div>
                        ))}
                    </div>

                    <button type="button" className="btn btn-start" onClick={onStart}>
                        Start Practice Now →
                    </button>
                </div>
            </section>

            <section className="info-cards">
                {cards.map((card) => (
                    <InfoCard key={card.title} {...card} />
                ))}
            </section>
        </main>
    )
}

export default LandingPage
