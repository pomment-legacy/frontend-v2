import UIStrings from '../strings/content';
import replaceUIString from '../strings/replace';

const gapList = [
    { min: 0, suffix: UIStrings.TIME_SECOND },
    { min: 60, suffix: UIStrings.TIME_MINUTE },
    { min: 3600, suffix: UIStrings.TIME_HOUR },
    { min: 86400, suffix: UIStrings.TIME_DAY },
    { min: 604800, suffix: UIStrings.TIME_WEEK },
    { min: 2592000, suffix: UIStrings.TIME_MONTH },
    { min: 31536000 },
];

function timeSince(date) {
    const gap = (new Date().getTime() - date.getTime()) / 1000;
    for (let i = 0; i < gapList.length - 1; i += 1) {
        if (gap >= gapList[i].min && gap < gapList[i + 1].min) {
            const divise = i === 0 ? 1 : gapList[i].min;
            const ago = Math.floor(gap / divise);
            return replaceUIString(gapList[i].suffix, {
                ago: ago || '0',
            });
        }
    }
    return date.toLocaleDateString();
}

export default timeSince;
