var BigData = function (table) {

	if (table == null) return;

	this.props = {
		model:  table.getAttribute('data-model'),
		page:   table.getAttribute('data-page'),
		length: parseInt(table.getAttribute('data-length')),
		sort:   table.getAttribute('data-sort'),
		order:  table.getAttribute('data-order').toLowerCase(),
		search: table.getAttribute('data-search'),
	};

	var pagination = document.querySelector('#DataTables_Table_0_paginate ul.pagination');

	this.assets = {
		selLength:  document.querySelector('[name=DataTables_Table_0_length]'),
		fldSearch:  document.querySelector('#DataTables_Table_0_filter input[name=search]'),
		table:      table,
		thead:      table.querySelector('thead'),
		columns:    null,
		tbody:      table.querySelector('tbody'),
		info:       document.querySelector('#DataTables_Table_0_info'),
		pagination: pagination,
		btnFirst:   pagination.querySelector('li.first'),
		btnPrev:    pagination.querySelector('li.prev'),
		pages:      null,
		btnNext:    pagination.querySelector('li.next'),
		btnLast:    pagination.querySelector('li.last')
	};

	this.assets.selLength.value = this.props.length;
	this.assets.fldSearch.value = this.props.search;

	this.assets.selLength.onchange = function () {
		this.setLength(this.assets.selLength.value);
	}.bind(this);
	this.assets.fldSearch.onkeypress = this.assets.fldSearch.onblur = function (ev) {
		var code = (ev.keyCode || ev.which);
		if (ev.type == 'blur' || code == 13) {
			this.props.search = this.assets.fldSearch.value;
			this.props.page = 1;
			this.query();
		}
	}.bind(this);

	this.assets.columns = this.assets.thead.querySelectorAll('th[data-field]');
	var i = this.assets.columns.length;
	while (i > 0) {
		var column = this.assets.columns[--i];
		column.onclick = function (e) {
			this.props.sort = e.target.getAttribute('data-field');
			switch (e.target.className) {
				case 'sorting':
				case 'sorting_desc':
					this.props.order = 'asc';
					break;
				case 'sorting_asc':
					this.props.order = 'desc';
					break;
			}
			this.update();
			this.query();
		}.bind(this);
	}

	this.assets.btnFirst.onclick = function () {
		this.firstPage();
	}.bind(this);
	this.assets.btnPrev.onclick = function () {
		this.prevPage();
	}.bind(this);
	this.assets.btnNext.onclick = function () {
		this.nextPage();
	}.bind(this);
	this.assets.btnLast.onclick = function () {
		this.lastPage();
	}.bind(this);

	this.update();
};

BigData.prototype.setLength = function (value) {
	this.props.length = parseInt(value, 10);
	this.props.page = 1;
	this.query();
};

BigData.prototype.search = function (pattern) {
	this.props.search = pattern;
	this.query();
};

BigData.prototype.firstPage = function () {
	if (this.props.page == 1) return;
	this.props.page = 1;
	this.query();
};

BigData.prototype.prevPage = function () {
	if (this.props.page == 1) return;
	this.props.page--;
	this.query();
};

BigData.prototype.gotoPage = function (index) {
	if (index < 1 || index > this.props.totalPage) return;
	this.props.page = index;
	this.query();
};

BigData.prototype.nextPage = function () {
	if (this.props.page == this.props.totalPage) return;
	this.props.page++;
	this.query();
};

BigData.prototype.lastPage = function () {
	if (this.props.page == this.props.totalPage) return;
	this.props.page = this.props.totalPage;
	this.query();
};

BigData.prototype.query = function () {

	var query = '/admin/queryData?model=' + this.props.model;

	if (this.props.page != null) query += '&page=' + this.props.page;
	if (this.props.length != null) query += '&len=' + this.props.length;
	if (this.props.sort != null) query += '&sort=' + this.props.sort;
	if (this.props.order != null) query += '&order=' + this.props.order;
	if (this.props.search != null) query += '&search=' + encodeURI(this.props.search);

	var xhr = new XMLHttpRequest();
	xhr.open('GET', query, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			this.assets.tbody = this.assets.table.querySelector('tbody');
			this.assets.tbody.outerHTML = xhr.response;
			this.update();
		}
	}.bind(this);
	xhr.send();
};

BigData.prototype.update = function () {
	var i;

	var c;
	i = this.assets.columns.length;
	while (i > 0) {
		c = this.assets.columns[--i];
		c.className = c.getAttribute('data-field') == this.props.sort ?
			'sorting_' + this.props.order :
			'sorting';
	}

	this.props.total = parseInt(this.assets.tbody.getAttribute('data-total'), 10);

	if (this.assets.pages) {
		i = this.assets.pages.length;
		while (i > 0) this.assets.pagination.removeChild(this.assets.pages[--i]);
	}
	this.assets.pages = [];

	this.props.totalPage = Math.ceil(this.props.total / this.props.length);

	var start = Math.min(this.props.total, (this.props.page - 1) * this.props.length + 1);
	var end = Math.min(this.props.total, start + this.props.length - 1);

	// Page buttons
	i = Math.max(0, this.props.page - 3);
	var max = Math.min(i + 5, this.props.totalPage);
	i = Math.max(0, i - (5 - (max - i)));

	var btn;
	while (i++ < max) {
		btn = document.createElement('li');
		btn.className = 'page' + (i == this.props.page ?
			' active' :
			'');
		btn.innerHTML = '<a href="#">' + i + '</a>';
		var index = i;
		btn.onclick = function (e) {
			this.gotoPage(parseInt(e.srcElement.innerHTML));
		}.bind(this);
		this.assets.pagination.insertBefore(btn, this.assets.btnLast);
		this.assets.pages.push(btn);
	}

	var isFirst = this.props.page == 1;
	var isLast = this.props.totalPage == 0 || this.props.page == this.props.totalPage;

	this.assets.btnFirst.className = 'first' + (isFirst ?
		' disabled' :
		'');
	this.assets.btnPrev.className = 'prev' + (isFirst ?
		' disabled' :
		'');
	this.assets.btnNext.className = 'next' + (isLast ?
		' disabled' :
		'');
	this.assets.btnLast.className = 'last' + (isLast ?
		' disabled' :
		'');

	this.assets.info.innerHTML = this.props.total ?
		("Affichage de l'élément " + start + " à " + end + " sur " + this.props.total + " élément(s)") :
		"";
};

window.bigdata = new BigData(document.querySelector('.bigdata'));
