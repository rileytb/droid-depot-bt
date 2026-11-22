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

async function writeHex(hex) {
  const data = fromHexString(hex);
  if (writeC.properties.writeWithoutResponse) {
    await writeC.writeValueWithoutResponse(data);
  } else {
    await writeC.writeValue(data);
  }
}

document.getElementById('connect-button').addEventListener('click', async function () {
  try {
    // Prefer a name filter when possible; fall back to acceptAllDevices for
    // browsers that no longer surface the DROID advertisement reliably.
    let device;
    try {
      device = await navigator.bluetooth.requestDevice({
        optionalServices: [serviceUuid],
        filters: [{ name: 'DROID' }],
      });
    } catch (filterError) {
      console.log('Name filter failed, falling back to acceptAllDevices:', filterError);
      device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [serviceUuid],
      });
    }

    console.log('Connecting to GATT Service...');
    progressStep();
    const server = await device.gatt.connect();

    console.log('Getting Droid...');
    progressStep();
    const service = await server.getPrimaryService(serviceUuid);

    console.log('Getting Characteristics...');
    progressStep();
    const characteristics = await service.getCharacteristics();

    const notifyChar = characteristics.find((c) => c.uuid === notificationUuid);
    const writeChar = characteristics.find((c) => c.uuid === writeUuid);

    if (notifyChar) {
      await handleNotificationCharacteristic(notifyChar);
    }

    if (writeChar) {
      writeC = writeChar;
      await initialWrites();
    } else {
      throw new Error('Write characteristic not found');
    }
  } catch (error) {
    console.log('Argh! ' + error);
    clearProgress();
    setErrorText();
  }
});

async function initialWrites() {
  await sleep(1500);
  await writeHex('222001');
  await sleep(1500);
  await writeHex('222001');
  await sleep(1500);
  await writeHex('222001');
  await sleep(1500);
  await writeHex('222001');
  await sleep(1500);
  await writeHex('27420f4444001f00');
  await sleep(1500);
  await writeHex('27420f4444001802');
  await sleep(1500);
  await writeHex('27420f4444001f00');
  await sleep(1500);
  await writeHex('27420f4444001802');
  await sleep(2000);
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

function progressStep() {
  currentStep++;
  clearErrorText();
  if (document.getElementsByClassName('status-light')[currentStep]) {
    const currentStepItem = document.getElementsByClassName('status-light')[currentStep];
    currentStepItem.classList.add('status-light-active');
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
  document.getElementById('error-text').textContent = 'Error connecting to droid...';
}

function clearErrorText() {
  document.getElementById('error-text').textContent = '';
}
