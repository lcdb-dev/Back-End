import { getPayload } from 'payload';
import config from './dist/payload.config.js';

const createUser = async () => {
  try {
    const payload = await getPayload({ config });
    
    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@example.com',
        password: 'Admin@123456',
      },
    });
    
    console.log('✅ User created successfully:');
    console.log('Email:', user.email);
    console.log('ID:', user.id);
    console.log('\nUse these credentials to login at http://localhost:3000/admin:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
};

createUser();
