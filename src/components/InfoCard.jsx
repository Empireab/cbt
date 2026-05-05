function InfoCard({ icon, title, text }) {
    return (
        <article className="info-card">
            <div className="card-icon">{icon}</div>
            <div>
                <h3>{title}</h3>
                <p>{text}</p>
            </div>
        </article>
    )
}

export default InfoCard
