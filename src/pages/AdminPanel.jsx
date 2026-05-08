import { useState, useEffect } from 'react'

function AdminPanel() {
    const [pendingPayments, setPendingPayments] = useState([])
    const [allPayments, setAllPayments] = useState([])
    const [stats, setStats] = useState({})
    const [adminPassword, setAdminPassword] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [adminNotes, setAdminNotes] = useState('')

    // Admin password - in production, this should be properly secured
    const ADMIN_PASSWORD = 'admin123'
    const API_BASE = 'https://cbt-2-b01o.onrender.com/api'

    useEffect(() => {
        if (isAuthenticated) {
            loadData()
        }
    }, [isAuthenticated])

    const loadData = async () => {
        setIsLoading(true)
        try {
            await Promise.all([
                loadPendingPayments(),
                loadAllPayments(),
                loadStats()
            ])
        } catch (error) {
            console.error('Error loading data:', error)
        }
        setIsLoading(false)
    }

    const loadPendingPayments = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/payments/pending`)
            if (!response.ok) {
                throw new Error(`Failed to load pending payments: ${response.status}`)
            }
            const payments = await response.json()
            setPendingPayments(Array.isArray(payments) ? payments : [])
        } catch (error) {
            console.error('Error loading pending payments:', error)
            setPendingPayments([])
        }
    }

    const loadAllPayments = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/payments`)
            if (!response.ok) {
                throw new Error(`Failed to load all payments: ${response.status}`)
            }
            const payments = await response.json()
            setAllPayments(Array.isArray(payments) ? payments : [])
        } catch (error) {
            console.error('Error loading all payments:', error)
            setAllPayments([])
        }
    }

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/stats`)
            if (!response.ok) {
                throw new Error(`Failed to load stats: ${response.status}`)
            }
            const statsData = await response.json()
            setStats(statsData && typeof statsData === 'object' ? statsData : {})
        } catch (error) {
            console.error('Error loading stats:', error)
            setStats({})
        }
    }

    const handleAdminLogin = () => {
        if (adminPassword === ADMIN_PASSWORD) {
            setIsAuthenticated(true)
        } else {
            alert('Invalid admin password')
        }
    }

    const handleApprovePayment = async (paymentId) => {
        if (!confirm('Are you sure you want to approve this payment?')) return

        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/admin/payments/${paymentId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminNotes })
            })

            if (response.ok) {
                alert('Payment approved successfully!')
                setSelectedPayment(null)
                setAdminNotes('')
                loadData()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to approve payment')
            }
        } catch (error) {
            console.error('Error approving payment:', error)
            alert('Failed to approve payment. Please try again.')
        }
        setIsLoading(false)
    }

    const handleDeclinePayment = async (paymentId) => {
        if (!confirm('Are you sure you want to decline this payment?')) return

        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE}/admin/payments/${paymentId}/decline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminNotes })
            })

            if (response.ok) {
                alert('Payment declined successfully!')
                setSelectedPayment(null)
                setAdminNotes('')
                loadData()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to decline payment')
            }
        } catch (error) {
            console.error('Error declining payment:', error)
            alert('Failed to decline payment. Please try again.')
        }
        setIsLoading(false)
    }

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString()
    }

    const getStatusBadge = (status) => {
        const styles = {
            pending: { background: '#fff3cd', color: '#856404' },
            approved: { background: '#d4edda', color: '#155724' },
            declined: { background: '#f8d7da', color: '#721c24' }
        }
        return styles[status] || styles.pending
    }

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#1b2732' }}>Admin Panel</h2>
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #d7dde3',
                                borderRadius: '8px',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                    <button
                        onClick={handleAdminLogin}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#0f5533',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#1b2732' }}>CBT Admin Panel</h1>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={loadData}
                            disabled={isLoading}
                            style={{
                                padding: '8px 16px',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </button>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            style={{
                                padding: '8px 16px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#1b2732' }}>Total Users</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff', margin: '0' }}>{stats.totalUsers || 0}</p>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#1b2732' }}>Trial Users</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745', margin: '0' }}>{stats.trialUsers || 0}</p>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#1b2732' }}>Paid Users</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f5533', margin: '0' }}>{stats.paidUsers || 0}</p>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#1b2732' }}>Pending</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107', margin: '0' }}>{stats.pendingPayments || 0}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                    {/* Pending Payments */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px', color: '#1b2732' }}>Pending Payments</h2>
                        {pendingPayments.length === 0 ? (
                            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No pending payments</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {pendingPayments.map((payment) => (
                                    <div key={payment._id} style={{ border: '1px solid #e9ecef', borderRadius: '8px', padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', color: '#1b2732' }}>{payment.name}</h4>
                                                <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>{payment.email}</p>
                                                <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '14px' }}>{payment.phone}</p>
                                            </div>
                                            <span style={{ background: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                Pending
                                            </span>
                                        </div>
                                        <p style={{ margin: '8px 0', color: '#495057' }}>
                                            <strong>Screenshot:</strong>
                                        </p>
                                        <img
                                            src={payment.screenshot}
                                            alt="Payment proof"
                                            style={{
                                                maxWidth: '200px',
                                                maxHeight: '150px',
                                                border: '1px solid #e9ecef',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                // Open image in new tab for full view
                                                const newWindow = window.open()
                                                newWindow.document.write(`
                                                    <html>
                                                        <head><title>Payment Screenshot</title></head>
                                                        <body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8f9fa;">
                                                            <img src="${payment.screenshot}" style="max-width:90%;max-height:90%;border:1px solid #dee2e6;border-radius:8px;" />
                                                        </body>
                                                    </html>
                                                `)
                                            }}
                                        />
                                        <p style={{ margin: '8px 0 16px 0', color: '#6c757d', fontSize: '14px' }}>
                                            Submitted: {formatDate(payment.submittedAt)}
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setSelectedPayment(payment)}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    flex: 1
                                                }}
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* All Payments */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px', color: '#1b2732' }}>All Payments</h2>
                        {allPayments.length === 0 ? (
                            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No payments yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                                {allPayments.slice(0, 20).map((payment) => (
                                    <div key={payment._id} style={{
                                        border: '1px solid #e9ecef',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        background: payment.status === 'approved' ? '#f8fff8' : payment.status === 'declined' ? '#fff8f8' : 'white'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', color: '#1b2732', marginBottom: '4px' }}>
                                                    {payment.name}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                                    {payment.email}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                                    {formatDate(payment.submittedAt)}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    ...getStatusBadge(payment.status)
                                                }}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </div>
                                        {payment.expiryDate && (
                                            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                                                Expires: {formatDate(payment.expiryDate)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Review Modal */}
                {selectedPayment && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '12px',
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}>
                            <h3 style={{ marginBottom: '20px', color: '#1b2732' }}>Review Payment</h3>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '8px' }}>User Details</h4>
                                <p><strong>Name:</strong> {selectedPayment.name}</p>
                                <p><strong>Email:</strong> {selectedPayment.email}</p>
                                <p><strong>Phone:</strong> {selectedPayment.phone}</p>
                                <p><strong>Submitted:</strong> {formatDate(selectedPayment.submittedAt)}</p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '8px' }}>Payment Screenshot</h4>
                                <img
                                    src={selectedPayment.screenshot}
                                    alt="Payment proof"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        border: '1px solid #e9ecef',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    Admin Notes (Optional)
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this payment decision..."
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #d7dde3',
                                        borderRadius: '6px',
                                        minHeight: '60px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setSelectedPayment(null)
                                        setAdminNotes('')
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeclinePayment(selectedPayment._id)}
                                    disabled={isLoading}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isLoading ? 'Processing...' : 'Decline'}
                                </button>
                                <button
                                    onClick={() => handleApprovePayment(selectedPayment._id)}
                                    disabled={isLoading}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isLoading ? 'Processing...' : 'Approve'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPanel