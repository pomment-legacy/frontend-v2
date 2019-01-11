import config from '../config';

function getAvatarSize() {
    return parseFloat(getComputedStyle(this.$ctx.nodeInfo.element).fontSize)
        * config.avatarSizeEM * window.devicePixelRatio;
}

export default getAvatarSize;
