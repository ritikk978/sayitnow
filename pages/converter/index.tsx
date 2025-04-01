import React, { useState, useRef, useEffect, ChangeEvent, useCallback } from 'react';
import axios from 'axios';
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
    Mic, // Icon for starting recording
    MicOff, // Icon for stopping recording or indicating recording state
    AlertCircle, // Icon for STT not supported
} from 'lucide-react';
import Link from 'next/link'; // Keep if used elsewhere, otherwise remove if not needed
import InternalNavbar from '@/component/internalNavbar'; // Assuming this path is correct

// --- Interfaces ---
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
    readonly length: number;
    readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    readonly [index: number]: SpeechRecognitionAlternative;
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

// --- Helper function (Improved Error Handling) ---
const base64ToBlob = (base64: string, mimeType: string): Blob => {
    try {
        const byteCharacters = atob(base64); // Decode base64 - can throw error if invalid
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i); // Assign directly
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    } catch (e) {
        console.error("Error decoding base64 string:", e, "Input length:", base64.length);
        throw new Error(`Failed to decode base64 audio data. ${e instanceof Error ? e.message : String(e)}`);
    }
};

// --- Check for SpeechRecognition API ---
const SpeechRecognition =
    typeof window !== 'undefined'
        ? window.SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

const textEncoder = new TextEncoder(); // Keep outside

const VoiceSynthesizer: React.FC = () => {
    // == State Management ==
    const [text, setText] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [voiceName, setVoiceName] = useState<string>('');
    const [pitch, setPitch] = useState<number>(0);
    const [speakingRate, setSpeakingRate] = useState<number>(1);
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false); // Main TTS loading state
    const [ttsStatusMessage, setTtsStatusMessage] = useState<string>(''); // Detailed status
    const [audioUrl, setAudioUrl] = useState<string>(''); // Object URL for playback
    const [error, setError] = useState<string>(''); // TTS error
    const [isConversionSuccess, setIsConversionSuccess] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [volume, setVolume] = useState<number>(1);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Consider global state management
    const [voices, setVoices] = useState<Voice[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [combinedAudioBlob, setCombinedAudioBlob] = useState<Blob | null>(null); // For download

    // -- STT State --
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [sttError, setSttError] = useState<string>('');
    const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState<boolean>(false);

    // == Refs ==
    const audioRef = useRef<HTMLAudioElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null); // Use 'any' or specific type if available
    const previousAudioUrlRef = useRef<string | null>(null); // Ref to track the *previous* blob URL for revocation

    // == API Calls & Data Handling ==

    // Fetch Voices on Mount
    useEffect(() => {
        let isMounted = true;
        const fetchVoices = async () => {
            setError('');
            try {
                console.log('Fetching voices from /api/tts...');
                const response = await axios.get('/api/tts');
                console.log('API Voices Response:', response);

                if (!isMounted) return;

                const data = response.data;
                const voiceList: Voice[] = data && Array.isArray(data.voices) ? data.voices : [];

                if (voiceList.length === 0) {
                    console.warn("API did not return a 'voices' array or it was empty.");
                }

                const languageCodes = voiceList
                    .flatMap(voice => voice.languageCodes || [])
                    .filter((code): code is string => typeof code === 'string' && code.length > 0);

                const languageSet = new Set(languageCodes);
                const sortedLanguages = Array.from(languageSet).sort();

                setLanguages(sortedLanguages);
                setVoices(voiceList);

                // Set Defaults
                if (sortedLanguages.length > 0) {
                    let defaultLanguage = sortedLanguages.includes('en-US') ? 'en-US' : sortedLanguages[0];
                    setSelectedLanguage(defaultLanguage);

                    const defaultVoicesForLang = voiceList.filter(
                        (voice) => voice.languageCodes?.includes(defaultLanguage)
                    );
                    let defaultVoice = defaultVoicesForLang.find(v => v.name.includes('Standard') || v.name.includes('Neural')) || defaultVoicesForLang[0];

                    if (defaultVoice) {
                        setVoiceName(defaultVoice.name);
                    } else if (voiceList.length > 0) {
                        setVoiceName(voiceList[0]?.name || '');
                        setSelectedLanguage(voiceList[0]?.languageCodes?.[0] || '');
                    }
                } else if (voiceList.length > 0) {
                    setVoiceName(voiceList[0]?.name || '');
                    setSelectedLanguage(voiceList[0]?.languageCodes?.[0] || '');
                } else {
                    setError("No voices available. Please check API configuration.");
                }

            } catch (err: any) {
                console.error("Voice fetch error:", err);
                if (isMounted) {
                    setError(`Failed to load voices: ${err.message || 'Check API setup & console.'}`);
                }
            }
        };

        fetchVoices();

        return () => {
            isMounted = false;
        }
    }, []);

    // Function to chunk text
      // Function to chunk text (Corrected Null Check)
      const chunkText = (inputText: string, maxChunkBytes = 4900): string[] => {
        if (!inputText) return [];
        const chunks: string[] = [];
        let start = 0;

        while (start < inputText.length) {
            let end = start;
            let currentChunk = '';

            // Find largest substring <= maxChunkBytes
            for (let testEnd = start + 1; testEnd <= inputText.length; testEnd++) {
                const sub = inputText.substring(start, testEnd);
                if (textEncoder.encode(sub).length <= maxChunkBytes) {
                    currentChunk = sub;
                    end = testEnd;
                } else {
                    break;
                }
            }

            if (end <= start) {
                 console.warn("Could not create a chunk starting at index", start);
                 break;
            }

            // Try to find better split point (sentence end or space) within the valid chunk
            if (end < inputText.length) { // Only adjust if not the last chunk naturally ending text
                const segment = currentChunk;
                let adjusted = false; // Flag to see if we found a better split point

                // 1. Try Sentence Boundary
                const sentenceEndMatch = segment.match(/[.!?]\s+(?=[A-ZÀ-ÖØ-öø-ÿ])/g);
                // *** Check if sentenceEndMatch is NOT null before accessing it ***
                if (sentenceEndMatch) {
                    const lastMatchStr = sentenceEndMatch[sentenceEndMatch.length - 1]; // Safe now
                    const lastSentenceEndIndex = segment.lastIndexOf(lastMatchStr); // Safe now

                    // Ensure match isn't at the very start (index 0) which wouldn't be a good split
                    if (lastSentenceEndIndex > 0) {
                        const potentialNewEnd = start + lastSentenceEndIndex + (lastMatchStr?.length || 0);
                        // Verify the adjusted chunk is still within byte limits
                        if (textEncoder.encode(inputText.substring(start, potentialNewEnd)).length <= maxChunkBytes) {
                            end = potentialNewEnd;
                            currentChunk = inputText.substring(start, end);
                            adjusted = true; // Found a good sentence split
                            console.log(`Adjusted chunk end to sentence boundary at index ${end}`);
                        }
                    }
                }

                // 2. Try Space Boundary (if sentence boundary adjustment didn't happen)
                if (!adjusted) {
                    const lastSpaceIndex = segment.lastIndexOf(' ');
                    // Ensure space exists and isn't the very first char (index 0) or the very last char
                    if (lastSpaceIndex > 0 && segment.length > lastSpaceIndex + 1) {
                         const potentialNewEnd = start + lastSpaceIndex + 1; // Split *after* the space
                         // Verify the adjusted chunk is still within byte limits
                         if (textEncoder.encode(inputText.substring(start, potentialNewEnd)).length <= maxChunkBytes) {
                             end = potentialNewEnd;
                             currentChunk = inputText.substring(start, end);
                             console.log(`Adjusted chunk end to space boundary at index ${end}`);
                             // adjusted = true; // Optional: flag space adjustment if needed elsewhere
                         }
                    }
                }
                // If neither adjustment worked or was applied, 'end' remains the max byte limit boundary calculated earlier
            }

            chunks.push(currentChunk.trim());
            start = end; // Move start to the end of the processed chunk
        }
        console.log("Chunking complete. Number of chunks:", chunks.length);
        return chunks;
    }

    // Function to combine audio blobs
    const combineAudioChunks = async (audioBlobs: Blob[]): Promise<Blob> => {
        console.log(`Combining ${audioBlobs.length} audio blobs.`);
        const validBlobs = audioBlobs.filter(blob => blob && blob.size > 0);

        if (validBlobs.length === 0) {
            console.warn("No valid audio blobs to combine.");
            return new Blob([], { type: 'audio/mp3' });
        }
        if (validBlobs.length === 1) {
             console.log("Only one valid blob, returning it directly.");
            return validBlobs[0];
        }

        try {
            const audioBuffers = await Promise.all(validBlobs.map(blob => blob.arrayBuffer()));
            const totalLength = audioBuffers.reduce((total, buffer) => total + buffer.byteLength, 0);
            const combinedBuffer = new ArrayBuffer(totalLength);
            const combinedView = new Uint8Array(combinedBuffer);
            let offset = 0;
            audioBuffers.forEach(buffer => {
                combinedView.set(new Uint8Array(buffer), offset);
                offset += buffer.byteLength;
            });
            const finalBlob = new Blob([combinedBuffer], { type: 'audio/mp3' });
            console.log(`Combining complete. Final blob size: ${finalBlob.size} bytes.`);
            return finalBlob;
        } catch (err) {
            console.error("Error combining audio buffers:", err);
            throw new Error(`Failed during audio combination process. ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    // --- Main TTS Conversion Logic ---
    const handleConvert = async () => {
        // 1. Reset State & Revoke PREVIOUS URL
        setError('');
        setTtsStatusMessage('');
        setIsConversionSuccess(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setCombinedAudioBlob(null); // Clear old blob
        setAudioUrl(''); // Clear current audio URL state *before* revocation

        if (previousAudioUrlRef.current) {
            console.log('Revoking previous Blob URL:', previousAudioUrlRef.current);
            URL.revokeObjectURL(previousAudioUrlRef.current);
            previousAudioUrlRef.current = null;
        }

        // 2. Validate Input
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
            // 3. Chunk Text
            setTtsStatusMessage('Splitting text...');
            const chunks = chunkText(text);
            const totalChunks = chunks.length;
            if (totalChunks === 0) throw new Error("Text resulted in zero chunks.");
            setTtsStatusMessage(`Fetching audio for ${totalChunks} chunk${totalChunks > 1 ? 's' : ''}...`);
            console.log(`Starting parallel fetch for ${totalChunks} chunks.`);

            // 4. Fetch Audio Chunks Concurrently
            const fetchPromises = chunks.map((chunkContent, index) => {
                console.log(`  - Req chunk ${index + 1}/${totalChunks}`);
                return axios.post('/api/tts', {
                    text: chunkContent, languageCode: selectedLanguage, voiceName: voiceName, pitch: pitch, speakingRate: speakingRate
                })
                .then(response => {
                    if (!response.data?.audioContent) throw new Error(`No audio for chunk ${index + 1}.`);
                    console.log(`  - Rec chunk ${index + 1}/${totalChunks}`);
                    try { return base64ToBlob(response.data.audioContent, 'audio/mp3'); }
                    catch (decodeError) { throw new Error(`Decode err chunk ${index + 1}: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`); }
                })
                .catch(err => {
                    console.error(`Err chunk ${index + 1}:`, err);
                    const errMsg = err.response?.data?.error || err.message || 'Unknown error';
                    throw new Error(`Chunk ${index + 1} failed: ${errMsg}`); // Rethrow
                });
            });

            const audioBlobs = await Promise.all(fetchPromises);
            console.log("All audio chunks fetched successfully.");

            // 5. Combine Audio Blobs
            setTtsStatusMessage(`Combining ${totalChunks} audio chunk${totalChunks > 1 ? 's' : ''}...`);
            const combinedBlobResult = await combineAudioChunks(audioBlobs);
            if (combinedBlobResult.size === 0) throw new Error("Combined audio is empty.");

            setCombinedAudioBlob(combinedBlobResult); // Store blob for download

            // 6. Create Object URL & Update State (triggers useEffect for audio element)
            setTtsStatusMessage('Generating playback URL...');
            const newAudioObjectUrl = URL.createObjectURL(combinedBlobResult);

            previousAudioUrlRef.current = newAudioObjectUrl; // Store for next revocation
            setAudioUrl(newAudioObjectUrl); // Trigger player update

            // 7. Final Success State
            setTtsStatusMessage('Speech generated successfully!');
            setIsConversionSuccess(true);
            setTimeout(() => {
                setIsConversionSuccess(false);
                setTtsStatusMessage('');
            }, 4000);

        } catch (err: any) {
            console.error("Conversion process failed:", err);
            setError(`Conversion Failed: ${err.message || 'An unexpected error occurred.'}`);
            setTtsStatusMessage('');
            setAudioUrl(''); // Ensure URL is cleared on error
            setCombinedAudioBlob(null);
            // Revoke potentially created URL if error occurred mid-process
            if (previousAudioUrlRef.current) {
                 console.log("Revoking URL due to conversion error:", previousAudioUrlRef.current);
                 URL.revokeObjectURL(previousAudioUrlRef.current);
                 previousAudioUrlRef.current = null;
            }
        } finally {
            setIsLoading(false);
        }
    };

    // == Lifecycle & Helper Hooks ==

    // Check STT Support on Mount
    useEffect(() => {
        setBrowserSupportsSpeechRecognition(!!SpeechRecognition);
    }, []);

    // Cleanup Object URL on Component Unmount
    useEffect(() => {
        return () => {
            if (previousAudioUrlRef.current) {
                console.log('Revoking Blob URL on component unmount:', previousAudioUrlRef.current);
                URL.revokeObjectURL(previousAudioUrlRef.current);
                previousAudioUrlRef.current = null;
            }
        };
    }, []); // Empty dependency array: runs only on mount/unmount

    // Manage Audio Element State based on audioUrl
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        // Event Handlers
        const handleTimeUpdate = () => { if (!isNaN(audioElement.currentTime)) setCurrentTime(audioElement.currentTime); };
        const handleLoadedMetadata = () => {
            setIsPlaying(false); // Reset play state
            setCurrentTime(0);
            if (!isNaN(audioElement.duration) && isFinite(audioElement.duration)) {
                setDuration(audioElement.duration);
                console.log("Audio metadata loaded. Duration:", audioElement.duration);
            } else {
                setDuration(0);
                console.warn("Audio duration invalid after metadata load:", audioElement.duration);
                //setError("Failed to load audio metadata."); // Optional: Set error
            }
        };
        const handleCanPlay = () => { console.log("Audio element reports 'canplay'. Ready."); };
        const handleEnded = () => { setIsPlaying(false); setCurrentTime(0); };
        const handleError = (e: Event) => {
            console.error("Audio Element Error:", e, audioElement?.error);
            const errorMsg = audioElement?.error?.message || 'Could not load/play audio.';
            setError(`Audio Error: ${errorMsg}`);
            const erroredSrc = audioElement.src; // Capture src before clearing state

            setAudioUrl(''); // Clear URL state (triggers this effect again to cleanup)
            setDuration(0);
            setCurrentTime(0);
            setIsPlaying(false);
            setCombinedAudioBlob(null);

             // Attempt to revoke the problematic URL
             if(previousAudioUrlRef.current && previousAudioUrlRef.current === erroredSrc) {
                console.log("Revoking URL due to audio element error:", previousAudioUrlRef.current);
                URL.revokeObjectURL(previousAudioUrlRef.current);
                previousAudioUrlRef.current = null;
             } else if (erroredSrc && erroredSrc.startsWith('blob:')) {
                 console.warn("Revoking URL from audioElement.src due to error (ref mismatch):", erroredSrc);
                 URL.revokeObjectURL(erroredSrc);
             }
        };

        // Logic runs when audioUrl state changes
        if (audioUrl) {
            console.log("Setting new audio source and loading:", audioUrl);
            audioElement.src = audioUrl;
            audioElement.load(); // *** Explicitly call load() ***

            // Add event listeners
            audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
            audioElement.addEventListener('canplay', handleCanPlay);
            audioElement.addEventListener('timeupdate', handleTimeUpdate);
            audioElement.addEventListener('ended', handleEnded);
            audioElement.addEventListener('error', handleError);

        } else {
            // If audioUrl is cleared, clean up the audio element
            console.log("Clearing audio source and resetting state.");
            audioElement.removeAttribute('src');
            audioElement.load();
            // Reset related state if not already done
            if (duration !== 0) setDuration(0);
            if (currentTime !== 0) setCurrentTime(0);
            if (isPlaying) setIsPlaying(false);
        }

        // Cleanup Function: Remove listeners
        return () => {
            console.log("Cleaning up audio listeners for URL:", audioUrl || "none");
            audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioElement.removeEventListener('canplay', handleCanPlay);
            audioElement.removeEventListener('timeupdate', handleTimeUpdate);
            audioElement.removeEventListener('ended', handleEnded);
            audioElement.removeEventListener('error', handleError);
        };
    }, [audioUrl]); // Re-run *only* when audioUrl changes

    // Apply Volume/Mute Changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Apply Dark Mode Class
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.classList.toggle('dark', isDarkMode);
            document.body.classList.toggle('light', !isDarkMode);
        }
    }, [isDarkMode]);

    // Auto-resize Textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 6 * 16)}px`;
        }
    }, [text]);

    // Cleanup STT on Unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                console.log('Speech recognition aborted on unmount.');
                recognitionRef.current = null;
            }
        };
    }, []);

    // == Event Handlers ==

    // Format Time Helper
    const formatTime = (seconds: number): string => {
        if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Play/Pause Handler
    const handlePlayPause = () => {
        const audioElement = audioRef.current;
        // Ensure URL exists and duration is loaded and valid
        if (audioElement && audioUrl && duration > 0 && !isNaN(duration)) {
            if (isPlaying) {
                audioElement.pause();
            } else {
                // Reset to start if ended
                if (audioElement.ended || Math.abs(audioElement.currentTime - duration) < 0.1) {
                    audioElement.currentTime = 0;
                    setCurrentTime(0);
                }
                audioElement.play().catch(err => {
                    console.error("Error starting playback:", err);
                    setError("Could not play audio. Browser interaction might be needed first.");
                    setIsPlaying(false);
                });
            }
            setIsPlaying(!isPlaying); // Toggle state
        } else {
            console.warn("Play/Pause ignored: Conditions not met (audioElement, audioUrl, valid duration).", { hasElement: !!audioElement, audioUrl, duration });
        }
    };

    // Seek Handler (Click on Progress Bar)
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audioElement = audioRef.current;
        if (audioElement && duration > 0 && !isNaN(duration)) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, clickX / rect.width)); // Clamp [0, 1]
            const newTime = duration * percentage;
            audioElement.currentTime = newTime;
            setCurrentTime(newTime); // Update state immediately
        }
    };

    // Mute Toggle Handler
    const handleMuteToggle = () => setIsMuted(!isMuted);

    // Download Handler
    const handleDownload = () => {
        if (!combinedAudioBlob || combinedAudioBlob.size === 0) {
            console.warn("Download attempted but no valid combined audio blob exists.");
            setError("No audio data available to download.");
            return;
        }
        const downloadUrl = URL.createObjectURL(combinedAudioBlob); // Temporary URL for download
        const link = document.createElement('a');
        link.href = downloadUrl;

        const langLabel = selectedLanguage || 'lang';
        const voiceLabelMatch = voiceName.match(/-([^-]+)-([^-]+)$/);
        const voiceLabel = voiceLabelMatch ? voiceLabelMatch[0].substring(1) : (voiceName || 'voice');
        link.download = `${langLabel}_${voiceLabel}_${Date.now()}.mp3`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl); // Revoke temporary download URL
        console.log("Download initiated for:", link.download);
    };

    // Input Change Handlers
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
    const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) setIsMuted(false);
    }

    // STT Toggle Handler
    const handleToggleRecording = useCallback(() => {
        if (!browserSupportsSpeechRecognition) {
            setSttError("STT not supported by this browser.");
            return;
        }

        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                console.log("Stopping STT manually.");
            }
        } else {
            if (!SpeechRecognition) return;
            setSttError(''); setError(''); setTtsStatusMessage(''); // Clear errors/status

            if (recognitionRef.current) recognitionRef.current.abort(); // Abort previous if exists

            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = selectedLanguage || navigator.language || 'en-US';
            console.log(`Starting STT with lang: ${recognition.lang}`);

            recognition.onstart = () => { console.log('STT started.'); setIsRecording(true); };
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i]?.[0]?.transcript;
                    if(transcript && event.results[i].isFinal) finalTranscript += transcript;
                 }
                 if (finalTranscript) {
                     console.log('Final transcript:', finalTranscript);
                     setText(prevText => (prevText.trim() ? prevText.trimEnd() + ' ' : '') + finalTranscript.trim());
                 }
            };
            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('STT error:', event.error, event.message);
                let message = `STT Error: ${event.error}.`;
                 if (event.error === 'not-allowed' || event.error === 'service-not-allowed') message = "Mic access denied. Allow permissions.";
                 else if (event.error === 'no-speech') message = "No speech detected.";
                 else if (event.error === 'network') message = "Network error during STT.";
                 else if (event.error === 'audio-capture') message = "Audio capture failed.";
                 else if (event.error === 'aborted') message = ""; // Ignore standard abort
                 else if (event.error === 'language-not-supported') message = `Lang (${recognition.lang}) not supported for STT.`;

                if(message) setSttError(message);
                setIsRecording(false);
                recognitionRef.current = null;
            };
            recognition.onend = () => {
                console.log('STT ended.');
                // Check if ended unexpectedly
                if (recognitionRef.current && isRecording) console.log("STT ended unexpectedly.");
                setIsRecording(false);
                recognitionRef.current = null;
            };

            try { recognition.start(); }
            catch (e) {
                console.error("Error starting STT:", e);
                setSttError("Could not start STT. Check mic permissions.");
                setIsRecording(false);
                recognitionRef.current = null;
            }
        }
    }, [isRecording, browserSupportsSpeechRecognition, selectedLanguage]);

    // Filter voices based on selected language
    const filteredVoices = voices.filter((voice) =>
        voice.languageCodes?.includes(selectedLanguage)
    );

    // Get language label (Display Name)
    const getLanguageLabel = (code: string): string => {
        try {
            const display = new Intl.DisplayNames(['en'], { type: 'language' });
            const baseCode = code.split('-')[0];
            return display.of(baseCode) || code;
        } catch (e) { return code; }
    };

    // == JSX Rendering ==
    return (
        <>
            <InternalNavbar />
            <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900 text-white' : 'light bg-gradient-to-br from-indigo-300 via-purple-100 to-blue-50'}`}>
                <main className="flex-grow flex items-center justify-center px-4 py-8 mt-16">
                    <motion.div
                        className="w-full max-w-6xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white bg-opacity-90 backdrop-blur-lg border border-gray-200'} shadow-xl`}>

                            {/* Left Panel */}
                            <div className={`lg:col-span-2 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white bg-opacity-80'}`}>
                                <motion.div className="space-y-5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                    {/* Text Input */}
                                    <div className="space-y-1 relative">
                                        <div className="flex justify-between items-center mb-1">
                                            <label htmlFor="text" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}> Text </label>
                                            {browserSupportsSpeechRecognition ? (
                                                <motion.button onClick={handleToggleRecording} className={`p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'} ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 animate-pulse' : isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 focus:ring-indigo-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-600 focus:ring-indigo-500'} disabled:opacity-50 disabled:cursor-not-allowed`} title={isRecording ? "Stop" : "Record"} aria-label={isRecording ? "Stop voice input" : "Start voice input"} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={isLoading} >
                                                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                                </motion.button>
                                            ) : (
                                                <div className="flex items-center space-x-1 text-xs text-gray-500" title="STT not available"> <AlertCircle className="w-3 h-3" /> <span>Mic Off</span> </div>
                                            )}
                                        </div>
                                        <textarea id="text" ref={textareaRef} value={text} onChange={handleTextChange} rows={6} className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'} rounded-md resize-y p-3 overflow-y-hidden disabled:opacity-70`} placeholder={isRecording ? "Listening..." : "Type, paste, or use the mic..."} disabled={isLoading} />
                                        <div className="flex justify-between items-center mt-1">
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}> {text.length} chars </p>
                                            {(text.length > 0 && !isRecording && !isLoading) && ( <motion.button className={`text-xs ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`} onClick={() => setText('')} whileTap={{ scale: 0.95 }}> Clear </motion.button> )}
                                        </div>
                                        <AnimatePresence> {isRecording && !sttError && ( <motion.p className="text-xs text-center text-blue-500 mt-1 animate-pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}> Listening... </motion.p> )} </AnimatePresence>
                                        <AnimatePresence> {sttError && ( <motion.div className={`flex items-center ${isDarkMode ? 'bg-yellow-900 border-yellow-700 text-yellow-300' : 'bg-yellow-100 border border-yellow-300 text-yellow-800'} p-2 rounded-md space-x-2 text-xs mt-2`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}> <AlertTriangle className="w-4 h-4 shrink-0" /> <span className="flex-grow">{sttError}</span> <button onClick={() => setSttError('')} className="ml-auto opacity-70 hover:opacity-100 shrink-0"> <X className="w-3 h-3" /> </button> </motion.div> )} </AnimatePresence>
                                    </div>

                                    {/* TTS Status/Success/Error */}
                                    <AnimatePresence>
                                        {isLoading && ttsStatusMessage && ( <motion.div className={`flex items-center ${isDarkMode ? 'bg-indigo-900 border-indigo-700 text-indigo-300' : 'bg-indigo-100 border border-indigo-300 text-indigo-800'} p-3 rounded-lg space-x-3 text-sm`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}> <Loader2 className="w-5 h-5 animate-spin shrink-0" /> <span>{ttsStatusMessage}</span> </motion.div> )}
                                        {isConversionSuccess && !isLoading && ( <motion.div className={`flex items-center ${isDarkMode ? 'bg-green-900 border-green-700 text-green-300' : 'bg-green-100 border border-green-300 text-green-800'} p-3 rounded-lg space-x-3 text-sm`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}> <Check className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'} shrink-0`} /> <span>{ttsStatusMessage || 'Success!'}</span> </motion.div> )}
                                        {error && !isLoading && ( <motion.div className={`flex items-start ${isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-100 border border-red-300 text-red-800'} p-3 rounded-lg space-x-3 text-sm`} initial={{ opacity: 0, height: 0}} animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}> <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} shrink-0 mt-0.5`} /> <p className="flex-grow">{error}</p> <motion.button className={`ml-auto ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} shrink-0`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setError('')} aria-label="Close error"> <X className="w-4 h-4" /> </motion.button> </motion.div> )}
                                    </AnimatePresence>

                                    {/* Language/Voice Selects */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label htmlFor="language" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}> Language </label>
                                            <select id="language" value={selectedLanguage} onChange={handleLanguageChange} disabled={isLoading || isRecording || languages.length === 0} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500' : 'border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:cursor-not-allowed`}>
                                                {languages.length === 0 && !error && <option disabled>Loading...</option>}
                                                {languages.length === 0 && error && <option disabled>Failed</option>}
                                                {languages.map((code) => ( <option key={code} value={code}> {getLanguageLabel(code)} ({code}) </option> ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="voice" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}> Voice </label>
                                            <select id="voice" value={voiceName} onChange={handleVoiceChange} disabled={isLoading || isRecording || !selectedLanguage || filteredVoices.length === 0} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500' : 'border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:cursor-not-allowed`}>
                                                <option value="">{selectedLanguage ? 'Select voice' : 'Select lang first'}</option>
                                                {filteredVoices.length === 0 && selectedLanguage && <option disabled>No voices for {getLanguageLabel(selectedLanguage)}</option>}
                                                {filteredVoices.map((voice) => ( <option key={voice.name} value={voice.name}> {voice.name.split('-').slice(2).join('-')} {voice.ssmlGender ? ` (${voice.ssmlGender.toLowerCase()})` : ''} </option> ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Advanced Settings */}
                                    <div className="pt-2">
                                        <button type="button" className={`${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium text-sm flex items-center space-x-1.5 group disabled:opacity-50`} onClick={() => setShowAdvanced(!showAdvanced)} aria-expanded={showAdvanced} disabled={isLoading || isRecording}> <Settings className="w-4 h-4 group-hover:rotate-12 transition-transform" /> <span>Advanced</span> {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />} </button>
                                    </div>
                                    <AnimatePresence>
                                        {showAdvanced && (
                                            <motion.div className={`space-y-4 border rounded-lg p-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} ${(isLoading || isRecording) ? 'opacity-50 pointer-events-none' : ''}`} initial={{ height: 0, opacity: 0}} animate={{ height: 'auto', opacity: (isLoading || isRecording) ? 0.5 : 1, marginTop: '0.5rem', paddingTop: '1rem', paddingBottom: '1rem' }} exit={{ height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}>
                                                <div className="grid grid-cols-6 items-center gap-2"> <label htmlFor="pitch" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}> Pitch </label> <input type="range" id="pitch" min="-20" max="20" step="1" value={pitch} onChange={handlePitchChange} className={`w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4`} disabled={isLoading || isRecording} /> <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-right col-span-1 w-10`}>{pitch.toFixed(0)}</span> </div>
                                                <div className="grid grid-cols-6 items-center gap-2"> <label htmlFor="speakingRate" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}> Rate </label> <input type="range" id="speakingRate" min="0.25" max="4.0" step="0.05" value={speakingRate} onChange={handleRateChange} className={`w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4`} disabled={isLoading || isRecording} /> <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-right col-span-1 w-10`}>{speakingRate.toFixed(2)}x</span> </div>
                                                <div className="grid grid-cols-6 items-center gap-2"> <label htmlFor="volume" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} col-span-1`}> Volume </label> <input type="range" id="volume" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} disabled={isMuted || isRecording} className={`w-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-indigo-600 col-span-4 ${isMuted ? 'opacity-50' : ''}`} /> <button onClick={handleMuteToggle} className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} col-span-1 w-10 flex justify-center items-center disabled:opacity-50`} aria-label={isMuted ? 'Unmute' : 'Mute'} disabled={isRecording}> {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />} </button> </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Convert Button */}
                                    <motion.button className={`w-full font-bold py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-gray-800 focus:ring-indigo-400' : 'focus:ring-offset-white focus:ring-indigo-500'} flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? (isDarkMode ? 'bg-indigo-800 text-gray-400' : 'bg-indigo-300 text-gray-50') : (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')}`} onClick={handleConvert} disabled={isLoading || isRecording || !text.trim() || !voiceName || !selectedLanguage} whileHover={(!isLoading && !isRecording && text.trim() && voiceName && selectedLanguage) ? { scale: 1.03, boxShadow: "0px 5px 15px rgba(99, 102, 241, 0.4)" } : {}} whileTap={(!isLoading && !isRecording && text.trim() && voiceName && selectedLanguage) ? { scale: 0.98 } : {}} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                                        {isLoading ? ( <> <Loader2 className="animate-spin w-5 h-5" /> <span>Processing...</span> </> ) : ( <> <Sparkles className="w-5 h-5" /> <span>Convert to Speech</span> </> )}
                                    </motion.button>
                                </motion.div>
                            </div>

                            {/* Right Panel */}
                            <div className={`lg:col-span-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-600 to-purple-600'} p-6 text-white`}>
                                <motion.div className="h-full flex flex-col" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-white text-xl font-bold">Audio Output</h2>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5 ${audioUrl ? 'bg-green-500 text-white' : (isLoading ? 'bg-yellow-500 text-black' : (error ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'))}`}>
                                            {isLoading && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                                            <span>{isLoading ? 'Processing' : (audioUrl ? 'Ready' : (error ? 'Failed' : 'Idle'))}</span>
                                         </div>
                                     </div>
                                     {/* Visualization Area */}
                                     <div className="flex-grow flex items-center justify-center mb-6 min-h-[200px]">
                                         {audioUrl && duration > 0 && !isNaN(duration) ? ( // Check for valid URL and duration
                                             <div className="w-full h-full flex flex-col items-center justify-center">
                                                 <div className="w-full h-32 md:h-40 mb-4 relative overflow-hidden">
                                                     <motion.div className="absolute inset-0 flex items-end justify-around space-x-px" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                         {[...Array(60)].map((_, i) => ( <motion.div key={i} className={`bg-white ${isDarkMode ? 'bg-opacity-70' : 'bg-opacity-80'} w-1 rounded-t-full`} initial={{ height: '2%' }} animate={{ height: isPlaying ? `${Math.max(2, Math.random() * 80 + 10)}%` : `${Math.max(2, Math.sin(i * 0.2 + currentTime * 3) * 30 + 40)}%` }} transition={{ duration: isPlaying ? 0.1 : 0.4, ease: isPlaying ? "easeOut" : "easeInOut", delay: isPlaying ? Math.random() * 0.05 : 0 }} /> ))}
                                                     </motion.div>
                                                 </div>
                                                 <div className="w-full h-2 bg-white bg-opacity-20 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
                                                     <motion.div className="h-full bg-white" style={{ width: `${(currentTime / duration) * 100}%` }} transition={{ duration: 0.1, ease: "linear" }} />
                                                 </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-10">
                                                <motion.div className="inline-block mb-4 p-4 rounded-full bg-white bg-opacity-10" animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }}> <AudioWaveform className="w-12 h-12 text-white opacity-75" /> </motion.div>
                                                <p className={`text-white ${isDarkMode ? 'text-opacity-70' : 'text-opacity-80'} max-w-md mx-auto`}> {isLoading ? ttsStatusMessage || 'Generating...' : (error ? 'Audio generation failed.' : 'Synthesized audio appears here.')} </p>
                                            </div>
                                        )}
                                     </div>
                                     {/* Audio Player Controls */}
                                     <AnimatePresence>
                                        {audioUrl && ( // Only show controls if URL exists
                                            <motion.div className={`rounded-xl ${isDarkMode ? 'bg-white bg-opacity-10' : 'bg-black bg-opacity-10'} p-5`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                                <audio ref={audioRef} preload="metadata" className="hidden" key={audioUrl || 'no-audio'} />
                                                <div className="flex flex-col space-y-4">
                                                    <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-100'} font-mono`}> <span>{formatTime(currentTime)}</span> <span>{formatTime(duration)}</span> </div>
                                                    <div className="flex items-center justify-center space-x-6">
                                                        <motion.button className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:text-white bg-white bg-opacity-10 hover:bg-opacity-20' : 'text-gray-200 hover:text-white bg-black bg-opacity-10 hover:bg-opacity-20'} focus:outline-none ring-2 ring-transparent focus:ring-white/50 disabled:opacity-50`} onClick={handleMuteToggle} aria-label={isMuted ? 'Unmute' : 'Mute'} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={isRecording}> {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />} </motion.button>
                                                        <motion.button className={`p-4 rounded-full ${isDarkMode ? 'bg-white text-indigo-700 hover:bg-gray-200' : 'bg-white text-indigo-700 hover:bg-gray-200'} focus:outline-none ring-2 ring-transparent focus:ring-white/75 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`} onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isRecording || !audioUrl || !duration || duration <= 0 || isNaN(duration)}> {isPlaying ? <Pause className="w-6 h-6 fill-current"/> : <Play className="w-6 h-6 ml-1 fill-current"/>} </motion.button>
                                                        <motion.button className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:text-white bg-white bg-opacity-10 hover:bg-opacity-20' : 'text-gray-200 hover:text-white bg-black bg-opacity-10 hover:bg-opacity-20'} focus:outline-none ring-2 ring-transparent focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed`} onClick={handleDownload} aria-label="Download" title="Download MP3" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={isRecording || !combinedAudioBlob || combinedAudioBlob.size === 0}> <Download className="w-5 h-5" /> </motion.button>
                                                     </div>
                                                 </div>
                                             </motion.div>
                                         )}
                                     </AnimatePresence>
                                     {/* Info Boxes */}
                                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         <motion.div className={`${isDarkMode ? 'bg-white bg-opacity-5' : 'bg-black bg-opacity-5'} p-4 rounded-lg`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}> <h3 className={`${isDarkMode ? 'text-gray-200' : 'text-white'} text-sm font-semibold mb-2`}>Available Voices</h3> <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-200'} text-xs`}> {selectedLanguage ? `${filteredVoices.length} voice${filteredVoices.length !== 1 ? 's' : ''} for ${getLanguageLabel(selectedLanguage)}` : (languages.length > 0 ? 'Select language' : (isLoading ? 'Loading...' : 'No voices found'))} </p> </motion.div>
                                         <motion.div className={`${isDarkMode ? 'bg-white bg-opacity-5' : 'bg-black bg-opacity-5'} p-4 rounded-lg`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}> <h3 className={`${isDarkMode ? 'text-gray-200' : 'text-white'} text-sm font-semibold mb-2`}>Usage Notes</h3> <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-200'} text-xs`}> Long text split (~4900 bytes/chunk). API limits may apply. </p> </motion.div>
                                     </div>
                                 </motion.div>
                             </div>

                        </div> {/* End Main Grid */}
                    </motion.div> {/* End Centered Container */}
                </main>

                {/* Footer */}
                 <footer className={`py-4 px-6 text-center text-sm ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white bg-opacity-70 text-gray-600'}`}>
                     <div className="container mx-auto"> <p>Voice Synthesizer Pro • Powered by TTS API & Browser STT</p> </div>
                 </footer>
             </div>
         </>
     );
 };

 export default VoiceSynthesizer;