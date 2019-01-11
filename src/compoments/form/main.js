import md5 from 'crypto-js/md5';
import FormTemplate from './form.eft';
import TextArea from './textarea.eft';
import UIStrings from '../../strings/content';
import config from '../../config';
import replaceUIString from '../../strings/replace';
import strSizeof from './str-sizeof';
import getAvatarSize from '../../utils/avatar-size';

function updateAvatar() {
    const root = this.root;
    this.$data.avatar = `${root.avatarPrefix}${md5(this.$data.email)}?s=${getAvatarSize.bind(root)()}`;
}

class Form extends FormTemplate {
    constructor(props) {
        super(props);
        updateAvatar.bind(this)();
        this.$data.nameUI = UIStrings.FORM_NAME;
        this.$data.emailUI = UIStrings.FORM_EMAIL_REQUIRED;
        this.$data.websiteUI = UIStrings.FORM_WEBSITE;
        this.$data.submitUI = UIStrings.FORM_SUBMIT;
        this.$data.cancelUI = UIStrings.FORM_CANCEL;
        this.$methods.updateAvatarEvent = updateAvatar.bind(this);
        this.tooMany = false;
        this.contentWrapper = new TextArea({
            $data: {
                contentUI: replaceUIString(UIStrings.FORM_CONTENT_REQUIRED, {
                    maxChar: config.maxChar,
                }),
            },
            $methods: {
                blurEvent({ state }) {
                    state.$data.active = '';
                },
                focusEvent({ state }) {
                    state.$data.active = 'active';
                },
                inputEvent: (function inputEvent({ state }) {
                    this.area.style.height = '0px';
                    this.area.style.height = `${Math.max(this.minHeight, this.area.scrollHeight)}px`;
                    this.tooMany = strSizeof(state.$data.content) > config.maxChar;
                    this.$data.disableSubmit = this.tooMany ? true : null;
                }).bind(this),
            },
        });
        this.area = this.contentWrapper.$ctx.nodeInfo.element.childNodes[0];
        this.minHeight = 0;
    }
}

export default Form;
