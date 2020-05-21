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
  return pulseMotor(motorRight, 200, directionBackward);
}

function rotateRight() {
  return pulseMotor(motorLeft, 200, directionBackward);
}

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

// const hex = document.getElementById('hex').value;
// writeC.writeValue(fromHexString(hex)).then(console.log).catch(console.log);
var interval;

async function droidCommands() {
  // if(interval) {
  //   window.clearInterval(interval);
  // }

  await playRandomSound().catch((e) => {console.log(e)})
  // await rotateHeadRight().catch((e) => {console.log(e)})
  // await rotateHeadLeft().catch((e) => {console.log(e)})
  await rotateLeft()
  await rotateRight()
  // interval = window.setInterval(() => {
  //   await playRandomSound()
  //   await rotateHeadRight()
  //   await rotateHeadLeft()
  // }, 10000)
}

document.getElementById('send').addEventListener('click', function () {
  // rotateHeadLeft().then(() => {
  //   window.setTimeout(() => {
  //     rotateHeadRight();
  //   }, 500);
  //   playRandomSound();
  // });
  // playRandomSound().then(() => {
  //   rotateHeadRight().then(()=> {
  //     rotateHeadLeft();
  //   })
  // })
  droidCommands()



  // rotateHeadRight()
  // rotateHeadLeft()
  // rotateHeadLeft().then(() => {
  //   rotateHeadRight();

  // });

  // rotateLeft().then(() => {
  //   rotateRight();
  // });
});
