'use strict';

angular
    .module('Admin', [])
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.admin', {
                url: '/admin',
                templateUrl: 'app/Admin/Admin.html',
                controller: 'AdminCtrl'
            })
    })
    .controller('AdminCtrl', AdminCtrl)
    .factory('AdminSvc', AdminSvc)
;

function AdminCtrl($scope, $state, $mdToast, AdminSvc) {

    $scope.bots = [];
    AdminSvc.bots()
        .then(function (bots) {
            $scope.bots = bots;
        });

    $scope.minDate = new Date();
    $scope.activity = {
        activity: 'notification',
        datetime: new Date(),
        duration: 0,
        location: 'Social Fitness'
    };

    $scope.save = function (activity) {
        AdminSvc.createBotActivity(activity.bot, activity)
            .then(function (response) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Activity Saved')
                        .hideDelay(3000)
                );
                $state.go('app.home');
            });
    };

}

function AdminSvc($q, $http) {

    function bots() {
        var deferred = $q.defer();
        $http.get('/api/bots')
            .then(function (response) {
                deferred.resolve(response.data);
            });
        return deferred.promise;
    }

    function createBotActivity(bot, activity) {
        var deferred = $q.defer();
        $http.post('/api/activity/' + bot, activity)
            .then(function (response) {
                deferred.resolve(response.data);
            });
        return deferred.promise;
    }

    return {
        bots: bots,
        createBotActivity: createBotActivity
    }

}