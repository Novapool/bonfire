#!/usr/bin/env tsx
/**
 * Quick test script to verify Firebase connection
 * Run with: npx tsx test-firebase.ts
 */

import * as dotenv from 'dotenv'
import { FirebaseAdapter } from './src/database/FirebaseAdapter'

// Load environment variables
dotenv.config({ path: '../../.env' })

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase connection...\n')

  console.log('Configuration:')
  console.log('  Project ID:', process.env.FIREBASE_PROJECT_ID)
  console.log('  Database URL:', process.env.FIREBASE_DATABASE_URL)
  console.log('  Credentials Path:', process.env.FIREBASE_CREDENTIALS_PATH)
  console.log('')

  try {
    // Create adapter
    const adapter = new FirebaseAdapter({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      databaseURL: process.env.FIREBASE_DATABASE_URL!,
      credentialsPath: process.env.FIREBASE_CREDENTIALS_PATH,
    })

    console.log('✓ FirebaseAdapter created')

    // Initialize
    await adapter.initialize()
    console.log('✓ Firebase initialized successfully')

    // Test write
    const testRoomId = 'TEST01'
    const testState = { phase: 'lobby', players: [] }
    const testMetadata = {
      roomId: testRoomId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      hostId: 'test-host',
      playerCount: 0,
      status: 'active' as const,
      gameType: 'test-game',
    }

    await adapter.saveGameState(testRoomId, testState)
    await adapter.updateRoomMetadata(testRoomId, testMetadata)
    console.log('✓ Test room created:', testRoomId)

    // Test read
    const state = await adapter.loadGameState(testRoomId)
    console.log('✓ Test room state retrieved:', state)

    const metadata = await adapter.getRoomMetadata(testRoomId)
    console.log('✓ Test room metadata retrieved:', metadata)

    // Clean up
    await adapter.deleteRoom(testRoomId)
    console.log('✓ Test room deleted')

    console.log('\n🎉 Firebase connection test successful!')
    console.log('Your Firebase setup is working correctly.')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Firebase connection test failed:')
    console.error(error)
    process.exit(1)
  }
}

testFirebaseConnection()
