var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the Dashboard page
app.controller('dashboardController', function($scope, $http) {
  // TODO: Q1
  $http({
    url: '/genres',
    method: 'GET'
  }).then(res => {
    console.log("Movie Genre: ", res.data);
    $scope.genres = res.data;
  }, err => {
    console.log("Movie Genre ERROR: ", err);
  });

  $scope.showMovies = function(g) {
    $http({
      url: '/genres/' + g.genre,
      method: 'GET'
    }).then(res => {
      console.log("Top 10 movies: ", res.data);
      $scope.movies = res.data;
    }, err => {
      console.log("Top 10 ERROR: ", err);
    });
  };

});

// Controller for the Recommendations Page
app.controller('recommendationsController', function($scope, $http) {
  // TODO: Q2
  $scope.submitIds = function () {
    // TODO: Part (3) - Add an HTTP request to this function (see lines 4-12 above for reference)
    $http({
      url: '/recommendations/' + $scope.movieName,
      method: 'GET'
    }).then(res => {
      console.log("movieRecommend: ", res.data);
      $scope.recommendedMovies = res.data;
    }, err => {
      console.log("movieRecommend ERROR: ", err);
    });
  };
});

// Controller for the Best Of Page
app.controller('bestofController', function($scope, $http) {
  // TODO: Q3
  $http({
    url: '/decades',
    method: 'GET'
  }).then(res => {
    console.log("Movie years: ", res.data);
    $scope.decades = res.data;
  }, err => {
    console.log("Movie years ERROR: ", err);
  });

  $scope.submitDecade = function () {
    $http({
      url: '/decades/' + $scope.selectedDecade.decade,
      method: 'GET'
    }).then(res => {
      console.log("Top genre movie: ", res.data);
      $scope.bestofMovies = res.data;
    }, err => {
      console.log("Top genre movie ERROR: ", err);
    });
  };
});
