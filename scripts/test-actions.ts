import { scoreEssay } from '../app/actions/score-writing'
import { scoreSpeakingAction } from '../lib/actions/score'
import { scoreReading } from '../app/actions/score-reading'
import { scoreListening } from '../app/actions/score-listening'

async function main() {
  const essay = 'This essay discusses public health measures including vaccination, testing, and community response.'
  const writing = await scoreEssay(essay, 'Public health measures reduce severe COVID-19 outcomes')
  console.log('writing', writing)

  const speaking = await scoreSpeakingAction({
    type: 'read_aloud',
    transcript: 'In recent years significant changes in diet and lifestyle have led to a sharp rise in heart related illnesses.',
    promptText: 'In recent years, significant changes in diet and lifestyle have led to a sharp rise in heart related illnesses.'
  })
  console.log('speaking', speaking)

  const reading = await scoreReading({
    type: 'multiple_choice_single',
    userResponse: 'B',
    promptText: 'Select the correct answer for the passage',
    options: ['A','B','C'],
    answerKey: 'B'
  })
  console.log('reading', reading)

  const listening = await scoreListening({
    type: 'summarize_spoken_text',
    transcript: 'The talk explains how protective behaviors and vaccination lower severe cases.',
    promptText: 'Summarize the lecture.'
  })
  console.log('listening', listening)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})