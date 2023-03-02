import { Slide } from './Slide';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <div id="slide">
      <div id="slide-elements">        
        <img src="assets/image1.jpg"/>        
        <img src="assets/image2.jpg"/>
        <img src="assets/image3.jpg"/>        
        <video playsinline src="assets/video.mp4"></video>        
      </div>
      <div id="slide-controls"></div>
    </div>
    <footer>Made with &#9825; by <a href="https://github.com/julianachagas" target="_blank">Juliana Chagas</a></footer>
  </div>
`;

const slideContainer = document.getElementById('slide');
const elements = document.getElementById('slide-elements');
const controls = document.getElementById('slide-controls');

if (slideContainer && elements && controls && elements.children.length > 0) {
  new Slide(slideContainer, Array.from(elements.children), controls, 3000);
}
