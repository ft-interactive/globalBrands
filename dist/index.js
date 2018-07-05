(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.client = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/christopher.campbell/Documents/GitHub/globalBrands/bower_components/o-table/main.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _oTable = require('./src/js/oTable');

var _oTable2 = _interopRequireDefault(_oTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const constructAll = function () {
	_oTable2.default.init();
	document.removeEventListener('o.DOMContentLoaded', constructAll);
}; /*global require, module*/


document.addEventListener('o.DOMContentLoaded', constructAll);

exports.default = _oTable2.default;

},{"./src/js/oTable":"/Users/christopher.campbell/Documents/GitHub/globalBrands/bower_components/o-table/src/js/oTable.js"}],"/Users/christopher.campbell/Documents/GitHub/globalBrands/bower_components/o-table/src/js/oTable.js":[function(require,module,exports){
'use strict';

/**
 * Initialises an o-table components inside the element passed as the first parameter
 *
 * @param {(HTMLElement|string)} [el=document.body] - Element where to search for the o-table component. You can pass an HTMLElement or a selector string
 * @returns {OTable} - A single OTable instance
 */
function OTable(rootEl) {
	if (!rootEl) {
		rootEl = document.body;
	} else if (!(rootEl instanceof HTMLElement)) {
		rootEl = document.querySelector(rootEl);
	}
	if (rootEl.getAttribute('data-o-component') === "o-table") {
		this.rootEl = rootEl;
	} else {
		this.rootEl = rootEl.querySelector('[data-o-component~="o-table"]');
	}

	if (this.rootEl !== undefined) {
		this.listeners = [];
		this.isResponsive = false;
		this.rootEl.setAttribute('data-o-table--js', '');

		this.tableHeaders = Array.from(this.rootEl.querySelectorAll('thead th'));
		const tableRows = Array.from(this.rootEl.getElementsByTagName('tr'));

		this.tableHeaders.forEach((th, columnIndex) => {
			// Do not sort headers with attribute.
			if (th.hasAttribute('data-o-table-heading-disable-sort')) {
				return false;
			}

			th.setAttribute('tabindex', "0");

			const listener = this._sortByColumn(columnIndex);
			this.listeners.push(listener);
			th.addEventListener('click', listener);
			th.addEventListener('keydown', event => {
				const ENTER = 13;
				const SPACE = 32;
				if ('code' in event) {
					// event.code is not fully supported in the browsers we care about but
					// use it if it exists
					if (event.code === "Space" || event.code === "Enter") {
						listener(event);
					}
				} else if (event.keyCode === ENTER || event.keyCode === SPACE) {
					// event.keyCode has been deprecated but there is no alternative
					listener(event);
				}
			});
		});

		// "o-table--responsive-flat" configuration only works when there is a
		// `<thead>` block containing the table headers. If there are no headers
		// available, the `responsive-flat` class needs to be removed to prevent
		// headings being hidden.
		if (this.rootEl.getAttribute('data-o-table-responsive') === 'flat' && this.tableHeaders.length > 0) {
			this.isResponsive = true;
		} else {
			this.rootEl.classList.remove('o-table--responsive-flat');
		}

		if (this.isResponsive) {
			this._duplicateHeaders(tableRows, this.tableHeaders);
		}

		this.dispatch('ready', {
			oTable: this
		});
	}
}

/**
 * Helper function to dispatch namespaced events, namespace defaults to oTable
 * @param  {String} event
 * @param  {Object} data={}
 * @param  {String} namespace='oTable'
 */
OTable.prototype.dispatch = function (event, data = {}, namespace = 'oTable') {
	this._timeoutID = setTimeout(() => {
		this.rootEl.dispatchEvent(new CustomEvent(namespace + '.' + event, {
			detail: data,
			bubbles: true
		}));
	}, 0);
};

/**
 * Gets a table header for a given column index.
 *
 * @public
 * @returns {element|null} - The header element for the requested column index.
 */
OTable.prototype.getTableHeader = function (columnIndex) {
	return this.tableHeaders[columnIndex] || null;
};

/**
 * Helper function to remove all event handlers which were added during instantiation of the component
 * @returns {undefined}
 */
OTable.prototype.removeEventListeners = function () {
	const tableHeaders = Array.from(this.rootEl.querySelectorAll('thead th'));

	tableHeaders.forEach((th, columnIndex) => {
		th.removeEventListener('click', this.listeners[columnIndex]);
		th.removeEventListener('keydown', this.listeners[columnIndex]);
	});
};

function getIntlCollator() {
	if (typeof Intl !== 'undefined' && {}.hasOwnProperty.call(Intl, 'Collator')) {
		return new Intl.Collator();
	}
}

function ascendingSort(a, b, isNumericValue, intlCollator) {
	if ((typeof a === 'string' || a instanceof String) && (typeof b === 'string' || b instanceof String)) {
		return intlCollator ? intlCollator.compare(a, b) : a.localeCompare(b);
	} else if (isNumericValue && isNaN(a) || a < b) {
		return -1;
	} else if (isNumericValue && isNaN(b) || b < a) {
		return 1;
	} else {
		return 0;
	}
}

function descendingSort(...args) {
	return 0 - ascendingSort.apply(this, args);
}

/**
 * Sorts the table by a specific column
 * @param  {number} The index of the column to sort the table by
 * @param  {bool} Which direction to sort in, ascending or descending
 * @param  {bool} Whether the values in this column are numeric, if they are numeric we convert the contents into numbers
 * @returns undefined
 */
OTable.prototype.sortRowsByColumn = function (index, sortAscending, isNumericValue) {
	const tbody = this.rootEl.querySelector('tbody');
	const rows = Array.from(tbody.querySelectorAll('tr'));
	const intlCollator = getIntlCollator();
	rows.sort(function (a, b) {
		let aCol = a.children[index];
		let bCol = b.children[index];

		if (aCol.getAttribute('data-o-table-order') !== null) {
			aCol = aCol.getAttribute('data-o-table-order');
			bCol = bCol.getAttribute('data-o-table-order');
			if (!isNaN(parseInt(aCol, 10))) {
				aCol = parseInt(aCol, 10);
				bCol = parseInt(bCol, 10);
			}
		} else {
			aCol = aCol.textContent;
			bCol = bCol.textContent;
		}

		if (isNumericValue) {
			aCol = parseFloat(aCol.replace(/,/g, ''));
			bCol = parseFloat(bCol.replace(/,/g, ''));
		}

		if (sortAscending) {
			return ascendingSort(aCol, bCol, isNumericValue, intlCollator);
		} else {
			return descendingSort(aCol, bCol, isNumericValue, intlCollator);
		}
	});

	rows.forEach(function (row) {
		tbody.appendChild(row);
	});

	this.sorted(index, sortAscending ? 'ASC' : 'DES');
};

/**
 * Update the aria sort attributes on a sorted table.
 * Useful to reset sort attributes in the case of a custom sort implementation failing.
 * E.g. One which relies on the network.
 *
 * @private
 * @param {number|null} columnIndex - The index of the currently sorted column, if any.
 * @param {string|null} sort - The type of sort i.e. ASC or DES, if any.
 */
OTable.prototype._updateSortAttributes = function _updateSortAttributes(columnIndex, sort) {
	let ariaSort;
	switch (sort) {
		case 'ASC':
			ariaSort = 'ascending';
			break;
		case 'DES':
			ariaSort = 'descending';
			break;
		default:
			ariaSort = 'none';
			break;
	}
	// Set aria attributes.
	const sortedHeader = this.getTableHeader(columnIndex);
	if (!sortedHeader || sortedHeader.getAttribute('aria-sort') !== ariaSort) {
		this.tableHeaders.forEach(header => {
			const headerSort = header === sortedHeader ? ariaSort : 'none';
			header.setAttribute('aria-sort', headerSort);
		});
		this.rootEl.setAttribute('data-o-table-order', sort);
	}
};

/**
 * Indicated that the table has been sorted by firing by a custom sort implementation.
 * Fires the `oTable.sorted` event.
 *
 * @public
 * @param {number|null} columnIndex - The index of the currently sorted column, if any.
 * @param {string|null} sort - The type of sort i.e. ASC or DES, if any.
 */
OTable.prototype.sorted = function (columnIndex, sort) {
	this._updateSortAttributes(columnIndex, sort);
	this.dispatch('sorted', {
		sort,
		columnIndex,
		oTable: this
	});
};

/**
 * Duplicate the table headers into each row
 * For use with responsive tables
 *
 * @private
 * @param  {array} rows Table rows
 */
OTable.prototype._duplicateHeaders = function _duplicateHeaders(rows, headers) {
	rows.forEach(row => {
		const data = Array.from(row.getElementsByTagName('td'));
		data.forEach((td, dataIndex) => {
			td.parentNode.insertBefore(headers[dataIndex].cloneNode(true), td);
		});
	});
};

/**
 *
 * @private
 * @param {Number} columnIndex
 */
OTable.prototype._sortByColumn = function _sortByColumn(columnIndex) {
	return function (event) {
		const currentSort = event.currentTarget.getAttribute('aria-sort');
		const sort = this.rootEl.getAttribute('data-o-table-order') === null || currentSort === "none" || currentSort === "descending" ? 'ASC' : 'DES';

		/**
   * Check if sorting has been cancelled on this table in favour of a custom implementation.
   *
   * The return value is false if event is cancelable and at least one of the event handlers
   * which handled this event called Event.preventDefault(). Otherwise it returns true.
   * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
   */
		const customSort = !event.currentTarget.dispatchEvent(new CustomEvent('oTable.sorting', {
			detail: {
				sort,
				columnIndex,
				oTable: this
			},
			bubbles: true,
			cancelable: true
		}));

		if (!customSort) {
			this.sortRowsByColumn(columnIndex, sort === "ASC", event.currentTarget.getAttribute('data-o-table-data-type') === 'numeric');
		}

		/**
   * Update aria attributes to provide immediate feedback.
   *
   * This is called again by the `sorted` method to assure accuracy.
   * I.e. if a sort fails previous sort attributes can be restored via the `sorted` method.
   */
		this._updateSortAttributes(columnIndex, sort);
	}.bind(this);
};

/**
 * Destroys the instance, removing any event listeners that were added during instatiation of the component
 * @returns undefined
 */
OTable.prototype.destroy = function () {
	if (this._timeoutID !== undefined) {
		clearTimeout(this._timeoutID);
		this._timeoutID = undefined;
	}
	this.rootEl.removeAttribute('data-o-table--js');
	this.removeEventListeners();
	delete this.rootEl;
};

/**
 * Initialises all o-table components inside the element passed as the first parameter
 *
 * @param {(HTMLElement|string)} [el=document.body] - Element where to search for o-table components. You can pass an HTMLElement or a selector string
 * @returns {Array|OTable} - An array of OTable instances or a single OTable instance
 */
OTable.init = function (el = document.body) {
	if (!(el instanceof HTMLElement)) {
		el = document.querySelector(el);
	}
	if (/\bo-table\b/.test(el.getAttribute('data-o-component'))) {
		return new OTable(el);
	}
	const tableEls = Array.from(el.querySelectorAll('[data-o-component~="o-table"]'));
	return tableEls.map(el => {
		return new OTable(el);
	});
};

OTable.wrap = function wrap(tableSelector, wrapClass) {
	tableSelector = typeof tableSelector === "string" ? tableSelector : ".o-table";
	wrapClass = typeof wrapClass === "string" ? wrapClass : "o-table-wrapper";

	const matchingEls = document.querySelectorAll(tableSelector);
	let wrapEl;

	if (matchingEls.length > 0) {
		wrapEl = document.createElement('div');
		wrapEl.setAttribute("class", wrapClass);

		for (let c = 0, l = matchingEls.length; c < l; c++) {
			const tableEl = matchingEls[c];

			if (!tableEl.parentNode.matches("." + wrapClass)) {
				wrapElement(tableEl, wrapEl.cloneNode(false));
			}
		}
	}
};

function wrapElement(targetEl, wrapEl) {
	const parentEl = targetEl.parentNode;
	parentEl.insertBefore(wrapEl, targetEl);
	wrapEl.appendChild(targetEl);
}

module.exports = OTable;

},{}],"/Users/christopher.campbell/Documents/GitHub/globalBrands/client/index.js":[function(require,module,exports){
'use strict';

document.querySelector('input#tableFilter').onkeyup = function (event) {
  var filter = event.target.value.toUpperCase(); //get the contents of the search box in UPPERCASE
  document.querySelectorAll('#brandsTable tbody tr').forEach(function (row) {
    //for each selected row
    var searchableText = row.textContent.toUpperCase(); //get all the text content in UPPERCASE
    if (searchableText.indexOf(filter) > -1) {
      //if the filter is in the searchableText of the row then carry on displaying the row
      row.style.display = '';
    } else {
      //otherwise hide it
      row.style.display = 'none';
    }
  });
};

var OTable = require("./../bower_components/o-table/main.js");
oTable = new OTable(document.body);

},{"./../bower_components/o-table/main.js":"/Users/christopher.campbell/Documents/GitHub/globalBrands/bower_components/o-table/main.js"}]},{},["/Users/christopher.campbell/Documents/GitHub/globalBrands/client/index.js"])("/Users/christopher.campbell/Documents/GitHub/globalBrands/client/index.js")
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL28tdGFibGUvbWFpbi5qcyIsImJvd2VyX2NvbXBvbmVudHMvby10YWJsZS9zcmMvanMvb1RhYmxlLmpzIiwiY2xpZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQ0E7Ozs7OztBQUVBLE1BQU0sZUFBZSxZQUFXO0FBQy9CLGtCQUFPLElBQVA7QUFDQSxVQUFTLG1CQUFULENBQTZCLG9CQUE3QixFQUFtRCxZQUFuRDtBQUNBLENBSEQsQyxDQUhBOzs7QUFRQSxTQUFTLGdCQUFULENBQTBCLG9CQUExQixFQUFnRCxZQUFoRDs7Ozs7OztBQ1JBOzs7Ozs7QUFNQSxTQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBd0I7QUFDdkIsS0FBSSxDQUFDLE1BQUwsRUFBYTtBQUNaLFdBQVMsU0FBUyxJQUFsQjtBQUNBLEVBRkQsTUFFTyxJQUFJLEVBQUUsa0JBQWtCLFdBQXBCLENBQUosRUFBc0M7QUFDNUMsV0FBUyxTQUFTLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBVDtBQUNBO0FBQ0QsS0FBSSxPQUFPLFlBQVAsQ0FBb0Isa0JBQXBCLE1BQTRDLFNBQWhELEVBQTJEO0FBQzFELE9BQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxFQUZELE1BRU87QUFDTixPQUFLLE1BQUwsR0FBYyxPQUFPLGFBQVAsQ0FBcUIsK0JBQXJCLENBQWQ7QUFDQTs7QUFFRCxLQUFJLEtBQUssTUFBTCxLQUFnQixTQUFwQixFQUErQjtBQUM5QixPQUFLLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxPQUFLLFlBQUwsR0FBb0IsS0FBcEI7QUFDQSxPQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLGtCQUF6QixFQUE2QyxFQUE3Qzs7QUFFQSxPQUFLLFlBQUwsR0FBb0IsTUFBTSxJQUFOLENBQVcsS0FBSyxNQUFMLENBQVksZ0JBQVosQ0FBNkIsVUFBN0IsQ0FBWCxDQUFw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LE1BRUs7QUFBRztBQUNOLFVBQUksS0FBSixDQUFVLE9BQVYsR0FBb0IsTUFBcEI7QUFDRDtBQUNGLEdBUEQ7QUFRRCxDQVhIOztBQWFBLElBQU0sU0FBUyxRQUFRLFNBQVIsQ0FBZjtBQUNBLFNBQVMsSUFBSSxNQUFKLENBQVcsU0FBUyxJQUFwQixDQUFUIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSovXG5pbXBvcnQgb1RhYmxlIGZyb20gJy4vc3JjL2pzL29UYWJsZSc7XG5cbmNvbnN0IGNvbnN0cnVjdEFsbCA9IGZ1bmN0aW9uKCkge1xuXHRvVGFibGUuaW5pdCgpO1xuXHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdvLkRPTUNvbnRlbnRMb2FkZWQnLCBjb25zdHJ1Y3RBbGwpO1xufTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignby5ET01Db250ZW50TG9hZGVkJywgY29uc3RydWN0QWxsKTtcblxuZXhwb3J0IGRlZmF1bHQgb1RhYmxlO1xuIiwiLyoqXG4gKiBJbml0aWFsaXNlcyBhbiBvLXRhYmxlIGNvbXBvbmVudHMgaW5zaWRlIHRoZSBlbGVtZW50IHBhc3NlZCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gKlxuICogQHBhcmFtIHsoSFRNTEVsZW1lbnR8c3RyaW5nKX0gW2VsPWRvY3VtZW50LmJvZHldIC0gRWxlbWVudCB3aGVyZSB0byBzZWFyY2ggZm9yIHRoZSBvLXRhYmxlIGNvbXBvbmVudC4gWW91IGNhbiBwYXNzIGFuIEhUTUxFbGVtZW50IG9yIGEgc2VsZWN0b3Igc3RyaW5nXG4gKiBAcmV0dXJucyB7T1RhYmxlfSAtIEEgc2luZ2xlIE9UYWJsZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBPVGFibGUocm9vdEVsKSB7XG5cdGlmICghcm9vdEVsKSB7XG5cdFx0cm9vdEVsID0gZG9jdW1lbnQuYm9keTtcblx0fSBlbHNlIGlmICghKHJvb3RFbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuXHRcdHJvb3RFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iocm9vdEVsKTtcblx0fVxuXHRpZiAocm9vdEVsLmdldEF0dHJpYnV0ZSgnZGF0YS1vLWNvbXBvbmVudCcpID09PSBcIm8tdGFibGVcIikge1xuXHRcdHRoaXMucm9vdEVsID0gcm9vdEVsO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMucm9vdEVsID0gcm9vdEVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW8tY29tcG9uZW50fj1cIm8tdGFibGVcIl0nKTtcblx0fVxuXG5cdGlmICh0aGlzLnJvb3RFbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhpcy5saXN0ZW5lcnMgPSBbXTtcblx0XHR0aGlzLmlzUmVzcG9uc2l2ZSA9IGZhbHNlO1xuXHRcdHRoaXMucm9vdEVsLnNldEF0dHJpYnV0ZSgnZGF0YS1vLXRhYmxlLS1qcycsICcnKTtcblxuXHRcdHRoaXMudGFibGVIZWFkZXJzID0gQXJyYXkuZnJvbSh0aGlzLnJvb3RFbC5xdWVyeVNlbGVjdG9yQWxsKCd0aGVhZCB0aCcpKTtcblx0XHRjb25zdCB0YWJsZVJvd3MgPSBBcnJheS5mcm9tKHRoaXMucm9vdEVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0cicpKTtcblxuXHRcdHRoaXMudGFibGVIZWFkZXJzLmZvckVhY2goKHRoLCBjb2x1bW5JbmRleCkgPT4ge1xuXHRcdFx0Ly8gRG8gbm90IHNvcnQgaGVhZGVycyB3aXRoIGF0dHJpYnV0ZS5cblx0XHRcdGlmICh0aC5oYXNBdHRyaWJ1dGUoJ2RhdGEtby10YWJsZS1oZWFkaW5nLWRpc2FibGUtc29ydCcpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dGguc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIFwiMFwiKTtcblxuXHRcdFx0Y29uc3QgbGlzdGVuZXIgPSB0aGlzLl9zb3J0QnlDb2x1bW4oY29sdW1uSW5kZXgpO1xuXHRcdFx0dGhpcy5saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cdFx0XHR0aC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGxpc3RlbmVyKTtcblx0XHRcdHRoLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcblx0XHRcdFx0Y29uc3QgRU5URVIgPSAxMztcblx0XHRcdFx0Y29uc3QgU1BBQ0UgPSAzMjtcblx0XHRcdFx0aWYgKCdjb2RlJyBpbiBldmVudCkge1xuXHRcdFx0XHRcdC8vIGV2ZW50LmNvZGUgaXMgbm90IGZ1bGx5IHN1cHBvcnRlZCBpbiB0aGUgYnJvd3NlcnMgd2UgY2FyZSBhYm91dCBidXRcblx0XHRcdFx0XHQvLyB1c2UgaXQgaWYgaXQgZXhpc3RzXG5cdFx0XHRcdFx0aWYgKGV2ZW50LmNvZGUgPT09IFwiU3BhY2VcIiB8fCBldmVudC5jb2RlID09PSBcIkVudGVyXCIpIHtcblx0XHRcdFx0XHRcdGxpc3RlbmVyKGV2ZW50KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gRU5URVIgfHwgZXZlbnQua2V5Q29kZSA9PT0gU1BBQ0UpIHtcblx0XHRcdFx0XHQvLyBldmVudC5rZXlDb2RlIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYnV0IHRoZXJlIGlzIG5vIGFsdGVybmF0aXZlXG5cdFx0XHRcdFx0bGlzdGVuZXIoZXZlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIFwiby10YWJsZS0tcmVzcG9uc2l2ZS1mbGF0XCIgY29uZmlndXJhdGlvbiBvbmx5IHdvcmtzIHdoZW4gdGhlcmUgaXMgYVxuXHRcdC8vIGA8dGhlYWQ+YCBibG9jayBjb250YWluaW5nIHRoZSB0YWJsZSBoZWFkZXJzLiBJZiB0aGVyZSBhcmUgbm8gaGVhZGVyc1xuXHRcdC8vIGF2YWlsYWJsZSwgdGhlIGByZXNwb25zaXZlLWZsYXRgIGNsYXNzIG5lZWRzIHRvIGJlIHJlbW92ZWQgdG8gcHJldmVudFxuXHRcdC8vIGhlYWRpbmdzIGJlaW5nIGhpZGRlbi5cblx0XHRpZiAodGhpcy5yb290RWwuZ2V0QXR0cmlidXRlKCdkYXRhLW8tdGFibGUtcmVzcG9uc2l2ZScpID09PSAnZmxhdCcgJiYgdGhpcy50YWJsZUhlYWRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5pc1Jlc3BvbnNpdmUgPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJvb3RFbC5jbGFzc0xpc3QucmVtb3ZlKCdvLXRhYmxlLS1yZXNwb25zaXZlLWZsYXQnKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5pc1Jlc3BvbnNpdmUpIHtcblx0XHRcdHRoaXMuX2R1cGxpY2F0ZUhlYWRlcnModGFibGVSb3dzLCB0aGlzLnRhYmxlSGVhZGVycyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5kaXNwYXRjaCgncmVhZHknLCB7XG5cdFx0XHRvVGFibGU6IHRoaXNcblx0XHR9KTtcblx0fVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBkaXNwYXRjaCBuYW1lc3BhY2VkIGV2ZW50cywgbmFtZXNwYWNlIGRlZmF1bHRzIHRvIG9UYWJsZVxuICogQHBhcmFtICB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhPXt9XG4gKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVzcGFjZT0nb1RhYmxlJ1xuICovXG5PVGFibGUucHJvdG90eXBlLmRpc3BhdGNoID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRhID0ge30sIG5hbWVzcGFjZSA9ICdvVGFibGUnKSB7XG5cdHRoaXMuX3RpbWVvdXRJRCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdHRoaXMucm9vdEVsLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KG5hbWVzcGFjZSArICcuJyArIGV2ZW50LCB7XG5cdFx0XHRkZXRhaWw6IGRhdGEsXG5cdFx0XHRidWJibGVzOiB0cnVlXG5cdFx0fSkpO1xuXHR9LCAwKTtcbn07XG5cbi8qKlxuICogR2V0cyBhIHRhYmxlIGhlYWRlciBmb3IgYSBnaXZlbiBjb2x1bW4gaW5kZXguXG4gKlxuICogQHB1YmxpY1xuICogQHJldHVybnMge2VsZW1lbnR8bnVsbH0gLSBUaGUgaGVhZGVyIGVsZW1lbnQgZm9yIHRoZSByZXF1ZXN0ZWQgY29sdW1uIGluZGV4LlxuICovXG5PVGFibGUucHJvdG90eXBlLmdldFRhYmxlSGVhZGVyID0gZnVuY3Rpb24gKGNvbHVtbkluZGV4KSB7XG5cdHJldHVybiB0aGlzLnRhYmxlSGVhZGVyc1tjb2x1bW5JbmRleF0gfHwgbnVsbDtcbn07XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHJlbW92ZSBhbGwgZXZlbnQgaGFuZGxlcnMgd2hpY2ggd2VyZSBhZGRlZCBkdXJpbmcgaW5zdGFudGlhdGlvbiBvZiB0aGUgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICovXG5PVGFibGUucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuXHRjb25zdCB0YWJsZUhlYWRlcnMgPSBBcnJheS5mcm9tKHRoaXMucm9vdEVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RoZWFkIHRoJykpO1xuXG5cdHRhYmxlSGVhZGVycy5mb3JFYWNoKCh0aCwgY29sdW1uSW5kZXgpID0+IHtcblx0XHR0aC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMubGlzdGVuZXJzW2NvbHVtbkluZGV4XSk7XG5cdFx0dGgucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMubGlzdGVuZXJzW2NvbHVtbkluZGV4XSk7XG5cdH0pO1xufTtcblxuZnVuY3Rpb24gZ2V0SW50bENvbGxhdG9yKCkge1xuXHRpZiAodHlwZW9mIEludGwgIT09ICd1bmRlZmluZWQnICYmIHt9Lmhhc093blByb3BlcnR5LmNhbGwoSW50bCwgJ0NvbGxhdG9yJykpIHtcblx0XHRyZXR1cm4gbmV3IEludGwuQ29sbGF0b3IoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBhc2NlbmRpbmdTb3J0KGEsIGIsIGlzTnVtZXJpY1ZhbHVlLCBpbnRsQ29sbGF0b3IpIHtcblx0aWYgKCh0eXBlb2YgYSA9PT0gJ3N0cmluZycgfHwgYSBpbnN0YW5jZW9mIFN0cmluZykgJiYgKHR5cGVvZiBiID09PSAnc3RyaW5nJyB8fCBiIGluc3RhbmNlb2YgU3RyaW5nKSkge1xuXHRcdHJldHVybiBpbnRsQ29sbGF0b3IgPyBpbnRsQ29sbGF0b3IuY29tcGFyZShhLCBiKSA6IGEubG9jYWxlQ29tcGFyZShiKTtcblx0fSBlbHNlIGlmICgoaXNOdW1lcmljVmFsdWUgJiYgaXNOYU4oYSkpIHx8IGEgPCBiKSB7XG5cdFx0cmV0dXJuIC0xO1xuXHR9IGVsc2UgaWYgKChpc051bWVyaWNWYWx1ZSAmJiBpc05hTihiKSkgfHwgYiA8IGEpIHtcblx0XHRyZXR1cm4gMTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gMDtcblx0fVxufVxuXG5mdW5jdGlvbiBkZXNjZW5kaW5nU29ydCguLi5hcmdzKSB7XG5cdHJldHVybiAwIC0gYXNjZW5kaW5nU29ydC5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBTb3J0cyB0aGUgdGFibGUgYnkgYSBzcGVjaWZpYyBjb2x1bW5cbiAqIEBwYXJhbSAge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBjb2x1bW4gdG8gc29ydCB0aGUgdGFibGUgYnlcbiAqIEBwYXJhbSAge2Jvb2x9IFdoaWNoIGRpcmVjdGlvbiB0byBzb3J0IGluLCBhc2NlbmRpbmcgb3IgZGVzY2VuZGluZ1xuICogQHBhcmFtICB7Ym9vbH0gV2hldGhlciB0aGUgdmFsdWVzIGluIHRoaXMgY29sdW1uIGFyZSBudW1lcmljLCBpZiB0aGV5IGFyZSBudW1lcmljIHdlIGNvbnZlcnQgdGhlIGNvbnRlbnRzIGludG8gbnVtYmVyc1xuICogQHJldHVybnMgdW5kZWZpbmVkXG4gKi9cbk9UYWJsZS5wcm90b3R5cGUuc29ydFJvd3NCeUNvbHVtbiA9IGZ1bmN0aW9uIChpbmRleCwgc29ydEFzY2VuZGluZywgaXNOdW1lcmljVmFsdWUpIHtcblx0Y29uc3QgdGJvZHkgPSB0aGlzLnJvb3RFbC5xdWVyeVNlbGVjdG9yKCd0Ym9keScpO1xuXHRjb25zdCByb3dzID0gQXJyYXkuZnJvbSh0Ym9keS5xdWVyeVNlbGVjdG9yQWxsKCd0cicpKTtcblx0Y29uc3QgaW50bENvbGxhdG9yID0gZ2V0SW50bENvbGxhdG9yKCk7XG5cdHJvd3Muc29ydChmdW5jdGlvbiAoYSwgYikge1xuXHRcdGxldCBhQ29sID0gYS5jaGlsZHJlbltpbmRleF07XG5cdFx0bGV0IGJDb2wgPSBiLmNoaWxkcmVuW2luZGV4XTtcblxuXHRcdGlmIChhQ29sLmdldEF0dHJpYnV0ZSgnZGF0YS1vLXRhYmxlLW9yZGVyJykgIT09IG51bGwpIHtcblx0XHRcdGFDb2wgPSBhQ29sLmdldEF0dHJpYnV0ZSgnZGF0YS1vLXRhYmxlLW9yZGVyJyk7XG5cdFx0XHRiQ29sID0gYkNvbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtby10YWJsZS1vcmRlcicpO1xuXHRcdFx0aWYgKCFpc05hTihwYXJzZUludChhQ29sLCAxMCkpKSB7XG5cdFx0XHRcdGFDb2wgPSBwYXJzZUludChhQ29sLCAxMCk7XG5cdFx0XHRcdGJDb2wgPSBwYXJzZUludChiQ29sLCAxMCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFDb2wgPSBhQ29sLnRleHRDb250ZW50O1xuXHRcdFx0YkNvbCA9IGJDb2wudGV4dENvbnRlbnQ7XG5cdFx0fVxuXG5cdFx0aWYgKGlzTnVtZXJpY1ZhbHVlKSB7XG5cdFx0XHRhQ29sID0gcGFyc2VGbG9hdChhQ29sLnJlcGxhY2UoLywvZywgJycpKTtcblx0XHRcdGJDb2wgPSBwYXJzZUZsb2F0KGJDb2wucmVwbGFjZSgvLC9nLCAnJykpO1xuXHRcdH1cblxuXHRcdGlmIChzb3J0QXNjZW5kaW5nKSB7XG5cdFx0XHRyZXR1cm4gYXNjZW5kaW5nU29ydChhQ29sLCBiQ29sLCBpc051bWVyaWNWYWx1ZSwgaW50bENvbGxhdG9yKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGRlc2NlbmRpbmdTb3J0KGFDb2wsIGJDb2wsIGlzTnVtZXJpY1ZhbHVlLCBpbnRsQ29sbGF0b3IpO1xuXHRcdH1cblxuXHR9KTtcblxuXHRyb3dzLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xuXHRcdHRib2R5LmFwcGVuZENoaWxkKHJvdyk7XG5cdH0pO1xuXG5cdHRoaXMuc29ydGVkKGluZGV4LCAoc29ydEFzY2VuZGluZyA/ICdBU0MnIDogJ0RFUycpKTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBhcmlhIHNvcnQgYXR0cmlidXRlcyBvbiBhIHNvcnRlZCB0YWJsZS5cbiAqIFVzZWZ1bCB0byByZXNldCBzb3J0IGF0dHJpYnV0ZXMgaW4gdGhlIGNhc2Ugb2YgYSBjdXN0b20gc29ydCBpbXBsZW1lbnRhdGlvbiBmYWlsaW5nLlxuICogRS5nLiBPbmUgd2hpY2ggcmVsaWVzIG9uIHRoZSBuZXR3b3JrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcnxudWxsfSBjb2x1bW5JbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgY3VycmVudGx5IHNvcnRlZCBjb2x1bW4sIGlmIGFueS5cbiAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IHNvcnQgLSBUaGUgdHlwZSBvZiBzb3J0IGkuZS4gQVNDIG9yIERFUywgaWYgYW55LlxuICovXG5PVGFibGUucHJvdG90eXBlLl91cGRhdGVTb3J0QXR0cmlidXRlcyA9IGZ1bmN0aW9uIF91cGRhdGVTb3J0QXR0cmlidXRlcyhjb2x1bW5JbmRleCwgc29ydCkge1xuXHRsZXQgYXJpYVNvcnQ7XG5cdHN3aXRjaCAoc29ydCkge1xuXHRcdGNhc2UgJ0FTQyc6XG5cdFx0XHRhcmlhU29ydCA9ICdhc2NlbmRpbmcnO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnREVTJzpcblx0XHRcdGFyaWFTb3J0ID0gJ2Rlc2NlbmRpbmcnO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGFyaWFTb3J0ID0gJ25vbmUnO1xuXHRcdFx0YnJlYWs7XG5cdH1cblx0Ly8gU2V0IGFyaWEgYXR0cmlidXRlcy5cblx0Y29uc3Qgc29ydGVkSGVhZGVyID0gdGhpcy5nZXRUYWJsZUhlYWRlcihjb2x1bW5JbmRleCk7XG5cdGlmICghc29ydGVkSGVhZGVyIHx8IHNvcnRlZEhlYWRlci5nZXRBdHRyaWJ1dGUoJ2FyaWEtc29ydCcpICE9PSBhcmlhU29ydCkge1xuXHRcdHRoaXMudGFibGVIZWFkZXJzLmZvckVhY2goKGhlYWRlcikgPT4ge1xuXHRcdFx0Y29uc3QgaGVhZGVyU29ydCA9IChoZWFkZXIgPT09IHNvcnRlZEhlYWRlciA/IGFyaWFTb3J0IDogJ25vbmUnKTtcblx0XHRcdGhlYWRlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtc29ydCcsIGhlYWRlclNvcnQpO1xuXHRcdH0pO1xuXHRcdHRoaXMucm9vdEVsLnNldEF0dHJpYnV0ZSgnZGF0YS1vLXRhYmxlLW9yZGVyJywgc29ydCk7XG5cdH1cbn07XG5cbi8qKlxuICogSW5kaWNhdGVkIHRoYXQgdGhlIHRhYmxlIGhhcyBiZWVuIHNvcnRlZCBieSBmaXJpbmcgYnkgYSBjdXN0b20gc29ydCBpbXBsZW1lbnRhdGlvbi5cbiAqIEZpcmVzIHRoZSBgb1RhYmxlLnNvcnRlZGAgZXZlbnQuXG4gKlxuICogQHB1YmxpY1xuICogQHBhcmFtIHtudW1iZXJ8bnVsbH0gY29sdW1uSW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGN1cnJlbnRseSBzb3J0ZWQgY29sdW1uLCBpZiBhbnkuXG4gKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBzb3J0IC0gVGhlIHR5cGUgb2Ygc29ydCBpLmUuIEFTQyBvciBERVMsIGlmIGFueS5cbiAqL1xuT1RhYmxlLnByb3RvdHlwZS5zb3J0ZWQgPSBmdW5jdGlvbiAoY29sdW1uSW5kZXgsIHNvcnQpIHtcblx0dGhpcy5fdXBkYXRlU29ydEF0dHJpYnV0ZXMoY29sdW1uSW5kZXgsIHNvcnQpO1xuXHR0aGlzLmRpc3BhdGNoKCdzb3J0ZWQnLCB7XG5cdFx0c29ydCxcblx0XHRjb2x1bW5JbmRleCxcblx0XHRvVGFibGU6IHRoaXNcblx0fSk7XG59O1xuXG4vKipcbiAqIER1cGxpY2F0ZSB0aGUgdGFibGUgaGVhZGVycyBpbnRvIGVhY2ggcm93XG4gKiBGb3IgdXNlIHdpdGggcmVzcG9uc2l2ZSB0YWJsZXNcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtICB7YXJyYXl9IHJvd3MgVGFibGUgcm93c1xuICovXG5PVGFibGUucHJvdG90eXBlLl9kdXBsaWNhdGVIZWFkZXJzID0gZnVuY3Rpb24gX2R1cGxpY2F0ZUhlYWRlcnMocm93cywgaGVhZGVycykge1xuXHRyb3dzLmZvckVhY2goKHJvdykgPT4ge1xuXHRcdGNvbnN0IGRhdGEgPSBBcnJheS5mcm9tKHJvdy5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGQnKSk7XG5cdFx0ZGF0YS5mb3JFYWNoKCh0ZCwgZGF0YUluZGV4KSA9PiB7XG5cdFx0XHR0ZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShoZWFkZXJzW2RhdGFJbmRleF0uY2xvbmVOb2RlKHRydWUpLCB0ZCk7XG5cdFx0fSk7XG5cdH0pO1xufTtcblxuLyoqXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb2x1bW5JbmRleFxuICovXG5PVGFibGUucHJvdG90eXBlLl9zb3J0QnlDb2x1bW4gPSBmdW5jdGlvbiBfc29ydEJ5Q29sdW1uKGNvbHVtbkluZGV4KSB7XG5cdHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRjb25zdCBjdXJyZW50U29ydCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdhcmlhLXNvcnQnKTtcblx0XHRjb25zdCBzb3J0ID0gdGhpcy5yb290RWwuZ2V0QXR0cmlidXRlKCdkYXRhLW8tdGFibGUtb3JkZXInKSA9PT0gbnVsbCB8fCBjdXJyZW50U29ydCA9PT0gXCJub25lXCIgfHwgY3VycmVudFNvcnQgPT09IFwiZGVzY2VuZGluZ1wiID8gJ0FTQycgOiAnREVTJztcblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrIGlmIHNvcnRpbmcgaGFzIGJlZW4gY2FuY2VsbGVkIG9uIHRoaXMgdGFibGUgaW4gZmF2b3VyIG9mIGEgY3VzdG9tIGltcGxlbWVudGF0aW9uLlxuXHRcdCAqXG5cdFx0ICogVGhlIHJldHVybiB2YWx1ZSBpcyBmYWxzZSBpZiBldmVudCBpcyBjYW5jZWxhYmxlIGFuZCBhdCBsZWFzdCBvbmUgb2YgdGhlIGV2ZW50IGhhbmRsZXJzXG5cdFx0ICogd2hpY2ggaGFuZGxlZCB0aGlzIGV2ZW50IGNhbGxlZCBFdmVudC5wcmV2ZW50RGVmYXVsdCgpLiBPdGhlcndpc2UgaXQgcmV0dXJucyB0cnVlLlxuXHRcdCAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FdmVudFRhcmdldC9kaXNwYXRjaEV2ZW50XG5cdFx0ICovXG5cdFx0Y29uc3QgY3VzdG9tU29ydCA9ICFldmVudC5jdXJyZW50VGFyZ2V0LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdvVGFibGUuc29ydGluZycsIHtcblx0XHRcdGRldGFpbDoge1xuXHRcdFx0XHRzb3J0LFxuXHRcdFx0XHRjb2x1bW5JbmRleCxcblx0XHRcdFx0b1RhYmxlOiB0aGlzXG5cdFx0XHR9LFxuXHRcdFx0YnViYmxlczogdHJ1ZSxcblx0XHRcdGNhbmNlbGFibGU6IHRydWVcblx0XHR9KSk7XG5cblx0XHRpZiAoIWN1c3RvbVNvcnQpIHtcblx0XHRcdHRoaXMuc29ydFJvd3NCeUNvbHVtbihjb2x1bW5JbmRleCwgc29ydCA9PT0gXCJBU0NcIiwgZXZlbnQuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtby10YWJsZS1kYXRhLXR5cGUnKSA9PT0gJ251bWVyaWMnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgYXJpYSBhdHRyaWJ1dGVzIHRvIHByb3ZpZGUgaW1tZWRpYXRlIGZlZWRiYWNrLlxuXHRcdCAqXG5cdFx0ICogVGhpcyBpcyBjYWxsZWQgYWdhaW4gYnkgdGhlIGBzb3J0ZWRgIG1ldGhvZCB0byBhc3N1cmUgYWNjdXJhY3kuXG5cdFx0ICogSS5lLiBpZiBhIHNvcnQgZmFpbHMgcHJldmlvdXMgc29ydCBhdHRyaWJ1dGVzIGNhbiBiZSByZXN0b3JlZCB2aWEgdGhlIGBzb3J0ZWRgIG1ldGhvZC5cblx0XHQgKi9cblx0XHR0aGlzLl91cGRhdGVTb3J0QXR0cmlidXRlcyhjb2x1bW5JbmRleCwgc29ydCk7XG5cblx0fS5iaW5kKHRoaXMpO1xufTtcblxuLyoqXG4gKiBEZXN0cm95cyB0aGUgaW5zdGFuY2UsIHJlbW92aW5nIGFueSBldmVudCBsaXN0ZW5lcnMgdGhhdCB3ZXJlIGFkZGVkIGR1cmluZyBpbnN0YXRpYXRpb24gb2YgdGhlIGNvbXBvbmVudFxuICogQHJldHVybnMgdW5kZWZpbmVkXG4gKi9cbk9UYWJsZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodGhpcy5fdGltZW91dElEICE9PSB1bmRlZmluZWQpIHtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dElEKTtcblx0XHR0aGlzLl90aW1lb3V0SUQgPSB1bmRlZmluZWQ7XG5cdH1cblx0dGhpcy5yb290RWwucmVtb3ZlQXR0cmlidXRlKCdkYXRhLW8tdGFibGUtLWpzJyk7XG5cdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcblx0ZGVsZXRlIHRoaXMucm9vdEVsO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXNlcyBhbGwgby10YWJsZSBjb21wb25lbnRzIGluc2lkZSB0aGUgZWxlbWVudCBwYXNzZWQgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclxuICpcbiAqIEBwYXJhbSB7KEhUTUxFbGVtZW50fHN0cmluZyl9IFtlbD1kb2N1bWVudC5ib2R5XSAtIEVsZW1lbnQgd2hlcmUgdG8gc2VhcmNoIGZvciBvLXRhYmxlIGNvbXBvbmVudHMuIFlvdSBjYW4gcGFzcyBhbiBIVE1MRWxlbWVudCBvciBhIHNlbGVjdG9yIHN0cmluZ1xuICogQHJldHVybnMge0FycmF5fE9UYWJsZX0gLSBBbiBhcnJheSBvZiBPVGFibGUgaW5zdGFuY2VzIG9yIGEgc2luZ2xlIE9UYWJsZSBpbnN0YW5jZVxuICovXG5PVGFibGUuaW5pdCA9IGZ1bmN0aW9uKGVsID0gZG9jdW1lbnQuYm9keSkge1xuXHRpZiAoIShlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuXHRcdGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCk7XG5cdH1cblx0aWYgKC9cXGJvLXRhYmxlXFxiLy50ZXN0KGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1vLWNvbXBvbmVudCcpKSkge1xuXHRcdHJldHVybiBuZXcgT1RhYmxlKGVsKTtcblx0fVxuXHRjb25zdCB0YWJsZUVscyA9IEFycmF5LmZyb20oZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtby1jb21wb25lbnR+PVwiby10YWJsZVwiXScpKTtcblx0cmV0dXJuIHRhYmxlRWxzLm1hcChlbCA9PiB7XG5cdFx0cmV0dXJuIG5ldyBPVGFibGUoZWwpO1xuXHR9KTtcbn07XG5cbk9UYWJsZS53cmFwID0gZnVuY3Rpb24gd3JhcCh0YWJsZVNlbGVjdG9yLCB3cmFwQ2xhc3MpIHtcblx0dGFibGVTZWxlY3RvciA9IHR5cGVvZiB0YWJsZVNlbGVjdG9yID09PSBcInN0cmluZ1wiID8gdGFibGVTZWxlY3RvciA6IFwiLm8tdGFibGVcIjtcblx0d3JhcENsYXNzID0gdHlwZW9mIHdyYXBDbGFzcyA9PT0gXCJzdHJpbmdcIiA/IHdyYXBDbGFzcyA6IFwiby10YWJsZS13cmFwcGVyXCI7XG5cblx0Y29uc3QgbWF0Y2hpbmdFbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRhYmxlU2VsZWN0b3IpO1xuXHRsZXQgd3JhcEVsO1xuXG5cdGlmIChtYXRjaGluZ0Vscy5sZW5ndGggPiAwKSB7XG5cdFx0d3JhcEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0d3JhcEVsLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHdyYXBDbGFzcyk7XG5cblx0XHRmb3IgKGxldCBjID0gMCwgbCA9IG1hdGNoaW5nRWxzLmxlbmd0aDsgYyA8IGw7IGMrKykge1xuXHRcdFx0Y29uc3QgdGFibGVFbCA9IG1hdGNoaW5nRWxzW2NdO1xuXG5cdFx0XHRpZiAoIXRhYmxlRWwucGFyZW50Tm9kZS5tYXRjaGVzKFwiLlwiICsgd3JhcENsYXNzKSkge1xuXHRcdFx0XHR3cmFwRWxlbWVudCh0YWJsZUVsLCB3cmFwRWwuY2xvbmVOb2RlKGZhbHNlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG5mdW5jdGlvbiB3cmFwRWxlbWVudCh0YXJnZXRFbCwgd3JhcEVsKSB7XG5cdGNvbnN0IHBhcmVudEVsID0gdGFyZ2V0RWwucGFyZW50Tm9kZTtcblx0cGFyZW50RWwuaW5zZXJ0QmVmb3JlKHdyYXBFbCwgdGFyZ2V0RWwpO1xuXHR3cmFwRWwuYXBwZW5kQ2hpbGQodGFyZ2V0RWwpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9UYWJsZTtcbiIsImRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0I3RhYmxlRmlsdGVyJylcbiAgLm9ua2V5dXAgPSAoZXZlbnQpPT57XG4gICAgY29uc3QgZmlsdGVyID0gZXZlbnQudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCk7IC8vZ2V0IHRoZSBjb250ZW50cyBvZiB0aGUgc2VhcmNoIGJveCBpbiBVUFBFUkNBU0VcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjYnJhbmRzVGFibGUgdGJvZHkgdHInKS5mb3JFYWNoKCAocm93KT0+eyAvL2ZvciBlYWNoIHNlbGVjdGVkIHJvd1xuICAgICAgY29uc3Qgc2VhcmNoYWJsZVRleHQgPSByb3cudGV4dENvbnRlbnQudG9VcHBlckNhc2UoKTsgLy9nZXQgYWxsIHRoZSB0ZXh0IGNvbnRlbnQgaW4gVVBQRVJDQVNFXG4gICAgICBpZihzZWFyY2hhYmxlVGV4dC5pbmRleE9mKGZpbHRlcikgPiAtMSl7ICAvL2lmIHRoZSBmaWx0ZXIgaXMgaW4gdGhlIHNlYXJjaGFibGVUZXh0IG9mIHRoZSByb3cgdGhlbiBjYXJyeSBvbiBkaXNwbGF5aW5nIHRoZSByb3dcbiAgICAgICAgcm93LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgIH1lbHNleyAgLy9vdGhlcndpc2UgaGlkZSBpdFxuICAgICAgICByb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuY29uc3QgT1RhYmxlID0gcmVxdWlyZSgnby10YWJsZScpO1xub1RhYmxlID0gbmV3IE9UYWJsZShkb2N1bWVudC5ib2R5KTsiXX0=
