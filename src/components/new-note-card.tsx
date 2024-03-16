import * as Dialog from "@radix-ui/react-dialog"
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
    onNoteCreated: (content: string) => void
}

let SpeechRecognition: SpeechRecognition | null = null


export function NewNoteCard({onNoteCreated}:NewNoteCardProps){

    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
    const [content, setContent] = useState('')
    const [isRecording, setIsRecording] = useState(false)

    function handleStartEditor(){
        setShouldShowOnboarding(false)
    }

    function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>){
        setContent(event.target.value)

        if(event.target.value == ''){
            setShouldShowOnboarding(true)
        }
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault()

        if (content == ''){
            return
        }

        onNoteCreated(content)

        setContent('')

        setShouldShowOnboarding(true)
        

        toast.success('Nota salva com sucesso!')
    }

    function handleStartRecording(){
    
        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window
            || 'webkitSpeechRecognition' in window

        if (!isSpeechRecognitionAPIAvailable){
            alert('Infelizmente seu navegador não suporta a API de gravação!')
            return
        }

        setIsRecording(true)
        setShouldShowOnboarding(false)


        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        SpeechRecognition = new SpeechRecognitionAPI()

        SpeechRecognition.lang = 'pt-BR'
        SpeechRecognition.continuous = true
        SpeechRecognition.maxAlternatives = 1
        SpeechRecognition.interimResults = true

        SpeechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, '')

            setContent(transcription)
        }

        SpeechRecognition.onerror = (event) =>{
            console.error(event)
        }

        SpeechRecognition.start()
    }

    function handleStopRecording(){
        setIsRecording(false)

        if (SpeechRecognition !== null){
            SpeechRecognition.stop()
        }

    }

    return(
            <Dialog.Root>
                <Dialog.Trigger className="rounded-md bg-slate-700 p-5 flex flex-col gap-3 overflow-hidden relative text-left hover:ring-2 hover:ring-slate-600 outline-none">
                    <span className="text-sm text-slate-200 font-medium ">
                        Adicionar nota
                    </span>

                    <p className="text-sm text-slate-400 leading-6">
                        Grave uma nota em áudio que será convertida para texto automaticamente.
                    </p>
                </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className='inset-0 fixed bg-black/50'/>
                <Dialog.Content className='inset-0 md:inset-auto overflow-hidden fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md flex flex-col bg-slate-700 w-full md:max-w-[640px] md:h-[68vh] outline-none'>
                    <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-[6px] text-slate-400 hover:text-slate-100'>
                        <X className='size-5'/>
                    </Dialog.Close>

                    <form className="flex-1 flex-col flex">
                        <div className='flex flex-1 flex-col p-5 gap-3'>
                            <span className="text-sm text-slate-300 font-medium ">
                                Adicionar nota
                            </span>

                            {shouldShowOnboarding ? (
                                <p className="text-sm text-slate-400 leading-6">
                                Comece <button type="button" onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline">gravando uma nota</button> em áudio ou se preferir <button type="button" onClick={handleStartEditor} className="font-medium text-lime-400 hover:underline">utilize apenas texto</button>.
                                </p>
                            ):(
                                <textarea
                                    autoFocus
                                    className="text-sm leading-4 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                                    onChange={handleContentChanged}
                                    value={content}
                                />
                            )}
                        </div>

                        {isRecording ? (
                        <button
                            onClick={handleStopRecording}
                            type='button'
                            className='flex items-center justify-center gap-2 w-full bg-slate-900 py-4 text-center text-slate-300 outline-none text-sm font-medium hover:text-slate-100 '>
                            <div className="size-3 rounded-full bg-red-500 animate-pulse"/>
                            Gravando! (CLIQUE PARA INTERROMPER)
                        </button>
                        ) : (
                        <button
                            onClick={handleSaveNote}
                            type='button'
                            className='w-full bg-lime-400 py-4 text-center text-lime-950 outline-none text-sm font-medium hover:bg-lime-500 '>
                            Salvar nota
                        </button>
                        )}

                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )          
}