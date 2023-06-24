//@ts-check

(() => {
  try {
    const frameId = Date.now().toString(36) + Math.random().toString(36).substring(1);

    const sendMessage = (data) => {
      window.postMessage({
        type: 'HOMEPIE_SDK_MESSAGE',
        frame: frameId,
        data,
      });
    };

    const sdk = {
    };

    Object.defineProperty(window, '__HOMEPIE_SDK_INTERNALS__', {
      get() {
        return sdk;
      },
    });

    sendMessage({ action: 'REGISTER' });

    window.addEventListener('unload', () => {
      sendMessage({ action: 'UNREGISTER' });
    }, {
      once: true,
    });

    console.debug('[HomePie] SDK loaded');
  } catch (e) {
    console.error('[HomePie] failed to load SDK', e);
  }
})();
