/* angularjs */
(function($){
    // init ng
    // angular.element(document.body).ready(function() {
        // angular.bootstrap(document.body, ['indexPageApp']);
    // });

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
})(jQuery);