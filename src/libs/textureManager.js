var PIXI = require('pixi.js');

class TextureManager {
  constructor(options) {
    this.options = options;
    this.loaded = false;

    this.textures = [];
    this.texture = null;

    this.highResVideoLoaded = false;
    this.lowResVideoLoaded = false;

    // binds
    this.load = this.load.bind(this);
    this.error = this.error.bind(this);
    this.success = this.success.bind(this);
  }

  success(stream, callback) {
    this.video = document.createElement('video');
    this.video.src = window.URL.createObjectURL(stream);
    document.body.appendChild(this.video);
    this.video.style.display = 'none';

    this.video.onloadedmetadata = (e) => {
      this.video.play();
      this.highResVideoLoaded = true;
      this.videosLoaded(callback);
    };

    // set the texture
    //let userMediaTexture = PIXI.Texture.fromVideoUrl(this.video.src);
    //this.textures.push(userMediaTexture);

    // set uv texture
    if (this.options["uvTexture"]) {
      //let uvTexture = new THREE.TextureLoader().load('public/uv.jpg');
      //this.textures.push(uvTexture);
    }

    // =========== DEBUG =========
    //this.texture = userMediaTexture;
    // =========== DEBUG =========

  }

  videosLoaded(callback) {
    if (this.highResVideoLoaded) {
      this.loaded = true;
      callback();
    }
  }

  error(err) {
    console.error(err);
  }

  load(callback) {

    // load userMedia if one was requested
    if (this.options["userMedia"] && navigator.getUserMedia) {    
      navigator.getUserMedia({ video: true }, (stream) => {
        this.success(stream, callback);
      },
        this.error);
    } else {
      error('getUserMedia not supported');
    }
  }


}

export default TextureManager;