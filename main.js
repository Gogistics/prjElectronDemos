/*main.js for app*/
//set const & var
const   path = require('path'),
        electron = require('electron'),
        app = electron.app,
        browser_window = electron.BrowserWindow,
        auto_updater = require('./auto_updater'),
        debug = /--debug/.test(process.argv[2]);
        
// set window
var main_window = null;

// pre-definie app name
if (process.mas) app.setName('Electron Demo');

// set init function
function init_app(){
    function create_window(){
        // set options
        var window_options = {
            width: 1080,
            min_width: 680,
            height: 840,
            title: app.getName()
        };
        
        main_window = new browser_window(window_options);
        main_window.loadURL(path.join('', __dirname, '/templates/index.html'));
        
        // launch full-screen with deve-tools if there are any bugs
        if(debug){
            main_window.webContents.openDevTools();
            main_window.maximize();
        }
        
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