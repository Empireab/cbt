import { useState, useEffect } from 'react'

function PaymentPage({ form, onPaymentComplete, onBack }) {
    const [paymentStatus, setPaymentStatus] = useState('pending') // pending, submitted, approved, declined
    const [userCode, setUserCode] = useState('')
    const [isTrialUsed, setIsTrialUsed] = useState(false)
    const [paymentExpiry, setPaymentExpiry] = useState(null)
    const [verificationError, setVerificationError] = useState('')
    const [paymentScreenshot, setPaymentScreenshot] = useState(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const API_BASE = 'https://cbt-2-b01o.onrender.com/api'

    useEffect(() => {
        checkPaymentStatus()
    }, [form.email])

    const checkPaymentStatus = async () => {
        try {
            const response = await fetch(`${API_BASE}/payments/status/${form.email}`)
            const data = await response.json()

            setIsTrialUsed(data.trialUsed)

            if (data.paymentStatus === 'approved' && data.expiryDate) {
                const expiry = new Date(data.expiryDate)
                if (expiry > new Date()) {
                    setPaymentStatus('approved')
                    setPaymentExpiry(expiry)
                } else {
                    // Payment expired
                    setPaymentStatus('expired')
                }
            } else if (data.paymentStatus === 'pending') {
                setPaymentStatus('submitted')
            } else if (data.paymentStatus === 'declined') {
                setPaymentStatus('declined')
            }
        } catch (error) {
            console.error('Error checking payment status:', error)
        }
    }

    const handleUseTrial = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/trial/use`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: form.email,
                    name: form.name,
                    phone: form.phone
                })
            })

            if (response.ok) {
                setIsTrialUsed(true)
                setPaymentStatus('approved')
                onPaymentComplete()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to use trial')
            }
        } catch (error) {
            console.error('Error using trial:', error)
            alert('Failed to use trial. Please try again.')
        }
        setIsLoading(false)
    }

    const handleFileSelect = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setPaymentScreenshot({
                    file,
                    data: e.target.result,
                    name: file.name
                })
            }
            reader.readAsDataURL(file)
        } else {
            alert('Please select a valid image file')
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFileSelect(files[0])
        }
    }

    const handleFileInputChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleSubmitPayment = async () => {
        if (!paymentScreenshot) {
            alert('Please upload a screenshot of your payment')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/payments/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: form.email,
                    name: form.name,
                    phone: form.phone,
                    screenshot: paymentScreenshot.data,
                    screenshotName: paymentScreenshot.name
                })
            })

            if (response.ok) {
                setPaymentStatus('submitted')
                alert('Payment submitted for verification. You will be notified once approved.')
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to submit payment')
            }
        } catch (error) {
            console.error('Error submitting payment:', error)
            alert('Failed to submit payment. Please try again.')
        }
        setIsLoading(false)
    }

    const formatExpiryDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (paymentStatus === 'approved') {
        return (
            <main className="page">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Payment Approved ✅</h2>
                        <p>Access granted until {paymentExpiry ? formatExpiryDate(paymentExpiry) : 'expiry date'}</p>
                    </div>
                    <div className="success-panel">
                        <h3>Ready to Start Your Exam!</h3>
                        <p>You now have full access to the CBT examination system.</p>
                        <button type="button" className="btn" onClick={onPaymentComplete} style={{ marginTop: '20px' }}>
                            Begin Exam
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="page">
            <div className="form-container">
                <div className="form-header">
                    <h2>Payment Required</h2>
                    <p>Complete payment to access the examination</p>
                </div>

                {!isTrialUsed && (
                    <div className="success-panel" style={{ marginBottom: '24px', background: '#e8f5e8', border: '1px solid #4caf50' }}>
                        <h3 style={{ color: '#2e7d32', marginBottom: '12px' }}>🎁 Free Trial Available!</h3>
                        <p style={{ marginBottom: '16px' }}>Try the exam system once for free before making payment.</p>
                        <button type="button" className="btn" onClick={handleUseTrial} style={{ background: '#4caf50' }}>
                            Use Free Trial
                        </button>
                    </div>
                )}

                <div className="payment-instructions" style={{ marginBottom: '24px' }}>
                    <h3>Payment Instructions</h3>
                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                        <p style={{ marginBottom: '12px', fontWeight: '600' }}>Transfer ₦2,000 to:</p>
                        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>OPay</p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Account Number: <strong>9052806803</strong></p>
                            <p style={{ margin: '0', fontSize: '16px' }}>Account Name: <strong>Abraham</strong></p>
                        </div>
                        <p style={{ marginTop: '16px', fontSize: '14px', color: '#6c757d' }}>
                            After payment, upload a screenshot below and submit for verification.
                        </p>
                    </div>
                </div>

                {paymentStatus === 'pending' && (
                    <div className="payment-submission" style={{ marginBottom: '24px' }}>
                        <h3>Submit Payment Screenshot</h3>
                        <p style={{ marginBottom: '16px', color: '#6c757d' }}>
                            Upload a screenshot of your OPay payment confirmation
                        </p>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${isDragOver ? '#0f5533' : paymentScreenshot ? '#28a745' : '#d7dde3'}`,
                                borderRadius: '12px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                backgroundColor: isDragOver ? '#f0f8f0' : paymentScreenshot ? '#f8fff8' : '#fafbfc',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                marginBottom: '16px'
                            }}
                            onClick={() => document.getElementById('screenshot-input').click()}
                        >
                            {paymentScreenshot ? (
                                <div>
                                    <div style={{ fontSize: '48px', color: '#28a745', marginBottom: '12px' }}>✅</div>
                                    <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#28a745' }}>
                                        Screenshot Uploaded
                                    </p>
                                    <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                                        {paymentScreenshot.name}
                                    </p>
                                    <img
                                        src={paymentScreenshot.data}
                                        alt="Payment screenshot"
                                        style={{
                                            maxWidth: '200px',
                                            maxHeight: '150px',
                                            marginTop: '12px',
                                            border: '1px solid #e9ecef',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: '48px', color: '#6c757d', marginBottom: '12px' }}>
                                        📸
                                    </div>
                                    <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                                        {isDragOver ? 'Drop your screenshot here' : 'Click to upload or drag & drop'}
                                    </p>
                                    <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                                        PNG, JPG, or JPEG files only
                                    </p>
                                </div>
                            )}
                        </div>

                        <input
                            id="screenshot-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                        />

                        <div className="form-actions">
                            <button type="button" className="btn btn-back" onClick={onBack}>
                                Back
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={handleSubmitPayment}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Submitting...' : 'Submit for Verification'}
                            </button>
                        </div>
                    </div>
                )}

                {paymentStatus === 'submitted' && (
                    <div className="verification-section" style={{ marginTop: '24px' }}>
                        <h3>Payment Submitted ✅</h3>
                        <p style={{ marginBottom: '16px', color: '#6c757d' }}>
                            Your payment screenshot has been submitted and is pending admin review.
                            You will be notified via email once your payment is approved or declined.
                        </p>
                        <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
                                Please wait for admin approval. This usually takes 24-48 hours.
                            </p>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-back" onClick={onBack}>
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}

                {paymentStatus === 'declined' && (
                    <div className="declined-section" style={{ marginTop: '24px' }}>
                        <h3>Payment Declined ❌</h3>
                        <p style={{ marginBottom: '16px', color: '#dc3545' }}>
                            Your payment submission was declined by the administrator.
                            Please check your payment details and try again.
                        </p>
                        <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ margin: '0', fontSize: '14px', color: '#721c24' }}>
                                Common reasons for decline: Invalid payment amount, incorrect account details,
                                or unclear payment screenshot.
                            </p>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn" onClick={() => setPaymentStatus('pending')}>
                                Try Again
                            </button>
                            <button type="button" className="btn btn-back" onClick={onBack}>
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}

                {paymentStatus === 'expired' && (
                    <div className="expired-section" style={{ marginTop: '24px' }}>
                        <h3>Payment Expired ⏰</h3>
                        <p style={{ marginBottom: '16px', color: '#856404' }}>
                            Your payment has expired. Please make a new payment to continue accessing the exam system.
                        </p>
                        <div className="form-actions">
                            <button type="button" className="btn" onClick={() => setPaymentStatus('pending')}>
                                Make New Payment
                            </button>
                            <button type="button" className="btn btn-back" onClick={onBack}>
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}

export default PaymentPage