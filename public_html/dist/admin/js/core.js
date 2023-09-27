/*eslint-disable*/

const grecaptcha = window['grecaptcha'];

//datatable accent search
(function () {

	// Si activé, execute le reCaptcha avant de soumettre tout formulaire
	var metaSiteKey = document.head.querySelector('meta[property="recaptcha:site_key"]');

	if (metaSiteKey) {
		$('form').submit(function (ev) {

			ev.preventDefault();

			var form = ev.currentTarget;
			var siteKey = metaSiteKey.content;
			var inputName = document.head.querySelector('meta[property="recaptcha:input_name"]').content;

			grecaptcha.execute(siteKey, { action: 'submit' }).then(function (token) {
				var input = form.elements[inputName];
				if (input) {
					input.value = token;
				}
				form.submit();
			});
		});
	}

	function removeAccents(data) {
		if (data.normalize) {
			// Use I18n API if avaiable to split characters and accents, then remove
			// the accents wholesale. Note that we use the original data as well as
			// the new to allow for searching of either form.
			return data + ' ' + data
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '');
		}

		return data;
	}

	var searchType = jQuery.fn.DataTable.ext.type.search;

	searchType.string = function (data) {
		return !data ?
			'' :
			typeof data === 'string' ?
				removeAccents(data) :
				data;
	};

	searchType.html = function (data) {
		return !data ?
			'' :
			typeof data === 'string' ?
				removeAccents(data.replace(/<.*?>/g, '')) :
				data;
	};

}());

$(document).ready(function ($) {

	paceOptions = {
		elements: true
	};

	$(".sidebar").mmenu();

	/* ---------- Form data-toggle ---------- */
	function formDataToggle(form) {
		$('[data-toggle]', form).each(function (i, el) {
			var attr = el.getAttribute('data-toggle');
			attr = attr.replace(/\"/g, '');
			var func = Function('form', 'return ' + attr);
			try {
				if (func.call(null, form)) $(el).show();
				else $(el).hide();
			} catch (e) {
				console.error(attr, e);
				$(el).show();
			}
		});
	}

	function formBgColor(iframe, color) {
		if (iframe.id.startsWith('content')) {
			(iframe.contentDocument || iframe.contentWindow.document).body.style.backgroundColor = color;
		}
	}

	$("form.form-horizontal").each(function (i, form) {

		$('select, input, textarea', form).change(function () {
			formDataToggle(form);
		});
		formDataToggle(form);

		var bgColor = 'white';
		$('[name=bg_color]').each(function (i, input) {
			$(input).change(function (i, form) {
				$('iframe', form).each(function (i, iframe) {
					formBgColor(iframe, input.value);
				});
			});
			bgColor = input.value;
		});

		$('[data-tinymce]').each(function (i, textarea) {
			tinymce.init({
				file_browser_callback:  elFinderBrowser,
				init_instance_callback: function (editor) {
					formBgColor(editor, bgColor);
				},
				language:               "fr_FR",
				selector:               "textarea#" + textarea.id,
				height:                 '250px',
				width:                  '100%',
				entity_encoding:        "raw",
				convert_urls:           false,
				plugins:                [
					"paste autolink lists link image charmap anchor",
					"visualblocks code help",
					"table media",
					"textcolor hr",
					'emoticons',
				],
				verify_html:            true,
				toolbar:                [
					"styleselect removeformat | -fontselect bold italic underline strike subscript superscript | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | visualblocks code",
					"undo redo | cut copy paste pastetext | insert | emoticons",
				],
				setup:                  function (editor) {
					editor.ui.registry.addMenuButton('insert', {
						icon:    'plus',
						tooltip: 'Insert',
						fetch:   function (callback) {
							callback('media image link | charmap anchor hr | inserttable');
						}
					});
				},
				content_css:            "/dist/compiled/wysiwyg.min.css",
				body_class:             "wysiwyg",
				menubar:                false,
				font_formats:           'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;',
				style_formats:          [
					{
						title:  "Entête 2",
						format: "h2"
					},
					{
						title:  "Entête 3",
						format: "h3"
					},
					{
						title:  "Entête 4",
						format: "h4"
					},
					{
						title:  "Paragraphe",
						format: "p"
					},
					{
						title:   "Couleur primaire",
						inline:  "span",
						classes: 'color-primary'
					},
					{
						title:   "Couleur secondaire",
						inline:  "span",
						classes: 'color-secondary'
					},
					{
						title:    'Bouton',
						selector: 'a',
						classes:  'call-to-action'
					}
				],
				textcolor_cols:         8,
				textcolor_rows:         5,
				textcolor_map:          [
					"000000", "Black",
					"993300", "Burnt orange",
					"333300", "Dark olive",
					"003300", "Dark green",
					"003366", "Dark azure",
					"000080", "Navy Blue",
					"333399", "Indigo",
					"333333", "Very dark gray",
					"800000", "Maroon",
					"FF6600", "Orange",
					"808000", "Olive",
					"008000", "Green",
					"008080", "Teal",
					"0000FF", "Blue",
					"666699", "Grayish blue",
					"808080", "Gray",
					"FF0000", "Red",
					"FF9900", "Amber",
					"99CC00", "Yellow green",
					"339966", "Sea green",
					"33CCCC", "Turquoise",
					"3366FF", "Royal blue",
					"800080", "Purple",
					"999999", "Medium gray",
					"FF00FF", "Magenta",
					"FFCC00", "Gold",
					"FFFF00", "Yellow",
					"00FF00", "Lime",
					"00FFFF", "Aqua",
					"00CCFF", "Sky blue",
					"993366", "Red violet",
					"FFFFFF", "White",
					"FF99CC", "Pink",
					"FFCC99", "Peach",
					"FFFF99", "Light yellow",
					"CCFFCC", "Pale green",
					"CCFFFF", "Pale cyan",
					"99CCFF", "Light sky blue",
					"CC99FF", "Plum"
				]
			});
		});


	});


	/* ---------- Disable moving to top ---------- */
	$('a[href="#"][data-top!=true]').click(function (e) {
		e.preventDefault();
	});

	/* ---------- Tabs ---------- */
	$('#myTab a:first').tab('show');
	$('#myTab a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	});

	/* ---------- Tooltip ---------- */
	$('[rel="tooltip"],[data-rel="tooltip"]').tooltip({
		"placement": "bottom",
		delay:       {
			show: 400,
			hide: 200
		}
	});

	/* ---------- Popover ---------- */
	$('[rel="popover"],[data-rel="popover"],[data-toggle="popover"]').popover();


	$('.btn-close').click(function (e) {
		e.preventDefault();
		$(this).parent().parent().parent().fadeOut();
	});

	$('.btn-minimize').click(function (e) {
		e.preventDefault();

		var $target = $(this).parent().parent().next('.panel-body');
		if ($target.is(':visible')) $('i', $(this)).removeClass('fa-chevron-up').addClass('fa-chevron-down');
		else $('i', $(this)).removeClass('fa-chevron-down').addClass('fa-chevron-up');
		$target.slideToggle('slow', function () {
			widthFunctions();
		});

	});

	$('.btn-setting').click(function (e) {
		e.preventDefault();
		$('#myModal').modal('show');
	});

});

/* ---------- Check Retina ---------- */
function retina() {

	retinaMode = (window.devicePixelRatio > 1);

	return retinaMode;

}

/* ---------- Main Menu Open/Close, Min/Full ---------- */
$(document).ready(function ($) {

	$('#main-menu-toggle').click(function () {

		if ($('body').hasClass('sidebar-hide')) {

			$('body').removeClass('sidebar-hide');

		} else {

			$('body').addClass('sidebar-hide');

		}

	});

	let isOpened = false;

	$('#sidebar-menu').click(function () {

		$(".sidebar").trigger("open");

	});

	$('#sidebar-minify').click(function () {

		if ($('body').hasClass('sidebar-minified')) {

			$('body').removeClass('sidebar-minified');
			$('#sidebar-minify i').removeClass('fa-caret-square-o-right').addClass('fa-caret-square-o-left');

		} else {

			$('body').addClass('sidebar-minified');
			$('#sidebar-minify i').removeClass('fa-caret-square-o-left').addClass('fa-caret-square-o-right');
		}

	});

	$('.dropmenu').click(function (ev) {

		ev.preventDefault();

		const $this = $(this);
		const $group = $this.parent();
		const $opened = $('.sidebar .group.opened');

		$opened.find('ul').slideUp();
		$opened.removeClass('opened')

		if ($group.is($opened)) {

			return;
		}

		$group.toggleClass('opened');

		if ($('.sidebar').hasClass('minified')) {

			if (!$this.hasClass('open')) {
				$group.find('ul').first().slideToggle({
					progress() {
						dropSidebarShadow();
					}
				});
			}

		} else {

			$group.find('ul').first().slideToggle({
				progress() {
					dropSidebarShadow();
				}
			});
		}

	});

});

//$(document).ready(function($){

//	/* ---------- Add class .active to current link  ---------- */
//	$('ul.nav-sidebar').find('a').each(function(){

//		if($($(this))[0].href==String(window.location)) {

//			$(this).parent().addClass('active');

//			$(this).parents('ul').add(this).each(function(){
//			    $(this).show().parent().addClass('opened');
//				//$(this).prev('a').find('.chevron').removeClass('closed').addClass('opened');
//			});

//		}

//	});

//});


$(document).ready(function () {
	widthFunctions();
	dropSidebarShadow();
});

$(window).resize(dropSidebarShadow);
$('.sidebar-menu').scroll(dropSidebarShadow);

function dropSidebarShadow() {

	var top = $('.sidebar-menu').scrollTop();

	if (top > 60) {
		$('.sidebar-header').addClass('drop-shadow');
	} else {
		$('.sidebar-header').removeClass('drop-shadow');
	}

	var bottom = $('.sidebar-menu').outerHeight() - $('.nav-sidebar').height() + top + 1;

	if (bottom < 0) {
		$('.sidebar-footer').addClass('drop-shadow');
	} else {
		$('.sidebar-footer').removeClass('drop-shadow');
	}
}

/* ---------- Page width functions ---------- */

$(window).bind("resize", widthFunctions);

function widthFunctions(e) {

	if ($('.timeline')) {

		$('.timeslot').each(function () {

			var timeslotHeight = $(this).find('.task').outerHeight();

			$(this).css('height', timeslotHeight);

		});

	}

	var sidebarHeight = $('.sidebar').outerHeight();
	var mainHeight = $('.main').outerHeight();

	var sidebarLeftHeight = $('.sidebar').outerHeight();
	var contentHeight = $('.main').height();
	var contentHeightOuter = $('.main').outerHeight();

	var headerHeight = $('.navbar').outerHeight();
	var footerHeight = $('footer').outerHeight();

	var winHeight = $(window).height();
	var winWidth = $(window).width();

	$('.sidebar-menu').css('height', winHeight - 200);

	if (winWidth < 992) {
		$('body').removeClass('sidebar-minified');
	}

	//if(winWidth > 768) {
	//	$('.main').css('min-height', winHeight - footerHeight);
	//}
}
