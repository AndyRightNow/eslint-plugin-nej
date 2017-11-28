var NS_PER_SEC = 1e9;
var NS_PER_MS = 1e6;

module.exports = (function () {
    var records = [];
    var currentRecordMap = {};

    function start(benchId) {
        if (process.env.NODE_ENV === 'bench') {
            currentRecordMap[benchId] = {
                startTime: process.hrtime(),
                id: benchId
            };
        }
    }

    function end(benchId) {
        if (process.env.NODE_ENV === 'bench' &&
            currentRecordMap[benchId]) {
            var diff = currentRecordMap[benchId].diff = process.hrtime(currentRecordMap[benchId].startTime);
            currentRecordMap[benchId].diffTime = diff[0] * NS_PER_SEC + diff[1];
            records.push(currentRecordMap[benchId]);
            delete currentRecordMap[benchId];
        }
    }

    function formatNs(ns) {
        var secs = Math.floor(ns / NS_PER_SEC);
        var ms = Math.floor((ns - secs * NS_PER_SEC) / NS_PER_MS);
        var nsLeft = ns - secs * NS_PER_SEC - ms * NS_PER_MS;

        return [
            secs,
            ms,
            nsLeft
        ];
    }

    function getResults() {
        var ret = '';

        records.sort(function (a, b) {
            if (a.diffTime < b.diffTime) {
                return 1;
            } else if (a.diffTime > b.diffTime) {
                return -1;
            } else {
                return 0;
            }
        });

        for (var i = 0, l = records.length, record, diff, formatted; i < l; i++) {
            record = records[i];
            formatted = formatNs(record.diffTime);

            ret += (record.id + ' took ' + formatted[0] + ' seconds, ' + formatted[1] + ' ms and ' + formatted[2] + ' ns to finish\n');
        }

        return ret + '\nTotal time: ' + records.reduce(function (prev, cur) {
            return prev + cur.diffTime / NS_PER_SEC;
        }, 0) + ' seconds';
    }

    function genBenchId(fnName, filename) {
        return fnName + '_for_' + filename + '_starts_at_' + Date.now();
    }

    return {
        start: start,
        end: end,
        getResults: getResults,
        genBenchId: genBenchId
    }
})();