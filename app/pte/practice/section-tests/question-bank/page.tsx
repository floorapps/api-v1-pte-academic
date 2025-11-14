import QuestionsTable from '@/components/pte/questions-table'
import { initialCategories } from '@/lib/pte/data'

// Define the Question type to match what our table expects
type Question = {
  id: string
  title: string
  category: string
  subcategory: string
  difficulty: string
  status: 'completed' | 'in-progress' | 'not-started'
  attempts: number
  score?: number
}

export default function QuestionBankPage() {
  // Generate mock questions from the initialCategories data
  const generateQuestions = (): Question[] => {
    const questions: Question[] = []

    // Get all subcategories (categories that have a parent)
    const subCategories = initialCategories.filter((cat) => cat.parent !== null)

    subCategories.forEach((cat) => {
      const parentCategory = initialCategories.find(
        (parent) => parent.id === cat.parent
      )
      if (parentCategory) {
        // Create mock questions based on question_count in the category
        for (let i = 1; i <= Math.min(cat.question_count || 0, 10); i++) {
          // Limit to 10 per category for demo
          questions.push({
            id: `${cat.code}-${i}`,
            title: `${cat.title} Practice Question ${i}`,
            category: parentCategory.title,
            subcategory: cat.title,
            difficulty: i <= 3 ? 'Easy' : i <= 6 ? 'Medium' : 'Hard',
            status:
              i <= 2 ? 'completed' : i <= 4 ? 'in-progress' : 'not-started',
            attempts: i <= 4 ? Math.floor(Math.random() * i) + 1 : 0,
            score: i <= 2 ? Math.floor(Math.random() * 40) + 60 : undefined, // Only completed questions have scores
          })
        }
      }
    })

    return questions
  }

  const questions = generateQuestions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PTE Question Bank</h1>
          <p className="text-muted-foreground">
            Browse and practice all available PTE questions
          </p>
        </div>
      </div>

      <QuestionsTable rows={questions} />
    </div>
  )
}
