db = db.getSiblingDB('expense_tracker');

db.transactions.insertMany([
  { description: 'Lương tháng 5',      amount: 15000000, category: 'Thu nhập',  type: 'income',  tx_date: new Date('2026-05-11'), created_at: new Date() },
  { description: 'Ăn trưa',               amount: 50000, category: 'Ăn uống',   type: 'expense', tx_date: new Date('2026-05-11'), created_at: new Date() },
  { description: 'Tiền điện tháng 4',    amount: 350000, category: 'Hóa đơn',   type: 'expense', tx_date: new Date('2026-05-11'), created_at: new Date() },
  { description: 'Xăng xe',               amount: 80000, category: 'Di chuyển', type: 'expense', tx_date: new Date('2026-05-11'), created_at: new Date() },
  { description: 'Mua sách',             amount: 120000, category: 'Mua sắm',   type: 'expense', tx_date: new Date('2026-05-11'), created_at: new Date() },
  { description: 'Cà phê',                amount: 35000, category: 'Ăn uống',   type: 'expense', tx_date: new Date('2026-05-11'), created_at: new Date() },
  { description: 'Freelance project',   amount: 3000000, category: 'Thu nhập',  type: 'income',  tx_date: new Date('2026-05-11'), created_at: new Date() },
  { description: 'Ăn tối gia đình',      amount: 200000, category: 'Ăn uống',   type: 'expense', tx_date: new Date('2026-05-11'), created_at: new Date() },
]);

print('Seed data inserted successfully!');
