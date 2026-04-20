const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data (optional)
    await prisma.area_occupancy.deleteMany();
    await prisma.study_areas.deleteMany();

    // Create study areas
    const result = await prisma.study_areas.createMany({
      data: [
        {
          area_name: 'Central Library - Quiet Zone',
          building: 'Main Library',
          floor: 2,
          capacity: 50,
          wifi: true,
          charging_ports: true,
          silent_zone: true,
          ac: true,
          cafe: false,
          lat:  40.8075,
          lng: -73.9626,
          radius_meters: 30,
          is_active: true,
        },
        {
          area_name: 'Science Building - Study Lounge',
          building: 'Science Block',
          floor: 1,
          capacity: 30,
          wifi: true,
          charging_ports: false,
          silent_zone: false,
          ac: true,
          cafe: true,
          lat: 40.8080,
          lng: -73.9620,
          radius_meters: 25,
          is_active: true,
        },
        {
          area_name: 'Arts Building - Group Study',
          building: 'Arts Block',
          floor: 3,
          capacity: 40,
          wifi: true,
          charging_ports: true,
          silent_zone: false,
          ac: false,
          cafe: false,
          lat: 40.8085,
          lng: -73.9630,
          radius_meters: 35,
          is_active: true,
        },
      ],
    });

    console.log(`Created ${result.count} study areas`);

    // Get the created areas to add occupancy data
    const areas = await prisma.study_areas.findMany();

    // Create occupancy records
    for (const area of areas) {
      await prisma.area_occupancy.create({
        data: {
          study_area_id: area.study_area_id,
          current_count: Math.floor(Math.random() * (area.capacity || 50)),
          available_seats: Math.floor(Math.random() * (area.capacity || 50)),
          occupancy_percentage: Math.floor(Math.random() * 100),
          crowd_status:
            Math.random() > 0.66 ? 'High Crowd' : Math.random() > 0.33 ? 'Medium Crowd' : 'Low Crowd',
        },
      });
    }

    console.log(`Created occupancy records for ${areas.length} areas`);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
