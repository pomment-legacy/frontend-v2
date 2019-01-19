import md5 from 'crypto-js/md5';
import FormTemplate from './form.eft';
import TextArea from './textarea.eft';
import UIStrings from '../../strings/content';
import Config from '../../config';
import replaceUIString from '../../strings/replace';

function updateAvatar() {
    const root = this.root;
    this.$data.avatar = `${root.avatarPrefix}${md5(this.$data.email)}?s=${Config.avatarSize}`;
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
                    maxChar: Config.maxChar,
                }),
            },
            $methods: {
                blurEvent({ state }) {
                    state.$data.active = '';
                },
                focusEvent({ state }) {
                    state.$data.active = 'active';
                },
                inputEvent: (function inputEvent() {
                    this.area.style.height = '0px';
                    this.area.style.height = `${Math.max(this.minHeight, this.area.scrollHeight)}px`;
                }).bind(this),
            },
        });
        this.area = this.contentWrapper.$ctx.nodeInfo.element.childNodes[0];
        this.minHeight = 0;
    }

    get name() {
        return this.$data.name;
    }

    get email() {
        return this.$data.email;
    }

    get website() {
        return this.$data.website;
    }

    get content() {
        return this.contentWrapper.$data.content;
    }
}

export default Form;
