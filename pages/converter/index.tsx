import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
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
  Cpu // Keep Cpu if you want the placeholder button
} from 'lucide-react';
import Link from 'next/link';

// Define interfaces for language and voice data structures (using the one from Converter)
interface Voice {
  name: string;
  languageCodes: string[];
  ssmlGender?: string; // Optional as seen in Converter's usage
  naturalSampleRateHertz?: number;
}

// Define Language with label for better display (from VoiceSynthesizer)
interface LanguageDisplay {
  code: string;
  label: string; // We might need to generate this or fetch it if API doesn't provide
}


// --- Helper function to convert base64 to Blob (from Converter) ---
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
    // Return an empty blob or throw error, depending on desired handling
    return new Blob([], { type: mimeType });
  }
};

const VoiceSynthesizer: React.FC = () => {
  // == State Management (Merged) ==
  const [text, setText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [voiceName, setVoiceName] = useState<string>('');
  const [pitch, setPitch] = useState<number>(0);
  const [speakingRate, setSpeakingRate] = useState<number>(1);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Handles both voice loading and conversion loading
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showDetailedError, setShowDetailedError] = useState<boolean>(false);
  const [isConversionSuccess, setIsConversionSuccess] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1); // Kept from VoiceSynthesizer design
  const [isMuted, setIsMuted] = useState<boolean>(false); // Kept from VoiceSynthesizer design
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Kept from VoiceSynthesizer design

  // State for API data (from Converter)
  const [voices, setVoices] = useState<Voice[]>([]);
  const [languages, setLanguages] = useState<string[]>([]); // List of language codes

  // Refs (from VoiceSynthesizer)
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  // == API Calls & Data Handling (from Converter, adapted) ==

  // Fetch available voices on component mount
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const fetchVoices = async () => {
      setIsLoading(true);
      setError(''); // Clear previous errors
      try {
        const response = await axios.get('/api/tts'); // Assuming GET fetches voices
        console.log('API Voices Response:', response);

        if (!isMounted) return; // Exit if component unmounted

        const data = response.data;
        const voiceList: Voice[] = data.voices || [];

        if (!Array.isArray(voiceList)) {
            throw new Error("Invalid voice list format received from API.");
        }

        // Extract supported languages
        const languageCodes = voiceList
          .flatMap(voice => voice.languageCodes || []) // Use flatMap and handle missing languageCodes
          .filter((code): code is string => typeof code === 'string' && code.length > 0);

        const languageSet = new Set(languageCodes);
        const sortedLanguages = Array.from(languageSet).sort();

        setLanguages(sortedLanguages);
        setVoices(voiceList);

        // Set default language and voice more robustly
        if (sortedLanguages.length > 0) {
          // Try finding a common default like 'en-US' or the first language
          let defaultLanguage = sortedLanguages.includes('en-US') ? 'en-US' : sortedLanguages[0];
          setSelectedLanguage(defaultLanguage);

          const defaultVoicesForLang = voiceList.filter(
            (voice) => voice.languageCodes?.includes(defaultLanguage)
          );

          // Prefer a 'Standard' or 'Neural' voice if available, otherwise the first one
          let defaultVoice = defaultVoicesForLang.find(v => v.name.includes('Standard'))
                            || defaultVoicesForLang.find(v => v.name.includes('Neural'))
                            || defaultVoicesForLang[0];

          if (defaultVoice) {
            setVoiceName(defaultVoice.name);
          } else if (voiceList.length > 0) {
             // Fallback if no voice found for default language (shouldn't happen if logic above is sound)
             setVoiceName(voiceList[0].name);
             if(voiceList[0].languageCodes?.length > 0) {
                setSelectedLanguage(voiceList[0].languageCodes[0]);
             }
          }
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
        isMounted = false; // Cleanup function to set flag
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle text conversion (using logic from Converter)
  const handleConvert = async () => {
    // Reset previous states
    setAudioUrl(''); // This will trigger the cleanup useEffect for the old URL
    setError('');
    setIsConversionSuccess(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Validate input
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
      const response = await axios.post('/api/tts', { // Assuming POST synthesizes
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

      // Create a blob from the base64 audio content
      const audioBlob = base64ToBlob(data.audioContent, 'audio/mp3');
      if (audioBlob.size === 0) {
        throw new Error("Failed to decode base64 audio content.");
      }
      const audioObjectUrl = URL.createObjectURL(audioBlob);

      setAudioUrl(audioObjectUrl);
      setIsConversionSuccess(true);

      // Preload metadata for the new audio
      if (audioRef.current) {
        audioRef.current.src = audioObjectUrl; // Set src directly
        audioRef.current.load();
      }

      // Auto-hide success message
      setTimeout(() => {
        setIsConversionSuccess(false);
      }, 3000);

    } catch (err: any) {
      console.error("Conversion failed:", err);
       const errorMsg = err.response?.data?.error || err.message || 'Please check API logs and configuration.';
      setError(`Conversion failed: ${errorMsg}`);
      // Consider setting showDetailedError based on error type?
    } finally {
      setIsLoading(false);
    }
  };

  // == Lifecycle & Helpers (Merged) ==

  // Clean up blob URL (from Converter)
  useEffect(() => {
    let currentAudioUrl = audioUrl; // Capture the URL in the effect closure
    return () => {
      if (currentAudioUrl && currentAudioUrl.startsWith('blob:')) {
         console.log('Revoking Blob URL:', currentAudioUrl);
         URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [audioUrl]); // Dependency: run cleanup when audioUrl *changes*

  // Update audio player time (like in VoiceSynthesizer)
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleTimeUpdate = () => {
      if (!isNaN(audioElement.currentTime)) { // Check for NaN
        setCurrentTime(audioElement.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(audioElement.duration) && isFinite(audioElement.duration)) { // Check for NaN/Infinity
        setDuration(audioElement.duration);
      } else {
        setDuration(0); // Reset if duration is invalid
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0); // Reset time on end
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);

    // Initial metadata load check in case 'loadedmetadata' fired before effect
    handleLoadedMetadata();

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]); // Rerun when audioUrl changes

  // Apply volume settings (from VoiceSynthesizer)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle theme change (from VoiceSynthesizer)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('light', !isDarkMode);
    }
  }, [isDarkMode]);

  // Auto-resize textarea (from VoiceSynthesizer)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 6 * 16)}px`; // Use scrollHeight, ensure min height approx 6 rows
    }
  }, [text]);


  // == Event Handlers (Merged & Adapted) ==

  // Format time (like in Converter, but ensure safety)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause (like in Converter, adapted for VoiceSynthesizer structure)
  const handlePlayPause = () => {
    if (audioRef.current && audioUrl) { // Check for audioUrl too
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Ensure audio starts from beginning if it ended
        if (audioRef.current.ended || Math.abs(audioRef.current.currentTime - duration) < 0.1) {
            audioRef.current.currentTime = 0;
        }
        audioRef.current.play().catch(err => {
            console.error("Error playing audio:", err);
            setError("Could not play audio. Browser interaction might be needed.");
            setIsPlaying(false); // Reset state if play fails
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Mute Toggle (from VoiceSynthesizer)
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  // Download (like in Converter, adapted)
  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    // Generate filename (similar to VoiceSynthesizer's attempt)
    const langLabel = selectedLanguage || 'lang';
    const voiceLabel = voiceName.split('-').slice(-2).join('_') || 'voice';
    link.download = `${langLabel}_${voiceLabel}_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Detailed Error Toggle (like in VoiceSynthesizer)
  const handleShowDetailedError = () => {
    setShowDetailedError(!showDetailedError);
  };

  // Input Changes (Standard React handlers)
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // Reset voice selection when language changes
    const firstVoice = voices.find(
      (voice) => voice.languageCodes?.includes(newLang) // Safe access
    );
    setVoiceName(firstVoice ? firstVoice.name : '');
  };

  const handleVoiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setVoiceName(e.target.value);
  };

  const handlePitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPitch(Number(e.target.value));
  };

  const handleRateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSpeakingRate(Number(e.target.value));
  };

   const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  // Filter voices based on selected language (like in Converter)
  const filteredVoices = voices.filter((voice) =>
    voice.languageCodes?.includes(selectedLanguage) // Safe access
  );

  // Function to get display label for language code (simple version)
  // You might replace this with a more sophisticated lookup if needed
  const getLanguageLabel = (code: string): string => {
     try {
        const display = new Intl.DisplayNames(['en'], { type: 'language' });
        return display.of(code.split('-')[0]) || code; // Get base language name
     } catch (e) {
        return code; // Fallback to code if Intl fails
     }
  };

   return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900 text-white' : 'light bg-gradient-to-br from-indigo-300 via-purple-100 to-blue-50'}`}>
      {/* Header Bar */}
      <header className={`fixed top-0 left-0 right-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white bg-opacity-80 backdrop-blur-md'} shadow-md`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
         

            <motion.div
              className={`rounded-full ${isDarkMode ? 'bg-indigo-700' : 'bg-indigo-600'} p-2`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <AudioWaveform className="text-white w-5 h-5" />
            </motion.div>

              <h1 className="text-xl font-bold">Voice Synthesizer Pro</h1>
 
          </div>

          <div className="flex items-center space-x-4">
            <Link href={'/'}>
                  <h1 className="text-xl font-bold">Home</h1>
            </Link>

            <motion.button
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
               {isDarkMode ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /> </svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /> </svg>
              )}
            </motion.button>
          </div>
          
        </div>
      </header>

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
                {/* Text Input */}
                <div className="space-y-1">
                  <label htmlFor="text" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Text to Convert
                  </label>
                  <textarea
                    id="text"
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    rows={6} // Initial rows, will resize
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'} rounded-md resize-y p-3 overflow-y-hidden`} // resize-y and overflow-hidden for auto-resize
                    placeholder="Type or paste your text here..."
                  />
                  <div className="flex justify-between items-center">
                     <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {text.length === 0 ? 'Enter some text' : `${text.length} characters`}
                     </p>
                     {text.length > 0 && (
                        <motion.button
                          className={`text-xs ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                          onClick={() => setText('')} whileTap={{ scale: 0.95 }}
                        > Clear text </motion.button>
                      )}
                  </div>
                </div>

                 {/* Success Message */}
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

                {/* Error Handling */}
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
                      <div className="flex flex-col flex-grow">
                        {/* Using simplified error display */}
                        <p className="flex-grow">{error}</p>
                        {/* You can add the show/hide detailed error logic back here if needed */}
                        {/* {showDetailedError ? (...) : (...)} */}
                      </div>
                      <motion.button
                         className={`ml-auto ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} flex-shrink-0`}
                         whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                         onClick={() => { setError(''); setShowDetailedError(false); }}
                         aria-label="Close error message"
                      > <X className="w-4 h-4" /> </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Language and Voice Selection */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Language Dropdown */}
                  <div>
                    <label htmlFor="language" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}> Language </label>
                    <select
                      id="language" value={selectedLanguage} onChange={handleLanguageChange}
                      // Disable while loading voices OR during conversion
                      disabled={isLoading || languages.length === 0}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500'
                                   : 'border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500'
                        } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:cursor-not-allowed`}
                    >
                      {languages.length === 0 && !error && <option disabled>Loading languages...</option>}
                      {languages.length === 0 && error && <option disabled>Failed to load</option>}
                      {languages.map((code) => (
                        <option key={code} value={code}>
                          {getLanguageLabel(code)} ({code}) {/* Display friendly name + code */}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Voice Dropdown */}
                  <div>
                    <label htmlFor="voice" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}> Voice </label>
                    <select
                      id="voice" value={voiceName} onChange={handleVoiceChange}
                      // Disable if loading, no language selected, or no voices for language
                      disabled={isLoading || !selectedLanguage || filteredVoices.length === 0}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${
                         isDarkMode ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500'
                                    : 'border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500'
                         } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:cursor-not-allowed`}
                    >
                      <option value="">Select voice</option>
                      {filteredVoices.length === 0 && selectedLanguage && <option disabled>No voices for {selectedLanguage}</option>}
                      {filteredVoices.length === 0 && !selectedLanguage && <option disabled>Select language first</option>}
                      {filteredVoices.map((voice) => (
                        // Display voice name details (similar to Converter)
                        <option key={voice.name} value={voice.name}>
                          {voice.name.split('-').slice(2).join('-')} {/* Nicer name */}
                          {voice.ssmlGender ? ` (${voice.ssmlGender.toLowerCase()})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <div className="pt-2">
                    <button type="button"
                        className={`${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium text-sm flex items-center space-x-1.5 group`}
                        onClick={() => setShowAdvanced(!showAdvanced)} aria-expanded={showAdvanced}
                    >
                        <Settings className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span>Advanced Settings</span>
                        {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                </div>

                {/* Advanced Settings Panel */}
                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                        className={`space-y-4 border rounded-lg p-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        initial={{ height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem', paddingTop: '1rem', paddingBottom: '1rem' }}
                        exit={{ height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {/* Pitch */}
                            <div className="grid grid-cols-6 items-center gap-2">
                                <label htmlFor="pitch" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}> Pitch </label>
                                <input type="range" id="pitch" min="-20" max="20" step="1" value={pitch} onChange={handlePitchChange}
                                    className={`w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4`}
                                    aria-valuetext={`${pitch}`} disabled={isLoading} // Disable during loading
                                />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-right col-span-1 w-10`}>{pitch.toFixed(0)}</span>
                            </div>
                            {/* Speaking Rate */}
                            <div className="grid grid-cols-6 items-center gap-2">
                                <label htmlFor="speakingRate" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}> Rate </label>
                                <input type="range" id="speakingRate" min="0.25" max="4.0" step="0.05" value={speakingRate} onChange={handleRateChange}
                                    className={`w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4`}
                                    aria-valuetext={`${speakingRate.toFixed(2)}x`} disabled={isLoading} // Disable during loading
                                />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-right col-span-1 w-10`}>{speakingRate.toFixed(2)}x</span>
                            </div>
                            {/* Volume Control (Playback) */}
                            <div className="grid grid-cols-6 items-center gap-2">
                                <label htmlFor="volume" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}> Volume </label>
                                <input type="range" id="volume" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} disabled={isMuted}
                                    className={`w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4 ${isMuted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                <button onClick={handleMuteToggle}
                                    className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} col-span-1 w-10 flex justify-center items-center`}
                                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                                > {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />} </button>
                            </div>
                             {/* Model Quality Placeholder */}
                            {/* <div className="grid grid-cols-6 items-center gap-2"> ... </div> */}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Convert Button */}
                <motion.button
                  className={`w-full font-bold py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${ isDarkMode ? 'focus:ring-offset-gray-800 focus:ring-indigo-400' : 'focus:ring-offset-white focus:ring-indigo-500' } flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isLoading
                      ? isDarkMode ? 'bg-indigo-800 text-gray-400' : 'bg-indigo-300 text-gray-50'
                      : isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  onClick={handleConvert}
                  // Disable if loading, or inputs are invalid
                  disabled={isLoading || !text.trim() || !voiceName || !selectedLanguage}
                  whileHover={!isLoading && text.trim() && voiceName && selectedLanguage ? { scale: 1.03, boxShadow: "0px 5px 15px rgba(99, 102, 241, 0.4)" } : {}}
                  whileTap={!isLoading && text.trim() && voiceName && selectedLanguage ? { scale: 0.98 } : {}}
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

            {/* Right Panel - Visualization & Player */}
            <div className={`lg:col-span-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-600 to-purple-600'} p-6 text-white`}>
               <motion.div className="h-full flex flex-col" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                 {/* Header */}
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-xl font-bold">Audio Output</h2>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5 ${audioUrl ? 'bg-green-500 text-white' : (isLoading && !error ? 'bg-yellow-500 text-black' : 'bg-gray-500 text-white')}`}>
                       <span>{isLoading ? 'Processing' : (audioUrl ? 'Ready' : 'Idle')}</span>
                    </div>
                 </div>
                 {/* Visualization Area */}
                 <div className="flex-grow flex items-center justify-center mb-6 min-h-[200px]">
                    {audioUrl ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            {/* Waveform */}
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
                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-white bg-opacity-20 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                                if (audioRef.current && duration > 0) {
                                    const rect = e.currentTarget.getBoundingClientRect(); const clickX = e.clientX - rect.left; const percentage = clickX / rect.width;
                                    audioRef.current.currentTime = duration * percentage; setCurrentTime(duration * percentage);
                                } }}>
                                <motion.div className="h-full bg-white" initial={{ width: '0%'}} animate={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} transition={{ duration: 0.1, ease: "linear" }} />
                            </div>
                        </div>
                        ) : ( /* Idle/Loading State */
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

                 {/* Audio Player Controls */}
                 <AnimatePresence>
                    {audioUrl && (
                        <motion.div
                            className={`rounded-xl ${isDarkMode ? 'bg-white bg-opacity-10' : 'bg-black bg-opacity-10'} p-5`}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" key={audioUrl} />
                            <div className="flex flex-col space-y-4">
                                {/* Time display */}
                                <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-100'} font-mono`}>
                                <span>{formatTime(currentTime)}</span> <span>{formatTime(duration)}</span>
                                </div>
                                {/* Control buttons */}
                                <div className="flex items-center justify-center space-x-6">
                                    {/* Mute */}
                                    <motion.button
                                        className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:text-white bg-white bg-opacity-10 hover:bg-opacity-20' : 'text-gray-200 hover:text-white bg-black bg-opacity-10 hover:bg-opacity-20'} focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
                                        onClick={handleMuteToggle} aria-label={isMuted ? 'Unmute' : 'Mute'} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    > {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />} </motion.button>
                                    {/* Play/Pause */}
                                    <motion.button
                                        className={`p-4 rounded-full ${isDarkMode ? 'bg-white text-indigo-700 hover:bg-gray-200' : 'bg-white text-indigo-700 hover:bg-gray-200'} focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 shadow-lg`}
                                        onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    > {isPlaying ? <Pause className="w-6 h-6" fill="currentColor"/> : <Play className="w-6 h-6 ml-1" fill="currentColor"/>} </motion.button>
                                    {/* Download */}
                                    <motion.button
                                        className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:text-white bg-white bg-opacity-10 hover:bg-opacity-20' : 'text-gray-200 hover:text-white bg-black bg-opacity-10 hover:bg-opacity-20'} focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
                                        onClick={handleDownload} aria-label="Download Audio" title="Download MP3" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    > <Download className="w-5 h-5" /> </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                 </AnimatePresence>

                 {/* Info cards */}
                 <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {/* Voices Info */}
                    <motion.div className={`${isDarkMode ? 'bg-white bg-opacity-5' : 'bg-black bg-opacity-5'} p-4 rounded-lg`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                       <h3 className={`${isDarkMode ? 'text-gray-200' : 'text-white'} text-sm font-semibold mb-2`}>Available Voices</h3>
                       <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-200'} text-xs`}>
                          {selectedLanguage ? `${filteredVoices.length} voice${filteredVoices.length !== 1 ? 's' : ''} for ${getLanguageLabel(selectedLanguage)}` : (languages.length > 0 ? 'Select a language' : (isLoading ? 'Loading...' : 'No voices found'))}
                       </p>
                    </motion.div>
                    {/* Character Limits Info (Placeholder) */}
                    <motion.div className={`${isDarkMode ? 'bg-white bg-opacity-5' : 'bg-black bg-opacity-5'} p-4 rounded-lg`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                       <h3 className={`${isDarkMode ? 'text-gray-200' : 'text-white'} text-sm font-semibold mb-2`}>Usage Limits</h3>
                       <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-200'} text-xs`}> Character limits may apply per request. Check your API provider documentation. </p>
                    </motion.div>
                 </div>
               </motion.div>
            </div> {/* End Right Panel */}

          </div> {/* End Main Grid */}
        </motion.div> {/* End Centered Container */}
      </main>

      {/* Footer */}
      <footer className={`py-4 px-6 text-center text-sm ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white bg-opacity-70 text-gray-600'}`}>
        <div className="container mx-auto">
          <p>Voice Synthesizer Pro • Powered by Your TTS API</p>
        </div>
      </footer>
    </div>
  );
};

export default VoiceSynthesizer;