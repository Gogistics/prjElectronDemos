/* angularjs */
(function($){
    // init ng (alternative)
    // angular.element(document.body).ready(function() {
        // angular.bootstrap(document.body, ['indexPageApp']);
    // });
    const ipc_renderer = require('electron').ipcRenderer;
    ipc_renderer.on('ping', (event, message) => {
        console.log(message);
    });

    // set modules & interpolation
    window.index_page_app = window.index_page_app || angular.module('indexPageApp', ['ui.router', 'ngAnimate'], function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    });

    // set app values
    window.index_page_app.value('APP_VALUES',{
        EMAIL : 'gogistics@gogistics-tw.com'
    });

    // app-routing configuration
    window.index_page_app.config(function($stateProvider, $urlRouterProvider){
        // configuration
        // nested templates and routing
		$stateProvider
		.state('index_page', {
            url: '/index',
			templateUrl: 'file://' + __dirname + '/my_ng_templates/my_ng_index.html'
		})
		.state('front_page', {
            url: '/front',
			templateUrl: 'file://' + __dirname + '/my_ng_templates/my_ng_front.html'
		});
		$urlRouterProvider.otherwise('/index');
    });

    window.index_page_app.run(function($rootScope, APP_VALUES) {
        // pre-run
        // EX: ajax call with jquery
        $.get( "http://chains.gogistics-tw.com/data/pages_info.json", function( data ) {
            console.log( data );
        });
    });
    
    // custom directives
    window.index_page_app.directive('toggleInsertView', function() {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();
                alert('Add new password');
            });
        };
    });
    
    // controllers
    // controllers are used for building the connection between jinja templates and ng templates
    var indexController = function ($state, $scope, $stateParams, $rootScope, APP_VALUES) {
        // set ctrl
        var ctrl = this;
	}
	indexController.$injector = ['$state', '$scope', '$stateParams', '$rootScope', 'APP_VALUES'];
	window.index_page_app.controller('indexCtrl', indexController);
    
})(jQuery);