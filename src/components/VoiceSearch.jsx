import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export default function VoiceSearch({ onSearch, placeholder = "Search..." }) {
  const [isListening, setIsListening] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'
      recognitionInstance.maxAlternatives = 1

      recognitionInstance.onstart = () => {
        console.log('Voice recognition started')
        setIsListening(true)
        toast.success('🎤 Listening... Speak now!', { duration: 2000 })
      }

      recognitionInstance.onresult = (event) => {
        console.log('Voice recognition result:', event)
        const transcript = event.results[0][0].transcript
        console.log('Transcript:', transcript)
        setSearchText(transcript)
        onSearch(transcript)
        toast.success(`🔍 Searching for: "${transcript}"`, { duration: 3000 })
      }

      recognitionInstance.onerror = (event) => {
        console.error('Voice recognition error:', event.error)
        setIsListening(false)
        
        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.', { duration: 3000 })
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          toast.error('Microphone access denied. Please enable microphone permissions in your browser.', { duration: 5000 })
        } else if (event.error === 'network') {
          toast.error('Network error. Please check your internet connection.', { duration: 3000 })
        } else {
          toast.error(`Voice search error: ${event.error}`, { duration: 3000 })
        }
      }

      recognitionInstance.onend = () => {
        console.log('Voice recognition ended')
        setIsListening(false)
      }

      recognitionRef.current = recognitionInstance
    } else {
      setIsSupported(false)
      console.warn('Speech Recognition not supported in this browser')
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    }
  }, [])

  const startListening = async () => {
    if (!isSupported) {
      toast.error('Voice search not supported in this browser. Please use Chrome, Edge, or Safari.', { duration: 5000 })
      return
    }

    if (!recognitionRef.current) {
      toast.error('Voice recognition not initialized')
      return
    }

    try {
      // Request microphone permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true })
          console.log('Microphone permission granted')
        } catch (permError) {
          console.error('Microphone permission error:', permError)
          toast.error('Please allow microphone access to use voice search', { duration: 5000 })
          return
        }
      }

      // Start recognition
      recognitionRef.current.start()
      console.log('Starting voice recognition...')
    } catch (error) {
      console.error('Failed to start voice recognition:', error)
      if (error.message && error.message.includes('already started')) {
        toast.error('Voice search is already active')
      } else {
        toast.error('Failed to start voice search. Please try again.')
      }
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        console.log('Stopping voice recognition...')
      } catch (error) {
        console.error('Error stopping recognition:', error)
      }
    }
  }

  const handleTextSearch = (e) => {
    e.preventDefault()
    if (searchText.trim()) {
      onSearch(searchText)
      toast.success(`🔍 Searching for: "${searchText}"`)
    }
  }

  const handleClearSearch = () => {
    setSearchText('')
    onSearch('')
  }

  return (
    <div className="relative">
      {/* Browser Support Warning */}
      {!isSupported && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Voice Search Not Available</p>
              <p className="mt-1">Your browser doesn't support voice search. Please use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Safari</strong> for voice search functionality.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleTextSearch} className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-24 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
        />
        
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {searchText && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-16 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
            !isSupported
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isListening
              ? 'bg-red-500 text-white animate-pulse shadow-lg'
              : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
          }`}
          title={
            !isSupported
              ? 'Voice search not supported in this browser'
              : isListening
              ? 'Stop listening (click or speak)'
              : 'Start voice search (click to speak)'
          }
        >
          {isListening ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </form>

      {/* Voice Search Indicator */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 border-2 border-red-200 rounded-xl animate-pulse">
          <div className="flex items-center gap-2 text-red-600">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-4 bg-red-600 rounded animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-4 bg-red-600 rounded animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm font-medium">Listening... Speak now!</span>
          </div>
        </div>
      )}
    </div>
  )
}
