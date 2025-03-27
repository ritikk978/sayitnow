// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <title>SayItNow: Effortless Text-to-Speech Conversion | Free & Fast TTS Tool</title>
        <meta name="description" content="SayItNow is a free, fast, and powerful text-to-speech (TTS) tool that converts text into natural-sounding speech. Perfect for podcasts, presentations, and accessibility needs. Try it now!" />
        <meta name="keywords" content="text-to-speech, TTS, online TTS tool, text to speech converter, free text to speech, speech synthesis, SayItNow, TTS for presentations, text-to-speech for accessibility" />
        
        {/* Open Graph tags for better social media sharing */}
        <meta property="og:title" content="SayItNow: Effortless Text-to-Speech Conversion" />
        <meta property="og:description" content="Convert text into natural-sounding speech with SayItNow." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sayitnow.in" />
        <meta property="og:image" content="/your-image.jpg" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SayItNow: Effortless Text-to-Speech Conversion" />
        <meta name="twitter:description" content="Convert text into speech easily using SayItNow." />
        <meta name="twitter:image" content="/your-image.jpg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
