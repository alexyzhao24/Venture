import pkg from '../src/generated/client.js';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.task.deleteMany();

    const tasks = [
        { title: 'Walk', description: 'Go for a 30 minute walk', points: 1 },
        { title: 'Laundry', description: 'Do your laundry', points: 1 },
        { title: 'Meditate', description: 'Meditate, preferably outside, for 10 minutes', points: 1 },
        { title: 'Sleep Well', description: 'Sleep for 8 hours tonight without an alarm', points: 1 },
        { title: 'Run', description: 'Go for a 30 minute run', points: 2 },
        { title: 'Journal', description: 'Write a journal entry about your day', points: 2 },
        { title: 'A New Hobby', description: 'Find something you would like to try and try it out', points: 2 },
        { title: 'Clean Up', description: 'Clean your living space', points: 2 },
        { title: 'Volunteer', description: 'Go to your local charity or club and volunteer', points: 3 },
        { title: 'Make a Friend', description: 'Go out and talk to someone new', points: 3 },
    ];

    for (const task of tasks) {
        await prisma.task.create({ data: task });
    }
    console.log('Tasks seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());