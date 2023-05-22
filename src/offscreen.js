document.addEventListener('DOMContentLoaded', () => {
  const context = new AudioContext();
  const oscillator = context.createOscillator();

  oscillator.frequency.value = 1;  // 1 Hz
  oscillator.type = 'sine';

  const gainNode = context.createGain();
  gainNode.gain.value = 0.001;  // inaudible

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
});
