function replaceSingle(text, target, replacer) {
    return text.split(target).join(replacer);
}

function replaceUIString(text, item) {
    const itemKeys = Object.keys(item);
    let newText = text;
    itemKeys.forEach((e) => {
        newText = replaceSingle(newText, `{{${e}}}`, item[e]);
    });
    return newText;
}

export default replaceUIString;
