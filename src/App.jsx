import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import InstructionsPage from './pages/InstructionsPage'
import PaymentPage from './pages/PaymentPage'
import ExamPage from './pages/ExamPage'
import AdminPanel from './pages/AdminPanel'
import { cards, courses, stats, subjects } from './data/content'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  course: '',
  subjects: [],
}

function App() {
  const [page, setPage] = useState('home')
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  // Check for admin route
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true') {
      setPage('admin')
    }
  }, [])

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const toggleSubject = (subject) => {
    setForm((current) => {
      const selected = current.subjects.includes(subject)
        ? current.subjects.filter((item) => item !== subject)
        : [...current.subjects, subject]
      return { ...current, subjects: selected }
    })
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Please enter your full name.'
    if (!form.email.trim()) nextErrors.email = 'Please enter your email address.'
    if (!form.phone.trim()) nextErrors.phone = 'Please enter your phone number.'
    if (!form.course) nextErrors.course = 'Please select your course.'
    if (form.subjects.length < 2 || form.subjects.length > 5)
      nextErrors.subjects = 'Choose between 2 and 5 subjects.'
    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      setPage('instructions')
    }
  }

  const handleHome = () => {
    setPage('home')
    setErrors({})
    setForm(initialForm)
  }

  const handleBackToRegister = () => {
    setPage('register')
  }

  const handleBeginExam = () => {
    setPage('payment')
  }

  const handlePaymentComplete = () => {
    setPage('exam')
  }

  return (
    <div className="app-shell">
      {page === 'admin' ? (
        <AdminPanel />
      ) : (
        <>
          <Header />
          {page === 'home' ? (
            <LandingPage stats={stats} subjects={subjects} cards={cards} onStart={() => setPage('register')} />
          ) : page === 'register' ? (
            <RegisterPage
              form={form}
              errors={errors}
              onFieldChange={updateField}
              onToggleSubject={toggleSubject}
              onSubmit={handleSubmit}
              onBack={handleHome}
              courses={courses}
              subjects={subjects}
            />
          ) : page === 'instructions' ? (
            <InstructionsPage form={form} onStart={handleBeginExam} onBack={handleBackToRegister} />
          ) : page === 'payment' ? (
            <PaymentPage form={form} onPaymentComplete={handlePaymentComplete} onBack={() => setPage('instructions')} />
          ) : (
            <ExamPage form={form} onBack={handleHome} />
          )}
        </>
      )}
    </div>
  )
}

export default App
