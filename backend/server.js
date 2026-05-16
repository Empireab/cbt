const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'https://uniportpostutme2026.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cbt_system';

mongoose.connect(dbUri)
    .then(() => {
        console.log('MongoDB connected')

        // Start server only after successful DB connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch(err => {
        console.error('MongoDB connection error:', err)
        console.error('Ensure MongoDB is running and the URI is correct.')
        process.exit(1)
    });

// Models
const PaymentSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    phone: String,
    screenshot: String, // Base64 encoded image
    screenshotName: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
    },
    submittedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    declinedAt: Date,
    expiryDate: Date,
    adminNotes: String
});

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    phone: String,
    trialUsed: { type: Boolean, default: false },
    paymentHistory: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        status: String
    }],
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', PaymentSchema);
const User = mongoose.model('User', UserSchema);

// Routes

// Submit payment
app.post('/api/payments/submit', async (req, res) => {
    try {
        const { email, name, phone, screenshot, screenshotName } = req.body;

        // Check if user exists, create if not
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, name, phone });
            await user.save();
        }

        // Check if payment already exists
        let payment = await Payment.findOne({ email });
        if (payment) {
            return res.status(400).json({ error: 'Payment already submitted for this email' });
        }

        // Create new payment
        payment = new Payment({
            email,
            name,
            phone,
            screenshot,
            screenshotName,
            status: 'pending'
        });

        await payment.save();

        res.json({ message: 'Payment submitted successfully', paymentId: payment._id });
    } catch (error) {
        console.error('Error submitting payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get payment status
app.get('/api/payments/status/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const payment = await Payment.findOne({ email });
        const user = await User.findOne({ email });

        if (!payment && !user) {
            return res.json({ status: 'no_payment', trialAvailable: true });
        }

        const response = {
            trialUsed: user ? user.trialUsed : false,
            paymentStatus: payment ? payment.status : 'none',
            expiryDate: payment && payment.expiryDate ? payment.expiryDate : null
        };

        res.json(response);
    } catch (error) {
        console.error('Error getting payment status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Use free trial
app.post('/api/trial/use', async (req, res) => {
    try {
        const { email, name, phone } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, name, phone });
        }

        if (user.trialUsed) {
            return res.status(400).json({ error: 'Trial already used' });
        }

        user.trialUsed = true;
        await user.save();

        res.json({ message: 'Trial activated successfully' });
    } catch (error) {
        console.error('Error using trial:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin routes

// Get all pending payments
app.get('/api/admin/payments/pending', async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'pending' }).sort({ submittedAt: -1 });
        res.json(payments);
    } catch (error) {
        console.error('Error getting pending payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve payment
app.post('/api/admin/payments/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ error: 'Payment is not pending' });
        }

        // Set expiry to 1 month from now
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        payment.status = 'approved';
        payment.approvedAt = new Date();
        payment.expiryDate = expiryDate;
        payment.adminNotes = adminNotes;

        await payment.save();

        res.json({ message: 'Payment approved successfully', expiryDate });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Decline payment
app.post('/api/admin/payments/:id/decline', async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ error: 'Payment is not pending' });
        }

        payment.status = 'declined';
        payment.declinedAt = new Date();
        payment.adminNotes = adminNotes;

        await payment.save();

        res.json({ message: 'Payment declined successfully' });
    } catch (error) {
        console.error('Error declining payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all payments (for admin dashboard)
app.get('/api/admin/payments', async (req, res) => {
    try {
        const payments = await Payment.find().sort({ submittedAt: -1 });
        res.json(payments);
    } catch (error) {
        console.error('Error getting payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user statistics
app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({
            $or: [
                { trialUsed: true },
                { email: { $in: await Payment.distinct('email') } }
            ]
        });

        const trialUsers = await User.countDocuments({ trialUsed: true });

        const paidUsers = await Payment.countDocuments({
            status: 'approved'
        });

        const pendingPayments = await Payment.countDocuments({
            status: 'pending'
        });

        const declinedPayments = await Payment.countDocuments({
            status: 'declined'
        });

        res.json({
            totalUsers,
            trialUsers,
            paidUsers,
            pendingPayments,
            declinedPayments
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check if user can retake exam
app.get('/api/users/:email/can-retake', async (req, res) => {
    try {
        const { email } = req.params;

        const user = await User.findOne({ email });
        const payment = await Payment.findOne({ email, status: 'approved' });

        if (!user) {
            return res.json({ canRetake: false, reason: 'User not found' });
        }

        // If user has active payment, they can retake
        if (payment && payment.expiryDate && payment.expiryDate > new Date()) {
            return res.json({ canRetake: true, paymentActive: true });
        }

        // If trial used, they cannot retake
        if (user.trialUsed) {
            return res.json({ canRetake: false, reason: 'Trial used, payment required' });
        }

        res.json({ canRetake: false, reason: 'No active payment' });
    } catch (error) {
        console.error('Error checking retake permission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.delete('/api/admin/clear', async (req, res) => {
    try {

        // 1. Remove ONLY declined payments completely
        await Payment.deleteMany({
            status: 'declined'
        });

        // 2. Clear screenshots for approved payments
        // (so admin panel looks fresh)
        await Payment.updateMany(
            { status: 'approved' },
            {
                $unset: {
                    screenshot: "",
                    screenshotName: "",
                    adminNotes: ""
                }
            }
        );

        res.json({
            message: 'Admin panel cleared successfully'
        });

    } catch (error) {
        console.error('Error clearing admin panel:', error);
        res.status(500).json({
            error: 'Failed to clear admin panel'
        });
    }
});