function strSizeof(str) {
    return str.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_').length;
}

export default strSizeof;
