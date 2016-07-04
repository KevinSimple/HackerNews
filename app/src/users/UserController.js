(function () {

  angular
    .module('users')
    .controller('UserController', [
      'newsService', '$mdSidenav', '$mdBottomSheet', '$timeout', '$log', '$scope', '$mdDialog', '$mdMedia', '$sce', '$window',
      UserController
    ]).
    config(function ($mdThemingProvider) {
      $mdThemingProvider.theme('enatel')
        .primaryPalette('teal', {
          'default': '700', // by default use shade 400 from the teal palette for primary intentions
          'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
          'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
          'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        })
        .accentPalette('red').
        backgroundPalette('grey');
      $mdThemingProvider.setDefaultTheme('enatel');
    });

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function UserController(newsService, $mdSidenav, $mdBottomSheet, $timeout, $log, $scope, $mdDialog, $mdMedia, $sce, $window) {
    $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
    var self = this;

    //Member variables
    self.toggleList = toggleMenu;
    self.news = [];
    self.showWindow = showWindow;
    self.openNewWindow = openNewWindow;
    self.refresh = refresh;
    self.loadNews = loadNews;
    self.isLoading = false;
    self.setNumOfStories = setNumOfStories;
    self.showStoryNumSetDialog = showStoryNumSetDialog;
    self.showNotNumberWarning = showNotNumberWarning;
    self.isNumeric = isNumeric;
    //Member Methods
    /**
     * Hide or Show the 'right' sideNav area
     */
    function toggleMenu() {
      $mdSidenav('right').toggle();
    }

    /**
     *Check if numeric value
     */
    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    /**
     * Hide or Show the 'right' sideNav area
     */
    function setNumOfStories(num) {

      //Set service capacity
      newsService.setCapacity(num);

      //refresh the data source
      refresh();

    }

    /**
     * Show Not A Number warning
     */
    function showNotNumberWarning() {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.body))
          .clickOutsideToClose(true)
          .title('Warning')
          .textContent('Warning, you have entered invalid number for max stories you wanna see on this app.')
          .ok('Got it!')
      );
    }

    /**
     * Show dialog for setting the num of stories to be shown
     */
    function showStoryNumSetDialog() {

      var confirm = $mdDialog.prompt()
        .title('How many stories you want to retrieve?')
        .textContent('Please enter a number for as the max of stories you want to see on this app.')
        .placeholder('Max number of stories')
        .initialValue(25)
        .ok('Save')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function (num) {
        if (self.isNumeric(num)) {
          self.setNumOfStories(parseInt(num));
        } else {
          self.showNotNumberWarning();
        }
      }, function () {
        $scope.status = 'You didn\'t change anything. :p';
      });

    }

    /**
     * Load news
     */
    function loadNews() {
      //Show loading bar
      self.isLoading = true;

      //Empty news
      self.news = [];

      //Get News
      newsService.getMaxStories().then(function (data) {
        self.news = newsService.getLatestStories();
        console.log(self.news);
        console.log('All stories loaded!');

        //Cancel loading bar 
        $timeout(function () {
          self.isLoading = false;
        }, 1000);

      }, function () {
        //Cancel loading bar 
        self.isLoading = false;
        console.log('Stories failed to load!')
      });

    }

    /**
     * Refresh News
     */
    function refresh() {
      loadNews();
    }

    /**
     * Show news in a pop up dialog 
     */
    function showWindow(item) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

      $mdDialog.show({
        controller: UserController,
        template: '<div style="padding:20px"><iframe width="1200px" height="800px" ng-src="' + item.url + '"></iframe></div>',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        fullscreen: useFullScreen
      })
        .then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    }

    /**
     * Open news in new window 
     */
    function openNewWindow(item) {
      $window.open(item.url);
    }

    //Start Init loading news    
    loadNews();
  }

})();
