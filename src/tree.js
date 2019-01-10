function findWithAttr(arr, attr, value) {
    const array = arr;
    for (let i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
        if (array[i].slave) {
            for (let j = 0; j < array[i].slave.length; j += 1) {
                if (array[i].slave[j][attr] === value) {
                    return i;
                }
            }
        }
    }
    return -1;
}

function makeTree(dataArr) {
    const data = dataArr;
    if (!Array.isArray(data)) {
        return [];
    }
    let i = 0;
    while (i < data.length) {
        if (data[i].parent && data[i].parent >= 0) {
            const targetPos = findWithAttr(data, 'id', data[i].parent);
            if (data[targetPos]) {
                if (!data[targetPos].slave) data[targetPos].slave = [];
                data[targetPos].slave.push(data[i]);
            }
            data.splice(i, 1);
        } else {
            i += 1;
        }
    }
    return data.reverse();
}

export default makeTree;
