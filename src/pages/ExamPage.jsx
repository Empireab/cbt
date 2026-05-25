import { useState, useEffect } from 'react'
import Calculator from '../components/Calculator'
import { allQuestions } from '../data/questions'
import DOMPurify from "dompurify";

function ExamPage({ form, onBack }) {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState({})
    const [examQuestions, setExamQuestions] = useState([])
    const [showCalculator, setShowCalculator] = useState(false)
    const [timeLeft, setTimeLeft] = useState(30 * 60)
    const [submitted, setSubmitted] = useState(false)
    const [results, setResults] = useState(null)
    const [showConfirmation, setShowConfirmation] = useState(false)

    // Check payment verification
    useEffect(() => {
        checkPaymentAccess()
    }, [form.email, onBack])

    const checkPaymentAccess = async () => {
        try {
            const response = await fetch(`https://cbt-2-b01o.onrender.com/api/payments/status/${form.email}`)
            const data = await response.json()

            const hasAccess = (data.paymentStatus === 'approved' && data.expiryDate && new Date(data.expiryDate) > new Date()) || data.trialUsed

            if (!hasAccess) {
                // Redirect to payment page if no access
                alert('Payment verification required. Redirecting to payment page.')
                onBack()
                return
            }
        } catch (error) {
            console.error('Error checking payment status:', error)
            alert('Unable to verify payment status. Please try again.')
            onBack()
        }
    }

    useEffect(() => {
        generateExamQuestions()
    }, [])

    useEffect(() => {
        if (submitted) return
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleSubmitExam()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [submitted])

    const generateExamQuestions = () => {
        const selectedSubjects = form.subjects
        const baseCount = Math.floor(50 / selectedSubjects.length)
        const remainder = 50 % selectedSubjects.length
        let allExamQs = []
        const usedQuestions = new Set() // Track used questions to prevent duplicates

        selectedSubjects.forEach((subject, index) => {
            const subjectQuestions = allQuestions[subject] || []
            const requiredCount = baseCount + (index < remainder ? 1 : 0)
            const selected = []
            const availableQuestions = subjectQuestions.filter(q => !usedQuestions.has(q.question))

            // If we don't have enough unique questions, we'll have to allow some duplicates
            // but try to minimize them
            const pool = availableQuestions.length >= requiredCount
                ? availableQuestions
                : [...availableQuestions, ...subjectQuestions.filter(q => !availableQuestions.includes(q))]

            while (selected.length < requiredCount && pool.length > 0) {
                const randomIndex = Math.floor(Math.random() * pool.length)
                const question = pool.splice(randomIndex, 1)[0]
                selected.push({ ...question, subject })
                usedQuestions.add(question.question)
            }

            allExamQs = [...allExamQs, ...selected]
        })

        allExamQs.sort(() => Math.random() - 0.5)
        setExamQuestions(allExamQs.slice(0, 50))
    }

    const handleAnswerSelect = (optionIndex) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion]: optionIndex,
        }))
    }

    const handleNext = () => {
        if (currentQuestion < examQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
        }
    }

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
        }
    }

    const handleSubmitExam = () => {
        let score = 0
        let subjectScores = {}

        form.subjects.forEach((subject) => {
            subjectScores[subject] = { correct: 0, total: 0 }
        })

        examQuestions.forEach((q, idx) => {
            const subject = q.subject || form.subjects[Math.floor(idx / Math.floor(50 / form.subjects.length))]
            if (subjectScores[subject]) {
                subjectScores[subject].total++
                if (answers[idx] === q.correct) {
                    score++
                    subjectScores[subject].correct++
                }
            }
        })

        setResults({ score, total: examQuestions.length, subjectScores })
        setSubmitted(true)
    }

    const handleShowConfirmation = () => {
        setShowConfirmation(true)
    }

    const handleConfirmSubmit = () => {
        setShowConfirmation(false)
        handleSubmitExam()
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    if (!examQuestions.length) {
        return <main className="page page-exam"><div className="form-container"><p>Loading exam...</p></div></main>
    }

    if (submitted && results) {
        const percentage = Math.round((results.score / results.total) * 100)
        const getPerformanceMessage = () => {
            if (percentage >= 66) return '🎉 Excellent'
            if (percentage >= 46) return '⚡ Average'
            return '⚠️ Poor'
        }
        const getPerformanceAdvice = () => {
            if (percentage >= 66) return 'Excellent work! Keep practicing to maintain this momentum.'
            if (percentage >= 46) return 'Average result. Review the weak areas and try again.'
            return 'Poor result. Focus on review and retake the exam once you are prepared.'
        }
        const percentageColor = percentage >= 66 ? '#0f5533' : percentage >= 46 ? '#d4a017' : '#b1271d'
        return (
            <main className="page page-exam page-results">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Results</h2>
                        <p>Your exam is complete</p>
                    </div>
                    <div className="success-panel">
                        <div className="results-summary">
                            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f5533', marginBottom: '8px' }}>
                                    {results.score}/50 correct
                                </p>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f5533', marginBottom: '12px' }}>
                                    {getPerformanceMessage()}
                                </h3>
                                <p style={{ fontSize: '1.4rem', fontWeight: 700, color: percentageColor, marginBottom: '0' }}>
                                    {percentage}%
                                </p>
                                <p style={{ fontSize: '0.95rem', color: '#4c5f6d', marginTop: '12px', marginBottom: '0' }}>
                                    {getPerformanceAdvice()}
                                </p>
                            </div>

                            <div className="results-breakdown" style={{ marginTop: '32px', marginBottom: '32px' }}>
                                <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Breakdown by Subject</h4>
                                {Object.entries(results.subjectScores).map(([subject, scores]) => {
                                    const subjectPercentage = Math.round((scores.correct / scores.total) * 100)
                                    return (
                                        <div key={subject} className="subject-result-item">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong>{subject}</strong>
                                                <span>{scores.correct}/{scores.total}</span>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#4c5f6d', marginTop: '4px' }}>
                                                {subjectPercentage}%
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="results-actions" style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                                <button type="button" className="btn" onClick={async () => {
                                    // Check if user can retake exam
                                    try {
                                        const response = await fetch(`https://cbt-2-b01o.onrender.com/api/users/${form.email}/can-retake`)
                                        const data = await response.json()

                                        if (data.canRetake) {
                                            setSubmitted(false)
                                            setResults(null)
                                            setAnswers({})
                                            setCurrentQuestion(0)
                                            setTimeLeft(30 * 60)
                                            generateExamQuestions()
                                        } else {
                                            alert('You cannot retake the exam. ' + (data.reason || 'Payment required for retakes.'))
                                            onBack()
                                        }
                                    } catch (error) {
                                        console.error('Error checking retake permission:', error)
                                        alert('Unable to verify retake permission. Please try again.')
                                    }
                                }} style={{ flex: 1 }}>
                                    🔄 Retake Exam
                                </button>
                                <button type="button" className="btn btn-back" onClick={onBack} style={{ flex: 1 }}>
                                    🏠 Home
                                </button>
                            </div>

                            <div className="answer-review" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '2px solid #e2eaef' }}>
                                <h4 style={{ marginBottom: '20px', fontSize: '1rem' }}>Answer Review</h4>
                                {examQuestions.map((q, idx) => {
                                    const isAnswered = answers[idx] !== undefined
                                    const isCorrect = isAnswered && answers[idx] === q.correct
                                    const subjectName = q.subject || form.subjects[Math.floor(idx / Math.floor(50 / form.subjects.length))]
                                    return (
                                        <div key={idx} className="review-item">
                                            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                                <span style={{ fontSize: '0.9rem', color: '#4c5f6d', fontWeight: 600 }}>
                                                    Q{idx + 1} · {subjectName}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    backgroundColor: isCorrect ? 'rgba(15, 85, 51, 0.12)' : isAnswered ? 'rgba(177, 39, 29, 0.12)' : 'rgba(74, 74, 74, 0.12)',
                                                    color: isCorrect ? '#0f5533' : isAnswered ? '#b1271d' : '#4a4a4a',
                                                    fontWeight: 600
                                                }}>
                                                    {isCorrect ? '✓ Correct' : isAnswered ? '✗ Wrong' : 'Not answered'}
                                                </span>
                                            </div>
                                            <p
                                                style={{
                                                    margin: '8px 0',
                                                    fontSize: '1rem',
                                                    color: '#1b2732',
                                                    fontWeight: 500,
                                                    lineHeight: '1.5'
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: q.question,
                                                }}
                                            />
                                            {isAnswered && (
                                                <div style={{ marginTop: '8px', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                                    <p style={{ margin: '6px 0', color: isCorrect ? '#0f5533' : '#b1271d' }}>
                                                        ✓ Your answer: <strong>{q.options[answers[idx]]}</strong>
                                                    </p>
                                                    {!isCorrect && (
                                                        <p style={{ margin: '6px 0', color: '#0f5533' }}>
                                                            ✓ Correct: <strong>{q.options[q.correct]}</strong>
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {!isAnswered && (
                                                <div style={{ marginTop: '8px', fontSize: '0.95rem', color: '#4c5f6d', lineHeight: '1.4' }}>
                                                    ℹ Not answered. Correct answer: <strong>{q.options[q.correct]}</strong>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    const currentQ = examQuestions[currentQuestion]
    const answeredCount = Object.keys(answers).length
    const questionAnswered = answers[currentQuestion] !== undefined

    return (
        <main className="page page-exam">
            {showConfirmation && (
                <div className="modal-overlay">
                    <div className="confirmation-modal">
                        <h3>⚠️ Confirm Submission</h3>
                        <p style={{ marginBottom: '24px' }}>
                            You have answered <strong>{answeredCount}/50</strong> questions. Do you want to submit?
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" className="btn btn-back" onClick={() => setShowConfirmation(false)} style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button type="button" className="btn" onClick={handleConfirmSubmit} style={{ flex: 1 }}>
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="exam-fixed-top">
                <div className="exam-top-left">
                    <div className={`exam-question-tag ${questionAnswered ? 'answered' : 'unanswered'}`}>
                        {questionAnswered ? 'Answered' : 'Not answered'}
                    </div>
                    <div className="exam-top-detail">Answered {answeredCount}/50</div>
                    <div className="exam-top-detail">Q {currentQuestion + 1}/50</div>
                </div>
                <button type="button" className="btn btn-calc" onClick={() => setShowCalculator(!showCalculator)}>
                    🧮 Calculator
                </button>
            </div>

            {showCalculator && (
                <div className="calculator-top">
                    <Calculator />
                </div>
            )}

            <div className="exam-layout">
                <div className="exam-sidebar">
                    <div className="timer-panel">
                        <div className={`timer ${timeLeft < 300 ? 'danger' : ''}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <p>Time remaining</p>
                    </div>

                    <div className="progress-panel">
                        <div className="progress-info">
                            <strong>Question {currentQuestion + 1}</strong> of {examQuestions.length}
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / examQuestions.length) * 100}%` }}></div>
                        </div>
                        <p className="answered-count">{Object.keys(answers).length} answered</p>
                    </div>
                </div>

                <div className="exam-main">
                    <div className="question-container">
                        <div className="question-header">
                            <h3
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(currentQ.question),
                                }}
                            />
                        </div>

                        <div className="options-list">
                            {currentQ.options.map((option, idx) => (
                                <label
                                    key={idx}
                                    className={`option-label ${answers[currentQuestion] === idx ? 'selected' : ''
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="answer"
                                        checked={answers[currentQuestion] === idx}
                                        onChange={() => handleAnswerSelect(idx)}
                                    />

                                    <span
                                        className="option-text"
                                        dangerouslySetInnerHTML={{
                                            __html: option,
                                        }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="exam-actions">
                        <button type="button" className="btn btn-nav" onClick={handlePrev} disabled={currentQuestion === 0}>
                            ← Previous
                        </button>
                        <div className="btn-spacer"></div>
                        <button type="button" className="btn btn-nav" onClick={handleNext} disabled={currentQuestion === examQuestions.length - 1}>
                            Next →
                        </button>
                    </div>

                </div>
            </div>
            <div className="exam-bottom-bar">
                <div className="bottom-meta">
                    <span>{answeredCount}/50 answered</span>
                    <span>Ready to submit when complete</span>
                </div>
                <button type="button" className="btn btn-submit" onClick={handleShowConfirmation}>
                    Submit Exam
                </button>
            </div>
        </main>
    )
}

export default ExamPage
