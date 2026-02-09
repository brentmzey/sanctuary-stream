import PocketBase from 'pocketbase';

const ENVIRONMENTS: Record<string, { url: string; admin: string }> = {
  local: { 
    url: 'http://127.0.0.1:8090', 
    admin: 'admin@local.dev' 
  },
  staging: { 
    url: process.env.PB_URL_STAGING || 'https://staging.pockethost.io', 
    admin: process.env.PB_ADMIN_EMAIL_STAGING || 'admin@sanctuary.dev' 
  },
  production: { 
    url: process.env.PB_URL_PRODUCTION || 'https://production.pockethost.io', 
    admin: process.env.PB_ADMIN_EMAIL_PRODUCTION || 'admin@sanctuary.church' 
  }
};

async function initSchema(env: string = 'local') {
  const config = ENVIRONMENTS[env];
  if (!config) {
    console.error(`❌ Invalid environment: ${env}`);
    console.error(`   Valid options: local, staging, production`);
    process.exit(1);
  }

  const pb = new PocketBase(config.url);
  
  // Authenticate as admin
  const passwordEnvVar = `PB_SANCTUARY_STREAM_ADMIN_PASSWORD_${env.toUpperCase()}`;
  const password = process.env[passwordEnvVar];
  
  if (!password) {
    console.error(`❌ Missing ${passwordEnvVar} environment variable`);
    console.error(`   Set it with: export ${passwordEnvVar}=your-password`);
    process.exit(1);
  }

  try {
    // Try to authenticate with the admin account
    await pb.admins.authWithPassword(config.admin, password);
    console.log(`✅ Connected to ${env} PocketBase at ${config.url}`);
  } catch (error: any) {
    console.error(`❌ Failed to authenticate:`, error.message);
    console.error(`   Make sure you created the admin account at ${config.url}/_`);
    console.error(`   Email: ${config.admin}`);
    console.error(`   Password: <value of ${passwordEnvVar}>`);
    process.exit(1);
  }

  // Verify collections exist (created by migrations on startup)
  console.log('Verifying database schema...');
  try {
    await verifyCollections(pb);
    
    if (env === 'local') {
      await createTestUsers(pb);
    }
    
    await createDefaultStreamRecord(pb);

    console.log(`
✅ Schema initialization complete for ${env}`);
    console.log(`   View admin UI: ${config.url}/_/`);
  } catch (error: any) {
    console.error(`❌ Schema initialization failed:`, error.message);
    if (error.data) {
      console.error('   Error details:', JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

async function verifyCollections(pb: PocketBase) {
  const requiredCollections = ['users', 'commands', 'streams'];
  
  for (const name of requiredCollections) {
    try {
      const collection = await pb.collections.getOne(name);
      console.log(`✓ ${name} collection exists (${collection.schema.length} fields)`);
    } catch (error) {
      console.error(`❌ ${name} collection not found - migrations may not have run`);
      throw new Error(`Missing ${name} collection`);
    }
  }
}

async function createTestUsers(pb: PocketBase) {
  console.log('\nCreating test users (local environment only)...');
  
  const testUsers = [
    { 
      email: 'admin@local.dev', 
      password: 'admin123456', 
      role: 'admin', 
      name: 'Admin User',
      passwordConfirm: 'admin123456'
    },
    { 
      email: 'pastor@local.dev', 
      password: 'pastor123456', 
      role: 'pastor', 
      name: 'Pastor John',
      passwordConfirm: 'pastor123456'
    },
    { 
      email: 'bridge@local.dev', 
      password: 'bridge123456', 
      role: 'tech', 
      name: 'Bridge Service',
      passwordConfirm: 'bridge123456'
    }
  ];

  for (const user of testUsers) {
    try {
      await pb.collection('users').create(user);
      console.log(`  ✅ Created test user: ${user.email} (password: ${user.password})`);
    } catch (error: any) {
      if (error.status === 400 && error.data?.data?.email) {
        console.log(`  ✓ Test user exists: ${user.email}`);
      } else {
        console.error(`  ❌ Failed to create ${user.email}:`, error.message);
      }
    }
  }
}

async function createDefaultStreamRecord(pb: PocketBase) {
  try {
    const existing = await pb.collection('streams').getFullList();
    
    if (existing.length > 0) {
      console.log(`✓ Stream record exists (ID: ${existing[0].id})`);
      console.log('\n📝 Add this to your .env files:');
      console.log(`   STREAM_ID=${existing[0].id}`);
      return;
    }

    const record = await pb.collection('streams').create({
      status: 'idle',
      heartbeat: new Date().toISOString(),
      metadata: {}
    });
    
    console.log(`✅ Created default stream record: ${record.id}`);
    console.log('\n📝 Add this to your .env files:');
    console.log(`   STREAM_ID=${record.id}`);
  } catch (error: any) {
    console.error('❌ Failed to create stream record:', error.message);
    throw error;
  }
}

// Run initialization
const env = process.argv[2] || 'local';

console.log(`\n🚀 Initializing PocketBase schema for: ${env.toUpperCase()}`);
console.log(`${'='.repeat(60)}\n`);

initSchema(env)
  .then(() => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Success! Schema is ready for ${env}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
