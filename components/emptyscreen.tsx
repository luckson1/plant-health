import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import { Plants } from './plants_covered'

const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n'
  },
  {
    heading: 'Draft an email',
    message: `Draft an email to my boss about the following: \n`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4 mb-10 text-start">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Plant Pathologist Chatbot!
        </h1>
     
        <div className="inline w-full max-w-xl mb-2 md:md-5">
        Chat with an AI Pathologist for leaf health diagnostics of these
        <Plants />
      </div>
        <div className="mt-4 flex flex-col items-start space-y-2">
    <p>  Follow the following steps: </p>
      <div className="inline text-sm text-start ml-3">
              1. {" "}
              * Upload an image of a{" "}
              <span className="font-extrabold text-base">Single</span> leaf of any of
              these <Plants /> only
            </div>
            <p className='text-sm ml-3'>2. Click on the button to determine the leaf condition</p>
            <p className='text-sm ml-3'> 3. Our AI pland pathologist will try to determine the health condition of the leaf</p>
            <p className='text-sm ml-3'> 4. Chat with the AI pathologist to learn more about the condition</p>
            <div className='text-sm mt-3'>* Please note that if you upload a plant that is not among the  <Plants />,  the prediction will be wrong</div>
            <div className='text-sm mt-4' >* Please note that if you upload a plant that if you upload an image with multiple leaves, the prediction might be incorrenct</div>
        </div>
      </div>
    </div>
  )
}