import Timeout from './Timeout';

export class Slide {
  container: Element;
  slides: Element[];
  controls: Element;
  time: number;
  index: number;
  slide: Element;
  timeout: Timeout | null;
  pausedTimeout: Timeout | null;
  paused: boolean;
  thumbItems: HTMLElement[] | null;
  thumb: HTMLElement | null;
  audioBtn: HTMLElement | null;
  constructor(
    container: Element,
    slides: Element[],
    controls: Element,
    time: number = 5000,
  ) {
    this.container = container;
    this.slides = slides;
    this.controls = controls;
    this.time = time;

    this.index = Number(window.localStorage.getItem('activeSlide')) || 0;
    this.slide = this.slides[this.index];
    this.timeout = null;
    this.paused = false;
    this.pausedTimeout = null;
    this.thumbItems = null;
    this.thumb = null;
    this.audioBtn = null;

    this.init();
  }

  addAudioBtn(video: HTMLVideoElement) {
    this.audioBtn = document.createElement('button');
    this.audioBtn.classList.add('audio-btn');
    this.audioBtn.setAttribute('aria-label', 'Toggle Audio');
    const iconContainer = document.createElement('div');
    const icon = document.createElement('img');
    icon.src = 'assets/sound-off.svg';
    icon.setAttribute('aria-label', 'Audio is muted');
    iconContainer.appendChild(icon);
    this.audioBtn.appendChild(iconContainer);
    this.audioBtn.addEventListener('pointerup', () => {
      if (!this.paused) {
        video.muted = !video.muted;
        icon.src = video.muted ? 'assets/sound-off.svg' : 'assets/sound-on.svg';
        const aria = video.muted ? 'Audio is muted' : 'Audio is playing';
        icon.setAttribute('aria-label', aria);
      }
    });
    this.controls.appendChild(this.audioBtn);
  }

  auto(time: number) {
    this.timeout?.clear();
    this.timeout = new Timeout(() => this.next(), time);

    if (this.slide instanceof HTMLVideoElement) {
      this.addAudioBtn(this.slide);
    }

    if (this.thumbItems) {
      this.thumb = this.thumbItems[this.index];
      this.thumbItems.forEach(thumb => this.hide(thumb));
      this.thumb.classList.add('active');
      this.thumb.style.animationDuration = `${time}ms`;
    }
    if (this.thumb) {
      this.thumb.style.animationDuration = `${time}ms`;
    }
  }

  autoVideo(video: HTMLVideoElement) {
    video.muted = true;
    video.play();
    let firstPlay = true;
    video.addEventListener('playing', () => {
      if (firstPlay) {
        this.auto(video.duration * 1000);
        firstPlay = false;
      }
    });
  }

  hide(element: Element) {
    element.classList.remove('active');
    if (element instanceof HTMLVideoElement) {
      element.currentTime = 0;
      element.pause();
      this.audioBtn?.remove();
    }
  }

  show(index: number) {
    // active slide
    this.slide = this.slides[index];
    localStorage.setItem('activeSlide', this.index.toString());

    this.slides.forEach(slide => this.hide(slide));
    this.slide.classList.add('active');

    // set the timer to the next slide
    if (this.slide instanceof HTMLVideoElement) {
      this.autoVideo(this.slide);
    } else {
      this.auto(this.time);
    }
  }

  prev() {
    if (this.paused) return;
    this.index = this.index === 0 ? this.slides.length - 1 : this.index - 1;
    this.show(this.index);
  }

  next() {
    if (this.paused) return;
    this.index = this.index === this.slides.length - 1 ? 0 : this.index + 1;
    this.show(this.index);
  }

  pause() {
    document.body.classList.add('paused');
    this.pausedTimeout = new Timeout(() => {
      this.timeout?.pause();
      this.paused = true;
      this.thumb?.classList.add('paused');
      if (this.slide instanceof HTMLVideoElement) {
        this.slide.pause();
        if (this.audioBtn) this.audioBtn.style.opacity = '0';
      }
    }, 300);
  }

  continue() {
    document.body.classList.remove('paused');
    this.pausedTimeout?.clear();
    if (this.paused) {
      this.paused = false;
      this.timeout?.continue();
      this.thumb?.classList.remove('paused');
      if (this.slide instanceof HTMLVideoElement) {
        this.slide.play();
        if (this.audioBtn) this.audioBtn.style.opacity = '1';
      }
    }
  }

  private addControls() {
    // create buttons
    const prevBtn = document.createElement('button');
    const nextBtn = document.createElement('button');
    prevBtn.textContent = 'Previous Slide';
    nextBtn.textContent = 'Next Slide';
    this.controls.append(prevBtn, nextBtn);
    // pause and continue
    this.controls.addEventListener('pointerdown', () => this.pause());
    document.addEventListener('pointerup', () => this.continue());
    document.addEventListener('touchend', () => this.continue());
    // go to the next and previous slides
    prevBtn.addEventListener('pointerup', () => this.prev());
    nextBtn.addEventListener('pointerup', () => this.next());
  }

  private addThumbItems() {
    const thumbContainer = document.createElement('div');
    thumbContainer.id = 'slide-thumb';
    this.slides.forEach(_ => {
      thumbContainer.innerHTML += `<div><div class="thumb-item"></div></div>
      `;
    });
    this.controls.appendChild(thumbContainer);
    this.thumbItems = Array.from(document.querySelectorAll('.thumb-item'));
  }

  private init() {
    this.addControls();
    this.addThumbItems();
    this.show(this.index);
  }
}
