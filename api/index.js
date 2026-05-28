const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── Auth ─────────────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);

// ── Schema / Model ───────────────────────────────────────────
const txSchema = new mongoose.Schema({
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 1 },
  category:    { type: String, default: 'Khác' },
  type:        { type: String, enum: ['expense', 'income'], required: true },
  tx_date:     { type: Date, default: Date.now },
  created_at:  { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', txSchema);

// ── Routes (cần đăng nhập) ───────────────────────────────────

// GET /api/transactions
app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const { type, category, date, week, month, year, all } = req.query;
    const filter = { user_id: req.user.id };
    if (type)     filter.type = type;
    if (category) filter.category = category;

    if (all !== 'true') {
      if (date) {
        const d = new Date(date);
        filter.tx_date = {
          $gte: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
          $lt:  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)),
        };
      } else if (week) {
        const d = new Date(week);
        const day = d.getDay();
        const diffToMon = (day === 0 ? -6 : 1 - day);
        const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMon);
        const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 7);
        filter.tx_date = { $gte: mon, $lt: sun };
      } else if (month && year) {
        const y = parseInt(year), m = parseInt(month);
        filter.tx_date = {
          $gte: new Date(Date.UTC(y, m - 1, 1)),
          $lt:  new Date(Date.UTC(y, m, 1)),
        };
      } else if (year) {
        const y = parseInt(year);
        filter.tx_date = {
          $gte: new Date(Date.UTC(y, 0, 1)),
          $lt:  new Date(Date.UTC(y + 1, 0, 1)),
        };
      } else if (month) {
        const y = new Date().getFullYear(), m = parseInt(month);
        filter.tx_date = {
          $gte: new Date(Date.UTC(y, m - 1, 1)),
          $lt:  new Date(Date.UTC(y, m, 1)),
        };
      }
    }

    const txs = await Transaction.find(filter).sort({ tx_date: -1, created_at: -1 });
    res.json(txs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/transactions/summary
app.get('/api/transactions/summary', authMiddleware, async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: {
            year:  { $year: '$tx_date' },
            month: { $month: '$tx_date' },
            type:  '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/transactions/:id
app.get('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!transaction) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
app.post('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const tx = await Transaction.create({ ...req.body, user_id: req.user.id });
    res.status(201).json(tx);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/transactions/:id
app.put('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      req.body,
      { new: true }
    );
    if (!tx) return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    res.json(tx);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    res.json({ message: 'Đã xóa' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Export app cho test
module.exports = app;

// ── Chỉ chạy server khi file được gọi trực tiếp ──
if (require.main === module) {
  const PORT          = process.env.PORT          || 3000;
  const FRONTEND_PORT = process.env.FRONTEND_PORT || 8080;

  const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:secret123@localhost:27017/expense_tracker?authSource=admin';
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  };

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log('================================');
      console.log('[INFO] API running on port ' + PORT);
      console.log('[INFO] Web:      http://localhost:' + FRONTEND_PORT);
      console.log('[INFO] API:      http://localhost:' + PORT + '/api/transactions');
      console.log('[INFO] Auth:     http://localhost:' + PORT + '/api/auth/login');
      console.log('[INFO] Health:   http://localhost:' + PORT + '/health');
      console.log('================================');
    });
  }).catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });
}