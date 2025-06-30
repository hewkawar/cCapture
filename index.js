const usb = require('usb');
const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const config = require('./config.json');

const availableWebcams = [];

// Helper function to get string descriptor by index
function getString(device, index) {
    return new Promise((resolve, reject) => {
        device.getStringDescriptor(index, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

async function listVideoDevices() {
    const devices = usb.getDeviceList();

    for (const device of devices) {
        try {
            const descriptor = device.deviceDescriptor;

            // Look for video class devices
            const isVideo =
                descriptor.bDeviceClass === 0x0e || // Some webcams
                device.configDescriptor?.interfaces?.some(iface =>
                    iface.some(i => i.bInterfaceClass === 0x0e)
                );

            if (!isVideo) continue;

            device.open(); // Required before reading descriptors

            const vendor = await getString(device, descriptor.iManufacturer);
            const product = await getString(device, descriptor.iProduct);
            const serial = await getString(device, descriptor.iSerialNumber);

            console.log(`Device found:`);
            console.log(`  Vendor: ${vendor}`);
            console.log(`  Product: ${product}`);
            console.log(`  Serial: ${serial}`);

            availableWebcams.push({
                vendor,
                product,
                serial,
                device
            });

            device.close();
        } catch (err) {
        }
    }

    if (availableWebcams.length === 0) {
        console.log('No video devices found.');

        process.exit(1);
    } else {
        console.log(`Found ${availableWebcams.length} video device(s)`);

        await saveEnv();

        app.whenReady().then(createScreen);
    }
}

async function createScreen() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
        },
        fullscreenable: true,
        fullscreen: true,
        autoHideMenuBar: true,
    });

    win.loadFile('index.html');
}

async function saveEnv() {
    process.env.CCAPTURE_WIDTH = config.width || 1920;
    process.env.CCAPTURE_HEIGHT = config.height || 1080;
    process.env.CCAPTURE_FPS = config.fps || 50;
    process.env.CCAPTURE_ZOOM = config.zoom || 100;
}

listVideoDevices();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});