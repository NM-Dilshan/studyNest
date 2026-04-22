// Seed test data for hall requests
// Run: node seed-hall-requests.js

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./src/generated/prisma/client");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding test data...");

  try {
    // Create test student user
    const student = await prisma.users.create({
      data: {
        student_id: "IT2024001",
        name: "Sunera Imasha",
        email: "sunera@example.com",
        mobile: "0712345678",
        password: "$2a$10$test", // hashed password
        role: "student",
        is_active: true,
        department: "IT",
      },
    });

    console.log(`✅ Created student: ${student.name} (${student.student_id})`);

    // Create test volunteer user
    const volunteer = await prisma.users.create({
      data: {
        volunteer_id: "VOL2024001",
        name: "Naveen Kumar",
        email: "naveen@example.com",
        mobile: "0787654321",
        password: "$2a$10$test", // hashed password
        role: "volunteer",
        is_active: true,
        department: "Engineering",
      },
    });

    console.log(`✅ Created volunteer: ${volunteer.name} (${volunteer.volunteer_id})`);

    // Create test lecture halls
    const hall1 = await prisma.lecture_halls.create({
      data: {
        hall_name: "LT1",
        building: "Engineering Building",
        floor: 1,
        capacity: 150,
        block: "A",
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
      },
    });

    const hall2 = await prisma.lecture_halls.create({
      data: {
        hall_name: "LT2",
        building: "Engineering Building",
        floor: 2,
        capacity: 120,
        block: "A",
        projector: true,
        wifi: true,
        ac: true,
        is_active: true,
      },
    });

    const hall3 = await prisma.lecture_halls.create({
      data: {
        hall_name: "LT3",
        building: "Science Building",
        floor: 1,
        capacity: 100,
        block: "B",
        projector: true,
        wifi: true,
        whiteboard: true,
        is_active: true,
      },
    });

    console.log(`✅ Created halls: ${hall1.hall_name}, ${hall2.hall_name}, ${hall3.hall_name}`);

    // Create a test request
    const request = await prisma.hall_requests.create({
      data: {
        requester_id: student.user_id,
        requester_role: "student",
        requester_id_number: student.student_id,
        hall_id: hall1.hall_id,
        request_note: "Need to know if there are seats available now",
        request_status: "Pending",
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000),
      },
    });

    console.log(`✅ Created request from ${student.name}`);

    // Create a test response
    const response = await prisma.hall_request_updates.create({
      data: {
        request_id: request.request_id,
        responder_id: volunteer.user_id,
        availability_status: "Free",
        occupancy_level: "Low",
        available_seats: 87,
        volunteer_note: "Class ending at 3 PM, should get busier",
        confidence_level: "High",
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000),
      },
    });

    console.log(`✅ Created response from ${volunteer.name}`);

    console.log("\n✨ Seed data created successfully!\n");
    console.log("🧪 Test Accounts:");
    console.log(`   Student: ${student.email}`);
    console.log(`   Student ID: ${student.student_id}`);
    console.log(`   Volunteer: ${volunteer.email}`);
    console.log(`   Volunteer ID: ${volunteer.volunteer_id}`);

    console.log("\n📍 Test URLs:");
    console.log("   - Student Requests: http://localhost:3000/requests");
    console.log("   - Volunteer Dashboard: http://localhost:3000/volunteer/requests");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

main();
