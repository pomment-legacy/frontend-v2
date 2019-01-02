import './sass/frontend.scss';
import Pomment from 'pomment-sdk';
import Main from './compoments/index.eft';
import Bar from './compoments/bar';
import Form from './compoments/form';
import UIStrings from './strings/content';

class PommentWidget extends Main {
    constructor(props) {
        super(props);
        this._loaded = false;
        this._threadData = {};
        this._sdk = new Pomment({
            server: props.server,
            defaultURL: props.url,
            defaultTitle: props.title,
        });
        Object.keys(this).forEach((e) => {
            Object.defineProperty(this, e, {
                enumerable: false,
            });
        });
    }

    async load() {
        if (this._loaded) {
            throw Error('This instance is already loaded');
        }
        try {
            this._headerMessage = new Bar({
                $data: {
                    style: 'info',
                    message: UIStrings.POMMENT_LOADING,
                },
            });
            this._threadData = await this._sdk.listComments();
            this._loaded = true;
            this._form = new Form();
            this._headerMessage = null;
            // 可变高度文本框初始化
            this._form.area.value = '\n\n\n\n';
            this._form.minHeight = this._form.area.getBoundingClientRect().height;
            this._form.area.style.height = `${this._form.minHeight}px`;
            this._form.area.value = '';
        } catch (e) {
            this._headerMessage = new Bar({
                $data: {
                    style: 'error',
                    message: UIStrings.POMMENT_LOADING_FAILED,
                    link: UIStrings.POMMENT_LOADING_RETRY,
                },
                $methods: {
                    link: this.load.bind(this),
                },
            });
            throw e;
        }
    }

    get loaded() {
        return this._loaded;
    }
}

export default PommentWidget;
