import './sass/frontend.scss';
import Pomment from 'pomment-sdk';
import Main from './compoments/index.eft';
import Bar from './compoments/bar/main';
import Form from './compoments/form/main';
import UIStrings from './strings/content';
import Comment from './compoments/comment/comment.eft';
import getAvatarSize from './utils/avatar-size';
import makeTree from './tree';

class PommentWidget extends Main {
    constructor(props) {
        super(props);
        this.avatarPrefix = props.avatarPrefix || 'https://secure.gravatar.com/avatar/';
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
            const rawThreadData = await this._sdk.listComments();
            this._loaded = true;
            this._form = new Form({
                root: this,
            });
            this._headerMessage = null;
            // 可变高度文本框初始化
            this._form.area.value = '\n\n\n\n';
            this._form.minHeight = this._form.area.getBoundingClientRect().height;
            this._form.area.style.height = `${this._form.minHeight}px`;
            this._form.area.value = '';
            this._threadData = makeTree(rawThreadData.content);
            this._printList();
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

    _printList() {
        const avatarSize = getAvatarSize.bind(this)();
        this._threadData.forEach((e) => {
            this._comments.push(new Comment({
                $data: {
                    name: e.name,
                    emailHashed: `${this.avatarPrefix + e.emailHashed}?s=${avatarSize}`,
                    content: e.content,
                },
            }));
        });
    }

    get loaded() {
        return this._loaded;
    }
}

export default PommentWidget;
