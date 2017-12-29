'use strict';

const Parse = require('parse');
const arrayExt = require('js-array-ext');
const pRecursive = require('js-promise-recursive');

/**
 * @return the whole find list even if is bigger thant 1000.
 * @param {Parse.Query} query
 */
function queryFindFullList(query, options) {
	if (options === undefined) {
		options = {};
	}
	const limit = 100;
	let skip = 0;
	let list = [];
	const promise = new Parse.Promise();
	query.limit(limit);
	const recursive = objects => {
		if (objects.length === 0) {
			promise.resolve(list);
		} else {
			list = list.concat(objects);
			skip += limit;
			query.skip(skip);
			query.find(options)
			.then(recursive);
		}
	};
	query.find(options).then(recursive);
	return promise;
}

/**
 * Destroy the whole list even if is bigger thant 1000 longer.
 * @param {Parse.Object} objects
 */
const destroyAll = objects => pRecursive.pprocessList(arrayExt.piecesOfLength(objects, 100), Parse.Object.destroyAll);

	/**
	 * Destroy the whole list return from the query.find.
	 * @param {Parse.Query} query
	 */
function queryDestroyAll(query) {
	const limit = 100;
	const promise = new Parse.Promise();
	query.limit(limit);
	const recursive = objects => {
		if (objects.length === 0) {
			promise.resolve();
		} else {
			Parse.Object.destroyAll(objects)
			.then(() => query.find())
			.then(recursive);
		}
	};
	query.find().then(recursive);
	return promise;
}

module.exports = {
	queryFindFullList,
	destroyAll,
	queryDestroyAll
};
