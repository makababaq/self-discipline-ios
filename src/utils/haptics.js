import { Capacitor } from '@capacitor/core';

let pluginPromise;

async function withNativeHaptics(effect) {
  try {
    if (!Capacitor.isNativePlatform()) return;
    pluginPromise ??= import('@capacitor/haptics');
    await effect(await pluginPromise);
  } catch {
    // Optional feedback must never interrupt the action that triggered it.
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let selectionQueue = Promise.resolve();
let selectionSession = null;

function queueSelection(effect) {
  selectionQueue = selectionQueue.then(() => withNativeHaptics(effect));
  return selectionQueue;
}

export function startHapticSelection() {
  if (!Capacitor.isNativePlatform()) return;
  const session = Symbol();
  selectionSession = session;
  void queueSelection(({ Haptics }) => Haptics.selectionStart());

  return () => {
    if (selectionSession !== session) return;
    selectionSession = null;
    void queueSelection(({ Haptics }) => Haptics.selectionEnd());
  };
}

export const haptic = {
  tick() {
    const session = selectionSession;
    return queueSelection(({ Haptics }) => {
      if (selectionSession === session) return Haptics.selectionChanged();
    });
  },

  tap() {
    return withNativeHaptics(({ Haptics, ImpactStyle }) => Haptics.impact({ style: ImpactStyle.Light }));
  },

  water(reachGoal) {
    if (!reachGoal) return haptic.tap();
    return withNativeHaptics(({ Haptics, NotificationType }) => Haptics.notification({ type: NotificationType.Success }));
  },

  meal(isBatchCopy) {
    return withNativeHaptics(async ({ Haptics, ImpactStyle }) => {
      if (isBatchCopy) {
        await Haptics.impact({ style: ImpactStyle.Light });
        await delay(70);
      }
      await Haptics.impact({ style: ImpactStyle.Medium });
    });
  },

  workout(firstCompleteToday) {
    return withNativeHaptics(async ({ Haptics, ImpactStyle, NotificationType }) => {
      if (firstCompleteToday) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        await delay(110);
      }
      await Haptics.notification({ type: NotificationType.Success });
    });
  },

  delete() {
    return withNativeHaptics(({ Haptics, NotificationType }) => Haptics.notification({ type: NotificationType.Warning }));
  }
};
