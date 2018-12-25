import './sass/frontend.scss';
import Pomment from 'pomment-sdk';
import Main from './compoments/index.eft';

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

    async load(...mountProps) {
        if (this._loaded) {
            throw Error('This instance is already loaded');
        }
        try {
            this._threadData = await this._sdk.listComments();
            this._loaded = true;
            return super.$mount(...mountProps);
        } catch (e) {
            throw e;
        }
    }

    get loaded() {
        return this._loaded;
    }
}

export default PommentWidget;
