// Reduce video volume
function reduceVolume() {
  let vid1 = document.getElementById('vid1');
  if (vid1) {
    vid1.volume = 0.20;
  } else {
    console.warn('Warning: No Video 1!');
  }

  let vid2 = document.getElementById('vid2');
  if (vid2) {
    vid2.volume = 0.50;
  } else {
    console.warn('Warning: No Video 2!');
  }

  let vid3 = document.getElementById('vid3');
  if (vid3) {
    vid3.volume = 1.00;
  } else {
    console.warn('Warning: No Video 3!');
  }
}

// Do we have videos?
const areVideos = document.getElementById('videos');

if (areVideos) {
  reduceVolume();
  console.log('Reduced volume of one or more videos');
} else {
  throw new Error('No videos <div>!');
}
