chrome.offscreen.createDocument({
  url: chrome.runtime.getURL('offscreen.html'),
  reasons: ['AUDIO_PLAYBACK'],
  justification: 'Plays almost-silence continuously to keep the sound card awake',
});
