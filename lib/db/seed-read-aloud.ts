import { db } from '@/lib/db'
import { speakingQuestions } from '@/lib/db/schema'

const readAloudQuestions = [
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Technology and Society',
        promptText:
            'Technology has revolutionized the way we communicate, work, and live. From smartphones to artificial intelligence, innovations continue to reshape our daily experiences and create new opportunities for human connection and productivity.',
        difficulty: 'Medium' as const,
        tags: ['technology', 'society', 'communication'],
        isActive: true,
    },
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Environmental Conservation',
        promptText:
            'The preservation of natural ecosystems is crucial for maintaining biodiversity and ensuring the survival of countless species. Conservation efforts must address habitat destruction, climate change, and pollution to protect our planet for future generations.',
        difficulty: 'Hard' as const,
        tags: ['environment', 'conservation', 'ecology'],
        isActive: true,
    },
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Educational Methods',
        promptText:
            'Modern education systems are evolving to incorporate technology and innovative teaching methods. Interactive learning platforms and personalized instruction help students develop critical thinking skills and achieve their academic goals more effectively.',
        difficulty: 'Medium' as const,
        tags: ['education', 'learning', 'teaching'],
        isActive: true,
    },
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Health and Wellness',
        promptText:
            'Maintaining a healthy lifestyle requires regular exercise, balanced nutrition, and adequate rest. Physical activity strengthens the cardiovascular system, while proper diet provides essential nutrients for optimal body function.',
        difficulty: 'Easy' as const,
        tags: ['health', 'fitness', 'wellness'],
        isActive: true,
    },
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Economic Development',
        promptText:
            'Sustainable economic growth depends on innovation, infrastructure investment, and workforce development. Nations must balance economic progress with environmental protection and social equity to ensure long-term prosperity for all citizens.',
        difficulty: 'Hard' as const,
        tags: ['economics', 'development', 'sustainability'],
        isActive: true,
    },
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Cultural Heritage',
        promptText:
            'Cultural traditions and historical landmarks represent the collective memory of societies. Preserving these treasures helps maintain cultural identity and provides valuable insights into human civilization and artistic achievement.',
        difficulty: 'Medium' as const,
        tags: ['culture', 'heritage', 'history'],
        isActive: true,
    },
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Scientific Research',
        promptText:
            'Scientific inquiry drives human progress through systematic investigation and experimentation. Researchers across various disciplines work to understand natural phenomena, develop new technologies, and solve complex problems facing humanity.',
        difficulty: 'Medium' as const,
        tags: ['science', 'research', 'innovation'],
        isActive: true,
    },
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Urban Planning',
        promptText:
            'Cities of the future must prioritize sustainability, accessibility, and quality of life. Urban planners design communities that integrate green spaces, efficient transportation systems, and diverse housing options to create livable environments.',
        difficulty: 'Easy' as const,
        tags: ['urban', 'planning', 'sustainability'],
        isActive: true,
    },
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Global Communication',
        promptText:
            'The internet has transformed global communication by enabling instant information exchange across vast distances. Social media platforms, video conferencing, and messaging apps connect people worldwide, fostering international collaboration and cultural exchange.',
        difficulty: 'Easy' as const,
        tags: ['communication', 'internet', 'globalization'],
        isActive: true,
    },
    {
        type: 'read_aloud' as const,
        title: 'Read Aloud - Climate Change',
        promptText:
            'Rising global temperatures pose significant threats to ecosystems, agriculture, and human settlements. Mitigating climate change requires international cooperation, renewable energy adoption, and sustainable resource management practices.',
        difficulty: 'Hard' as const,
        tags: ['climate', 'environment', 'sustainability'],
        isActive: true,
    },
]

export async function seedReadAloudQuestions() {
    console.log('Seeding Read Aloud questions...')

    try {
        for (const question of readAloudQuestions) {
            await db.insert(speakingQuestions).values(question)
            console.log(`✓ Inserted: ${question.title}`)
        }

        console.log(`\n✅ Successfully seeded ${readAloudQuestions.length} Read Aloud questions`)
    } catch (error) {
        console.error('❌ Error seeding questions:', error)
        throw error
    }
}
