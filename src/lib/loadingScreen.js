// src/lib/loadingScreen.js
import Notiflix from 'notiflix';

let inited = false;
let counter = 0;
let openTimer = null;
let isOpen = false;

const open = (message = '처리 중...', type = 'circle', openDelay = 120) => {
  if (openTimer) clearTimeout(openTimer);
  openTimer = setTimeout(() => {
    if (!isOpen) {
      const fn = Notiflix.Loading[type];
      fn ? fn(message) : Notiflix.Loading.circle(message);
      isOpen = true;
    }
  }, openDelay);
};

const close = () => {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  if (isOpen) {
    Notiflix.Loading.remove();
    isOpen = false;
  }
};

const LoadingScreen = {
  init(opts = {}) {
    if (inited) return;
    Notiflix.Loading.init({
      backgroundColor: 'rgba(0,0,0,0.55)',
      svgColor: '#fff',
      clickToClose: false,
      svgSize: '72px',
      ...opts,
    });
    inited = true;
  },

  show(message = '처리 중...', type = 'circle') {
    open(message, type);
  },
  hide() {
    close();
  },

  trackStart(message = '처리 중...', type = 'circle') {
    counter += 1;
    if (counter === 1) open(message, type);
  },
  trackEnd() {
    counter = Math.max(0, counter - 1);
    if (counter === 0) close();
  },

  async withPromise(promise, { message = '처리 중...', type = 'circle' } = {}) {
    try {
      this.trackStart(message, type);
      const res = await promise;
      return res;
    } finally {
      this.trackEnd();
    }
  },
};

export default LoadingScreen;
