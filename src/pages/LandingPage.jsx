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
            <a
    href="https://wa.me/2347018724692"
    target="_blank"
    rel="noopener noreferrer"
    style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        backgroundColor: '#25D366',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000,
        textDecoration: 'none',
        transition: 'transform 0.3s ease'
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
    }}
>
    <span style={{ fontSize: '32px', color: 'white' }}>
        💬
    </span>
</a>
<div
    style={{
        background: 'linear-gradient(135deg, #25D366, #128C7E)',
        color: 'white',
        padding: '30px 24px',
        borderRadius: '20px',
        textAlign: 'center',
        marginTop: '30px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        maxWidth: '700px',
        marginInline: 'auto'
    }}
>
    {/* Logo */}
    <div style={{ marginBottom: '16px' }}>
        <img
            src="/logo.png"
            alt="Logo"
            style={{
                width: '90px',
                height: '90px',
                objectFit: 'contain',
                borderRadius: '50%',
                background: 'white',
                padding: '8px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
        />
    </div>

    {/* Heading */}
    <h3
        style={{
            marginBottom: '12px',
            fontSize: '1.6rem',
            fontWeight: '700'
        }}
    >
        Need Help? 💬
    </h3>

    {/* Text */}
    <p
        style={{
            fontSize: '16px',
            lineHeight: '1.8',
            marginBottom: '22px',
            opacity: 0.95,
            maxWidth: '550px',
            marginInline: 'auto'
        }}
    >
        Need more <strong>CBT questions and answers</strong> to boost your
        exam preparation? Message us on WhatsApp.
        <br />
        For support or any issues encountered, contact us directly.
    </p>

    {/* WhatsApp Button */}
    <a
        href="https://wa.me/2347018724692"
        target="_blank"
        rel="noopener noreferrer"
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'white',
            color: '#25D366',
            padding: '14px 28px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
        }}
    >
        💬 Chat on WhatsApp
    </a>
</div>
        </main>
        
        
    )
    
}

export default LandingPage
