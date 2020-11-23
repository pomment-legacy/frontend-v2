function findWithAttr(arr, attr, value) {
    const array = arr;
    for (let i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
        if (array[i].sub) {
            for (let j = 0; j < array[i].sub.length; j += 1) {
                if (array[i].sub[j][attr] === value) {
                    return i;
                }
            }
        }
    }
    return null;
}

function makeTree(dataArr) {
    const data = dataArr;
    if (!Array.isArray(data)) {
        return [];
    }
    let i = 0;
    while (i < data.length) {
        if (data[i].parent) {
            const targetPos = findWithAttr(data, 'uuid', data[i].parent);
            if (data[targetPos]) {
                if (!data[targetPos].sub) data[targetPos].sub = [];
                data[targetPos].sub.push(data[i]);
            }
            data.splice(i, 1);
        } else {
            i += 1;
        }
    }
    return data.reverse();
}

export default makeTree;
