// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // hoặc bcrypt

// Thay chuỗi kết nối bằng MongoDB URI của bạn
const MONGO_URI = "mongodb+srv://Vercel-Admin-khanhhuyen-landingpage:4ERUuzuEAVmnghqo@khanhhuyen-landingpage.a7fydhl.mongodb.net/?retryWrites=true&w=majority"; 

async function createAdmin() {
  await mongoose.connect(MONGO_URI);
  
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  
  const adminUser = {
    email: 'admin@gmail.com',
    password: hashedPassword,
    role: 'admin' // hoặc isAdmin: true
  };

  // Thay 'User' bằng Model của bạn, hoặc dùng trực tiếp connection collection
  await mongoose.connection.collection('users').insertOne(adminUser);
  
  console.log('Tạo tài khoản admin thành công!');
  process.exit();
}

createAdmin();