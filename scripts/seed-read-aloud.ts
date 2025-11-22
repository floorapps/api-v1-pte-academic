import { seedReadAloudQuestions } from '../lib/db/seed-read-aloud'

// Run the seed function
seedReadAloudQuestions()
    .then(() => {
        console.log('\n🎉 Database seeding completed!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n💥 Database seeding failed:', error)
        process.exit(1)
    })
