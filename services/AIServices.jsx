import OpenAI from "openai";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { CoachingOptions } from "./Options";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.NEXT_PUBLIC_API_OPENROUTER,
    dangerouslyAllowBrowser: true
});

export const AIModel = async (topic, coachingOption, lastTwoConversation) => {
    const option = CoachingOptions.find((item) => item.name === coachingOption);
    const PROMPT = option.prompt.replace('{user_topic}', topic);
    const completion = await openai.chat.completions.create({
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages: [
            { role: 'assistant', content: PROMPT },
            ...lastTwoConversation
        ],
    });
    return completion.choices[0].message;
};

export const ConvertTextToSpeech = async (text, expertName) => {
    const pollyClient = new PollyClient({
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY
        }
    });
    const command = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: expertName
    });
    try {
        const { AudioStream } = await pollyClient.send(command);
        const audioArrayBuffer = await AudioStream.transformToByteArray();
        const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        return audioUrl;
    } catch (e) {
        console.error(e);
        throw new Error("Failed to convert text to speech.");
    }
}; 