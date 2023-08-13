'use client'

import { ChatList } from '@/components/chat_list'
import { ChatScrollAnchor } from '@/components/chat_scorll_anchor'
import { Button } from '@/components/ui/button'
import { IconArrowElbow } from '@/components/ui/icons'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { nanoid } from '@/lib/utils'
import { useChat } from 'ai/react'
import { KeyboardEvent, useRef } from 'react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
const formRef=useRef<HTMLFormElement>(null)
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      formRef.current?.requestSubmit()
      event.preventDefault()
    }
  }
  const id = nanoid()
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
    <ChatList messages={messages} />
    <ChatScrollAnchor trackVisibility={isLoading} />
      <form onSubmit={handleSubmit} ref={formRef} className='relative '>
        <Textarea
        onKeyDown={handleKeyDown}
          // className="fixed bottom-0 w-full max-w-md mb-8 "
          className='min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm'
          value={input}
          placeholder="Ask me about plant diseases..."
          onChange={handleInputChange}
        />
        <div className="absolute right-0 top-4 sm:right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input === ''}
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
          </TooltipProvider>
        </div>
      </form>
    </div>
  )}
