// external libraries
var PIXI = require('pixi.js');
// Outernet's Libraries
import TextureManager from './libs/textureManager.js';

import Face from './face.js';

class Application {

  constructor() {
    // local data members
    this.counter = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.loaded = false;
    this.faces = [];
    this.images = [];
    this.currentContentIndex;
    this.wasJustNoFace = true;
    this.aspectRatio = this.width / this.height;  

    this.textureManager = new TextureManager({
      userMedia: true,
      uvTexture: false,
    });

    // binds
    this.animate                = this.animate.bind(this);
    this.texturesLoaded         = this.texturesLoaded.bind(this);
    this.onCVEvent              = this.onCVEvent.bind(this);
    this.drawGraphic            = this.drawGraphic.bind(this);
  }

  run() {
    // fetch configurations
    console.log(">> Start!");
    this.textureManager.load( this.texturesLoaded );
  }

  texturesLoaded() {
    console.log(">> Camera was loaded");
    this.loadIfReady();
  }

  loadIfReady() {
    if (this.textureManager.loaded) {
      this.load();
    }
  }

  load() {
    console.log(">> Loading Scene...");

    var w = this.width;
    var h = this.height;
    this.app = new PIXI.Application(w, h, {backgroundColor : 0x000000});
    document.body.appendChild(this.app.view);

    // initialize our scene
    this.initScene();
    this.animate();
  }

  initScene() {
    let _this = this;
    this.webcamWidth = this.textureManager.video.videoWidth;
    this.webcamHeight = this.textureManager.video.videoHeight;
    console.log("********************************");
    console.log("webcamWidth " + this.webcamWidth);
    console.log("webcamHeight " + this.webcamHeight);
    console.log("********************************");
 
    let canvas = document.createElement('canvas');
    canvas.width = this.webcamWidth;
    canvas.height = this.webcamHeight;
    this.video_context = canvas.getContext("2d");
    this.webcam_texture = PIXI.Texture.fromCanvas(this.video_context.canvas);
    this.webcam_sprite = new PIXI.Sprite(this.webcam_texture);
    this.video_context.setTransform(-1, 0, 0, 1, this.webcamWidth, 0);

    this.webcamRatio = this.webcamWidth/this.webcamHeight;
    if (this.webcamRatio < this.aspectRatio) {
        this.webcam_sprite.width = this.width;
        this.scale = this.width / this.webcamWidth;
        this.webcam_sprite.height = this.width / this.webcamRatio;
        this.webcam_sprite.y = 0 - (this.webcam_sprite.height/2 - this.height/2);
    }
    else {
        this.webcam_sprite.height = this.height;
        this.scale = this.height / this.webcamHeight;
        this.webcam_sprite.width = this.height * this.webcamRatio;
        this.webcam_sprite.x = 0 - (this.webcam_sprite.width/2 - this.width/2);
    }

    this.app.stage.addChild(this.webcam_sprite);

    this.emojiIndex = 0;
    this.graphicsFaceScaleFactor = 1.875;

    this.emojiSrcs = [
      { src: 'public/ARS_emoji_casanova.png',
        scale: 1*this.graphicsFaceScaleFactor,
        width: 436,
        height: 386,
        offsetY: 0.1
      },
      { src: 'public/ARS_emoji_chubby_bear.png',
        scale: 1*this.graphicsFaceScaleFactor,
        width: 436,
        height: 386,
        offsetY: 0.1
      },
      { src: 'public/ARS_emoji_cowboy.png',
        scale: 1*this.graphicsFaceScaleFactor,
        width: 436,
        height: 386,
        offsetY: 0.1
      },
      { src: 'public/ARS_emoji_cry_laugh.png',
        scale: 1*this.graphicsFaceScaleFactor,
        width: 436,
        height: 386,
        offsetY: 0.1
      },
      { src: 'public/ARS_emoji_froggy.png',
        scale: 1*this.graphicsFaceScaleFactor,
        width: 436,
        height: 386,
        offsetY: 0.1
      },
      { src: 'public/ARS_emoji_nerdy_mle.png',
        scale: 1*this.graphicsFaceScaleFactor,
        width: 436,
        height: 386,
        offsetY: 0.1
      },
      { src: 'public/ARS_emoji_nerdy_wom.png',
        scale: 1*this.graphicsFaceScaleFactor,
        width: 436,
        height: 386,
        offsetY: 0.1
      },
      { src: 'public/ARS_emoji_senior_mle.png',
        scale: 1*this.graphicsFaceScaleFactor,
        width: 436,
        height: 386,
        offsetY: 0.1
      },
      { src: 'public/ARS_emoji_surpised.png',
        scale: 1*this.graphicsFaceScaleFactor,
        width: 436,
        height: 386,
        offsetY: 0.1
      }
    ];

    window.addEventListener('message', this.onCVEvent);
  }

  onCVEvent(e) {

    console.log("CV EVENT TRIGGERED");
    console.log(e.data);

    if (!e || !e.data) {
      console.log("Unexpected message received", e);
      return;
    }
    if (!Array.isArray(e.data)) {
      console.log("Error: CV.data not an array", e);
      return;
    }
    var eventFaces = e.data[1].payload.currentFaces;
    if (eventFaces[0] == null) {
      console.log("Error: no face data.", e);
      return;
    }

    // clear the canvas 
    for (var i = 0; i < this.faces.length; i++) {
      if (this.faces[i].emoji) {
        this.faces[i].emoji.destroy();
      }
    };

    // reset faces
    this.faces = [];
    for (var i = 0; i < eventFaces.length; i++) {
      // convert number strings to actual numbers
      let lastPosX = 1 - Number(eventFaces[i].lastPosition[0]);
      let lastPosY = 1 - Number(eventFaces[i].lastPosition[1]);
      var lastPos = [lastPosY, lastPosX];
      this.faces.push(new Face(
          eventFaces[i].hash,
          eventFaces[i].age,
          eventFaces[i].gender,
          lastPos,
          eventFaces[i].lastTime,
          eventFaces[i].smile,
          eventFaces[i].width,
          eventFaces[i].height
      ));
    };

    var _this = this;
    this.faces.sort(_this.sortFacesByXCoord);
    for (let i = 0; i < this.faces.length; i++) {
      if (i < this.emojiSrcs.length) {
        this.drawGraphic(this.faces[i], i);
      } else {
        this.drawGraphic(this.faces[i], 0);
      }
    }
  }

  sortFacesByXCoord(a,b) {
    if (a.lastPosition[0] < b.lastPosition[0])
      return -1;
    if (a.lastPosition[0] > b.lastPosition[0])
      return 1;
    return 0;
  }

  shuffleGraphics(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  drawGraphic(face, num) {
    var _this = this;

    face.emoji = PIXI.Sprite.fromImage(_this.emojiSrcs[num].src);
    face.emoji.anchor.set(0, 0);
    this.app.stage.addChild(face.emoji);

    let w = face.width*this.webcamWidth*this.scale;
    let h = face.height*this.webcamHeight*this.scale;
    let spriteW = w;
    let spriteH = spriteW * this.emojiSrcs[num].height / this.emojiSrcs[num].width;

    face.emoji.width = spriteW;
    face.emoji.height = spriteH;
    if (this.emojiSrcs[num].hasOwnProperty('scale')) {
      face.emoji.width *= this.emojiSrcs[num].scale;
      face.emoji.height *= this.emojiSrcs[num].scale;
    }

    let x = this.webcam_sprite.x + face.lastPosition[0]*this.webcamWidth*this.scale - face.emoji.width/2;
    let y = this.webcam_sprite.y + face.lastPosition[1]*this.webcamHeight*this.scale - h/2;

    face.emoji.x = x;
    face.emoji.y = y-60;

    if (this.emojiSrcs[num].hasOwnProperty('offsetX')) {
      face.emoji.x += this.emojiSrcs[num].offsetX * w;
    }
    if (this.emojiSrcs[num].hasOwnProperty('offsetY')) {
      face.emoji.y += this.emojiSrcs[num].offsetY * h;
    }
  }

  animate() {

    this.video_context.drawImage(this.textureManager.video, 0, 0, this.webcamWidth, this.webcamHeight);
    this.webcam_texture.update();    

    this.counter++;
    requestAnimationFrame(this.animate);

    if (this.counter % 400 == 0) {
      this.shuffleGraphics(this.emojiSrcs);
    }
  }
}

var app = new Application();
app.run();