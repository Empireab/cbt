function InstructionsPage({ form, onStart, onBack }) {
    return (
        <main className="page page-instructions">
            <section className="hero">
                <div className="hero-copy">
                    <h2>Exam Instructions</h2>
                    <p>Read these rules before starting your UniPort Post UTME practice test.</p>

                    <div className="instructions-summary">
                        <p>
                            <strong>Student:</strong> {form.name || 'Not provided'}
                        </p>
                        <p>
                            <strong>Course:</strong> {form.course || 'Not selected'}
                        </p>
                        <p>
                            <strong>Subjects:</strong>{' '}
                            {form.subjects.length > 0 ? form.subjects.join(', ') : 'No subjects chosen'}
                        </p>
                    </div>

                    <div className="instructions-list">
                        <div className="instruction-item">
                            <span>1</span>
                            <div>
                                <h3>Timed exam</h3>
                                <p>Complete the practice test in 30 minutes with real Post UTME-style questions.</p>
                            </div>
                        </div>
                        <div className="instruction-item">
                            <span>2</span>
                            <div>
                                <h3>Question format</h3>
                                <p>Answer every question carefully. Mark only one option for each item.</p>
                            </div>
                        </div>
                        <div className="instruction-item">
                            <span>3</span>
                            <div>
                                <h3>Stay focused</h3>
                                <p>Use a quiet space and keep your phone away while practicing.</p>
                            </div>
                        </div>
                        <div className="instruction-item">
                            <span>4</span>
                            <div>
                                <h3>Review answers</h3>
                                <p>After finishing, review your score and subject breakdown to improve.</p>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-start" onClick={onStart}>
                            Start Exam
                        </button>
                        <button type="button" className="btn btn-back" onClick={onBack}>
                            ← Back to Registration
                        </button>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default InstructionsPage
