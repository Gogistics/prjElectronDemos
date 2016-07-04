/*main.js for app*/
//set const & var
const   path = require('path'),
        electron = require('electron'),
        app = electron.app,
        browser_window = electron.BrowserWindow,
        auto_updater = require('./auto_updater'),
        debug = /--debug/.test(process.argv[2]);
        
// set window
var main_window = null,
    inserted_window = null;
    
// pre-definie app name
if (process.mas) app.setName('Chains Wallet');

// set init function
function init_app(){
    function create_window(){
        // set options
        var window_options = {
            width: 1080,
            min_width: 680,
            height: 840,
            min_height: 400,
            title: app.getName(),
            icon: __dirname + '/images/chains_icon_1.png',
            // frame: false
        };
        main_window = new browser_window(window_options);
        
        // set overlay icon
        // main_window.setOverlayIcon( __dirname + '/images/changes.png', "unsaved changes");
        
        // set load url
        main_window.loadURL('file://' + __dirname + '/templates/index.html');
        // alternative:
        // mainWindow.loadURL(path.join('file://', __dirname, '/templates/index.html'));
        
        // launch full-screen with deve-tools if there are any bugs
        if(debug){
            main_window.webContents.openDevTools();
            main_window.maximize();
        }
        main_window.webContents.on('did-finish-load', function(){
            main_window.webContents.send('ping', 'message from main.js');
        });
        main_window.on('closed', function(){
            main_window = null;
        });
    }
    
    // set app events
    app.on('ready', function(){
        create_window();
        auto_updater.initialize();
    });
    
    app.on('window-all-closed', function(){
        if(process.platform !== 'darwin'){
            app.quit();
        }
    });
    
    app.on('activate', function(){
        if(main_window === null){
            create_window();
        }
    });
}

switch (process.argv[1]) {
  case '--squirrel-install':
    auto_updater.createShortcut(function () { app.quit() });
    break
  case '--squirrel-uninstall':
    auto_updater.removeShortcut(function () { app.quit() });
    break
  case '--squirrel-obsolete':
  case '--squirrel-updated':
    app.quit();
    break
  default:
    init_app();
}