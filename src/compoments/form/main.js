import FormTemplate from './form.eft';
import TextArea from './textarea.eft';
import UIStrings from '../../strings/content';
import config from '../../config';
import replaceUIString from '../../strings/replace';

const initProps = {
    $data: {
        avatar: null,
        nameUI: UIStrings.FORM_NAME,
        emailUI: UIStrings.FORM_EMAIL_REQUIRED,
        websiteUI: UIStrings.FORM_WEBSITE,
        submitUI: UIStrings.FORM_SUBMIT,
        cancelUI: UIStrings.FORM_CANCEL,
    },
    $methods: {
    },
};

class Form extends FormTemplate {
    constructor(props) {
        super(Object.assign({}, initProps, props));
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
                inputEvent: (function inputEvent() {
                    this.area.style.height = '0px';
                    this.area.style.height = `${Math.max(this.minHeight, this.area.scrollHeight)}px`;
                }).bind(this),
            },
        });
        this.area = this.contentWrapper.$ctx.nodeInfo.element.childNodes[0];
        this.minHeight = 0;
    }
}

export default Form;
