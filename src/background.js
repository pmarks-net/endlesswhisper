const IDLE_SECONDS = 600;  // Let Chrome OS sleep after 10 minutes.

let isSoundOn = null;
let idleState = null;

const init = (async () => {
  const data = await chrome.storage.local.get(['isSoundOn']);
  if (data.isSoundOn !== undefined) {
    isSoundOn = data.isSoundOn;
  } else {
    isSoundOn = true;  // default state
  }
  idleState = await new Promise((resolve) => {
    chrome.idle.queryState(IDLE_SECONDS, resolve);
  });
  apply();
})();

chrome.idle.setDetectionInterval(IDLE_SECONDS);
chrome.idle.onStateChanged.addListener(async (newState) => {
  idleState = newState;
  await init;
  apply();
});

chrome.action.onClicked.addListener(async (tab) => {
  await init;
  isSoundOn = !isSoundOn;
  chrome.storage.local.set({ isSoundOn });
  apply();
});

async function apply() {
  const on = isSoundOn && (idleState == 'active');
  console.log("isSoundOn=" + isSoundOn + " idleState=" + idleState + " on=" + on);
  if (!(busy && on == await busy)) {
    busy = setupOffscreenDocument(on);
    await busy;
    busy = null;
  }
}

let busy = null;
async function setupOffscreenDocument(newExists) {
  const url = chrome.runtime.getURL('offscreen.html');
  let oldExists = false;
  for (const client of await clients.matchAll({includeUncontrolled: true})) {
    if (client.url === url) {
      oldExists = true;
      break;
    }
  }
  if (oldExists != newExists) {
    if (newExists) {
      chrome.offscreen.createDocument({
        url: url,
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Continuously plays a very quiet sound, in order to keep your sound card awake',
      });
      chrome.action.setIcon({ path: 'icon128.png' });
    } else {
      chrome.offscreen.closeDocument();
      chrome.action.setIcon({ path: 'icon128-gray.png' });
    }
  }
  return newExists;
}

// Self-contained workaround for crbug.com/1316588 (Apache License)
let lastAlarm = 0;
(async function lostEventsWatchdog() {
  let quietCount = 0;
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 65000));
    const now = Date.now();
    const age = now - lastAlarm;
    console.log(`lostEventsWatchdog: last alarm ${age/1000}s ago`);
    if (age < 95000) {
      quietCount = 0;  // alarm still works.
    } else if (++quietCount >= 3) {
      console.error("lostEventsWatchdog: reloading!");
      return chrome.runtime.reload();
    } else {
      chrome.alarms.create(`lostEventsWatchdog/${now}`, {delayInMinutes: 1});
    }
  }
})();
// Requires the "alarms" permission:
chrome.alarms.onAlarm.addListener(() => lastAlarm = Date.now());
