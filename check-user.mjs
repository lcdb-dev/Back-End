import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://atoolsood_db_user:S6CAKbYrmiyLkKFz@leo.cn7rilk.mongodb.net/lcdb?appName=Leo&retryWrites=true&w=majority';

async function checkUser() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('lcdb');

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Database: lcdb');
    console.log('📂 Collections:');
    collections.forEach(col => console.log('   -', col.name));

    // Get users collection
    const usersCollection = db.collection('users');
    const users = await usersCollection.find().toArray();
    
    console.log('\n👤 Users in database:');
    console.log('Total:', users.length);
    users.forEach((user, index) => {
      console.log(`\n[${index + 1}] User:`);
      console.log('  ID:', user._id);
      console.log('  Email:', user.email);
      console.log('  Password:', user.password?.slice(0, 20) + '...');
      console.log('  Roles:', user.roles);
      console.log('  Created:', user.createdAt);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkUser();
