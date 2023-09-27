/*!
   McNull https://github.com/McNull/angular-form-gen
*/
(function (angular) {

	var templatePrefix = "/dist/admin/app/angular/angular-form-gen/template/";
	var fg = angular.module('fg', ['dq', 'pascalprecht.translate']);

	fg.constant('FgField', function FgField(type, properties) {

		this.name = this.type = type;

		if (properties) angular.extend(this, properties);

		this.displayName = this.displayName || this.type.charAt(0).toUpperCase() + this.type.substring(1);
	});

	fg.config(["$translateProvider", function ($translateProvider) {

		$translateProvider.translations('en', {
			ADD_FIELD:               'Add field',
			EDITOR_LEGEND:           'Form editor',
			EDITOR_DRAG_INSTRUCTION: 'Drag one of the available templates from the palette onto this canvas.',
			JSON_COPY:               'Copy the json data.',
			PROPERTIES_LABEL:        'Properties',
			VALIDATION_LABEL:        'Validation',
			MAX_VALUE_LABEL:         'Maximum value',
			MIN_VALUE_LABEL:         'Minimum value',
			MAX_VALUE_INFO:          'The maximum value that should be entered.',
			MIN_VALUE_INFO:          'The minimum value that should be entered.',
			INITIAL_VALUE:           'initial value',
			EDITOR_SET_VALUE:        'Set the initial value of this field.',
			OPTIONS_LABEL:           'Options',
			NO_TEMPLATE:             'No template registered in cache for field type',
			CONFIGURE_FIELD:         'Configure this field.',
			MOVE_DOWN:               'Move down',
			MOVE_UP:                 'Move up',
			REMOVE:                  'Remove',
			PALETTE:                 'Toolbox',
			ALL_TYPES:               'All field types',
			DEBUG_LABEL:             'Debug',
			NO_OPTIONS:              'No options defined',
			ADD_OPTION:              'Click here to add a new option definition to this field.',
			OPTION_VALUE:            'Value',
			OPTION_TEXT:             'Text',
			ADD_OPTION_TO_LIST:      'Add a new option to the list',
			REMOVE_OPTION:           'Remove this option from the list',
			FIELD_NAME:              'Field name',
			DISPLAY_NAME:            'Display label',
			PLACEHOLDER_TEXT:        'Placeholder',
			TOOLTIP:                 'Description',
			OPTIONAL_MESSAGE:        'Optional message',
			MESSAGE_LABEL:           'Message',
			MIN_LENGTH:              'Minimum length',
			MIN_LENGTH_INFO:         'The minimum length of characters that should be entered.',
			MAX_LENGTH:              'Maximum length',
			MAX_LENGTH_INFO:         'The maximum length of characters that should be entered.',
			PATTERN_LABEL:           'Pattern',
			PATTERN_INFO:            'The pattern that should match with the input value.',
			REQUIRED_LABEL:          'Required',
			REQUIRED_INFO:           'Indicates if a value is required for this field.'
		});

		$translateProvider.translations('fr', {
			ADD_FIELD:               'Ajouter un champ',
			EDITOR_LEGEND:           'Éditeur de formulaire',
			EDITOR_DRAG_INSTRUCTION: 'Faites glisser l\'un des widgets disponibles sur ce canvas.',
			JSON_COPY:               'Copier le json.',
			PROPERTIES_LABEL:        'Propriétés',
			VALIDATION_LABEL:        'Validation',
			MAX_VALUE_LABEL:         'Valeur minimale',
			MIN_VALUE_LABEL:         'Valeur maximale',
			MAX_VALUE_INFO:          'La valeur maximale qui doit être entrée.',
			MIN_VALUE_INFO:          'La valeur minimale qui doit être entrée.',
			INITIAL_VALUE:           'valeur initiale',
			EDITOR_SET_VALUE:        'Réglez la valeur initiale de ce champ.',
			OPTIONS_LABEL:           'Options',
			NO_TEMPLATE:             'Aucun modèle enregistré dans le cache pour le type de champ',
			CONFIGURE_FIELD:         'Configurer ce champ.',
			MOVE_DOWN:               'Descendre',
			MOVE_UP:                 'Monter',
			REMOVE:                  'Retirer',
			PALETTE:                 'Boîte à widgets',
			ALL_TYPES:               'Tous les types',
			DEBUG_LABEL:             'Déboguer',
			NO_OPTIONS:              'Pas d\'options définies',
			ADD_OPTION:              'Cliquez ici pour ajouter une option pour ce domaine .',
			OPTION_VALUE:            'Valeur',
			OPTION_TEXT:             'Libellé',
			ADD_OPTION_TO_LIST:      'Ajouter une nouvelle option à la liste',
			REMOVE_OPTION:           'Retirer cette option dans la liste',
			FIELD_NAME:              'Nom du champ',
			DISPLAY_NAME:            'Libellé',
			PLACEHOLDER_TEXT:        'Placeholder',
			TOOLTIP:                 'Description',
			OPTIONAL_MESSAGE:        'Message optionel',
			MESSAGE_LABEL:           'Message',
			MIN_LENGTH:              'Longueur minimum',
			MIN_LENGTH_INFO:         'La longueur minimum de caractères qui doivent être saisies.',
			MAX_LENGTH:              'Longueur maximum',
			MAX_LENGTH_INFO:         'La longueur maximum de caractères qui doivent être saisies.',
			PATTERN_LABEL:           'Pattern',
			PATTERN_INFO:            'La valeur d\'entrée doit correspondre au pattern désiré.',
			REQUIRED_LABEL:          'Requis    ',
			REQUIRED_INFO:           'Indique si ce champ est requis.'
		});

		$translateProvider.preferredLanguage('fr');
	}]);

	fg.config(["$provide", function ($provide) {

		$provide.provider('fgConfig', function () {

			var config = {
				enableDebugInfo: true,
				validation:      {
					messages: {},
					patterns: {}
				},
				fields:          {
					templates:  [],
					categories: {},
					renderInfo: {}
				}
			};

			var templates = config.fields.templates;

			function indexOfTemplate(type) {
				var idx = templates.length;

				while (idx--) {
					if (templates[idx].type === type) {
						break;
					}
				}

				return idx;
			}

			return {
				debug:      function (value) {
					config.enableDebugInfo = value;
				},
				fields:     {
					add:        function (objectTemplate, categories, templateUrl, propertiesTemplateUrl) {

						if (!objectTemplate || !objectTemplate.type || !categories || !categories.length) {
							throw new Error('Need a valid objectTemplate and at least one category');
						}

						var idx = indexOfTemplate(objectTemplate.type);

						if (idx !== -1) {
							templates[idx] = objectTemplate;
						} else {
							templates.push(objectTemplate);
						}

						this.category(objectTemplate.type, categories);
						this.renderInfo(objectTemplate.type, templateUrl, propertiesTemplateUrl);
					},
					remove:     function (type) {
						var idx = indexOfTemplate(type);

						if (idx !== -1) {
							templates.splice(idx, 1);
						}

						this.category(type);
						this.renderInfo(type);
					},
					renderInfo: function (fieldType, templateUrl, propertiesTemplateUrl) {
						config.fields.renderInfo[fieldType] = {
							templateUrl:           templateUrl,
							propertiesTemplateUrl: propertiesTemplateUrl
						};
					},
					category:   function (fieldType, categories) {
						if (!angular.isArray(categories)) {
							categories = [categories];
						}

						angular.forEach(config.fields.categories, function (category) {
							delete category[fieldType];
						});

						angular.forEach(categories, function (category) {
							if (config.fields.categories[category] === undefined) {
								config.fields.categories[category] = {};
							}

							config.fields.categories[category][fieldType] = true;
						});
					}
				},
				validation: {
					message: function (typeOrObject, message) {

						var messages = config.validation.messages;

						if (angular.isString(typeOrObject)) {

							if (!message) {
								throw new Error('No message specified for ' + typeOrObject);
							}

							messages[typeOrObject] = message;
						} else {
							angular.extend(messages, typeOrObject);
						}
					},
					pattern: function (nameOrObject, pattern) {

						if (angular.isString(nameOrObject)) {
							config.validation.patterns[name] = pattern;
						} else {
							angular.extend(config.validation.patterns, nameOrObject);
						}
					}
				},
				$get:       function () {
					return config;
				}
			};
		});
	}]);

	fg.config(["fgConfigProvider", "FgField", function (fgConfigProvider, FgField) {

		// Messages 'Une valeur est requise pour ce champ.'
		fgConfigProvider.validation.message({
			required:  'REQUIRED_LABEL',
			minlength: 'La valeur ne correspond pas à la longueur minimale<% field.schema && (" de " + field.schema.validation.minlength + " caractères" || "")%>.',
			maxlength: 'La valeur maximale est supérieure à la longueur<% field.schema && (" de " + field.schema.validation.maxlength + " caractères" || "")%>.',
			pattern:   'La valeur "<% field.state.$viewValue %>" ne correspond pas au format désiré.',
			email:     'La valeur "<% field.state.$viewValue %>" n\'est pas un courriel valide',
			unique:    'La valeur "<% field.state.$viewValue %>" est déjà utilisé',
			number:    'La valeur "<% field.state.$viewValue %>" n\'est pas un nombre.',
			min:       'La valeur <% field.schema && ("doit être au moins " + field.schema.validation.min) || field.state.$viewValue + " n\'est pas conforme." %>',
			max:       'La valeur <% field.schema && ("doit être inférieure à " + field.schema.validation.max) || field.state.$viewValue + " n\'est pas conforme." %>'
		});

		// Fields
		var categories = {
			'Texte':              [
				new FgField('text', {
					displayName: 'Textbox'
				}),
				new FgField('email', {
					displayName: 'Courriel'
				}),
				new FgField('number', {
					validation:  { maxlength: 15 },
					displayName: 'Nombre'
				}),
				new FgField('password', {
					displayName: 'Mot de passe'
				}),
				new FgField('textarea')
			],
			'Checkbox':           [
				new FgField('checkbox', { nolabel: true }),
				new FgField('checkboxlist', {
					displayName: 'Liste de checkbox',
					options:     [
						{
							value: '1',
							text:  'Option 1'
						}
					],
					value:       {
						'1': true,
						'2': true
					}
				})
			],
			'Boîte de sélection': [
				new FgField('radiobuttonlist', {
					displayName: 'Liste de radios',
					options:     [
						{
							value: '1',
							text:  'Option 1'
						}
					],
					value:       '1'
				}),
				new FgField('selectlist', {
					displayName: 'Selecteur',
					options:     [
						{
							value: '1',
							text:  'Option 1'
						}
					],
					value:       '1'
				})
			]
		};

		angular.forEach(categories, function (fields, category) {
			angular.forEach(fields, function (field) {
				fgConfigProvider.fields.add(field, category /*, templateUrl, propertiesTemplateUrl */);
			});
		});

		// Patterns
		fgConfigProvider.validation.pattern({
			'Aucun':                 undefined,
			'Url':                   '^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$',
			'Domaine':               '^([a-z][a-z0-9\\-]+(\\.|\\-*\\.))+[a-z]{2,6}$',
			'Courriel':              '^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$',
			'Nombre entier':         '^-{0,1}\\d+$',
			'Nombre entier positif': '^\\d+$',
			'Mot de passe':          '(?=.*\\d)(?=.*[!@#$%^&*\\-=()|?.\"\';:]+)(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$'
		});
	}]);

	fg.directive('fgBindExpression', ["$interpolate", function ($interpolate) {

		function buildWatchExpression(interpolateFn) {
			var sb = [];
			var expressions = interpolateFn.expressions;
			var ii = expressions.length;

			while (ii--) {
				var expression = expressions[ii];

				if (expression.exp && !expression.exp.match(/^\s*$/)) {
					sb.push(expression.exp);
				}
			}

			return '[' + sb.join() + ']';
		}

		return function (scope, element, attr) {

			var interpolateFn, watchHandle, oldWatchExpr;

			function cleanWatchHandle() {
				if (watchHandle) watchHandle();
				watchHandle = undefined;
			}

			function interpolateExpression() {
				element.text(interpolateFn(scope));
			}

			scope.$on('$destroy', function () {
				cleanWatchHandle();
			});

			scope.$watch(attr.fgBindExpression, function (value) {
				if (value !== undefined) {
					interpolateFn = $interpolate(value);

					element.addClass('ng-binding').data('$binding', interpolateFn);

					var watchExpr = buildWatchExpression(interpolateFn);

					if (oldWatchExpr !== watchExpr) {

						oldWatchExpr = watchExpr;

						cleanWatchHandle();

						watchHandle = scope.$watchCollection(watchExpr, function () {
							interpolateExpression();
						});
					} else {
						interpolateExpression();
					}
				}
			});
		};
	}]);

	fg.directive('fgDropdownInput', ["$compile", "$document", "$timeout", "$parse", "fgUtils", function ($compile, $document, $timeout, $parse, fgUtils) {

		function createInput($scope, $element, $attrs) {

			var template = '<div class="fg-dropdown-input input-group">' +
				'<input type="text" class="form-control"/>' +
				'<span class="input-group-btn">' +
				'<button class="btn btn-default" type="button" ng-click="dropdownToggle()">' +
				'<span class="caret"></span>' +
				'</button>' +
				'</span>' +
				'</div>';

			var $template = angular.element(template);
			var $input = $template.find('input');
			var attributes = $element.prop("attributes");

			angular.forEach(attributes, function (a) {
				if (a.name !== 'fg-dropdown-input' && a.name !== 'class') {
					$input.attr(a.name, a.value);
				}
			});

			var $button = $template.find('button');
			var closeTimeout;

			$scope.dropdownToggle = function () {

				$scope.dropdownVisible = !$scope.dropdownVisible;
			};

			$scope.$on('$destroy', function () {
				if (closeTimeout) $timeout.cancel(closeTimeout);
				closeTimeout = undefined;
			});

			return $template;
		}

		function createDropdown($scope, $element, $attrs, ngModelCtrl, $input) {

			var modelGetter = $parse($attrs.ngModel);
			var modelSetter = modelGetter.assign;

			var template = '<div class="fg-dropdown" ng-class="{ \'open\': dropdownVisible }">' +
				'<ul ng-if="items && items.length" class="dropdown-menu">' +
				'<li ng-repeat="item in items" ng-class="{ active: item.value === getModelValue() }">' +
				'<a href="" ng-click="setModelValue(item.value)"><% item.text || item.value %></a>' +
				'</li>' +
				'</ul>' +
				'</div>';

			var $template = angular.element(template);

			$scope.setModelValue = function (value) {

				$scope.dropdownVisible = false;

				var viewValue = value || '';

				var idx = ngModelCtrl.$formatters.length;

				while (idx--) {
					var fn = ngModelCtrl.$formatters[idx];
					var viewValue = fn(viewValue);

					if (viewValue === undefined) {
						break;
					}
				}


				// Parse the viewValue

				idx = ngModelCtrl.$parsers.length;
				var pv = viewValue;

				while (idx--) {
					var fn = ngModelCtrl.$parsers[idx];
					pv = fn(pv);

					if (pv === undefined) {
						break;
					}
				}

				if (pv === undefined) {
					// Failed to parse.
					// Set the formatted string in the input, which will retrigger the parsing and display the correct error message.

					ngModelCtrl.$setViewValue(viewValue);
					ngModelCtrl.$render();

				} else {
					modelSetter($scope, value);
				}
			};

			$scope.getModelValue = function () {
				return modelGetter($scope);
			};

			var input = $input[0];

			$scope.$watch('dropdownVisible', function (value) {
				if (value) {

					var rect = input.getBoundingClientRect();
					var scroll = fgUtils.getScrollOffset();

					$template.css({
						left:  (scroll.x + rect.left) + 'px',
						top:   (scroll.y + rect.top + input.clientHeight) + 'px',
						width: input.clientWidth + 'px'
					});
				}
			});

			$scope.$watchCollection($attrs.fgDropdownInput, function (value) {
				$scope.items = value;
			});

			$scope.$on('$destroy', function () {
				$template.remove();
			});

			return $template;
		}

		return {
			priority: 1000,
			restrict: 'A',
			terminal: true,
			scope:    true,
			compile:  function (tElement, tAttrs) {

				return function link($scope, $element, $attrs, ctrls) {

					var $input = createInput($scope, $element, $attrs);

					$element.append($input);
					$compile($input)($scope);

					var $inputText = $input.find('input');
					var ngModelCtrl = $inputText.controller('ngModel');

					////////////////////////////////////////

					var $dropdown = createDropdown($scope, $element, $attrs, ngModelCtrl, $input);
					var dropdownCompileFn = $compile($dropdown);

					var $body = $document.find('body');

					$body.append($dropdown);

					dropdownCompileFn($scope);

					////////////////////////////////////////
				};
			}
		};
	}]);

	fg.directive('fgNullForm', function () {

		var nullFormCtrl = {
			$addControl:    angular.noop,
			$removeControl: angular.noop,
			$setValidity:   angular.noop,
			$setDirty:      angular.noop,
			$setPristine:   angular.noop
		};

		return {
			restrict: 'A',
			require:  ['form'],
			link:     function link($scope, $element, $attrs, $ctrls) {

				var form = $ctrls[0];

				// Locate the parent form

				var parentForm = $element.parent().inheritedData('$formController');

				if (parentForm) {

					// Unregister this form controller

					parentForm.$removeControl(form);
				}

				// Nullify the form

				angular.extend(form, nullFormCtrl);
			}
		};
	});

	fg.directive('fgFormRequiredFilter', function () {

		return {
			restrict: 'A',
			require:  ['form'],
			link:     function ($scope, $element, $attrs, $ctrls) {

				var form = $ctrls[0];

				var $setValidity = form.$setValidity;

				form.$setValidity = function (validationToken, isValid, control) {

					if (validationToken === 'required') {
						isValid = true;
					}

					$setValidity.call(form, validationToken, isValid, control);
				};
			}
		};
	});

	fg.directive('fgInputNumber', function () {
		return {
			require: 'ngModel',
			link:    function (scope, element, attr, ctrl) {

				ctrl.$parsers.push(function (inputValue) {
					// this next if is necessary for when using ng-required on your input.
					// In such cases, when a letter is typed first, this parser will be called
					// again, and the 2nd time, the value will be undefined
					if (inputValue == undefined) {
						return '';
					}

					var transformedInput = inputValue.replace(/[^0-9]/g, '');

					var value = parseInt(transformedInput);
					value === NaN ?
						undefined :
						value;

					if (transformedInput != inputValue) {
						ctrl.$setViewValue(transformedInput);
						ctrl.$render();
					}

					return value;

				});

				ctrl.$parsers.push(function (value) {
					var empty = ctrl.$isEmpty(value);
					if (empty || /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/.test(value)) {
						ctrl.$setValidity('number', true);
						return value === '' ?
							null :
							(empty ?
								value :
								parseFloat(value));
					} else {
						ctrl.$setValidity('number', false);
						return undefined;
					}
				});

				ctrl.$formatters.push(function (value) {
					return ctrl.$isEmpty(value) ?
						undefined :
						value.toString();
				});

				if (attr.min) {
					var minValidator = function (value) {
						var min = parseFloat(attr.min);
						if (!ctrl.$isEmpty(value) && value < min) {
							ctrl.$setValidity('min', false);
							return undefined;
						} else {
							ctrl.$setValidity('min', true);
							return value;
						}
					};

					ctrl.$parsers.push(minValidator);
					ctrl.$formatters.push(minValidator);
				}

				if (attr.max) {
					var maxValidator = function (value) {
						var max = parseFloat(attr.max);
						if (!ctrl.$isEmpty(value) && value > max) {
							ctrl.$setValidity('max', false);
							return undefined;
						} else {
							ctrl.$setValidity('max', true);
							return value;
						}
					};

					ctrl.$parsers.push(maxValidator);
					ctrl.$formatters.push(maxValidator);
				}

				ctrl.$formatters.push(function (value) {

					if (ctrl.$isEmpty(value) || angular.isNumber(value)) {
						ctrl.$setValidity('number', true);
						return value;
					} else {
						ctrl.$setValidity('number', false);
						return undefined;
					}
				});
			}
		};
	});

	fg.directive('fgPlaceholder', function () {

		return {
			link: function ($scope, $element, $attrs) {
				$scope.$watch($attrs.fgPlaceholder, function (value) {
					$element.attr('placeholder', value);
				});
			}
		};
	});

	fg.factory('fgUtils', ["$window", "fgConfig", function ($window, fgConfig) {

		var uniqueCounter = (+new Date) % 10000;

		return {
			getScrollOffset:     function () {

				var offset = {};

				if ($window.pageYOffset !== undefined) {
					offset.x = $window.pageXOffset;
					offset.y = $window.pageYOffset;
				} else {
					var de = $window.document.documentElement;
					offset.x = de.scrollLeft;
					offset.y = de.scrollTop;
				}

				return offset;
			},
			defaultArea:         'default',
			getRenderInfo:       function (field) {

				var renderInfo = fgConfig.fields.renderInfo[field.type];

				if (!renderInfo) {
					renderInfo = {};
					fgConfig.fields.renderInfo[field.type] = renderInfo;
				}

				if (!renderInfo.templateUrl) {
					renderInfo.templateUrl = this.getTemplateUrl(field);
				}

				if (!renderInfo.propertiesTemplateUrl) {
					renderInfo.propertiesTemplateUrl = this.getTemplateUrl(field, 'properties');
				}

				return renderInfo;
			},
			formatTemplateUrl:   function (type, area) {
				return templatePrefix + 'field/' + (area || this.defaultArea) + '/' + type + '.ng.html';
			},
			getTemplateUrl:      function (field, area) {

				area = area || this.defaultArea;
				var templateType = field.type;
				var templateUrl = this.formatTemplateUrl(templateType, area);
				return templateUrl;
			},
			getUnique:           function () {
				return ++uniqueCounter;
			},
			copyField:           function (field) {
				var copy = angular.copy(field);
				copy.name = 'propriete_' + this.getUnique();
				return copy;
			},
			findElementsByClass: function (root, className, recursive, buffer) {
				buffer = buffer || [];

				if (root.className === className) {
					buffer.push(root);
				}

				if (root.hasChildNodes()) {
					for (var i = 0; i < root.children.length; i++) {
						var child = root.children[i];
						if (child.className === className) {
							buffer.push(child);
						}
						if (recursive) {
							this.findElementsByClass(child, className, recursive, buffer);
						}
					}
				}

				return buffer;
			}
		};
	}]);

	angular.module('dq', []).factory('dqUtils', ["$window", "$rootScope", function ($window, $rootScope) {

		var _dragData = null;

		//noinspection FunctionWithInconsistentReturnsJS
		return {
			getEvent:      function (e) {
				return e && e.originalEvent ?
					e.originalEvent :
					e || $window.event;
			},
			stopEvent:     function (e) {
				// e.cancelBubble is supported by IE8 -
				// this will kill the bubbling process.
				e.cancelBubble = true;
				e.bubbles = false;

				// e.stopPropagation works in modern browsers
				if (e.stopPropagation) e.stopPropagation();
				if (e.preventDefault) e.preventDefault();

				return false;
			},
			dragData:      function (data) {
				if (data === undefined) {
					return _dragData;
				}
				_dragData = data;
			},
			getParentArea: function ($scope) {
				var area = {};
				$scope.$emit('dqLocateArea', area);
				return area.name;
			},
			isAreaMatch:   function ($scope) {
				var parentArea = this.getParentArea($scope);
				var eventArea = _dragData ?
					_dragData.area :
					"";

				return parentArea === eventArea;
			}
		};
	}]);

	angular.module('dq').directive('dqDragArea', ["dqUtils", function (dqUtils) {

		function evalBroadcastEvent($scope, args, areaName, expression) {
			if (expression && args && args.area === areaName) {
				$scope.$eval(expression);
			}
		}

		return {
			restrict: 'AEC',
			link:     function ($scope, $element, $attrs) {

				var areaName = $attrs.dqDragArea || $attrs.dqDragAreaName || "";

				$scope.$on('dqDragBegin', function ($event, args) {
					evalBroadcastEvent($scope, args, areaName, $attrs.dqDragProgressBegin);
				});

				$scope.$on('dqDragEnd', function ($event, args) {
					evalBroadcastEvent($scope, args, areaName, $attrs.dqDragProgressEnd);
				});

				$scope.$on('dqLocateArea', function ($event, args) {
					args.name = areaName;
					$event.stopPropagation();
				});
			}
		}
	}]);

	angular.module('dq').directive('dqDragEnter', ["dqDragTrack", function (dqDragTrack) {
		return {
			link: dqDragTrack
		};
	}]).directive('dqDragLeave', ["dqDragTrack", function (dqDragTrack) {
		return {
			link: dqDragTrack
		};
	}]).directive('dqDragOver', ["dqDragTrack", function (dqDragTrack) {
		return {
			link: dqDragTrack
		};
	}]).directive('dqDrop', ["dqDragTrack", function (dqDragTrack) {
		return {
			link: dqDragTrack
		};
	}]).factory('dqDragTrack', ["dqUtils", "$document", function (dqUtils, $document) {

		// Combines both nq-drag-enter & nq-drag-leave & nq-drag-over

		return function ($scope, $element, $attrs) {

			// Tracking already set on the element?

			if ($element.data('dqDragTrack') !== true) {

				var trackingEnabled = false; // Toggled on drag-begin if the area name does not match the target
				var inbound = false; // Toggle to indicate if the dragging is in or outbound element
				var element = $element[0];
				var dropEffect = 'none'; // Drop effect used in the dragover event
				var doingLeaveDoubleCheck = false; // Toggle that indicates the body has a dragover event to do.

				var $body = $document.find('body');

				function dragLeaveDoubleCheck($e) {
					var e = dqUtils.getEvent($e);

					// Check if the drag over element is a child of the this element

					var target = e.target || $e.target;

					if (target !== element) {

						// TODO: we're not really checking if the target element is visually within the $element.

						if (!element.contains(target)) {

							// Drag over element is out of bounds

							dragLeaveForSure(true);
						}
					}

					// We're done with the expensive body call

					$body.off('dragover', dragLeaveDoubleCheck);

					// Notify the local element event callback there's no event listener on the body and the next event
					// can safely be cancelled.

					doingLeaveDoubleCheck = false;

					e.dataTransfer.dropEffect = dropEffect;

					// Always cancel the dragover -- otherwise the dropEffect is not used.

					return dqUtils.stopEvent($e);
				}

				function dragLeaveForSure(apply) {
					inbound = false;
					var expression = $attrs.dqDragLeave;
					if (expression) {
						if (apply) {
							$scope.$apply(function () {
								$scope.$eval(expression);
							});
						} else {
							$scope.$eval(expression);
						}
					}
				}

				$scope.$on('$destroy', function () {
					// Just to be sure
					$body.off('dragover', dragLeaveDoubleCheck);
				});

				$scope.$on('dqDragBegin', function () {
					// Check if we should track drag movements
					trackingEnabled = dqUtils.isAreaMatch($scope);
				});

				$scope.$on('dqDragEnd', function () {
					if (trackingEnabled) {
						// Gief cake
						dragLeaveForSure(false);
					}
				});

				$element.on('dragenter', function (e) {
					if (trackingEnabled && inbound === false) {
						inbound = true;
						var expression = $attrs.dqDragEnter;
						if (expression) {
							$scope.$apply(function () {
								$scope.$eval(expression);
							});
						}
					}
				});

				$element.on('dragleave', function () {
					if (trackingEnabled && inbound === true) {

						// dragleave is a lie -- hovering child elements will cause this event to trigger also.
						// We fake the cake by tracking the drag ourself.

						// Notify the "real" dragover event that he has to play nice with the body and not to
						// cancel the event chain.

						doingLeaveDoubleCheck = true;
						$body.on('dragover', dragLeaveDoubleCheck);
					}
				});

				//noinspection FunctionWithInconsistentReturnsJS
				$element.on('dragover', function ($e) {

					if (trackingEnabled) {

						var e = dqUtils.getEvent($e);

						var expression = $attrs.dqDragOver;
						var result;

						if (expression) {
							$scope.$apply(function () {
								result = $scope.$eval(expression);
							});
						}

						// The evaluated expression can indicate to cancel the drop

						dropEffect = result === false ?
							'none' :
							'copy';

						if (!doingLeaveDoubleCheck) {

							// There's no dragover queued on the body.
							// The event needs to be terminated here else the dropEffect will
							// not be applied (and dropping is not allowed).

							e.dataTransfer.dropEffect = dropEffect;
							return dqUtils.stopEvent($e);
						}
					}
				});

				//noinspection FunctionWithInconsistentReturnsJS
				$element.on('drop', function ($e) {

					var e = dqUtils.getEvent($e);

					if (trackingEnabled) {
						var expression = $attrs.dqDrop;

						if (expression) {
							$scope.$apply(expression);
						}
					}

					return dqUtils.stopEvent($e);
				});

				// Ensure that we only do all this magic stuff on this element for one time only.

				$element.data('dqDragTrack', true);
			}
		};
	}]);

	angular.module('dq').directive('dqDraggable', ["dqUtils", "$rootScope", function (dqUtils, $rootScope) {

		function evalAndBroadcast(eventName, targetArea, $scope, expression, cb) {
			$scope.$apply(function () {
				var data = $scope.$eval(expression);

				var bcData = {
					area: targetArea,
					data: data
				};

				cb(bcData);

				$rootScope.$broadcast(eventName, bcData);
			});
		}

		return {
			restrict: 'AEC',
			link:     function ($scope, $element, $attrs) {

				var targetArea = $attrs.dqDraggable || $attrs.dqDragTargetArea || "";
				var disabled = false;

				$scope.$watch($attrs.dqDragDisabled, function (value) {
					disabled = value;
					$element.attr('draggable', disabled ?
						'false' :
						'true');
				});

				$element.on('selectstart', function (e) {

					// Pure IE evilness

					if (!disabled && this.dragDrop) {
						this.dragDrop();
						e = dqUtils.getEvent(e);
						return dqUtils.stopEvent(e);
					}
				}).on('dragstart', function (e) {

					e = dqUtils.getEvent(e);

					if (disabled) {
						return dqUtils.stopEvent(e);
					}

					var dt = e.dataTransfer;
					dt.effectAllowed = 'all';
					dt.setData('Text', '');

					evalAndBroadcast('dqDragBegin', targetArea, $scope, $attrs.dqDragBegin, function (dragData) {
						dqUtils.dragData(dragData);
					});

				}).on('dragend', function () {

					evalAndBroadcast('dqDragEnd', targetArea, $scope, $attrs.dqDragEnd, function () {
						dqUtils.dragData(null);
					});

				});
			}
		};
	}]);

	fg.controller('fgEditController', ["$scope", "fgUtils", "$location", function ($scope, fgUtils, $location) {

		var self = this;


		$scope.$watch(function () {

			var schema = $scope.schemaCtrl.model();

			if (schema) {

				var fields = schema.fields;

				if (fields) {

					var i = fields.length;

					while (--i >= 0 && !schema.$$_invalid) {
						schema.$$_invalid = fields[i].$$_invalid;
					}
				}
			}

		});
	}]);

	fg.directive('fgEdit', function () {
		return {
			priority:    100,
			require:     'fgSchema',
			restrict:    'AE',
			scope:       {
				// // The schema model to edit
				schema: '=?fgSchema'
			},
			replace:     true,
			controller:  'fgEditController as editCtrl',
			templateUrl: templatePrefix + 'edit/edit.ng.html',
			link:        function ($scope, $element, $attrs, schemaCtrl) {

				if ($scope.schema === undefined) {
					$scope.schema = {};
				}

				schemaCtrl.model($scope.schema);
				$scope.schemaCtrl = schemaCtrl;
			}
		}
	});

	fg.controller('fgFormController', ["$scope", "$parse", function ($scope, $parse) {

		this.model = {};
		var self = this;

		this.init = function (dataExpression, schema, state, editMode) {

			self.editMode = editMode;

			var dataGetter = $parse(dataExpression);
			var dataSetter = dataGetter.assign;

			$scope.$watch(dataGetter, function (value) {
				if (value === undefined) {
					value = {};

					if (dataSetter) {
						dataSetter($scope, value);
					}
				}

				self.model.data = value;
			});

			$scope.$watch(function () {
				return schema.model();
			}, function (value) {
				if (value === undefined) {
					schema.model({});
				} else {
					self.model.schema = value;
				}
			});

			self.model.state = state;


			return self.model;
		};
	}]);

	fg.directive('fgForm', ["fgFormCompileFn", function (fgFormCompileFn) {
		return {
			restrict:   'AE',
			require:    ['^?form', 'fgForm', '^fgSchema'],
			controller: 'fgFormController',
			scope:      true,
			compile:    fgFormCompileFn
		};
	}]).factory('fgFormLinkFn', function () {
		return function link($scope, $element, $attrs, ctrls) {

			var ngFormCtrl = ctrls[0];
			var formCtrl = ctrls[1];
			var schemaCtrl = ctrls[2];

			var editMode = $attrs.fgNoRender === 'true';

			formCtrl.init($attrs.fgFormData, schemaCtrl, ngFormCtrl, editMode);
		};
	}).factory('fgFormCompileFn', ["fgFormLinkFn", function (fgFormLinkFn) {
		return function ($element, $attrs) {

			$element.addClass('fg-form');

			var noRender = $attrs.fgNoRender;

			if (noRender !== 'true') {
				var renderTemplate = '<div fg-form-fields></div>';
				$element.append(renderTemplate);
			}

			return fgFormLinkFn;
		};
	}]);


	fg.directive('fgValidationSummary', ["fgValidationSummaryLinkFn", function (fgValidationSummaryLinkFn) {

		return {
			require:     ['^?fgField', '^?form'],
			templateUrl: templatePrefix + 'validation/summary.ng.html',
			scope:       {
				fieldName:          '@?fgValidationSummary',
				validationMessages: '=?fgValidationMessages'
			},
			link:        fgValidationSummaryLinkFn
		};
	}]).factory('fgValidationSummaryLinkFn', ["fgConfig", function (fgConfig) {

		return function ($scope, $element, $attrs, ctrls) {

			var fgFieldCtrl = ctrls[0];
			var ngFormController = ctrls[1];

			if (fgFieldCtrl) {
				// Grab the whole field state from the field controller
				$scope.field = fgFieldCtrl.field();
				$scope.form = fgFieldCtrl.form();

			} else if (ngFormController) {

				$scope.form = {
					state: ngFormController
				};

				$scope.$watch('fieldName', function (value) {
					$scope.field = {
						name:  value,
						state: ngFormController[value]
					};
				});
			}

			if ($scope.validationMessages) {
				angular.forEach($scope.validationMessages, function (value, key) {
					if (!value) {
						delete $scope.validationMessages[key];
					}
				});
			}

			$scope.messages = angular.extend({}, fgConfig.validation.messages, $scope.validationMessages);
		};
	}]);
	fg.directive('fgUniqueFieldName', function () {

		var changeTick = 0;

		function validate(ngModelCtrl, schemaCtrl, field) {

			var schema = schemaCtrl.model();
			var valid = true;
			var schemaField;

			if (schema) {

				var fields = schema.fields;

				for (var i = 0; i < fields.length; i++) {
					schemaField = fields[i];
					if (schemaField !== field && field.name === schemaField.name) {
						valid = false;
						break;
					}
				}
			}

			ngModelCtrl.$setValidity('unique', valid);
		}

		return {
			priority: 100,
			require:  ['ngModel', '^fgSchema'],
			link:     function ($scope, $element, $attrs, ctrls) {

				var ngModelCtrl = ctrls[0];
				var schemaCtrl = ctrls[1];

				var field = $scope.field;

				if (!field) {
					throw Error('No field property on scope');
				}

				$scope.$watch(function () {
					return ngModelCtrl.$modelValue;
				}, function () {

					++changeTick;
				});

				$scope.$watch(function () {
					return changeTick;
				}, function () {

					validate(ngModelCtrl, schemaCtrl, field);
				});
			}
		};
	});

	fg.controller('fgTabsController', function () {

		this.items = [];
		this.active = null;

		this.add = function (item) {
			this.items.push(item);

			this.items.sort(function (x, y) {
				return x.order - y.order;
			});

			if (!this.active && item.autoActive != false) {
				this.activate(item);
			}
		};

		this.activate = function (item) {

			if (!item.disabled) {
				this.active = item;
			}

		};
	});

	fg.directive('fgTabs', function () {
		return {
			require:     ['fgTabs'],
			restrict:    'EA',
			transclude:  true,
			controller:  'fgTabsController',
			templateUrl: templatePrefix + 'common/tabs.ng.html',
			scope:       {
				'tabs': '=?fgTabs'
			},
			link:        function ($scope, $element, $attrs, $ctrls) {
				$scope.tabs = $ctrls[0];
			}
		};
	});

	fg.directive('fgTabsPane', ["fgTabsPaneLinkFn", function (fgTabsPaneLinkFn) {
		return {
			require:     ['^fgTabs'],
			restrict:    'EA',
			transclude:  true,
			templateUrl: templatePrefix + 'common/tabs-pane.ng.html',
			link:        fgTabsPaneLinkFn,
			scope:       true
		};
	}]).factory('fgTabsPaneLinkFn', function () {
		return function ($scope, $element, $attrs, $ctrls) {

			$scope.tabs = $ctrls[0];

			$scope.pane = {
				title:        $attrs.fgTabsPane || $attrs.title,
				order:        parseInt($attrs.fgTabsPaneOrder || $attrs.order) || 10,
				autoActive:   !($attrs.fgTabsPaneAutoActive === "false" || $attrs.autoActive === "false"),
				renderAlways: $attrs.fgTabsPaneRenderAlways === "true" || $attrs.renderAlways === "true"
			};

			$scope.$watch($attrs.disabled, function (value) {
				$scope.pane.disabled = value;
			});

			$scope.tabs.add($scope.pane);
		};
	});

	function fgToJsonReplacer(key, value) {
		var val = value;

		if (typeof key === 'string' && key.charAt(0) === '$') {
			val = undefined;
		}
		return val;
	}

	fg.filter('j$on', function () {
		return function (input, displayHidden) {

			if (displayHidden)
				return JSON.stringify(input || {}, null, '  ');

			return JSON.stringify(input || {}, fgToJsonReplacer, '  ');
		};
	}).directive('jsonify', ["$window", "$filter", function ($window, $filter) {
		return {
			templateUrl: templatePrefix + 'common/jsonify.ng.html',
			replace:     true,
			scope:       {
				jsonify:       "=",
				displayHidden: "@jsonifyDisplayHidden"
			},
			link:        function ($scope, $element, $attrs, ctrls) {
				$scope.expression = $attrs.jsonify;

				$scope.copy = function () {
					$window.prompt("Copy to clipboard: Ctrl+C, Enter", $filter('j$on')($scope.jsonify, $scope.displayHidden));
				};
			}
		};
	}]);

	fg.controller('fgEditCanvasController', ["$scope", "dqUtils", "$timeout", "fgUtils", function ($scope, dqUtils, $timeout, fgUtils) {

		$scope.dragPlaceholder = {
			visible: false,
			index:   0
		};

		$scope.$on('dqDragBegin', function () {
			$scope.dragging = true;
		});

		$scope.$on('dqDragEnd', function () {
			$scope.dragging = false;
		});

		this.dragEnter = function () {
			$scope.dragPlaceholder.visible = true;
			$scope.dragPlaceholder.index = $scope.schema.fields.length;
		};

		this.dragLeave = function () {
			$scope.dragPlaceholder.visible = false;
		};

		this.dragBeginCanvasField = function (index, field) {

			// Delay is set to prevent browser from copying adjusted html as copy image
			$timeout(function () {
				field.$_isDragging = true;
			}, 1);

			return { source: 'canvas', field: field, index: index };
		};

		this.dragEndCanvasField = function (field) {

			$timeout(function () {
				field.$_isDragging = false;
			}, 10);
		};

		this.drop = function () {

			var dragData = dqUtils.dragData();

			if (dragData && dragData.data) {

				var field = dragData.data.field;
				var source = dragData.data.source;
				var index = dragData.data.index;
				var fields = $scope.schema.fields;

				if (source == 'palette') {
					$scope.schemaCtrl.addField(field, $scope.dragPlaceholder.index);

				} else if (source == 'canvas') {
					$scope.schemaCtrl.moveField(index, $scope.dragPlaceholder.index);
				}

				// IE fix: not calling dragEnd sometimes
				field.$_isDragging = false;
			} else {
				throw Error('Drop without data');
			}
		};
	}]);

	fg.directive('fgEditCanvas', function () {

		return {
			require:     ['^fgEdit', '^fgSchema', '^form'],
			templateUrl: templatePrefix + 'edit/canvas.ng.html',
			controller:  'fgEditCanvasController as canvasCtrl',
			link:        function ($scope, $element, $attrs, ctrls) {
				$scope.editCtrl = ctrls[0];
				$scope.schemaCtrl = ctrls[1];
				$scope.formCtrl = ctrls[2];

				var ignoreDirty = true;

				$scope.$watchCollection('schema.fields', function () {

					// Ignore the first call, $watchCollection fires at once without any changes.

					if (!ignoreDirty) {
						$scope.formCtrl.$setDirty(true);
					}

					ignoreDirty = false;

				});
			}
		};
	});

	fg.controller('fgEditPaletteController', ["$scope", "fgConfig", function ($scope, fgConfig) {

		$scope.templates = angular.copy(fgConfig.fields.templates);

		var count = 0;

		$scope.templateFilter = function (template) {
			return !$scope.selectedCategory || $scope.selectedCategory[template.type];
		};
	}]);
	fg.directive('fgEditPalette', function () {
		return {
			require:     ['^fgSchema'],
			templateUrl: templatePrefix + 'edit/palette.ng.html',
			controller:  'fgEditPaletteController',
			link:        function ($scope, $element, $attrs, ctrls) {
				$scope.schemaCtrl = ctrls[0];
			}
		};
	});
	fg.controller('fgFieldController', ["$scope", "fgUtils", function ($scope, fgUtils) {

		var self = this;
		var _form, _field;

		this.init = function (fgFormCtrl, fieldSchema, editMode) {

			self.initForm(fgFormCtrl);
			self.initField(fieldSchema);
			self.initDefaultData(fieldSchema, editMode);

			$scope.form = _form;
			$scope.field = _field;

		};

		this.initForm = function (fgFormCtrl) {
			_form = fgFormCtrl ?
				fgFormCtrl.model :
				{};

			return _form;
		};

		this.initField = function (fieldSchema) {

			_field = {
				$_id:   'id' + fgUtils.getUnique(),
				schema: fieldSchema
			};

			$scope.$watch('field.schema.name', function (value, oldValue) {
				self.registerState(value);
			});

			return _field;
		};

		this.initDefaultData = function (fieldSchema, editMode) {

			var fieldName = fieldSchema.name;

			_form.data = _form.data || {};

			if (editMode) {

				$scope.$watch('field.schema.value', function (value) {
					_form.data[fieldSchema.name] = value;
				});

				$scope.$watch('field.schema.name', function (value, oldValue) {
					if (value !== oldValue) {
						var data = _form.data[oldValue];
						delete _form.data[oldValue];
						_form.data[value] = data;
					}
				});

			} else if (_form.data && _form.data[fieldName] === undefined && fieldSchema.value !== undefined) {
				_form.data[fieldName] = fieldSchema.value;
			}

			return _form.data;
		};

		this.setFieldState = function (state) {
			// Called by the field-input directive
			_field.state = state;
			self.registerState(_field.schema.name);
		};

		this.registerState = function (fieldName) {
			// Re-register the ngModelCtrl with the form controller
			// whenever the name of the field has been modified.

			if (_form.state && _field.state) {
				_form.state.$removeControl(_field.state);
				_field.state.$name = fieldName;
				_form.state.$addControl(_field.state);
			}

			_field.name = fieldName;

		};

		this.field = function () {
			return _field;
		};

		this.form = function () {
			return _form;
		};
	}]);
	fg.directive('fgField', ["fgFieldLinkFn", function (fgFieldLinkFn) {

		return {
			require:     ['^?fgForm', 'fgField'],
			replace:     true,
			templateUrl: templatePrefix + 'form/field.ng.html',
			scope:       {
				fieldSchema: '=fgField', // The schema definition of the field
				tabIndex:    '=?fgTabIndex', // Optional tab index -- used in overlay mode to disable focus
				editMode:    '=?fgEditMode', // Indicates edit mode, which will sync the fieldSchema.value
				// to the form data for WYSIWYG pleasures.
				noValidationSummary: '=fgNoValidationSummary' // If true hides the validation summary
			},
			controller:  'fgFieldController',
			link:        fgFieldLinkFn
		};
	}]).factory('fgFieldLinkFn', ["fgUtils", function (fgUtils) {
		return function ($scope, $element, $attrs, ctrls) {

			var fgFormCtrl = ctrls[0];
			var fgFieldCtrl = ctrls[1];

			if ($scope.tabIndex === undefined) {
				$scope.tabIndex = 'auto';
			}

			$scope.renderInfo = fgUtils.getRenderInfo($scope.fieldSchema);

			fgFieldCtrl.init(fgFormCtrl, $scope.fieldSchema, $scope.editMode);
		};
	}]);

	fg.directive('fgFieldInput', ["fgFieldInputLinkFn", function (fgFieldInputLinkFn) {
		return {
			require: ['^fgField', 'ngModel'],
			link:    fgFieldInputLinkFn
		};
	}]).factory('fgFieldInputLinkFn', function () {
		return function ($scope, $element, $attrs, ctrls) {

			var fgFieldCtrl = ctrls[0];
			var ngModelCtrl = ctrls[1];

			fgFieldCtrl.setFieldState(ngModelCtrl);
		};
	}).factory('fgUpdatePattern', function () {
		//SSchaaf http://stackoverflow.com/questions/20847979/ngpattern-binding-not-working
		//Angular migration https://docs.angularjs.org/guide/migration
		return {
			require: "^ngModel",
			link:    function (scope, element, attrs, ctrl) {
				scope.$watch(function () {
						// Evaluate the ngPattern attribute against the current scope
						alert("attrs.ngPattern", attrs.ngPattern);
						return scope.$eval(attrs.ngPattern);
					},
					function (newval, oldval) {
						//Get the value from `ngModel`
						alert("newval", newval);
						alert("oldval", oldval);
						value = ctrl.$viewValue;

						// And set validity on the model to true if the element
						// is empty  or passes the regex test
						if (ctrl.$isEmpty(value) || newval.test(value)) {
							ctrl.$setValidity('pattern', true);
							return value;
						} else {
							ctrl.$setValidity('pattern', false);
							return undefined;
						}
					});
			}
		}
	});

	fg.directive('fgFormFields', function () {

		return {
			require:     ['^?fgForm'],
			restrict:    'AE',
			templateUrl: templatePrefix + 'form/form-fields.ng.html',
			scope:       {},
			link:        function ($scope, $element, $attrs, ctrls) {

				var fgForm = ctrls[0];

				$scope.$watch(function () {
					return fgForm.model;
				}, function (value) {
					$scope.form = value;
				});
			}
		};
	});
	fg.controller('fgSchemaController', ["$scope", "fgUtils", function ($scope, fgUtils) {

		var _model;
		this.model = function (value) {
			if (value !== undefined) {
				_model = value;

				if (!angular.isArray(value.fields)) {
					value.fields = [];
				}
			}

			return _model;
		};

		this.addField = function (field, index) {

			var copy = fgUtils.copyField(field);

			index = index === undefined ?
				_model.fields.length :
				index;
			_model.fields.splice(index, 0, copy);

		};

		this.removeField = function (index) {
			_model.fields.splice(index, 1);
		};

		this.swapFields = function (idx1, idx2) {
			if (idx1 <= -1 || idx2 <= -1 || idx1 >= _model.fields.length || idx2 >= _model.fields.length) {
				return;
			}

			_model.fields[idx1] = _model.fields.splice(idx2, 1, _model.fields[idx1])[0];
		};

		this.moveField = function (fromIdx, toIdx) {
			if (fromIdx >= 0 && toIdx <= _model.fields.length && fromIdx !== toIdx) {
				var field = _model.fields.splice(fromIdx, 1)[0];
				if (toIdx > fromIdx) --toIdx;
				_model.fields.splice(toIdx, 0, field);
			}
		};
	}]);
	fg.directive('fgSchema', ["fgSchemaLinkFn", function (fgSchemaLinkFn) {

		return {
			require:    ['fgSchema'],
			controller: 'fgSchemaController',
			link:       fgSchemaLinkFn
		};
	}]).factory('fgSchemaLinkFn', function () {
		return function ($scope, $element, $attrs, ctrls) {
			var schemaCtrl = ctrls[0];

			$scope.$watch($attrs.fgSchema, function (value) {
				schemaCtrl.model(value);
			});

		};
	});

	fg.directive('fgEditCanvasField', function () {
		return {
			templateUrl: templatePrefix + 'edit/field.ng.html'
		};
	});

	fg.controller('fgEditPaletteCategoriesController', ["$scope", "fgConfig", function ($scope, fgConfig) {

		$scope.categories = fgConfig.fields.categories;

		$scope.setCategory = function (name, category) {
			$scope.categoryName = name;
			$scope.category = category;
		};

		if (!$scope.category) {
			//noinspection LoopStatementThatDoesntLoopJS
			for (var name in $scope.categories) {
				//noinspection JSUnfilteredForInLoop
				$scope.setCategory(name, $scope.categories[name]);
				break;
			}
		}
	}]);

	fg.directive('fgEditPaletteCategories', function () {
		return {
			templateUrl: templatePrefix + 'edit/categories.ng.html',
			require:     '^fgEditPalette',
			scope:       {
				category: "=?"
			},
			controller:  'fgEditPaletteCategoriesController'
		};
	});

	fg.directive('fgEditCanvasFieldProperties', ["fgUtils", function (fgUtils) {

		function setRenderAlways(tabItems) {
			var i = tabItems.length;

			while (i--) {
				var tab = tabItems[i];

				if (tab.title !== 'Debug') {
					tab.renderAlways = true;
				}
			}
		}

		return {
			templateUrl: templatePrefix + 'edit/properties.ng.html',
			scope:       {
				field: '=fgEditCanvasFieldProperties'
			},
			link:        {
				pre:  function ($scope) {
					$scope.property = {};
				},
				post: function ($scope) {

					$scope.$watch('fieldPropertiesForm.$invalid', function (newValue) {
						$scope.field.$$_invalid = newValue;
					});

					$scope.renderInfo = fgUtils.getRenderInfo($scope.field);


					$scope.$watch('property.tabs.items.length', function (value) {
						if (value) {
							setRenderAlways($scope.property.tabs.items);
						}
					});

				}
			}
		};
	}]);

	fg.controller('fgPropertyFieldOptionsController', ["$scope", function ($scope) {

		var self = this;
		var optionCounter = 1;

		// Monitor for changes in the options array and ensure a
		// watch for every option value.
		// Watchers are deleted when removing options from the array.

		$scope.$watchCollection('field.options', function (options) {
			if (options) {
				angular.forEach(options, function (option) {
					if (!option.$_valueWatchFn) {
						option.$_valueWatchFn = $scope.$watch(function () {
							return option.value;
						}, handleValueChange);
					}
				});
			}
		});

		function handleValueChange(newValue, oldValue) {

			// Called by the watch collection
			// Ensure that when the selected value is changed, this
			// is synced to the field value.

			if (newValue !== oldValue) {
				if ($scope.multiple) {
					$scope.field.value[newValue] = $scope.field.value[oldValue];
					delete $scope.field.value[oldValue];
				} else {
					if (oldValue === $scope.field.value) {
						$scope.field.value = newValue;
					}
				}
			}
		}

		this.addOption = function () {

			if (!$scope.field.options) {
				$scope.field.options = [];
			}

			var option = {
				value: 'Option ' + optionCounter++
			};

			$scope.field.options.push(option);

			var count = $scope.field.options.length;

			if (!$scope.multiple && count === 1) {
				$scope.field.value = option.value;
			}

		};

		this.removeOption = function (index) {
			var options = $scope.field.options.splice(index, 1);

			if (options && options.length) {

				var option = options[0];

				if ($scope.multiple) {

					if ($scope.field.value[option.value] !== undefined)
						delete $scope.field.value[option.value];

				} else {

					if (option.value === $scope.field.value && $scope.field.options.length) {
						$scope.field.value = $scope.field.options[0].value;
					}

					option.$_valueWatchFn();
				}
			}
		};
	}]);
	fg.directive('fgPropertyFieldOptions', ["fgPropertyFieldOptionsLinkFn", function (fgPropertyFieldOptionsLinkFn) {
		return {
			scope:       true,
			controller:  'fgPropertyFieldOptionsController as optionsCtrl',
			templateUrl: templatePrefix + 'edit/options.ng.html',
			link:        fgPropertyFieldOptionsLinkFn
		};
	}]).factory('fgPropertyFieldOptionsLinkFn', function () {
		return function ($scope, $element, $attrs, ctrls) {

			$scope.multiple = false;

			$attrs.$observe('fgPropertyFieldOptions', function (value) {
				if (value === 'multiple') {
					$scope.multiple = true;
				}
			});
		};
	});
	fg.directive('fgPropertyFieldCommon', ["fgPropertyFieldCommonLinkFn", function (fgPropertyFieldCommonLinkFn) {
		return {
			restrict:    'AE',
			templateUrl: templatePrefix + 'edit/common.ng.html',
			link:        fgPropertyFieldCommonLinkFn
		};
	}]).factory('fgPropertyFieldCommonLinkFn', function () {
		return function ($scope, $element, $attrs, ctrls) {

			$scope.fields = {
				fieldname:   false,
				displayname: false,
				placeholder: false,
				tooltip:     false,
				focus:       false
			};

			$scope.$watch($attrs['fgPropertyFieldCommon'], function (value) {
				$scope.fields = angular.extend($scope.fields, value);
			});
		};
	});

	fg.directive('fgPropertyFieldValue', ["fgPropertyFieldValueLinkFn", function (fgPropertyFieldValueLinkFn) {

		return {
			require:     ['^form'],
			templateUrl: templatePrefix + 'edit/field-value.ng.html',
			transclude:  true,
			link:        fgPropertyFieldValueLinkFn
		};
	}]).factory('fgPropertyFieldValueLinkFn', ["$parse", function ($parse) {

		return function ($scope, $element, $attrs, ctrls) {

			$scope.draw = true;
			var frmCtrl = ctrls[0];
			var oldViewValue;

			$scope.$watch('field.$_redraw', function (value) {

				if (value) {

					var ngModelCtrl = frmCtrl['fieldValue'];

					if (ngModelCtrl) {
						oldViewValue = ngModelCtrl.$viewValue;
					}

					$scope.draw = false;
					$scope.field.$_redraw = false;
				} else {
					$scope.draw = true;
					$element = $element;
				}
			});

			$scope.$watch(function () {
				return frmCtrl['fieldValue'];
			}, function (ngModelCtrl) {
				if (ngModelCtrl && oldViewValue) {
					ngModelCtrl.$setViewValue(oldViewValue);
					ngModelCtrl.$render();
					oldViewValue = undefined;
				}
			});
		};
	}]).directive('fgFieldRedraw', function () {
		return {
			require: ['ngModel'],
			link:    function ($scope, $element, $attrs, ctrls) {

				var oldValue = $scope.$eval($attrs.ngModel);

				$scope.$watch($attrs.ngModel, function (value) {
					if (value != oldValue) {
						$scope.field.$_redraw = true;
						oldValue = value;
					}
				});
			}
		};
	});

	fg.directive('fgPropertyField', ["fgPropertyFieldLinkFn", function (fgPropertyFieldLinkFn) {

		return {
			restrict:    'AE',
			templateUrl: templatePrefix + 'edit/property-field.ng.html',
			transclude:  true,
			scope:       true,
			link:        fgPropertyFieldLinkFn
		};

	}]).factory('fgPropertyFieldLinkFn', function () {
		return function ($scope, $element, $attrs, ctrls) {

			$attrs.$observe('fgPropertyField', function (value) {
				$scope.fieldName = value;
			});

			$attrs.$observe('fgPropertyFieldLabel', function (value) {
				if (value) {
					$scope.fieldLabel = value;
				}
			});

		};
	});
	fg.directive('fgParsePattern', function () {

		return {
			require: ['ngModel'],
			link:    function ($scope, $element, $attrs, ctrls) {
				var ngModelCtrl = ctrls[0];

				ngModelCtrl.$parsers.push(validate);

				function validate(value) {
					try {
						new RegExp(value);
					} catch (e) {
						ngModelCtrl.$setValidity('pattern', false);
						return undefined;
					}

					ngModelCtrl.$setValidity('pattern', true);
					return value;
				}
			}
		};
	});
	fg.directive('fgPropertyFieldValidation', ["fgPropertyFieldValidationLinkFn", function (fgPropertyFieldValidationLinkFn) {
		return {
			restrict:    'A',
			templateUrl: templatePrefix + 'edit/validation.ng.html',
			link:        fgPropertyFieldValidationLinkFn
		};
	}]).factory('fgPropertyFieldValidationLinkFn', ["fgConfig", function (fgConfig) {

		var patternOptions = [];
		var patternConfig = fgConfig.validation.patterns;

		angular.forEach(patternConfig, function (value, text) {
			patternOptions.push({ value: value, text: text });
		});

		return function ($scope, $element, $attrs, ctrls) {

			$scope.patternOptions = patternOptions;

			$scope.field.validation = $scope.field.validation || {};
			$scope.field.validation.messages = $scope.field.validation.messages || {};

			$scope.fields = {
				required:  false,
				minlength: false,
				maxlength: false,
				pattern:   false
			};

			$scope.$watch($attrs['fgPropertyFieldValidation'], function (value) {
				$scope.fields = angular.extend($scope.fields, value);
			});
		};
	}]);
	fg.directive('fgEditValidationMessage', ["fgEditValidationMessageLinkFn", function (fgEditValidationMessageLinkFn) {
		return {
			templateUrl: templatePrefix + 'edit/validation-message.ng.html',
			link:        fgEditValidationMessageLinkFn,
			scope:       true
		};
	}]).factory('fgEditValidationMessageLinkFn', function () {

		var DEFAULT_TOOLTIP = "Enter a error message here that will be shown if this validation fails. If this field is empty a default message will be used.";

		return function ($scope, $element, $attrs, ctrls) {
			$attrs.$observe('fgEditValidationMessage', function (value) {
				$scope.validationType = value;
			});

			$attrs.$observe('fgEditValidationTooltip', function (value) {
				value = value || DEFAULT_TOOLTIP;
				$scope.tooltip = value;
			});
		};
	});
})(angular);
//# sourceMappingURL=angular-form-gen.js.map
