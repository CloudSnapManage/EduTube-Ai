
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-youtube-video.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/generate-notes.ts';
import '@/ai/flows/answer-question-flow.ts';
import '@/ai/flows/generate-chapters.ts';
import '@/ai/flows/generate-quiz.ts'; // Added new quiz flow

    