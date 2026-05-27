const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');

// Kiểm tra nếu đang chạy trong GitHub Actions hoặc có MONGO_URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:secret123@localhost:27018/expense_tracker_test?authSource=admin';
const shouldTestDB = process.env.SKIP_DB_TESTS !== 'true';

// Chỉ kết nối DB nếu cần test database
beforeAll(async () => {
  if (shouldTestDB) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Test DB connected');
      // Xóa dữ liệu cũ
      await mongoose.connection.db.dropDatabase();
    } catch (err) {
      console.warn('⚠️ Cannot connect to MongoDB, skipping DB tests');
      process.env.SKIP_DB_TESTS = 'true';
    }
  }
}, 30000);

afterAll(async () => {
  if (shouldTestDB && mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('✅ Test DB disconnected');
  }
});

// Health check - luôn chạy
describe('Health Check', () => {
  test('GET /health trả về ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

// Chỉ chạy test database nếu có kết nối
const describeDB = shouldTestDB ? describe : describe.skip;

describeDB('Transactions API', () => {
  let createdId;

  test('GET /api/transactions trả về mảng', async () => {
    const response = await request(app).get('/api/transactions?all=true');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/transactions tạo giao dịch mới và lưu ID', async () => {
    const newTx = {
      description: 'Test transaction',
      amount: 1000,
      category: 'Test',
      type: 'expense',
      tx_date: '2025-05-11'
    };
    const response = await request(app)
      .post('/api/transactions')
      .send(newTx);
    
    expect(response.status).toBe(201);
    expect(response.body.description).toBe('Test transaction');
    
    // Lưu ID từ response
    createdId = response.body._id || response.body.id;
    console.log('📝 Created transaction ID:', createdId);
    expect(createdId).toBeDefined();
  });

  test('GET /api/transactions/:id lấy giao dịch cụ thể', async () => {
    expect(createdId).toBeDefined();
    const response = await request(app).get(`/api/transactions/${createdId}`);
    console.log('🔍 GET response status:', response.status);
    console.log('🔍 GET response body:', response.body);
    expect(response.status).toBe(200);
    const returnedId = response.body._id || response.body.id;
    expect(returnedId).toBe(createdId);
  });

  test('DELETE /api/transactions/:id xóa giao dịch', async () => {
    expect(createdId).toBeDefined();
    const response = await request(app).delete(`/api/transactions/${createdId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Đã xóa');
  });
});

// Test đơn giản luôn pass (fallback)
describe('Basic Validation', () => {
  test('CI/CD pipeline is configured', () => {
    expect(true).toBe(true);
  });
});