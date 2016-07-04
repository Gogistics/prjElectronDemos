/* angularjs */
(function($){
    // init ng (alternative)
    angular.element(document.body).ready(function() {
        angular.bootstrap(document.body, ['chainsApp']);
    });
    const ipc_renderer = require('electron').ipcRenderer;
    ipc_renderer.on('ping', (event, message) => {
        console.log(message);
    });

    // set modules & interpolation
    window.chains_app = window.chains_app || angular.module('chainsApp', ['ui.router'], function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    });

    // set app values
    window.chains_app.value('APP_VALUES',{
        EMAIL : 'gogistics@gogistics-tw.com'
    });

    // app-routing configuration
    window.chains_app.config(function($stateProvider, $urlRouterProvider){
        // configuration
        // nested templates and routing
		$stateProvider
		.state('signup_page', {
            url: '/signup',
			templateUrl:  '../my_ng_templates/my_ng_signup.html'
		})
		.state('signin_page', {
            url: '/signin',
			templateUrl:  '../my_ng_templates/my_ng_signin.html'
		})
		.state('index_page', {
            url: '/index',
			templateUrl:  '../my_ng_templates/my_ng_index.html'
		})
		.state('front_page', {
            url: '/front',
			templateUrl:  '../my_ng_templates/my_ng_front.html'
		});
		$urlRouterProvider.otherwise('/signin');
    });

    window.chains_app.run(function($http, $rootScope, APP_VALUES) {
        // pre-run
        // EX: ajax call
        $http({
            method : "GET",
            url : "http://chains.gogistics-tw.com/data/pages_info.json"
        }).then(function handle_success(response) {
            console.log(response);
        }, function handle_error(response) {
            console.log(response);
        });
    });
    
    // factories
    window.chains_app.factory('UTIL_INDEX', function(){
        return require('./util/index.js');
    });
    window.chains_app.factory('PWD_GENERATOR', function($http){
        return { uuid: require('uuid'),
                create_uuid_v4: function(){
                    return this.uuid.v4();
                }};
    });
    window.chains_app.factory('CRYPTO_HANDLER', function($http){
        return { crypto: require('crypto-js'),
                encryptByDES: function(message, key) {
                    var keyHex = this.crypto.enc.Utf8.parse(key);
                    var encrypted = this.crypto.DES.encrypt(message, keyHex, {
                        mode: this.crypto.mode.ECB,
                        padding: this.crypto.pad.Pkcs7
                    });
                    return encrypted.toString();
                },
                decryptByDES: function(ciphertext, key) {
                    var keyHex = this.crypto.enc.Utf8.parse(key);
                    var decrypted = this.crypto.DES.decrypt({
                        ciphertext: this.crypto.enc.Base64.parse(ciphertext)
                    }, keyHex, {
                        mode: this.crypto.mode.ECB,
                        padding: this.crypto.pad.Pkcs7
                    });
                    return decrypted.toString(this.crypto.enc.Utf8);
                }};
    });
    window.chains_app.factory('CLIPBOARD', function(){
        return require('electron').clipboard;
    });
    
    // services
    window.chains_app.service('LOKI_STORAGE', ['$q', function($q){
        // set var
        this.path = require('path');
        this.loki_db = new require('lokijs')(this.path.resolve(__dirname, '../..', 'chains.db'));
        this.collection = null;
        this.loaded = false;
        
        this.init = function(){
            //
            var d = $q.defer();
            this.reload()
                .then(function(){
                    this.collection = this.loki_db.getCollection('key_chain');
                    d.resolve(this);
                }.bind(this))
                .catch(function(e){
                    this.loki_db.addCollection('key_chain');
                    this.loki_db.saveDatabase();
                    this.collection = this.loki_db.getCollection('key_chain');
                    this.loaded = true;
                    d.resolve(this);
                }.bind(this));
                
                return d.promise;
        };
        
        this.reload = function(){
            var d = $q.defer();
            this.loaded = false;
            this.loki_db.loadDatabase({}, function(e){
                if(e){
                    d.reject(e);
                }else{
                    this.loaded = true;
                    d.resolve(this);
                }
            }.bind(this));
            
            return d.pomise;
        };
        
        this.get_collection = function(){
            return this.loki_db.getCollection('key_chain');
        };
        
        this.is_loaded = function(){
            return this.loaded;
        }
        
        this.add_doc = function(arg_doc){
            var d = $q.defer();
            
            if(this.is_loaded() && this.get_collection()){
                this.get_collection().insert(arg_doc);
                this.loki_db.saveDatabase();
                d.resolve(this.get_collection());
            }else{
                d.reject(new Error('Loki DB is not ready!'));
            };
            
            return d.promise;
        };
        
        this.remove_doc = function(arg_doc){
            return function(){                
                var d = $q.defer();
                if(this.is_loaded() && this.get_collection()){
                    this.get_collection().remove(arg_doc);
                    this.loki_db.saveDatabase();
                    d.resolve(true);
                }else{
                    d.reject(new Error('Loki DB is not ready'));
                }
                return d.promise();
            }.bind(this);
        };
        
        this.get_docs = function(){
            return (this.get_collection()) ? this.get_collection().data : null;
        };
    }]);
    
    // custom directives
    window.chains_app.directive('toggleInsertView', function() {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();
                alert('Add new password');
            });
        };
    });
    
    // isolated scope
    window.chains_app.directive('verifySigninInfo', ['$http', '$state', '$stateParams', 'PWD_GENERATOR', 'CRYPTO_HANDLER', function($http, $state, $stateParams, PWD_GENERATOR, CRYPTO_HANDLER) {
        return {
            restrict: 'EA',
            scope: {signininfo: '='},
            link: function(scope, el) {
                el.bind('click', function(e) {
                    e.preventDefault();
                    
                    if(!scope.signininfo.account_name){
                        alert('Please type in accout name')
                        return;
                    }
                    if(!scope.signininfo.pwd){
                        alert('Pease type in password')
                        return;
                    }
                    
                    var secret = PWD_GENERATOR.create_uuid_v4(),
                        hash = CRYPTO_HANDLER.crypto.HmacSHA1('sha256', secret).toString();
                    
                    scope.signininfo.key = secret;
                    scope.signininfo.hash = hash;
                    scope.signininfo.encoded_account_name = CRYPTO_HANDLER.encryptByDES(scope.signininfo.account_name, secret);
                    scope.signininfo.account_name = CRYPTO_HANDLER.decryptByDES(scope.signininfo.encoded_account_name, secret);
                    scope.signininfo.encoded_pwd = CRYPTO_HANDLER.encryptByDES(scope.signininfo.pwd, hash);
                    scope.signininfo.pwd = CRYPTO_HANDLER.decryptByDES(scope.signininfo.encoded_pwd, hash);
                    
                    console.log(scope.signininfo);
                    scope.$digest();
                    $state.go('index_page');
                });
            }
        };
    }]);
    
    // shared scope
    window.chains_app.directive('generatePassword', ['PWD_GENERATOR', 'CRYPTO_HANDLER', function(PWD_GENERATOR, CRYPTO_HANDLER) {
        return {restrict: 'EA',
                link: function(scope, el) {
                    el.bind('click', function(e) {
                        e.preventDefault();
                        var secret = PWD_GENERATOR.create_uuid_v4(),
                            hash = CRYPTO_HANDLER.crypto.HmacSHA1('sha256', secret).toString();
                        scope.ctrl.pwd = hash;
                        scope.$digest();
                    });
                }
            };
    }]);
    window.chains_app.directive('copyPwd', ['CLIPBOARD', function(CLIPBOARD){
        return {restrict: 'AE',
                link: function(scope, el, attrs){
                    el.bind('click', function(e){
                        e.preventDefault();
                        CLIPBOARD.clear();
                        var pwd = (scope.ctrl.pwd) ? scope.ctrl.pwd : null;
                        CLIPBOARD.writeText(pwd);
                    });
                }
            };
    }]);
    // shared scope
    
    window.chains_app.directive('userInfoDirective', function ($animate) {
        return {
            restrict: 'AE',
            transclude:true,
            scope: {togglechecked: '&'},
            link: function (scope, elem, attrs, ctrl, transclude) {
                scope.person = {name: 'Alan', account_name: 'invisible_alan'};
                transclude(scope, function(clone, scope){
                    elem.append(clone);
                });
                
                elem.on('click', function () {
                    // elem.html('You clicked me!');
                    scope.togglechecked();
                });
                elem.on('mouseenter', function () {
                    scope.togglechecked();
                    scope.$digest();
                });
                elem.on('mouseleave', function () {
                    scope.togglechecked();
                    scope.$digest();
                });
            }
        };
    });
    
    
    //Define tooltip Directive
    window.chains_app.directive('tooltip', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                var tooltipSpan, x, y;
               //Find the element which will contain tooltip-span
                tooltipSpan = elem[0].querySelector('span#tooltip-span');
                
                //Bind mousemove event to the element which will show tooltip
                elem.mousemove(function(e) {
                    //find X & Y coodrinates
                    x = e.clientX,
                    y = e.clientY;
                    
                    //Set tooltip position according to mouse position
                    tooltipSpan.style.top = (y + 10) + 'px';
                    tooltipSpan.style.left = (x + 15) + 'px';
                });
                   
            }
        };
    });
    
    window.chains_app.directive('autoComplete', [ '$timeout', function($timeout){
        return {
            restrict: 'EA',
            scope: {mydata: '='},
            link: function(scope, elem, attrs, ctrl){
                    elem.autocomplete({
                        source: scope.mydata,
                        select: function(){
                            $timeout(function(){
                                elem.trigger('input');
                            }, 300);
                        }
                    });
                }
        };
    }]);
    
    window.chains_app.directive('savePwd', ['LOKI_STORAGE', function(LOKI_STORAGE){
        //
    }]);
    window.chains_app.directive('removePwd', ['LOKI_STORAGE', function(LOKI_STORAGE){
        //
    }]);
    
    // controllers
    var signupController = function($state, $scope, $stateParams, $rootScope, APP_VALUES){
        // set ctrl
        var ctrl = this;
    };
    signupController.$injector = ['$state', '$scope', '$stateParams', '$rootScope', 'APP_VALUES'];
	window.chains_app.controller('signupCtrl', signupController);
    
    
    var signinController = function($state, $scope, $stateParams, $rootScope, APP_VALUES, UTIL_INDEX){
        // set ctrl
        var ctrl = this;
        ctrl.signin_info = {account_name: null,
                            pwd: null,
                            key: null,
                            hash: null,
                            encoded_account_name: null,
                            encoded_pwd: null};
    };
    signinController.$injector = ['$state', '$scope', '$stateParams', '$rootScope', 'APP_VALUES', 'UTIL_INDEX'];
	window.chains_app.controller('signinCtrl', signinController);
    
    var indexController = function ($state, $scope, $stateParams, $rootScope, APP_VALUES) {
        // set ctrl
        var ctrl = this;
        ctrl.pwd = 'Hello Chains';
        ctrl.checked = false;
        
        ctrl.toggle_checked = function(){
            ctrl.checked = !ctrl.checked;
            $scope.$digest();
        }
        
        // temp. data such addresses, keys, and transactions
        ctrl.addresses = ['cascvrgtrght',
                        'xafeghbfsrth',
                        'demvpvpsodjo'];
        
        ctrl.keys = ['EWFKOICNL',
                    'MCNSOIEQP',
                    'LPOZCJEIZ'];
                    
        ctrl.transactions = ['CGW45G5H6U7I8O89OLRFBRGWEG',
                            'SQW45G5HU67089HMLPODPFLRFBR3',
                            'CSO2019G5HU670LO0S93LPORFBR0',
                            'IOA145G5GH74HIPO89HMLDPFL74M',
                            'XNBSJAIEOQ9870LO0S93SIA092M4',
                            'ZLOAIPQ0E481SVSJUOEFW719H74H'];
                            
	}
	indexController.$injector = ['$state', '$scope', '$stateParams', '$rootScope', 'APP_VALUES'];
	window.chains_app.controller('indexCtrl', indexController);
    
    var frontController = function ($state, $scope, $stateParams, $rootScope, APP_VALUES) {
        // set ctrl
        var ctrl = this;
	}
	frontController.$injector = ['$state', '$scope', '$stateParams', '$rootScope', 'APP_VALUES'];
	window.chains_app.controller('frontCtrl', frontController);
    
})(jQuery);