import './sass/frontend.scss';
import Pomment from 'pomment-sdk';
import Main from './compoments/index.eft';
import Bar from './compoments/bar';

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
            this._threadData = await this._sdk.listComments();
            this._loaded = true;
            this._headerMessage = new Bar({
                $data: {
                    style: 'success',
                    message: '加载成功！',
                    closeable: 'closeable',
                },
            });
        } catch (e) {
            this._headerMessage = new Bar({
                $data: {
                    style: 'error',
                    message: '加载失败。',
                    link: '重试',
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
