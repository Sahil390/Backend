require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection error', err);
    process.exit(1);
  }
}
test();