async function addDummyData() {
  const baseUrl = 'http://localhost:3000/api/study-areas';

  const data1 = {
    name: 'Library Zone A',
    building: 'Main Building',
    floor: 0,
    capacity: 50,
    latitude: 40.7128,
    longitude: -74.0060,
    radiusMeters: 20,
    status: 'available',
    facilities: {
      wifi: true,
      chargingPorts: true,
      silentZone: false,
      ac: true,
    },
  };

  const data2 = {
    name: 'Study Lounge B',
    building: 'Academic Block',
    floor: 2,
    capacity: 80,
    latitude: 40.7138,
    longitude: -74.0070,
    radiusMeters: 25,
    status: 'low_crowd',
    facilities: {
      wifi: true,
      chargingPorts: true,
      silentZone: true,
      ac: true,
    },
  };

  try {
    console.log('Creating Study Area 1...');
    const response1 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data1),
    });
    const result1 = await response1.json();
    console.log('Study Area 1 Result:', JSON.stringify(result1, null, 2));

    console.log('\nCreating Study Area 2...');
    const response2 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data2),
    });
    const result2 = await response2.json();
    console.log('Study Area 2 Result:', JSON.stringify(result2, null, 2));

    console.log('\n✅ Dummy data added successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addDummyData();
