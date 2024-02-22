import * as Dialog from '@radix-ui/react-dialog'
import { error } from 'console'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps){
    //States
    const [shouldShowOnboarding, setshouldShowOnboarding] = useState(true)
    const [content, setContent] = useState('')
    const [isRecording, setIsRecording] = useState(false)

    //Functions
    function handleStartEditor(){
      setshouldShowOnboarding(false)
    }

    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>){
      setContent(event.target.value)

      if(event.target.value === ''){
        setshouldShowOnboarding(true);
      }
    }

    function handleSaveNote(event: FormEvent){
      event.preventDefault()

      if(content === '')
        return

      onNoteCreated(content) //Função do componente pai, recebido por propriedades

      setContent('');
      setshouldShowOnboarding(true)

      toast.success("Nota criado com sucesso")
    }

    function handleStartRecording(){
      const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
      if(!isSpeechRecognitionAPIAvailable){
        alert('Infelizmente seu navegador não suporta a API de gravação')
        return
      }

      setIsRecording(true)
      setshouldShowOnboarding(false)


      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      speechRecognition = new SpeechRecognitionAPI()


      speechRecognition.lang = 'pt-BR'
      speechRecognition.continuous = true
      speechRecognition.maxAlternatives = 1
      speechRecognition.interimResults = true

      speechRecognition.onresult = (event) => {
        const transcription = Array.from(event.results).reduce((text, result) => {
          return text.concat(result[0].transcript)
        }, '')

        setContent(transcription)
      }

      speechRecognition.onerror = (event) => {
        console.error(event)
      }

      speechRecognition.start()
    }

    function handleStopRecording(){
      setIsRecording(false)

      if(speechRecognition != null)
        speechRecognition.stop()
    }

    //HTML
    return (
      <Dialog.Root>
        <Dialog.Trigger className="rounded-md flex flex-col text-left bg-slate-700 p-5 space-y-3 hover:ring-2 hover:ring-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-lime-400">
          <span className="text-sm font-medium text-slate-200">
            Adicionar Nota
          </span>
          <p className='text-sm leading-6 text-slate-400'>
            Grave uma nota em áudio que será convertida para texto automaticamente.
          </p>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='inset-0 fixed bg-black/60'/>
          <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col'>
            <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
              <X className='size-5'/>
            </Dialog.Close>

            <form className='flex flex-1 flex-col'>
              <div className='flex flex-1 flex-col gap-3 p-5'>
                <span className="text-sm font-medium text-slate-300">
                  Adicionar nota
                </span>

                {shouldShowOnboarding ? (
                  <p className='text-sm leading-6 text-slate-400'>
                  Come gravando <button type="button" onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'>uma nota em áudio</button> ou se preferir utilize <button type="button" onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'>apenas texto</button>.
                  </p>
                ) : (
                  <textarea 
                    autoFocus
                    className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                    onChange={handleContentChange}
                    value={content}
                  />
                )}
                
              </div>

              {isRecording ? (
                <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 text-slate-400 bg-slate-800 py-4 text-center font-medium text-sm  outline-none hover:text-slate-100"
              >
                <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
                Gravando! (clique p/ interromper)
              </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="w-full text-lime-950 bg-lime-400 py-4 text-center font-medium   text-sm  outline-none"
                >
                  Salvar nota
                </button>
              )}
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
}