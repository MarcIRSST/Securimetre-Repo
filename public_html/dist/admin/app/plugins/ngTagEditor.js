'use strict';

angular.module('ngTagEditor', [])
	.filter('getCol', function(){
		return function (items, row){
			return items && items.map(function (item){
					return item[row];
			}).join(',');
		}
	})
	.directive('tagEditor', function(){
		return{
			restrict: 'AE',
			scope: {
				field: '@',
				selected: '@',
				label: '@',
				current: '='
			},
			replace: true,
			templateUrl: '/assets/app/template/ngTagEditor.html',
			controller: ['$scope', '$attrs', '$element', '$http', function($scope, $attrs, $element, $http){
				

				$scope.options = [];
				$scope.options.output = $attrs.output || 'title';

				activate();

				function activate() {
					
					$scope.select = JSON.parse($scope.selected);
					$scope.tags = [];
					$scope.suggestions = [];
					$scope.selection = [];

					$http.get('/api/suggestions/' + $scope.field).success(function(data){
						
						$scope.selection = data.data;

						angular.forEach($scope.selection, function(value, key) {
						   
						   var index = _.indexOf($scope.select, value.id);

						   if (index > -1) {
								$scope.tags.push(value);
						   } else if (value.id.toString() !== $scope.current.toString()) {
								$scope.suggestions.push(value);
						   }
						});


					});

        		}


				$scope.add = function(id, title){

					$scope.tags.push({'id':id, 'title':title});
					_.remove($scope.suggestions, function(n) { return n.id  == id; });
					//$scope.$apply();
				};
				$scope.remove = function(index){
						
					$scope.suggestions.push($scope.tags[index]);
					$scope.tags.splice(index, 1);

				};
			}]
		}
	});