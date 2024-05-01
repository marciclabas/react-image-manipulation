/// <reference lib="WebWorker" />
console.debug('[WORKER] Running');
import cv from 'opencv-ts' // dev
import { onMessage } from 'opencv-tools/workers/correct'
onmessage = onMessage(cv)