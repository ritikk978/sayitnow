import React, { useState, useRef, useEffect, ChangeEvent, useCallback } from 'react';
import axios from 'axios'; // Import axios
import { motion, AnimatePresence } from 'framer-motion';
import {
  AudioWaveform,
  Check,
  AlertTriangle,
  X,
  Settings,
  ChevronUp,
  ChevronDown,
  Loader2,
  Sparkles,
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Cpu, // Keep Cpu if you want the placeholder button
  Mic, // Icon for starting recording
  MicOff, // Icon for stopping recording or indicating recording state
  AlertCircle, // Icon for STT not supported
} from 'lucide-react';
import Link from 'next/link';
import InternalNavbar from '@/component/internalNavbar';

// --- Interfaces (keep as they are) ---

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}


interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}


 
 





interface Voice {
  name: string;
  languageCodes: string[];
  ssmlGender?: string;
  naturalSampleRateHertz?: number;
}

interface LanguageDisplay {
  code: string;
  label: string;
}

// --- Helper function (keep as it is) ---
const base64ToBlob = (base64: string, mimeType: string): Blob => {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (e) {
    console.error("Error decoding base64 string:", e);
    return new Blob([], { type: mimeType });
  }
};



// --- Check for SpeechRecognition API ---
// Do this outside the component to check availability synchronously
const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

const VoiceSynthesizer: React.FC = () => {
  // == State Management (Merged + STT State) ==
  const [text, setText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [voiceName, setVoiceName] = useState<string>('');
  const [pitch, setPitch] = useState<number>(0);
  const [speakingRate, setSpeakingRate] = useState<number>(1);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // TTS loading
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [error, setError] = useState<string>(''); // TTS error
  const [showDetailedError, setShowDetailedError] = useState<boolean>(false);
  const [isConversionSuccess, setIsConversionSuccess] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  // -- STT State --
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [sttError, setSttError] = useState<string>('');
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState<boolean>(false);

  // Refs (TTS + STT)
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<typeof SpeechRecognition | null>(null);

  // == API Calls & Data Handling (TTS - keep as is) ==
   useEffect(() => {
    let isMounted = true;
    const fetchVoices = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Assume /api/tts GET returns voices list like { voices: [...] }
        const response = await axios.get('/api/tts');
        console.log('API Voices Response:', response);

        if (!isMounted) return;

        const data = response.data;
        // Robust check for the voices array
        const voiceList: Voice[] = data && Array.isArray(data.voices) ? data.voices : [];

        if (voiceList.length === 0 && (!data || !data.voices)) {
             console.warn("API did not return a 'voices' array or it was empty.");
             // Optionally throw an error if voices are absolutely required
             // throw new Error("No voices received from API.");
        }

        const languageCodes = voiceList
          .flatMap(voice => voice.languageCodes || [])
          .filter((code): code is string => typeof code === 'string' && code.length > 0);

        const languageSet = new Set(languageCodes);
        const sortedLanguages = Array.from(languageSet).sort();

        setLanguages(sortedLanguages);
        setVoices(voiceList);

        if (sortedLanguages.length > 0) {
          let defaultLanguage = sortedLanguages.includes('en-US') ? 'en-US' : sortedLanguages[0];
          setSelectedLanguage(defaultLanguage);

          const defaultVoicesForLang = voiceList.filter(
            (voice) => voice.languageCodes?.includes(defaultLanguage)
          );

          let defaultVoice = defaultVoicesForLang.find(v => v.name.includes('Standard'))
                            || defaultVoicesForLang.find(v => v.name.includes('Neural'))
                            || defaultVoicesForLang[0];

          if (defaultVoice) {
            setVoiceName(defaultVoice.name);
          } else if (voiceList.length > 0) {
             setVoiceName(voiceList[0].name);
             if(voiceList[0].languageCodes?.length > 0) {
                setSelectedLanguage(voiceList[0].languageCodes[0]);
             } else {
                 // If the first voice also has no language, maybe clear selection?
                 setSelectedLanguage(''); // Or handle as appropriate
             }
          }
        } else if (voiceList.length > 0) {
            // Fallback if no languages extracted but voices exist (unlikely with correct data)
            setVoiceName(voiceList[0].name);
            setSelectedLanguage(voiceList[0].languageCodes?.[0] || '');
        }
      } catch (err: any) {
        console.error("Voice fetch error:", err);
         if (isMounted) {
            setError(`Failed to load voices: ${err.message || 'Check API setup & console.'}`);
         }
      } finally {
         if (isMounted) {
            setIsLoading(false);
         }
      }
    };

    fetchVoices();

    return () => {
        isMounted = false;
    }
  }, []);

  const handleConvert = async () => {
    setAudioUrl('');
    setError('');
    setIsConversionSuccess(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!text.trim()) {
      setError('Please enter some text to convert.');
      return;
    }
    if (!selectedLanguage || !voiceName) {
      setError('Please select a language and voice.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending to API:', { text, languageCode: selectedLanguage, voiceName, pitch, speakingRate });
      const response = await axios.post('/api/tts', {
        text,
        languageCode: selectedLanguage,
        voiceName,
        pitch,
        speakingRate
      });

      const data = response.data;
      console.log('API Synthesis Response:', data);

      if (!data.audioContent) {
        throw new Error("API response did not contain audio content.");
      }

      const audioBlob = base64ToBlob(data.audioContent, 'audio/mp3');
      if (audioBlob.size === 0) {
        throw new Error("Failed to decode base64 audio content.");
      }
      const audioObjectUrl = URL.createObjectURL(audioBlob);

      setAudioUrl(audioObjectUrl);
      setIsConversionSuccess(true);

      if (audioRef.current) {
        audioRef.current.src = audioObjectUrl;
        audioRef.current.load();
      }

      setTimeout(() => {
        setIsConversionSuccess(false);
      }, 3000);

    } catch (err: any) {
      console.error("Conversion failed:", err);
       const errorMsg = err.response?.data?.error || err.message || 'Please check API logs and configuration.';
      setError(`Conversion failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // == Lifecycle & Helpers (Merged + STT Init) ==

  // Check for SpeechRecognition support on mount
  useEffect(() => {
    setBrowserSupportsSpeechRecognition(!!SpeechRecognition);
  }, []);

  // Cleanup blob URL (keep as is)
  useEffect(() => {
    let currentAudioUrl = audioUrl;
    return () => {
      if (currentAudioUrl && currentAudioUrl.startsWith('blob:')) {
         console.log('Revoking Blob URL:', currentAudioUrl);
         URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [audioUrl]);

  // Update audio player time (keep as is)
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleTimeUpdate = () => { if (!isNaN(audioElement.currentTime)) setCurrentTime(audioElement.currentTime); };
    const handleLoadedMetadata = () => { if (!isNaN(audioElement.duration) && isFinite(audioElement.duration)) setDuration(audioElement.duration); else setDuration(0);};
    const handleEnded = () => { setIsPlaying(false); setCurrentTime(0); };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);

    handleLoadedMetadata(); // Initial check

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Apply volume settings (keep as is)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle theme change (keep as is)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('light', !isDarkMode);
    }
  }, [isDarkMode]);

  // Auto-resize textarea (keep as is)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 6 * 16)}px`;
    }
  }, [text]);

  // Cleanup Speech Recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped on unmount.');
      }
    };
  }, []);

  // == Event Handlers (Merged + STT Handlers) ==

  // Format time (keep as is)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause (keep as is)
  const handlePlayPause = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (audioRef.current.ended || Math.abs(audioRef.current.currentTime - duration) < 0.1) {
            audioRef.current.currentTime = 0;
        }
        audioRef.current.play().catch(err => {
            console.error("Error playing audio:", err);
            setError("Could not play audio. Browser interaction might be needed.");
            setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Mute Toggle (keep as is)
  const handleMuteToggle = () => setIsMuted(!isMuted);

  // Download (keep as is)
  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    const langLabel = selectedLanguage || 'lang';
    const voiceLabel = voiceName.split('-').slice(-2).join('_') || 'voice';
    link.download = `${langLabel}_${voiceLabel}_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Detailed Error Toggle (keep as is)
  const handleShowDetailedError = () => setShowDetailedError(!showDetailedError);

  // Input Changes (keep as is)
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value);
  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const firstVoice = voices.find((voice) => voice.languageCodes?.includes(newLang));
    setVoiceName(firstVoice ? firstVoice.name : '');
  };
  const handleVoiceChange = (e: ChangeEvent<HTMLSelectElement>) => setVoiceName(e.target.value);
  const handlePitchChange = (e: ChangeEvent<HTMLInputElement>) => setPitch(Number(e.target.value));
  const handleRateChange = (e: ChangeEvent<HTMLInputElement>) => setSpeakingRate(Number(e.target.value));
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => setVolume(Number(e.target.value));

  // --- STT Handlers ---
  const handleToggleRecording = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
        setSttError("Speech recognition is not supported by your browser.");
        return;
    }

    if (isRecording) {
        // Stop recording
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            // isRecording state will be set to false in the 'onend' handler
        }
    } else {
        // Start recording
        if (!SpeechRecognition) return; // Guard against TS error

        setSttError(''); // Clear previous STT errors
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        // --- Configuration ---
        recognition.continuous = true; // Keep listening
        recognition.interimResults = true; // Get results as they come
         // Attempt to use the selected TTS language, fallback to browser default or 'en-US'
        recognition.lang = selectedLanguage || navigator.language || 'en-US';
        console.log(`Starting STT with language: ${recognition.lang}`);


        // --- Event Handlers ---
        recognition.onstart = () => {
            console.log('Speech recognition started');
            setIsRecording(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update text state ONLY with the final transcript part
            if (finalTranscript) {
                console.log('Final transcript:', finalTranscript);
                // Append to existing text, adding a space if needed
                setText(prevText => prevText.trim() ? prevText + ' ' + finalTranscript.trim() : finalTranscript.trim());
            }
            // You could optionally display the interimTranscript elsewhere for feedback
             // console.log('Interim transcript:', interimTranscript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error, event.message);
            let message = `Speech recognition error: ${event.error}.`;
            if (event.error === 'not-allowed') {
                message = "Microphone access denied. Please allow microphone permissions in your browser settings.";
            } else if (event.error === 'no-speech') {
                message = "No speech detected. Please try speaking clearly.";
            } else if (event.error === 'network') {
                message = "Network error during speech recognition. Check your connection.";
            } else if (event.error === 'audio-capture') {
                 message = "Could not capture audio. Ensure your microphone is working and selected.";
            }
            setSttError(message);
            setIsRecording(false); // Ensure recording state is reset on error
             recognitionRef.current = null; // Clean up ref on error
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            setIsRecording(false);
            recognitionRef.current = null; // Clean up ref on normal end
        };

        // Start the recognition
        try {
             recognition.start();
        } catch (e) {
             console.error("Error starting speech recognition:", e);
             setSttError("Could not start speech recognition. Ensure microphone is ready.");
             setIsRecording(false);
             recognitionRef.current = null;
        }
    }
}, [isRecording, browserSupportsSpeechRecognition, selectedLanguage]);


  // Filter voices (keep as is)
  const filteredVoices = voices.filter((voice) =>
    voice.languageCodes?.includes(selectedLanguage)
  );

  // Get language label (keep as is)
  const getLanguageLabel = (code: string): string => {
     try {
        // Use Intl.DisplayNames for better language names if available
        const display = new Intl.DisplayNames(['en'], { type: 'language' });
        // Get the base language code (e.g., 'en' from 'en-US')
        const baseCode = code.split('-')[0];
        return display.of(baseCode) || code; // Fallback to the original code
     } catch (e) {
        return code; // Fallback if Intl.DisplayNames fails
     }
  };

  // == JSX Rendering ==
  return (
    <>

    <InternalNavbar />
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900 text-white' : 'light bg-gradient-to-br from-indigo-300 via-purple-100 to-blue-50'}`}>
     

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 mt-16">
        <motion.div
          className="w-full max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white bg-opacity-90 backdrop-blur-lg border border-gray-200'} shadow-xl`}>

            {/* Left Panel - Controls */}
            <div className={`lg:col-span-2 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white bg-opacity-80'}`}>
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Text Input Area */}
                <div className="space-y-1 relative"> {/* Added relative positioning */}
                  <div className="flex justify-between items-center mb-1">
                     <label htmlFor="text" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                       Text to Convert
                     </label>
                     {/* --- Microphone Button --- */}
                     {browserSupportsSpeechRecognition ? (
                        <motion.button
                           onClick={handleToggleRecording}
                           className={`p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${ isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white' }
                           ${isRecording
                              ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400'
                              : isDarkMode
                                ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 focus:ring-indigo-400'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-600 focus:ring-indigo-500'
                           }`}
                           title={isRecording ? "Stop Recording" : "Start Recording"}
                           aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                        >
                           {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </motion.button>
                     ) : (
                         <div className="flex items-center space-x-1 text-xs text-gray-500" title="Speech recognition not available in this browser">
                             <AlertCircle className="w-3 h-3"/> <span>Mic Off</span>
                         </div>
                     )}
                  </div>
                  <textarea
                    id="text"
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    rows={6} // Initial rows
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'} rounded-md resize-y p-3 overflow-y-hidden`}
                    placeholder={isRecording ? "Listening..." : "Type, paste, or use the mic..."}
                    disabled={isRecording} // Optionally disable typing while recording
                  />
                  {/* Character count & Clear button */}
                  <div className="flex justify-between items-center mt-1">
                     <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {text.length === 0 ? 'Enter text or start recording' : `${text.length} characters`}
                     </p>
                     {text.length > 0 && !isRecording && (
                        <motion.button
                          className={`text-xs ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                          onClick={() => setText('')} whileTap={{ scale: 0.95 }}
                        > Clear text </motion.button>
                      )}
                  </div>
                   {/* STT Status/Error Message */}
                    {isRecording && (
                        <p className="text-xs text-center text-blue-500 mt-1 animate-pulse">Listening...</p>
                    )}
                    <AnimatePresence>
                     {sttError && (
                        <motion.div
                           className={`flex items-center ${isDarkMode ? 'bg-yellow-900 border-yellow-700 text-yellow-300' : 'bg-yellow-100 border border-yellow-300 text-yellow-800'} p-2 rounded-md space-x-2 text-xs mt-2`}
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           transition={{ duration: 0.3 }}
                        >
                           <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
                           <span>{sttError}</span>
                           <button onClick={() => setSttError('')} className="ml-auto text-inherit opacity-70 hover:opacity-100"> <X className="w-3 h-3" /> </button>
                        </motion.div>
                     )}
                    </AnimatePresence>
                </div>

                 {/* TTS Success Message */}
                 <AnimatePresence>
                    {isConversionSuccess && (
                        <motion.div
                           className={`flex items-center ${isDarkMode ? 'bg-green-900 border-green-700 text-green-300' : 'bg-green-100 border border-green-300 text-green-800'} p-3 rounded-lg space-x-3 text-sm`}
                           initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                           animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
                           exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                           transition={{ duration: 0.3 }}
                        >
                           <Check className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'} flex-shrink-0`} />
                           <span>Speech successfully generated!</span>
                        </motion.div>
                    )}
                 </AnimatePresence>

                {/* TTS Error Handling */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className={`flex items-start ${isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-100 border border-red-300 text-red-800'} p-3 rounded-lg space-x-3 text-sm`}
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0 mt-0.5`} />
                      <div className="flex flex-col flex-grow"> <p className="flex-grow">{error}</p> </div>
                      <motion.button
                         className={`ml-auto ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} flex-shrink-0`}
                         whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                         onClick={() => { setError(''); setShowDetailedError(false); }}
                         aria-label="Close error message"
                      > <X className="w-4 h-4" /> </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Language and Voice Selection (Disable during STT recording too) */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="language" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}> Language </label>
                    <select
                      id="language" value={selectedLanguage} onChange={handleLanguageChange}
                      disabled={isLoading || languages.length === 0 || isRecording} // Disable while recording
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500'
                                   : 'border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500'
                        } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:cursor-not-allowed`}
                    >
                      {/* Options remain the same */}
                       {languages.length === 0 && !error && <option disabled>Loading languages...</option>}
                      {languages.length === 0 && error && <option disabled>Failed to load</option>}
                      {languages.map((code) => ( <option key={code} value={code}> {getLanguageLabel(code)} ({code}) </option> ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="voice" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}> Voice </label>
                    <select
                      id="voice" value={voiceName} onChange={handleVoiceChange}
                      disabled={isLoading || !selectedLanguage || filteredVoices.length === 0 || isRecording} // Disable while recording
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${
                         isDarkMode ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500'
                                    : 'border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500'
                         } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:cursor-not-allowed`}
                    >
                      {/* Options remain the same */}
                      <option value="">Select voice</option>
                      {filteredVoices.length === 0 && selectedLanguage && <option disabled>No voices for {selectedLanguage}</option>}
                      {filteredVoices.length === 0 && !selectedLanguage && <option disabled>Select language first</option>}
                      {filteredVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name.split('-').slice(2).join('-')}
                          {voice.ssmlGender ? ` (${voice.ssmlGender.toLowerCase()})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Settings Toggle & Panel (Disable sliders during STT recording) */}
                <div className="pt-2">
                    <button type="button"
                        className={`${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium text-sm flex items-center space-x-1.5 group disabled:opacity-50 disabled:cursor-not-allowed`}
                        onClick={() => setShowAdvanced(!showAdvanced)} aria-expanded={showAdvanced}
                        disabled={isRecording} // Disable toggle when recording
                    >
                        <Settings className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span>Advanced Settings</span>
                        {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                </div>
                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                           className={`space-y-4 border rounded-lg p-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} ${isRecording ? 'opacity-50 pointer-events-none' : ''}`} // Fade out and disable interaction when recording
                           initial={{ height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                           animate={{ height: 'auto', opacity: isRecording ? 0.5 : 1, marginTop: '0.5rem', paddingTop: '1rem', paddingBottom: '1rem' }}
                           exit={{ height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                           transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {/* Pitch */}
                            <div className="grid grid-cols-6 items-center gap-2">
                                <label htmlFor="pitch" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}> Pitch </label>
                                <input type="range" id="pitch" min="-20" max="20" step="1" value={pitch} onChange={handlePitchChange}
                                    className={`w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4`}
                                    aria-valuetext={`${pitch}`} disabled={isLoading || isRecording} // Disable during loading/recording
                                />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-right col-span-1 w-10`}>{pitch.toFixed(0)}</span>
                            </div>
                            {/* Speaking Rate */}
                            <div className="grid grid-cols-6 items-center gap-2">
                                <label htmlFor="speakingRate" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}> Rate </label>
                                <input type="range" id="speakingRate" min="0.25" max="4.0" step="0.05" value={speakingRate} onChange={handleRateChange}
                                    className={`w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4`}
                                    aria-valuetext={`${speakingRate.toFixed(2)}x`} disabled={isLoading || isRecording} // Disable during loading/recording
                                />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-right col-span-1 w-10`}>{speakingRate.toFixed(2)}x</span>
                            </div>
                            {/* Volume Control (Playback) */}
                            <div className="grid grid-cols-6 items-center gap-2">
                                <label htmlFor="volume" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}> Volume </label>
                                <input type="range" id="volume" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} disabled={isMuted || isRecording} // Disable if muted or recording
                                    className={`w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4 ${isMuted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                <button onClick={handleMuteToggle}
                                    className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} col-span-1 w-10 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed`}
                                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                                    disabled={isRecording} // Disable mute toggle when recording
                                > {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />} </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Convert Button (Disable during STT recording) */}
                <motion.button
                  className={`w-full font-bold py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${ isDarkMode ? 'focus:ring-offset-gray-800 focus:ring-indigo-400' : 'focus:ring-offset-white focus:ring-indigo-500' } flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isLoading
                      ? isDarkMode ? 'bg-indigo-800 text-gray-400' : 'bg-indigo-300 text-gray-50'
                      : isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  onClick={handleConvert}
                  disabled={isLoading || !text.trim() || !voiceName || !selectedLanguage || isRecording} // Also disable while recording
                  whileHover={!isLoading && !isRecording && text.trim() && voiceName && selectedLanguage ? { scale: 1.03, boxShadow: "0px 5px 15px rgba(99, 102, 241, 0.4)" } : {}}
                  whileTap={!isLoading && !isRecording && text.trim() && voiceName && selectedLanguage ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {isLoading ? (
                    <> <Loader2 className="animate-spin w-5 h-5" /> <span>Processing...</span> </>
                  ) : (
                    <> <Sparkles className="w-5 h-5" /> <span>Convert to Speech</span> </>
                  )}
                </motion.button>
              </motion.div>
            </div>

            {/* Right Panel - Visualization & Player (Keep as is) */}
             <div className={`lg:col-span-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-600 to-purple-600'} p-6 text-white`}>
               <motion.div className="h-full flex flex-col" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-xl font-bold">Audio Output</h2>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5 ${audioUrl ? 'bg-green-500 text-white' : (isLoading && !error ? 'bg-yellow-500 text-black' : 'bg-gray-500 text-white')}`}>
                       <span>{isLoading ? 'Processing' : (audioUrl ? 'Ready' : 'Idle')}</span>
                    </div>
                 </div>
                 <div className="flex-grow flex items-center justify-center mb-6 min-h-[200px]">
                    {audioUrl ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="w-full h-32 md:h-40 mb-4 relative overflow-hidden">
                                <motion.div className="absolute inset-0 flex items-end justify-around space-x-px" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                {[...Array(60)].map((_, i) => (
                                    <motion.div key={i}
                                        className={`bg-white ${isDarkMode ? 'bg-opacity-70' : 'bg-opacity-80'} w-1 rounded-t-full`}
                                        initial={{ height: '2%' }}
                                        animate={{ height: isPlaying ? `${Math.max(2, Math.random() * 80 + 10)}%` : `${Math.max(2, Math.sin(i * 0.2 + currentTime * 3) * 30 + 40)}%` }}
                                        transition={{ duration: isPlaying ? 0.1 : 0.4, ease: isPlaying ? "easeOut" : "easeInOut", delay: isPlaying ? Math.random() * 0.05 : 0 }}
                                    /> ))}
                                </motion.div>
                            </div>
                            <div className="w-full h-2 bg-white bg-opacity-20 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                                if (audioRef.current && duration > 0) {
                                    const rect = e.currentTarget.getBoundingClientRect(); const clickX = e.clientX - rect.left; const percentage = clickX / rect.width;
                                    audioRef.current.currentTime = duration * percentage; setCurrentTime(duration * percentage);
                                } }}>
                                <motion.div className="h-full bg-white" initial={{ width: '0%'}} animate={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} transition={{ duration: 0.1, ease: "linear" }} />
                            </div>
                        </div>
                        ) : (
                        <div className="text-center py-10">
                           <motion.div className="inline-block mb-4 p-4 rounded-full bg-white bg-opacity-10" animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                              <AudioWaveform className="w-12 h-12 text-white opacity-75" />
                           </motion.div>
                           <p className={`text-white ${isDarkMode ? 'text-opacity-70' : 'text-opacity-80'} max-w-md mx-auto`}>
                              {isLoading ? 'Generating audio...' : 'Your synthesized audio will appear here.'}
                           </p>
                        </div>
                        )}
                    </div>
                 <AnimatePresence>
                    {audioUrl && (
                        <motion.div
                            className={`rounded-xl ${isDarkMode ? 'bg-white bg-opacity-10' : 'bg-black bg-opacity-10'} p-5`}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" key={audioUrl} />
                            <div className="flex flex-col space-y-4">
                                <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-100'} font-mono`}>
                                <span>{formatTime(currentTime)}</span> <span>{formatTime(duration)}</span>
                                </div>
                                <div className="flex items-center justify-center space-x-6">
                                    <motion.button
                                        className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:text-white bg-white bg-opacity-10 hover:bg-opacity-20' : 'text-gray-200 hover:text-white bg-black bg-opacity-10 hover:bg-opacity-20'} focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
                                        onClick={handleMuteToggle} aria-label={isMuted ? 'Unmute' : 'Mute'} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    > {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />} </motion.button>
                                    <motion.button
                                        className={`p-4 rounded-full ${isDarkMode ? 'bg-white text-indigo-700 hover:bg-gray-200' : 'bg-white text-indigo-700 hover:bg-gray-200'} focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 shadow-lg`}
                                        onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    > {isPlaying ? <Pause className="w-6 h-6" fill="currentColor"/> : <Play className="w-6 h-6 ml-1" fill="currentColor"/>} </motion.button>
                                    <motion.button
                                        className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:text-white bg-white bg-opacity-10 hover:bg-opacity-20' : 'text-gray-200 hover:text-white bg-black bg-opacity-10 hover:bg-opacity-20'} focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
                                        onClick={handleDownload} aria-label="Download Audio" title="Download MP3" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    > <Download className="w-5 h-5" /> </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                 </AnimatePresence>
                 <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div className={`${isDarkMode ? 'bg-white bg-opacity-5' : 'bg-black bg-opacity-5'} p-4 rounded-lg`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                       <h3 className={`${isDarkMode ? 'text-gray-200' : 'text-white'} text-sm font-semibold mb-2`}>Available Voices</h3>
                       <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-200'} text-xs`}>
                          {selectedLanguage ? `${filteredVoices.length} voice${filteredVoices.length !== 1 ? 's' : ''} for ${getLanguageLabel(selectedLanguage)}` : (languages.length > 0 ? 'Select a language' : (isLoading ? 'Loading...' : 'No voices found'))}
                       </p>
                    </motion.div>
                    <motion.div className={`${isDarkMode ? 'bg-white bg-opacity-5' : 'bg-black bg-opacity-5'} p-4 rounded-lg`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                       <h3 className={`${isDarkMode ? 'text-gray-200' : 'text-white'} text-sm font-semibold mb-2`}>Usage Limits</h3>
                       <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-200'} text-xs`}> Character limits may apply per request. Check your API provider documentation. </p>
                    </motion.div>
                 </div>
               </motion.div>
            </div>

          </div> {/* End Main Grid */}
        </motion.div> {/* End Centered Container */}
      </main>

      {/* Footer (keep as is) */}
       <footer className={`py-4 px-6 text-center text-sm ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white bg-opacity-70 text-gray-600'}`}>
        <div className="container mx-auto">
          <p>Voice Synthesizer Pro • Powered by Your TTS API & Browser Speech Recognition</p>
        </div>
      </footer>
    </div>
    </>
  );
};

export default VoiceSynthesizer;