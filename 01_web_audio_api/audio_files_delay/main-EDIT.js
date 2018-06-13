// define variables

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

var snareDelay = audioCtx.createDelay(5.0);

var gainNode = audioCtx.createGain();
gainNode.gain.setValueAtTime(.5, audioCtx.currentTime);

var destination = audioCtx.destination;

// get references to controls
var playSnare = document.querySelector('.play-snare');
var playLoop = document.querySelector('.play-snare-loop');
var rangeSnare = document.querySelector('input');
var delayTimeDisplay = document.querySelector('.delay-value');

// use XHR to load audio tracks, and
// decodeAudioData to decode them and stick them in buffers.
// Then we put the buffers into their sources
var buffers = [];
function getData(track) {
  var request = new XMLHttpRequest();
  request.open('GET', track , true);
  request.responseType = 'arraybuffer';


  request.onload = function() {
    audioCtx.decodeAudioData(request.response, function(buffer) {
        myBuffer = buffer;
        buffers.push(myBuffer);
      },

      function(e){"Error with decoding audio data" + e.err});

  }

  request.send();
}

// get the data samples
getData('snare.ogg');
// getData('kick.ogg');

// wire up buttons to stop and play audio.
// Because buffer sources are only a one shot
// playing method, you have to create a new one
// each time you play the sound.
var snareSource;

playSnare.onclick = function() {
  snareSource = audioCtx.createBufferSource();
  snareSource.buffer = buffers[0];
  snareSource.start();
  snareSource.connect(destination);
  snareSource.connect(snareDelay);
  snareDelay.connect(gainNode);
  gainNode.connect(destination);
}

playLoop.onclick = function() {
  var active = playLoop.getAttribute('data-active');
  if(active == 'false') {
    playLoop.setAttribute('data-active', 'true');
    playLoop.innerHTML = 'Stop loop';

    snareSource = audioCtx.createBufferSource();
    snareSource.buffer = buffers[0];
    snareSource.loop = true;
    snareSource.start();
    snareSource.connect(destination);
    snareSource.connect(snareDelay);
    snareDelay.connect(gainNode);
    gainNode.connect(destination);
  } else if(active == 'true') {
    playLoop.setAttribute('data-active', 'false');
    playLoop.innerHTML = 'Play loop';

    snareSource.disconnect(destination);
    snareSource.disconnect(snareDelay);
    snareDelay.disconnect(gainNode);
    gainNode.disconnect(destination);
    snareSource.stop();
  }
}

var delay;

// slider interaction
rangeSnare.oninput = function() {
  var delay = rangeSnare.value;
  snareDelay.delayTime.setValueAtTime(delay, audioCtx.currentTime);
  delayTimeDisplay.innerHTML = delay;
}