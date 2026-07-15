#!/usr/bin/env node

/**
 * Simple API test script for Volunteer Hall Updates
 */

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('=== Testing Volunteer Hall Updates API ===\n')
  
  // Test 1: GET lecture halls
  console.log('Test 1: GET /api/lecture-halls')
  try {
    const response = await fetch(`${baseUrl}/api/lecture-halls`)
    const data = await response.json()
    console.log(`Status: ${response.status}`)
    console.log(`Halls found: ${data.count}\n`)
    return data.halls[0]?.hall_id // Get first hall ID for testing
  } catch (error) {
    console.error(`Error: ${error.message}\n`)
    return null
  }
}

testEndpoints().then(hallId => {
  if (!hallId) {
    console.log('Failed to get hall ID from first test')
    process.exit(1)
  }
  
  console.log('✓ Test 1 passed')
  console.log(`\nDone! First hall ID: ${hallId}`)
})
