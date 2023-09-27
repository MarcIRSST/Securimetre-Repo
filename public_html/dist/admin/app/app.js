/*global angular, isDebug, _*/
/*eslint no-undef: 0*/
/*eslint no-unused-vars: 0*/

(function () {
	'use strict';
	angular.module('cms', [

		/* Angular Core */
		'ngAnimate',
		'ngSanitize',

		/* 3rd */
		'ui.bootstrap',
		'ui.tree',
		'ui.select',
		'xeditable',
		'toaster',
		'AngularGM',
		'ngFileUpload'
	])
		.config(function ($compileProvider, $interpolateProvider, $httpProvider, $provide) {
			//$compileProvider.debugInfoEnabled(isDebug);
			$interpolateProvider.startSymbol('<%');
			$interpolateProvider.endSymbol('%>');
			$httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
			$provide.decorator('angulargmDefaults', function ($delegate) {
				return angular.extend($delegate, {
					'mapOptions': {
						scrollwheel: false
					}
				});
			});
		})
		.filter('getCol', function () {
			return function (items, row) {
				return items && items.map(function (item) {
					return item[row];
				}).join(',');
			};
		})
		.filter('localeCompareString', function () {
			return function (items) {
				//window.console.log(items);
				items.sort(function (a, b) {
					return a.title.localeCompare(b.title);
				});
				return items;
			};
		})
		.directive('btnConfirm', btnConfirmDirective) // directives
		.directive('labelActive', labelDirective)
		.directive('labelCheck', labelCheckDirective)
		.directive('ngConfirmClick', confirmClickDirective)
		.directive('tagGrid', tagGridDirective)
		.directive('tagEditor', tagEditorDirective)
		.controller('ModalInstanceCtrl', ModalCtrl) //Ctrl
		.controller('ArboCtrl', ArboCtrl)
		.controller('GridCtrl', GridCtrl)
		.controller('AssociateCtrl', AssociateCtrl)
		.controller('MapCtrl', MapCtrl)
		.controller('UploaderCtrl', UploaderCtrl)
		.service('ApiService', apiService) //Api Service
		.factory('MenuFactory', menuFactory);

	// Directives
	function btnConfirmDirective() {

		var directive = {
			link:     link,
			scope:    {
				url:   "@",
				title: "=",
				id:    "="
			},
			replace:  true,
			restrict: 'E',
			template: "<button type=\"submit\" data-ng-click=\"showConfirmDeleteModal(title, url + id);\" class=\"btn btn-danger\"><i class=\"fa fa-trash-o\"></i></button>"
		};
		return directive;

		function link(scope, element, attrs) {

			scope.showConfirmDeleteModal = function (name, url) {

				$('#deleteForm').prop('action', url);
				$('#deletePageName').text(name);
				$('#modal-confirmDelete').modal({
					show: true
				});
			};
		}
	}

	function labelDirective() {

		var directive = {
			link:     link,
			scope:    {
				active: "="
			},
			restrict: 'E',
			replace:  true,
			template: "<span class=\"label label-<% type %>\"><% message %></span>"
		};
		return directive;

		function link(scope, element, attrs) {

			if ((scope.active === 1) || (scope.active)) {
				scope.type = "success";
				scope.message = "actif";
			} else {
				scope.type = "default";
				scope.message = "inactif";
			}
		}
	}

	function labelCheckDirective() {

		var directive = {
			link:     link,
			scope:    {
				active: "="
			},
			restrict: 'E',
			replace:  true,
			template: "<i class=\"<% message %>\"></i>"
		};
		return directive;

		function link(scope, element, attrs) {

			if ((scope.active === 1) || (scope.active)) {
				scope.message = "fa fa-check";
			} else {
				scope.message = "";
			}
		}
	}

	function confirmClickDirective() {
		return {
			link: function (scope, element, attr) {
				var msg = attr.ngConfirmClick || "êtes-vous certain?";
				var clickAction = attr.confirmedClick;
				element.bind('click', function (event) {
					if (window.confirm(msg)) scope.$eval(clickAction);
				});
			}
		};
	}

	function tagGridDirective($timeout) {
		return {
			restrict:    'AE',
			scope:       {
				field:      '@',
				uselabel:   '@',
				selected:   '=',
				collection: '='
			},
			replace:     true,
			templateUrl: '/dist/admin/app/template/ngTagGrid.html',
			controller:  ['$scope', function ($scope) {

				$scope.uselabel = ($scope.uselabel === true || $scope.uselabel === 'true') ?
					true :
					false;
				$scope.tags = []; // tags, without labels
				$scope.tagsLabels = []; // tags, with labels, (base on original code with only tags)

				activate();

				function activate() {
					if ($scope.selected) {
						try {
							var tagsLabels = JSON.parse($scope.selected);
							if (typeof (tagsLabels) == 'number') throw new Error("It's a number..."); // be sure it's not a number
							$scope.tagsLabels = tagsLabels;
							angular.forEach(tagsLabels, function (value, key) {
								var elem = _.find($scope.collection, function (n) {
									return n.id == value.id;
								});
								$scope.tags.push(elem); // don't break the original code with only tags
							});

						} catch (e) {
							var initialSelection = $scope.selected.split(',');
							angular.forEach(initialSelection, function (value, key) {
								var elem = _.find($scope.collection, function (n) {
									return n.id == value;
								});
								$scope.tags.push(elem);
							});
						}
					}
				}

				$scope.update = function () {
					if (!$scope.collection) return; // exit

					angular.forEach($scope.collection, function (value, key) {
						value.suggest = true; // reset all of them then...
					});

					angular.forEach($scope.tags, function (value, key) {
						var elem = _.find($scope.collection, function (n) {
							return n.id == parseInt(value.id);
						});
						elem.suggest = false;
					});

					// Suggest first available in collection
					for (var i = 0, l = $scope.collection.length; i < l; i++) {
						if ($scope.collection[i].suggest === true) {
							$scope.tagSelector = $scope.collection[i];
							break;
						}
					}
				};

				$scope.$watch('collection', $scope.update.bind($scope));

				$scope.add = function () {
					if (typeof $scope.tagSelector === 'undefined' || $scope.tagSelector == null) return;
					if (typeof $scope.tagSelector.id === 'undefined') return;
					var duplicate = _.find($scope.tags, function (n) {
						return n.id == parseInt($scope.tagSelector.id);
					});
					if (typeof duplicate !== 'undefined') return;

					$scope.tags.push($scope.tagSelector);
					var elem = _.find($scope.collection, function (n) {
						return n.id == parseInt($scope.tagSelector.id);
					});
					//$scope.tagSelector = $scope.collection[0];
					if ($scope.uselabel) $scope.setTagsLabels();
					$scope.update();
				};

				$scope.remove = function (tag, index) {
					var elem = _.find($scope.collection, function (n) {
						return n.id == tag.id;
					});
					$scope.tags.splice(index, 1);
					//$scope.tagSelector = $scope.collection[0];
					if ($scope.uselabel) $scope.setTagsLabels();
					$scope.update();
				};

				$scope.setOrder = function (dir, index) {
					var indexDest = index + 1;
					if (dir == "asc") indexDest = (index - 1);

					var item = $scope.tags[index];
					$scope.tags.splice(index, 1);
					$scope.tags.splice(indexDest, 0, item);
					if ($scope.uselabel) $scope.setTagsLabels();
					$scope.update();
				};

				$scope.setTagsLabels = function () {
					var tagsLabels = [];
					angular.forEach($scope.tags, function (value, key) {
						var label = $('#' + $scope.field + '_' + value.id).val() || '';
						tagsLabels.push({
							id:    value.id,
							label: label
						});
					});
					$scope.tagsLabels = tagsLabels;
				};
			}]
		};
	}

	function tagEditorDirective($timeout) {
		return {
			restrict:    'AE',
			scope:       {
				field:      '@',
				selected:   '=',
				collection: '=',
				required:   '='
			},
			replace:     true,
			templateUrl: '/dist/admin/app/template/ngTagEditor.html',
			controller:  ['$scope', function ($scope) {

				activate();

				function activate() {

					$scope.tags = [];
					$scope.selection = [];
					$scope.suggestions = [];

					if ($scope.selected !== undefined) {
						$scope.selection = $scope.selected.split(',');
					}

					angular.forEach($scope.collection, function (value, key) {

						var index = $scope.selection.indexOf(value.id.toString());

						if (index > -1) {
							$scope.tags.push(value);
						} else {
							$scope.suggestions.push(value);
						}
					});
				}

				$scope.add = function (item) {
					$scope.tags.push(item);
					_.remove($scope.suggestions, function (n) {
						return n.id == item.id;
					});
				};

				$scope.remove = function (item) {
					$scope.suggestions.push(item);
					_.remove($scope.tags, function (n) {
						return n.id == item.id;
					});
				};
			}]
		};
	}


	// Controllers
	function ModalCtrl($scope, $uibModalInstance, item, listPages) {

		$scope.locales = locales;

		locales.forEach(function (locale) {
			if (item[locale] && item[locale]['target_blank'] && item[locale].target_blank == 1)
				item[locale].target_blank = true;
		});

		$scope.hasUrl = function (item) {
			var result = false;
			locales.forEach(function (locale) {
				if (item[locale] && item[locale].url) {
					result = true;
					return false;
				}
			});
			return result;
		};

		if (item.active == 1) item.active = true;

		if (listPages) {

			//l'item de l'item est mis dans le liste pour permettre une autre sélection....
			if (item.page_id) {
				var u = _.findKey(listPages, {
					'id': item.page_id
				});
				if (u) {
					listPages[u].selected = false;
				}
			}

			$scope.pages = _.filter(listPages, {
				'selected': false
			});
			$scope.pages.splice(0, 0, {
				'id':    0,
				'label': 'Aucune page associée'
			});

			if (item.page_id) {
				var indexPage = _.findKey($scope.pages, {
					'id': item.page_id
				});
				item.page = $scope.pages[indexPage];
			} else {
				item.page = $scope.pages[0];
			}
		}

		$scope.item = item;
		$scope.copyobject = angular.copy(item); //clone au cas ou un cancel.

		$scope.save = function () {
			$uibModalInstance.close($scope.item);
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss($scope.copyobject);
		};
	}

	function ArboCtrl($scope, $http, toaster, $uibModal, ApiService, MenuFactory) {

		function activate() {
			$scope.openElement = function (item) {

				var locale = locales[0];
				if (item.hasOwnProperty(locale)) {
					var keys = Object.keys(item[locale]);

					keys.forEach(function (key) {
						delete item[key];
					});
				}


				var modalInstance = $uibModal.open({
					animation:   true,
					templateUrl: '/dist/admin/app/template/modal.html',
					controller:  'ModalInstanceCtrl',
					size:        0,
					resolve:     {
						listPages: function () {
							return $scope.pages;
						},
						item:      function () {
							return item;
						}
					}
				});

				modalInstance.result.then(function (selectedItem) { //SAVE
					var oldPageId = selectedItem.page_id;
					if (selectedItem.page) {
						selectedItem.page_id = selectedItem.page.id;
					} else {
						selectedItem.page_id = undefined;
					}

					if (selectedItem.page && selectedItem.page.id) {
						selectedItem.url = '';
					}
					if (oldPageId !== selectedItem.page_id) {
						if (selectedItem.page && selectedItem.page.id) {
							var indexNew = _.findKey($scope.pages, {
								'id': selectedItem.page_id
							});
							if (indexNew) {
								$scope.pages[indexNew].selected = true;
							}
						}
						if (oldPageId) {
							var indexRemove = _.findKey($scope.pages, {
								'id': oldPageId
							});
							if (indexRemove) {
								$scope.pages[indexRemove].selected = false;
							}
						}
					}

					ApiService.processItem({
						collection: 'menu_trees',
						action:     'save'
					}, selectedItem).then(function (response) {

						if (!selectedItem.id) { // new

							selectedItem.id = response;

							var indexGroup = _.findKey($scope.groups, {
								'group': selectedItem.group
							});

							if (!selectedItem.parent_id) {
								$scope.groups[indexGroup].items.push(selectedItem);

							} else {

								var keepGoing = true;

								angular.forEach($scope.groups[indexGroup].items, function (value, key) {

									if (keepGoing) {

										if (value.id === selectedItem.parent_id) {
											$scope.groups[indexGroup].items[key].children.push(selectedItem);
											keepGoing = false;
										} else if (value.children.length > 0) {
											angular.forEach($scope.groups[indexGroup].items[key].children, function (value2, key2) {

												if (value2.id === selectedItem.parent_id) { //si 2ème niveau

													$scope.groups[indexGroup].items[key].children[key2].children.push(selectedItem);
													keepGoing = false;

												} else if (value2.children.length > 0) {

													angular.forEach($scope.groups[indexGroup].items[key].children[key2].children, function (value3, key3) {

														if (value3.id === selectedItem.parent_id) { //si 3ème niveau

															$scope.groups[indexGroup].items[key].children[key2].children[key3].children.push(selectedItem);
															keepGoing = false;

														} else if (value3.children.length > 0) {

															angular.forEach($scope.groups[indexGroup].items[key].children[key2].children[key3], function (value4, key4) {

																if (value4.id === selectedItem.parent_id) { //si 4ème niveau
																	$scope.groups[indexGroup].items[key].children[key2].children[key3].children[key4].children.push(selectedItem);
																	keepGoing = false;
																}
															});
														}
													});
												}
											});
										}
									}
								});


							}
						}
					});

				}, function (selectedItem) { //CANCEL

					item = selectedItem;
					if (selectedItem.id > 0) {

						var indexGroup = _.findKey($scope.groups, {
							'group': selectedItem.group
						});

						if (!selectedItem.parent_id) { //1er niveau

							var indexItem = _.findKey($scope.groups[indexGroup].items, {
								'id': selectedItem.id
							});
							$scope.groups[indexGroup].items[indexItem] = selectedItem;

						} else { // 2ème, 3ème et 4ème niveau

							var keepGoing = true;

							angular.forEach($scope.groups[indexGroup].items, function (value, key) {

								if (keepGoing) {
									if (value.children.length > 0) {
										angular.forEach($scope.groups[indexGroup].items[key].children, function (value2, key2) {

											if (value2.id == selectedItem.id) { //si 2ème niveau

												$scope.groups[indexGroup].items[key].children[key2] = selectedItem;
												keepGoing = false;

											} else if (value2.children.length > 0) {

												angular.forEach($scope.groups[indexGroup].items[key].children[key2].children, function (value3, key3) {

													if (value3.id == selectedItem.id) { //si 3ème niveau

														$scope.groups[indexGroup].items[key].children[key2].children[key3] = selectedItem;
														keepGoing = false;

													} else if (value3.children.length > 0) {

														angular.forEach($scope.groups[indexGroup].items[key].children[key2].children[key3], function (value4, key4) {
															if (value4.id == selectedItem.id) { //si 4ème niveau

																$scope.groups[indexGroup].items[key].children[key2].children[key3].children[key4] = selectedItem;
																keepGoing = false;
															}
														});
													}
												});
											}
										});
									}
								}
							});
						}
					}

				}); // fin modal instance
			};

			$scope.addElement = function (group) { // ajout d'un élément à un group
				var item = {
					id:            0,
					group:         group.group,
					parent_id:     0,
					isTargetBlank: false,
					locked:        false,
					active:        false,
					children:      []
				};

				$scope.openElement(item, $scope.pages);
			};

			$scope.editElement = function (scope) {

				$scope.openElement(scope.$modelValue, $scope.pages);
			};

			$scope.removeElement = function (scope) {

				ApiService.processItem({
					collection: "menu_trees",
					action:     'delete'
				}, {
					id: scope.$modelValue.id
				});
				scope.remove();
			};

			$scope.addChildren = function (scope) {

				var nodeData = scope.$modelValue;
				var item = {
					id:            0,
					group:         nodeData.group,
					parent_id:     nodeData.id,
					isTargetBlank: false,
					url:           '',
					locked:        false,
					active:        false,
					children:      []
				};

				$scope.openElement(item);
			};

			$scope.infoPageContent = function (item) {

				if (item) {
					var p = _.findKey($scope.pages, {
						id: item
					});
					if (p) {
						$scope.pages[p].selected = true;
						return $scope.pages[p].label;
					}
				}
				return '';
			};

			$scope.showLink = function (item, isExternal) {

				if (isExternal) {
					return (item.url && item.isTargetBlank && !item.page_id);
				} else {
					return (item.url && !item.isTargetBlank && !item.page_id);
				}
			};

			$scope.items = collections;
			$scope.maxdepth = maxdepth;
			$scope.groups = MenuFactory.getGroups();
			$scope.pages = pages;

			angular.forEach($scope.groups, function (value, key) {
				var i = _.filter($scope.items, {
					'group': value.group
				});
				if (i) $scope.groups[key].items = i;
			});

			angular.forEach($scope.pages, function (value, key) {
				value.selected = false; //($scope.selectedPages.indexOf(value.id) > -1);
			});

			$scope.treeOptions = {

				beforeDrag: function (sourceNodeScope) {

					var index = sourceNodeScope.$parent.$index;
					var element = sourceNodeScope.$parent.$modelValue[index];
					return (element.locked == 0);
				},

				accept: function (sourceNode, destNodes, destIndex) {

					return (destNodes.depth() < $scope.maxdepth);
				},

				dropped: function (event) {

					var items = {};

					function getParent(item) {
						var parent = item.nodesScope.$parent.$modelValue;
						if (!parent) {
							var identifier = item.nodesScope.$element.attr('data-id').split('-');
							var group = _.filter($scope.groups, {
								group: identifier[0]
							})[0];
							parent = {
								id:       0,
								group:    group.group,
								children: group.items
							};
						}
						return parent;
					}

					for (var parent of [getParent(event.source), getParent(event.dest)]) {
						if (parent) items[parent.id] = {
							group: parent.group,
							items: _.map(parent.children, function (item) {
								return item.id;
							})
						};
					}
					ApiService.processItem({
						collection: "menu_trees",
						action:     'order'
					}, items);
				}
			};
		}

		activate();
	}

	function decodeHtmlEntities(str) {
		return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
			var num = parseInt(numStr, 10); // read num as normal number
			return String.fromCharCode(num);
		});
	}

	function GridCtrl($scope, ApiService, $location) {

		activate();

		function activate() {

			$scope.info = info;
			$scope.collections = collections;

			angular.forEach($scope.collections, function (collection) {
				angular.forEach(collection, function (value, key) {
					if (typeof value == "string")
						collection[key] = decodeHtmlEntities(value);
				});
			});

			$scope.orderSortOptions = {

				// TO CORRECT
				orderChanged: function (event) {

					var indexSource = event.source.index;
					var indexDest = event.dest.index;
					var item = event.source.itemScope.item;

					var data = {
						relation:    $scope.info.relation,
						relation_id: $scope.info.id,
						index:       indexSource,
						indexTo:     indexDest,
						//identifiant: item.id,
						identifiant: 'pivot' in item ?
							             item.pivot.id :
							             item.id,
						isDrag:      true
					};

					ApiService.processItem({
						collection: $scope.info.collection,
						action:     'order'
					}, data);
				},
				containment:  '#grid'
			};

			// CORRECTED
			$scope.setOrder = function (dir, index) {

				var swap_index = index + (dir == "asc" ?
					-1 :
					1);

				var items = $scope.collections;
				var item = $scope.collections[index];

				items.splice(index, 1);
				items.splice(swap_index, 0, item);

				var data = {
					relation_id:        $scope.info.id,
					relation:           $scope.info.relation,
					relation_attribute: $scope.info.fkey,
					items:              items.map((item) => item.id),
				};

				ApiService.processItem({
					collection: $scope.info.collection,
					action:     'order'
				}, data);
			};

			$scope.setHeadline = function (id) {

				var data = {
					collection: $scope.info.collection,
					relation:   $scope.info.relation,
					refId:      $scope.info.id,
					id:         id
				};

				ApiService.processItem({
					collection: $scope.info.collection,
					action:     'setheadline'
				}, data);
				angular.forEach($scope.collections, function (item) { //reset de tous les éléments car juste une sélection par collection
					if (item.id === id) item.is_headline = 1;
					else item.is_headline = 0;
				});
			};
		}
	}

	function AssociateCtrl($scope) {
		function activate() {
			$scope.setTitle = function () {
				$('#title').val($("#ref_id option[value='" + $scope.ev + "']").text());
			};
		}

		activate();
	}

	function MapCtrl($scope, $timeout) {

		activate();

		function activate() {

			$scope.$watch('[zoom_level]', function () {

				if ($scope.zoom_level && $scope.latitude && $scope.longitude) {

					$timeout(function () {
						$scope.center = new google.maps.LatLng($scope.latitude, $scope.longitude);
						$scope.zoom = $scope.zoom_level;
					}, 500);

				} else {

					//Par défaut ... point de départ
					$scope.latitude = $scope.default.default_latitude;
					$scope.longitude = $scope.default.default_longitude;
					$scope.zoom_level = parseInt($scope.default.default_zoom_level);
					$scope.zoom = $scope.zoom_level;
				}
			});

			$scope.$watch('center', function (center) {
				if (center) {
					$scope.centerLat = center.lat();
					$scope.centerLng = center.lng();
					$scope.$broadcast('gmMarkersRedraw');
				}
			});

			$scope.updateCenter = function (lat, lng) {
				$scope.center = new google.maps.LatLng(lat, lng);
			};
		}
	}

	function UploaderCtrl($scope, Upload, $timeout) {

		function activate() {

			$scope.message = "";
			$scope.maxSize = 104857600; //100 mo
			$scope.isDone = false;
			$scope.messageOn = false;

			$scope.$watch('initFilename', function () {
				if ($scope.initFilename) {
					$scope.filename = $scope.initFilename;
					$scope.isDone = true;
				}

				if (!$scope.accept) {
					$scope.accept = 'video/mp4'; //default
				}
			});

			$scope.$watch('files', function () {

				$scope.upload($scope.files);
			});

			$scope.validate = function (file) {

				if (file) {

					var format = file.type;
					var msg;

					if ($scope.accept.indexOf(format) == -1 || format == "") {
						msg = 'le fichier n\'est pas dans le bon format.';
						$scope.setMessage(msg);
						return false;
					}

					if (file.size > $scope.maxSize) {
						msg = 'Le poids du fichier dépasse la limite permise de 100mo pour ce type de fichier';
						$scope.setMessage(msg);
						return false;
					}

					if (file.size < $scope.minSize) {
						msg = 'le fichier ne semble pas adéquat. Son poids est anormalement bas.';
						$scope.setMessage(msg);
						return false;
					}
				}

				return true;
			};

			$scope.setMessage = function (erreurMessage) {

				if (!$scope.messageOn) {

					$scope.messageOn = true;
					$scope.message = erreurMessage;
					$scope.$apply();

					$timeout(function () {
						$scope.messageOn = false;
					}, 1300);
				}
			};

			$scope.upload = function (files) {

				if (files && files.length) {
					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						$scope.progressPercentage = 0;

						Upload.upload({

							url:    '/admin/' + $scope.entite + '/upload',
							fields: {
								property: 'video'
							},
							file:   file

						}).progress(function (evt) {

							$scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);

						}).success(function (data, status, headers, config) {

							$scope.isDone = true;
							$scope.progressPercentage = 0;
							$scope.filename = data.data;


						}).error(function (data, status, headers, config) {

							$scope.message = data.data;


						});
					}
				}
			};
		}

		activate();
	}

	// Api Service
	function apiService($http, toaster, $q) {
		var token = $('meta[name="csrf-token"]').attr('content');

		var service = {
			processItem: processItem
		};
		return service;

		function processItem(info, data) {
			let method = 'POST';
			let url = '/admin/' + info.collection;

			if ((info.action === 'save') && ((data.id !== undefined) && (data.id !== 0))) {
				method = 'PUT';
				url += '/' + data.id;
			} else if (info.action === 'delete') {
				method = 'DELETE';
				url = url + '/' + data.id;
			} else if (info.action === 'order') {
				url += '/order';
			} else if (info.action === 'setheadline') {
				url += '/setheadline';
			}

			var deferred = $q.defer();

			$http({
				method:  method,
				url:     url,
				headers: {
					'X-CSRF-TOKEN': token
				},
				data:    data
			})
				.then((response) => {
					let message;
					let id;
					console.log(response);
					if (typeof response.data == 'string') {
						message = response.data;
						id = undefined;
					} else {
						message = 'L\'élément a été correctement sauvegardé!';
						id = response.data.id;
					}

					if (response.status == 200) toaster.pop('success', response.status, message);
					else if (response.status == 201) toaster.pop('success', response.status, message);
					else toaster.pop('error', response.status, response.data);

					deferred.resolve(id);
				});

			return deferred.promise;
		}
	}

	function menuFactory() {

		var factory = {
			getGroups: getGroups
		};
		return factory;

		function getGroups() {

			var groups = enumGroup;
			var collection = [];

			angular.forEach(groups, function (value, key) {

				var item = {
					//lang : value.lang,
					group: key,
					label: value.label,
					items: []
				};
				collection.push(item);
			});

			return collection;
		}
	}

})();
