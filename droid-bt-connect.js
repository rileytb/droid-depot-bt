function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

var writeC;
const serviceUuid = '09b600a0-3e42-41fc-b474-e9c0c8f0c801';
const notificationUuid = '09b600b0-3e42-41fc-b474-e9c0c8f0c801';
const writeUuid = '09b600b1-3e42-41fc-b474-e9c0c8f0c801';
var currentStep = -1;

const fromHexString = (hexString) =>
  new Uint8Array(
    hexString
      .replace(/\s+/g, '')
      .match(/.{1,2}/g)
      .map((byte) => parseInt(byte, 16))
  );

document.getElementById('connect-button').addEventListener('click', function () {
  navigator.bluetooth
    .requestDevice({
      optionalServices: [serviceUuid],
      filters: [
        {
          name: 'DROID',
        },
      ],
    })
    .then((device) => {
      console.log('Connecting to GATT Service...');
      progressStep();
      return device.gatt.connect();
    })
    .then((droid) => {
      console.log('Getting Droid...');
      progressStep();
      return droid.getPrimaryService(serviceUuid);
    })
    .then((service) => {
      console.log('Getting Characteristics...');
      progressStep();
      return service.getCharacteristics();
    })
    .then((characteristics) => {
      characteristics.forEach((c) => {
        if (c.uuid === notificationUuid) {
          return handleNotificationCharacteristic(c);
        } else if (c.uuid === writeUuid) {
          writeC = c;
          return initialWrites().catch(error => console.log(error));
        }
      });
    })
    .catch((error) => {
      console.log('Argh! ' + error);
      clearProgress()
      setErrorText()
    });
});

async function initialWrites() {
  await writeC.writeValue(fromHexString('222001'));
  await sleep(500);
  await writeC.writeValue(fromHexString('222001'));
  await sleep(500);
  await writeC.writeValue(fromHexString('222001'));
  await sleep(500);
  await writeC.writeValue(fromHexString('222001'));
  await sleep(500);
  await writeC.writeValue(fromHexString('27420f4444001f00'));
  await sleep(500);
  await writeC.writeValue(fromHexString('27420f4444001802'));
  await sleep(500);
  await writeC.writeValue(fromHexString('27420f4444001f00'));
  await sleep(500);
  await writeC.writeValue(fromHexString('27420f4444001802'));
  await sleep(1000);
  return writeC;
}
async function handleNotificationCharacteristic(c) {
  c = await c.startNotifications();
  return c.addEventListener(
    'characteristicvaluechanged',
    handleCharacteristicValueChanged
  );
}

function handleCharacteristicValueChanged(event) {
  var value = event.target.value;
  console.log('Received ' + JSON.stringify(value));
  progressStep();
}

var time = Math.random();
// var red = document.querySelector('#red');
// red.style.setProperty('--animation-time', time +'s');

function progressStep() {
  currentStep++;
  clearErrorText();
  if (document.getElementsByClassName('status-light')[currentStep]) {
    const currentStepItem = document.getElementsByClassName('status-light')[currentStep];
    currentStepItem.classList.add("status-light-active");
    currentStepItem.style.setProperty('--animation-time', time + 's');
  }
}

function clearProgress() {
  currentStep = -1;
  var list = document.getElementsByClassName('status-light');

  for (let light of list) {
    light.classList.remove('status-light-active');
  }
}

function setErrorText() {
  document.getElementById("error-text").textContent = "Error connecting to droid...";
}

function clearErrorText() {
  document.getElementById("error-text").textContent = "";
}
