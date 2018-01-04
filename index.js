'use strict';

const pDefer = require('p-defer');
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
	const deferred = pDefer();
	query.limit(limit);
	const recursive = objects => {
		if (objects.length === 0) {
			deferred.resolve(list);
		} else {
			list = list.concat(objects);
			skip += limit;
			query.skip(skip);
			query.find(options)
			.then(recursive);
		}
	};
	query.find(options).then(recursive);
	return deferred.promise;
}

/**
 * Destroy the whole list even if is bigger thant 1000 longer.
 * @param {Parse.Object} objects
 */
const destroyAll = Parse => objects => pRecursive.pprocessList(arrayExt.piecesOfLength(objects, 100), Parse.Object.destroyAll);

	/**
	 * Destroy the whole list return from the query.find.
	 * @param {Parse.Query} query
	 */
const queryDestroyAll = Parse => query => {
	const limit = 100;
	const deferred = pDefer();
	query.limit(limit);
	const recursive = objects => {
		if (objects.length === 0) {
			deferred.resolve();
		} else {
			Parse.Object.destroyAll(objects)
			.then(() => query.find())
			.then(recursive);
		}
	};
	query.find().then(recursive);
	return deferred.promise;
};

module.exports = Parse => ({
	queryFindFullList,
	destroyAll: destroyAll(Parse),
	queryDestroyAll: queryDestroyAll(Parse)
});
