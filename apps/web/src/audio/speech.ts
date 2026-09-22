/** Wrapper Web Speech API (TTS italiano). Offline con le voci di sistema. */

let voice: SpeechSynthesisVoice | null = null;

function pickVoice(): void {
  if (typeof speechSynthesis === 'undefined') return;
  const voices = speechSynthesis.getVoices();
  voice = voices.find((v) => v.lang.toLowerCase().startsWith('it')) ?? voices[0] ?? null;
}

if (typeof speechSynthesis !== 'undefined') {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

export function speak(text: string): void {
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'it-IT';
  if (voice) u.voice = voice;
  u.rate = 0.95;
  u.pitch = 1.15;
  speechSynthesis.speak(u);
}

export function stopSpeak(): void {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}
