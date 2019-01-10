import config from '../config';

function getAvatarSize() {
    return parseInt(getComputedStyle(this.$ctx.nodeInfo.element).fontSize, 10)
        * config.avatarSizeEM * window.devicePixelRatio;
}

export default getAvatarSize;
