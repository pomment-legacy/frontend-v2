function getAvatarSize() {
    return this.$ctx.nodeInfo.parent.querySelector('pmnt-avatar').getBoundingClientRect().width * window.devicePixelRatio;
}

export default getAvatarSize;
