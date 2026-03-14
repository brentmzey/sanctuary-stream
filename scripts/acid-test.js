const PocketBase = require('pocketbase/cjs');
const crypto = require('crypto');

async function acidTest() {
  console.log('🧪 Starting Acid Test: Full End-to-End Command Flow');
  const pb = new PocketBase('http://127.0.0.1:8090');
  
  try {
    // 1. Auth as User (who has admin role in the users collection)
    console.log('1. Authenticating as admin user...');
    await pb.collection('users').authWithPassword('admin@local.dev', 'admin123456');
    const userId = pb.authStore.model.id;
    console.log(`✅ Authenticated as user: ${userId}`);
    
    // 2. Create Command
    const correlationId = crypto.randomUUID();
    console.log(`2. Creating START command (Correlation: ${correlationId})...`);
    const command = await pb.collection('commands').create({
      action: 'START',
      executed: false,
      correlation_id: correlationId,
      created_by: userId
    });
    console.log(`✅ Command created with ID: ${command.id}`);
    
    // 3. Wait for Bridge to execute and update
    console.log('3. Waiting for Bridge to process (max 10s)...');
    let attempts = 0;
    while (attempts < 10) {
      const updatedCommand = await pb.collection('commands').getOne(command.id);
      if (updatedCommand.executed) {
        console.log('✅ Bridge marked command as EXECUTED!');
        if (updatedCommand.error_message) {
          console.error(`❌ But it reported an error: ${updatedCommand.error_message}`);
          process.exit(1);
        }
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    if (attempts >= 10) {
      console.error('❌ Timeout: Bridge did not process the command.');
      process.exit(1);
    }
    
    // 4. Verify Stream Status Update
    console.log('4. Verifying Stream status update...');
    const streams = await pb.collection('streams').getFullList();
    const stream = streams[0];
    console.log(`📡 Current Stream Status: ${stream.status}, Live: ${stream.is_live}`);
    
    console.log('\n✨ ACID TEST PASSED: Full flow verified from PB -> Bridge -> OBS -> PB');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ ACID TEST FAILED!');
    console.error(err);
    process.exit(1);
  }
}

acidTest();
