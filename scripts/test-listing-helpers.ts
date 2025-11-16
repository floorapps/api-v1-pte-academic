import { fetchListingQuestions, categorizeQuestions } from '../lib/pte/listing-helpers.js'

async function testListingHelpers() {
  console.log('Testing listing helpers...\n')

  const searchParams = {}
  const section = 'writing'
  const questionType = 'summarize_written_text'

  console.log('Fetching questions with:')
  console.log('  section:', section)
  console.log('  questionType:', questionType)
  console.log('  searchParams:', searchParams)
  console.log('')

  const data = await fetchListingQuestions(section, questionType, searchParams)

  console.log('Raw results:')
  console.log('  Total items:', data.items.length)
  console.log('  Total count:', data.total)
  console.log('  Current page:', data.page)
  console.log('  Page size:', data.pageSize)
  console.log('')

  if (data.items.length > 0) {
    console.log('First 5 questions:')
    data.items.slice(0, 5).forEach((q: any, i: number) => {
      console.log(`  ${i + 1}. ${q.title}`)
      console.log(`     Tags: ${JSON.stringify(q.tags)}`)
    })
  } else {
    console.log('❌ NO QUESTIONS FOUND!')
  }

  console.log('')
  const { all, weekly, monthly } = categorizeQuestions(data.items)

  console.log('Categorized results:')
  console.log('  All:', all.length)
  console.log('  Weekly:', weekly.length)
  console.log('  Monthly:', monthly.length)

  process.exit(0)
}

testListingHelpers().catch((error) => {
  console.error('Error testing listing helpers:', error)
  process.exit(1)
})
