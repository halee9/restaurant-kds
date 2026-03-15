/**
 * Web Audio API 기반 알림 사운드
 * — 외부 .mp3 파일 없이 프로그래밍적으로 소리 생성
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Safari: suspended 상태이면 resume
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** 기본 주문 알림 — 밝은 2음 차임 */
export function playDefaultNotification(volume: number = 0.8) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(volume * 0.4, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  // 첫 번째 음 (C5 = 523Hz)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(523, now);
  osc1.connect(gainNode);
  osc1.start(now);
  osc1.stop(now + 0.15);

  // 두 번째 음 (E5 = 659Hz)
  const gainNode2 = ctx.createGain();
  gainNode2.connect(ctx.destination);
  gainNode2.gain.setValueAtTime(volume * 0.4, now + 0.15);
  gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(659, now + 0.15);
  osc2.connect(gainNode2);
  osc2.start(now + 0.15);
  osc2.stop(now + 0.4);

  // 세 번째 음 (G5 = 784Hz) — 밝은 마무리
  const gainNode3 = ctx.createGain();
  gainNode3.connect(ctx.destination);
  gainNode3.gain.setValueAtTime(volume * 0.35, now + 0.3);
  gainNode3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(784, now + 0.3);
  osc3.connect(gainNode3);
  osc3.start(now + 0.3);
  osc3.stop(now + 0.6);
}

/** 배달 주문 알림 — 긴급한 3음 경고 */
export function playDeliveryNotification(volume: number = 0.8) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // 2회 반복 — 배달 주문은 더 주의 환기
  for (let rep = 0; rep < 2; rep++) {
    const offset = rep * 0.45;

    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(volume * 0.45, now + offset);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.4);

    // 낮은 음 (A4 = 440Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now + offset);
    osc1.connect(gainNode);
    osc1.start(now + offset);
    osc1.stop(now + offset + 0.12);

    // 높은 음 (A5 = 880Hz)
    const gainNode2 = ctx.createGain();
    gainNode2.connect(ctx.destination);
    gainNode2.gain.setValueAtTime(volume * 0.45, now + offset + 0.12);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.5);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + offset + 0.12);
    osc2.connect(gainNode2);
    osc2.start(now + offset + 0.12);
    osc2.stop(now + offset + 0.3);
  }
}

/** 현금 주문 알림 — "ka-ching" 금속성 레지스터 사운드 */
export function playCashNotification(volume: number = 0.8) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // 2회 반복 — 금속성 높은 주파수 연타
  for (let rep = 0; rep < 2; rep++) {
    const offset = rep * 0.25;

    // 첫 번째: 날카로운 탭 (2000Hz)
    const g1 = ctx.createGain();
    g1.connect(ctx.destination);
    g1.gain.setValueAtTime(volume * 0.5, now + offset);
    g1.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

    const o1 = ctx.createOscillator();
    o1.type = 'square';
    o1.frequency.setValueAtTime(2000, now + offset);
    o1.connect(g1);
    o1.start(now + offset);
    o1.stop(now + offset + 0.08);

    // 두 번째: 벨 (3000Hz)
    const g2 = ctx.createGain();
    g2.connect(ctx.destination);
    g2.gain.setValueAtTime(volume * 0.4, now + offset + 0.08);
    g2.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(3000, now + offset + 0.08);
    o2.connect(g2);
    o2.start(now + offset + 0.08);
    o2.stop(now + offset + 0.2);
  }
}

/** 소스에 따라 적절한 알림음 재생 */
export function playOrderNotification(source: string | undefined, volume: number = 0.8, paymentMethod?: string) {
  // 현금 주문 → ka-ching
  if (paymentMethod === 'CASH') {
    playCashNotification(volume);
    return;
  }

  const s = (source || '').toLowerCase();
  const isDelivery = s.includes('doordash') || s.includes('uber') || s.includes('grubhub')
    || s.includes('delivery') || s.includes('postmates');

  if (isDelivery) {
    playDeliveryNotification(volume);
  } else {
    playDefaultNotification(volume);
  }
}

/** 테스트용 — settings에서 미리 듣기 */
export function playTestSound(type: 'default' | 'delivery' | 'cash', volume: number = 0.8) {
  if (type === 'cash') {
    playCashNotification(volume);
  } else if (type === 'delivery') {
    playDeliveryNotification(volume);
  } else {
    playDefaultNotification(volume);
  }
}
