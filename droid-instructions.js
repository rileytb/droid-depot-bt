const powerFull = 'FF';
const powerStop = '00';
const motorLeft = 0;
const motorRight = 1;
const motorHead = 2;
const directionForward = '0';
const directionBackward = '8';

const soundBanks = ['00', '01', '02', '03', '04', '05', '06', '07', '0A'];

const soundCodes = ['00', '01', '02', '03', '04'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// common sending functions
function playRandomSound() {
  var bankCode = soundBanks[randomIntFromInterval(0, soundBanks.length)];
  var soundCode = soundCodes[randomIntFromInterval(0, soundCodes.length)];

  return sendBank(bankCode).then(() => {
    return playSound(soundCode);
  });
}

function sendBank(e) {
  return (
    (this.selectedBank = e),
    this.writeC
      .writeValue(fromHexString(`2742 0F44 4400 1F${e}`))
      .catch((e) => (this.error = JSON.stringify(e)))
  );
}

function playSound(e) {
  return this.writeC
    .writeValue(fromHexString(`2742 0F44 4400 18${e}`))
    .catch((e) => (this.error = JSON.stringify(e)));
}

function sendMovement(direction, motor, power) {
  return this.writeC
    .writeValue(
      fromHexString(`2942 0546 ${direction}${motor}${power} 012C 0000`)
    )
    .catch((e) => (this.error = JSON.stringify(e)));
}

function pulseMotor(motor, length, direction) {
  return this.sendMovement(
    direction || directionForward,
    motor,
    powerFull
  ).then(() => {
    return window.setTimeout(() => {
      return this.sendMovement(direction || directionForward, motor, powerStop);
    }, length || 200);
  });
}

// basic movement functions
function rotateLeft() {
  return pulseMotor(motorRight, 200, directionForward);
}

function rotateRight() {
  return pulseMotor(motorLeft, 200, directionForward);
}

//todo figure out the head motor commands
function rotateHeadLeft() {
  return pulseMotor(motorHead);
}

function rotateHeadRight() {
  return pulseMotor(motorHead, 500, directionBackward);
}

function ahead() {
  // return jo(this, void 0, void 0, (function* () {
  //     yield this.sendMovement(1, 0, "80"),
  //         yield zo(10),
  //         yield this.sendMovement(0, 0, "80")
  // }
  // ))
}

function back() {
  // return jo(this, void 0, void 0, (function* () {
  //     yield this.sendMovement(1, 8, "80"),
  //         yield zo(10),
  //         yield this.sendMovement(0, 8, "80")
  // }
  // ))
}

async function stop() {
  //     // return jo(this, void 0, void 0, (function* () {
  //     //     yield this.sendMovement(0, 0, "00"),
  //     //         yield zo(10),
  //     //         yield this.sendMovement(1, 0, "00"),
  //     //         yield zo(10),
  //     //         yield this.sendMovement(2, 0, "00"),
  //     //         yield zo(10)
  //     // }
  //     // ))
  //     this.sendMovement(motorRight, directionForward, powerStop).then(() => {
  //         await sleep(10);
  //         this.sendMovement(motorLeft, directionForward, powerStop).then(() => {
  //             await sleep(10);
  //             this.sendMovement(motorHead, directionForward, powerStop);
  //         });
  //     });
}

var soundWaitTime = 15;
function getSoundTimeout() {
  var count = document.getElementById('timeout-input').value;
  soundWaitTime = count;
}

var interval = null;
async function droidCommands() {
  getSoundTimeout();
  playRandomSound();

  if (interval) {
    window.clearInterval(interval);
  }

  if (progressLightInterval) {
    window.clearInterval(progressLightInterval);
  }

  setProgressBarState();

  interval = window.setInterval(() => {
    playRandomSound().then(() => {
      setProgressBarState();
    });
  }, soundWaitTime * 1000);
}

document
  .getElementById('initiate-button')
  .addEventListener('click', function () {
    droidCommands();
  });

var activeLight = -1;
var progressLightInterval;

function setProgressBarState() {
  var lights = document.getElementsByClassName('progress-light');
  clearProgressBarState();
  incrementLight();

  progressLightInterval = window.setInterval(() => {
    incrementLight();
  }, (soundWaitTime * 1000) / lights.length); //cleared after last 1
}

function clearProgressBarState() {
  var lights = document.getElementsByClassName('progress-light');

  window.clearInterval(progressLightInterval);
  activeLight = lights.length - 1;

  for (let light of lights) {
    light.classList.remove('progress-light-active');
    light.classList.remove('progress-light-pulse');
  }
}

function incrementLight() {
  var lights = document.getElementsByClassName('progress-light');
  
  if (lights[activeLight]) {
    lights[activeLight].classList.add('progress-light-pulse');
    lights[activeLight].classList.add('progress-light-active');
  }

  if (lights[activeLight + 1]) {
    lights[activeLight + 1].classList.remove('progress-light-pulse');
  }

  activeLight--;
}
