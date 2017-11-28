module.exports.map = function (arr, fn) {
    var ret = new Array(arr.length),
        i = 0,
        l = arr.length;

    for (; i < l; i++) {
        ret[i] = fn(arr[i], i);
    }

    return ret;
};

module.exports.forEach = function (arr, fn) {
    var i = 0,
        l = arr.length;

    for (; i < l; i++) {
        fn(arr[i], i);
    }
};

module.exports.forOwn = function (obj, fn) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            fn(obj[key], key);
        }
    }
};

module.exports.find = function (arr, pre) {
    var i = 0,
        l = arr.length;

    for (; i < l; i++) {
        if (pre(arr[i], i)) {
            return arr[i];
        }
    }
};