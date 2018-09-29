const {app, BrowserWindow} = require('electron')

let portastic = require('portastic');

url = require('url');
path = require('path');

require('electron-context-menu')();

let win;
let serverProc;

function runStartup() {
	let preferredPort = 63799;
	// Test if preferred port is open
	portastic.test(preferredPort)
	.then(function(isOpen) {
		if (isOpen) {
			let strPort = preferredPort + '';
			createWindow(strPort);
			createProcess(strPort);
		} else {
			// Finds an open port
			portastic.find({
				min: 61001,
				max: 65535,
				retrieve: 1
			})
			.then(function(ports) {
				if (ports && ports[0]) {
					strPort = ports[0] + '';
					createWindow(strPort);
					createProcess(strPort);
				} else {
					console.log("Error: could not find valid open port");
					process.exit(1);
				}
			});
		}
	});
}

function runShutdown() {
	exitServerProcess();
    // on macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

function createWindow(port) {
    win = new BrowserWindow({
		width: 1280,
		height: 960,
		webPreferences: {webSecurity: false}
	});

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'dist', 'revis', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // uncomment below to open devtools
	//win.webContents.openDevTools()
	
	win.webContents.on('did-finish-load', () => {
		win.webContents.send("port", port);
	});

    // Event when window is closed
    win.on('closed', function() {
        win = null
    })
}

// Create window on electron initialization
app.on('ready', runStartup)

app.on('window-all-closed', runShutdown)

app.on('activate', function() {
    // macOS specific close process
    if (win === null) {
		//createWindow()
		runStartup();
    }
})

app.on('will-quit', exitServerProcess)

function createProcess(port) {
	let serverAppPath = path.join(__dirname, "server", "revis-service");
	console.log("serverPath: " + serverAppPath);
	let spawn = require('child_process').spawn;
	serverProc = spawn(serverAppPath, ['-port=' + port]);
	serverProc.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`);
	});
	if (serverProc != null) {
		console.log("server process launched");
	}
}

function exitServerProcess() {
	serverProc.kill();
	serverProc == null;
}
