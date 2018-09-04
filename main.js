const {app, BrowserWindow} = require('electron')

url = require('url');
path = require('path');

let win;
let serverProc;

function runStartup() {
	createWindow();
	createProcess();
}

function runShutdown() {
	exitServerProcess();
    // on macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

function createWindow() {
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
        createWindow()
    }
})

app.on('will-quit', exitServerProcess)

function createProcess() {
	let serverAppPath = path.join(__dirname, "server", "revis-service");
	console.log("serverPath: " + serverAppPath);
	let spawn = require('child_process').spawn;
	serverProc = spawn(serverAppPath);
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
