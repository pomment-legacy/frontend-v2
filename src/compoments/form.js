import FormTemplate from './form.eft';
import UIStrings from '../strings/content';

const initProps = {
    $data: {
        avatar: null,
        nameUI: UIStrings.FORM_NAME,
        emailUI: UIStrings.FORM_EMAIL_REQUIRED,
        websiteUI: UIStrings.FORM_WEBSITE,
        contentUI: UIStrings.FORM_CONTENT_REQUIRED,
        submitUI: UIStrings.FORM_SUBMIT,
        cancelUI: UIStrings.FORM_CANCEL,
    },
    $methods: {
    },
};

class Form extends FormTemplate {
    constructor(props) {
        super(Object.assign({}, initProps, props));
    }
}

export default Form;
