export function uppercaseFirstChar(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function uppercaseFirstCharOverMultipleWordsWithReplaceSeparator(text: string, oldSeparator: string, newSeparator: string): string {
    let array = text.split(oldSeparator);

    for (let x = 0; x < array.length; x++) {
        array[x] = uppercaseFirstChar(array[x]);
    }
    return array.join(newSeparator);
}