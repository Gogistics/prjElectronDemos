/* angularjs */
// init ng
angular.element(document).ready(function() {
    angular.bootstrap(document, ['indexPageApp']);
});

// set modules & interpolation
window.index_page_app = window.index_page_app || angular.module('indexPageApp', [], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

// set app values
window.index_page_app.value('APP_VALUES',{
    EMAIL : 'gogistics@gogistics-tw.com'
});

// app-routing configuration
window.index_page_app.config(function(){
    // configuration
});

window.index_page_app.run(function($rootScope, $http, $window, $location, APP_VALUES) {
    // pre-run
});