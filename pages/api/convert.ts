import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

export default async function handler(req: { method: string; body: { text: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message?: string; url?: string; error?: any; }): void; new(): any; }; }; }) {
  if (req.method === "POST") {
    const { text } = req.body;

    const request = {
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    try {
      const [response] = await client.synthesizeSpeech(request);
      const writeFile = util.promisify(fs.writeFile);
      await writeFile("output.mp3", response.audioContent, "binary");
      res.status(200).json({ message: "Text converted to speech", url: "/output.mp3" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
