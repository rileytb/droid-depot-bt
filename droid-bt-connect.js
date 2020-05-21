function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

var writeC;
const serviceUuid = '09b600a0-3e42-41fc-b474-e9c0c8f0c801';
const notificationUuid = '09b600b0-3e42-41fc-b474-e9c0c8f0c801';
const writeUuid = '09b600b1-3e42-41fc-b474-e9c0c8f0c801';

const fromHexString = (hexString) =>
  new Uint8Array(
    hexString
      .replace(/\s+/g, '')
      .match(/.{1,2}/g)
      .map((byte) => parseInt(byte, 16))
  );

document.getElementById('ble').addEventListener('click', function () {
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
      return device.gatt.connect();
    })
    .then((droid) => {
      console.log('Getting Droid...');
      return droid.getPrimaryService(serviceUuid);
    })
    .then((service) => {
      console.log('Getting Characteristics...');

      return service.getCharacteristics();
    })
    .then((characteristics) => {
      characteristics.forEach((c) => {
        if (c.uuid === notificationUuid) {
          return handleNotificationCharacteristic(c);
        } else if (c.uuid === writeUuid) {
          writeC = c;
          return initialWrites();
        }
      });
    })
    .catch((error) => {
      console.log('Argh! ' + error);
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
  await sleep(10);
  await writeC.writeValue(fromHexString('27420f4444001802'));
  await sleep(500);
  await writeC.writeValue(fromHexString('27420f4444001f00'));
  await sleep(10);
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
}
