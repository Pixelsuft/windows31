const { app, BrowserWindow, electron, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
var server_compiled=true;
let mainWindow;
var in_fullscreen=false; //do not change
var screen_w=0;
var screen_h=0;
var resize_first=false;
var type_start=0;

const createWindow = function() {
	mainWindow = new BrowserWindow({
	width: 300,
	height: 350,
	icon: __dirname + '/src/icon.ico',
	titleBarStyle: "hidden",
	transparent: true,
	frame: false,
	darkTheme: false,
	center: true,
	minWidth: 300,
	minHeight: 200,
	resizable: true,
	title: "windows31",
	webPreferences: {
		nodeIntegration: true,
		nodeIntegrationInWorker: false,
		enableRemoteModule: true,
		javascript: true,
		webSecurity: false,
		nativeWindowOpen: true
	}
});
	mainWindow.loadFile(__dirname + '/loader.html');
	//mainWindow.webContents.openDevTools();
	var executablePath = 'server';
	if(server_compiled==false)executablePath = 'python server/server.py';
	var child = require('child_process').exec;
	child(executablePath, function (err, data) {
		if (err) {
			console.error(err);
			return;
		}
	});
	const urlExist = require("url-exist");
	(async () => {
	const exists = await urlExist("http://127.0.0.1:5000/");
	mainWindow.loadURL('http://127.0.0.1:5000/')
	})();
};
function creator(){
	createWindow();
	const template=[
	{
		label: "windows31",
		submenu: [
			{
				label: "Quit",
				click: function(){
					const { exec } = require('child_process');
					if(server_compiled==true){
						exec('taskkill /f /t /im server.exe', (err, stdout, stderr) => {
							if (err) {
								console.log(err);
								return;
							}
						});
					}
					else{
						exec('taskkill /f /t /im python.exe', (err, stdout, stderr) => {
							if (err) {
								console.log(err);
								return;
							}
						});
					}
					app.quit();
				}
			}
		]
	},
	{
		label: "View",
		submenu: [
			{
    label: "Toggle Full Screen",
    accelerator: function () {
      if (process.platform === "darwin") {
        return "Ctrl+Command+F";
      } else {
        return "F11";
      }
    }(),
    click: function () {
      if(in_fullscreen==false) {
				mainWindow.setBounds({ x: 0, y: 0, width: screen_w, height: screen_h });
				in_fullscreen=true;
			}
			else {
				mainWindow.setBounds({ x: screen_w/2-512, y: screen_h/2-384, width: 1024, height: 768 });
				in_fullscreen=false;
			}
    }
  }, {
    label: "Toggle Developer Tools",
    accelerator: function () {
      if (process.platform === "darwin") {
        return "Alt+Command+I";
      } else {
        return "Ctrl+Shift+I";
      }
    }(),
    click: function () {
        mainWindow.webContents.toggleDevTools();
    }
  }, {
    type: "separator"
  }, {
    type: "separator"
  },{
    role: "forcereload",
	label: "Reload",
	accelerator: "Ctrl+R"
  }
		]
	},
	{
		label: "Machine",
		submenu: [
			{
				label: "Start / Stop",
				click: function(){
					if(type_start==0)mainWindow.webContents.send('start-emulation');
					else if(type_start==2)mainWindow.webContents.send('stop');
					else dialog.showErrorBox("Error!", "Machine is starting!");
				}
			},
			{
				label: "Pause / Run",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('pause');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			},
			{
				label: "Reset",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('reset');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			},
			{
				label: "Lock mouse",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('lock-mouse');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			},
			{
				label: "Save state",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('save-state');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			},
			{
				label: "Load state",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('load-state');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			}
		]
	},
	{
		label: "Keyboard",
		submenu: [
			{
				label: "Ctrl+Alt+Delete",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('ctrlaltdel');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			},
			{
				label: "Alt+F4",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('altf4');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			},
			{
				label: "Escape",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('esc');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			}
		]
	},
	{
			label: "Scale",
			submenu: [
				{
					label: "Zoom scale",
					click: function(){
						if(type_start==2)mainWindow.webContents.send('zoom-scale');
						else dialog.showErrorBox("Error!", "Machine is not started!");
					}
				},
				{
					label: "Reset scale",
					click: function(){
						if(type_start==2)mainWindow.webContents.send('reset-scale');
						else dialog.showErrorBox("Error!", "Machine is not started!");
					}
				},
				{
					label: "Unzoom scale",
					click: function(){
						if(type_start==2)mainWindow.webContents.send('unzoom-scale');
						else dialog.showErrorBox("Error!", "Machine is not started!");
					}
				}
			]
	},
	{
		label: "Screen",
		submenu: [
			{
				label: "Take ScreenShot",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('take-screenshot');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			},
			{
				label: "Take TextShot",
				click: function(){
					if(type_start==2)mainWindow.webContents.send('take-textshot');
					else dialog.showErrorBox("Error!", "Machine is not started!");
				}
			}
		]
	},
	{
		label: "Links",
		submenu: [
			{
				label: "GitHub",
				click: function(){
					shell.openExternal('https://github.com/Pixelsuft/windows31');
				}
			},
			{
				label: "windows95",
				click: function(){
					shell.openExternal('https://github.com/felixrieseberg/windows95');
				}
			},
			{
				label: "Copy",
				click: function(){
					shell.openExternal('http://copy.sh/v86/');
				}
			},
			{
				label: "Copy GitHub",
				click: function(){
					shell.openExternal('https://github.com/copy/v86');
				}
			},
			{
				label: "Electron JS",
				click: function(){
					shell.openExternal('https://www.electronjs.org/');
				}
			}
		]
	}
];
Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};
app.whenReady().then(creator);
app.on('window-all-closed', function() {
	const { exec } = require('child_process');
	if(server_compiled==true){
		exec('taskkill /f /t /im server.exe', (err, stdout, stderr) => {
			if (err) {
				console.log(err);
				return;
			}
		});
	}
	else{
		exec('taskkill /f /t /im python.exe', (err, stdout, stderr) => {
			if (err) {
				console.log(err);
				return;
			}
		});
	}
	app.quit();
});
app.on('window-all-closed', function() {
	app.quit();
});
app.on('activate', function() {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.on('set-size', function(event, screen_width, screen_height){
	screen_w=screen_width;
	screen_h=screen_height;
	type_start=0;
	if(resize_first==false)
	{
		mainWindow.setBounds({ x: screen_width/2-512, y: screen_height/2-384, width: 1024, height: 768 });
		resize_first=true;
	}
});
ipcMain.on('in-loading', function(){
	type_start=1;
});
ipcMain.on('in-started', function(){
	type_start=2;
});
ipcMain.on('link-copied', function(){
	const options = {
		type: 'info',
		buttons: ['Ok!'],
		defaultId: 0,
		title: 'Information!',
		message: 'Image link copied to clipboard.\nOpen browser and paste link.'
	};
	dialog.showMessageBox(null, options);
});