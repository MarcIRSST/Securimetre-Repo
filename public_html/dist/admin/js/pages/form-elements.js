$(document).ready(function() {

	var orderIndex = 0;
	var sortingOrder = "asc";
	var search = "";
	var page = 0;
	var length = 25;

	var orderAttr = $('.datatable').attr('data-order-index');
	if(typeof orderAttr !== typeof undefined && orderAttr !== false) {
		orderIndex = orderAttr;
	}

	var sortAttr = $('.datatable').attr('data-sort-order');
	if(typeof sortAttr !== typeof undefined && sortAttr !== false) {
		sortingOrder = sortAttr;
	}

	function replaceAccents(a) {
		a = a.replace(/[àâ]/g, "a");
		a = a.replace(/[èéêë]/g, "e");
		a = a.replace(/[ù]/g, "u");
		a = a.replace(/[îï]/g, "i");
		return a;
	}

	const html = $('#grid-state').html();
	if(html) {
		const grid = JSON.parse(html);
		if(grid.model === $('.datatable').data('model')) {
			orderIndex = grid.data.sortIndex;
			sortingOrder = grid.data.order;
			search = grid.data.search ?? '';
			length = parseInt(grid.data.length);
			page = (grid.data.page - 1) * length;

		} else {
			$.ajax({
				type: "POST",
				headers: {
					'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
				},
				url: '/admin/resetGridState',
			});
		}
	}

	jQuery.extend(jQuery.fn.dataTableExt.oSort, {
		"string-pre": function(a) {
			if(!a || !a.toString) return '';
			a = replaceAccents(a.toString().toLowerCase());
			return a;
		},
		"html-pre": function(a) {
			if(!a || !a.toString) return '';
			a = replaceAccents(a.toString().toLowerCase());
			a = a.replace(/<.*?>/g, "");
			return a;
		},
	});
	const table = $('.datatable').dataTable({
		search: {
			search
		},
		order: [
			[orderIndex, sortingOrder]
		],
		displayStart: page,
		iDisplayLength: length,
		sDom: "<'row'<'col-lg-6'l><'col-lg-6'f>r>t<'row'<'col-lg-12'i><'col-lg-12 center'p>>",
		sPaginationType: "full_numbers",
		oLanguage: {
			sProcessing: "Traitement en cours...",
			sSearch: "Rechercher&nbsp;:&nbsp;",
			sLengthMenu: "Afficher _MENU_ &eacute;l&eacute;ments",
			sInfo: "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ment(s)",
			sInfoEmpty: "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ment",
			sInfoFiltered: "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
			sInfoPostFix: "",
			sLoadingRecords: "Chargement en cours...",
			sZeroRecords: "Aucun &eacute;l&eacute;ment &agrave; afficher",
			sEmptyTable: "Aucune donnée disponible dans le tableau",
			oPaginate: {
				sFirst: "Premier",
				sPrevious: "Pr&eacute;c&eacute;dent",
				sNext: "Suivant",
				sLast: "Dernier"
			},
			oAria: {
				sSortAscending: ": activer pour trier la colonne par ordre croissant",
				sSortDescending: ": activer pour trier la colonne par ordre décroissant"
			}
		},
		columnDefs: [{
			orderable: false,
			targets: -1
		}]
	});

	$('.datatable').on('draw.dt', () => {
		// This will show: "Ordering on column 1 (asc)", for example
		var order = table.api().order();
		var info = table.api().page.info();
		var sortIndex = order[0][0];
		var length = table.api().page.len();
		order = order[0][1];
		page = info.page + 1;
		search = table.api().search();
		var model = table.data('model');

		$.ajax({
			type: "POST",
			url: '/admin/setGridState',
			headers: {
				'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
			},
			data: {
				sortIndex,
				page,
				search,
				order,
				model,
				length,
			},
		});

	});

	$(".btn-delete").click(function(e) {
		e.preventDefault();
		const href = $(this).data('href');
		$('#btn-confirmer').attr('href', href);
	});

	$("#btn-confirmer").click(function(e) {
		const href = $(this).attr('href');
		window.location = href;
	});

	$('.input-group.date').datepicker({
		format: "yyyy-mm-dd",
		weekStart: 7,
		language: "fr",
		todayHighlight: true,
		autoclose: true
	});

});
