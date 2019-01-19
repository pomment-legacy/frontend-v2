import './sass/frontend.scss';
import Pomment from 'pomment-sdk';
import md5 from 'crypto-js/md5';
import Main from './compoments/index.eft';
import Bar from './compoments/bar/bar.eft';
import Form from './compoments/form/main';
import UIStrings from './strings/content';
import Comment from './compoments/comment/comment.eft';
import Config from './config';
import makeTree from './tree';
import timeSince from './utils/time';
import replaceUIString from './strings/replace';
import strSizeof from './utils/str-sizeof';

class PommentWidget extends Main {
    constructor(props) {
        super(props);
        this.avatarPrefix = props.avatarPrefix || 'https://secure.gravatar.com/avatar/';
        this.adminName = props.adminName;
        this.adminAvatar = props.adminAvatar;
        this.fixedHeight = props.fixedHeight || 0;
        this._loaded = false;
        this._postIDHiddenStyle = document.head.appendChild(document.createElement('style'));
        this._postIDHiddenStyle.dataset.usage = 'Pomment 评论 ID 隐藏样式';
        this._threadData = {};
        this._threadElementMap = new Map();
        this._threadMap = new Map();
        this._sdk = new Pomment({
            server: props.server,
            defaultURL: props.url,
            defaultTitle: props.title,
        });
        this._currentTarget = -1;
        Object.keys(this).forEach((e) => {
            Object.defineProperty(this, e, {
                enumerable: false,
            });
        });
        this._enablePostIDMagic();
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
                $methods: {
                    cancel: this._cancelReplyOther.bind(this),
                    submit: this._submit.bind(this),
                },
            });
            this._defaultForm = this._form;
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

    _printEntry(e, sub, unshift = false) {
        const avatarSize = Config.avatarSize;
        const oName = e.name;
        const oAvatar = `${this.avatarPrefix + e.emailHashed}?s=${avatarSize}`;
        const name = e.byAdmin ? (this.adminName || oName) : oName;
        const avatar = e.byAdmin ? (this.adminAvatar || oAvatar) : oAvatar;
        const singleItem = new Comment({
            $methods: {
                jump: this._jumpTo.bind(this),
                reply: this._moveFormTo.bind(this),
            },
            $data: {
                id: e.id,
                name,
                avatar,
                website: e.byAdmin ? '' : e.website,
                content: e.content,
                datetime: e.createdAt.toISOString(),
                date: timeSince(e.createdAt),
                admin: UIStrings.ENTRY_ADMIN,
                adminHidden: e.byAdmin ? '' : 'hidden',
                adminPaddingLeft: UIStrings.ENTRY_ADMIN_PADDING,
                parent: e.parent,
                reply: UIStrings.ENTRY_REPLY,
            },
        });
        if (sub) {
            const parent = this._threadMap.get(e.parent);
            const parentName = parent.byAdmin ? (this.adminName || parent.name) : parent.name;
            singleItem.$data.replyOf = replaceUIString(UIStrings.ENTRY_REPLY_OF, {
                parentName,
            });
            singleItem.$data.replyOfPaddingLeft = UIStrings.ENTRY_PRPLY_OF_PADDING;
        }
        this._threadMap.set(e.id, e);
        this._threadElementMap.set(e.id, singleItem);
        const target = sub ? sub.subComments : this._comments;
        target[unshift ? 'unshift' : 'push'](singleItem);
        return singleItem;
    }

    _printList() {
        this._comments = [];
        this._threadData.forEach((e) => {
            const el = this._printEntry(e, null);
            if (e.sub) {
                e.sub.forEach((f) => {
                    this._printEntry(f, el);
                });
            }
        });
    }

    _jumpTo(props) {
        const id = props.value;
        const element = this._threadElementMap.get(id).$ctx.nodeInfo.element;
        window.scrollTo({
            top: element.offsetTop - this.fixedHeight,
            behavior: 'smooth',
        });
    }

    _jumpToCurrent() {
        if (this._currentTarget >= 0) {
            this._jumpTo({ value: this._currentTarget });
        }
    }

    _moveFormTo(props) {
        this._form.$umount();
        const id = props.value;
        this._currentTarget = id;
        if (id < 0) {
            if (process.env.NODE_ENV !== 'production') {
                console.info('[Pomment]', 'Form will be moved to default position');
            }
            this._defaultForm = this._form;
            this._form.$data.cancelHidden = 'hidden';
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            console.info('[Pomment]', `Form will be moved to the bottom of ${id}`);
        }
        const element = this._threadElementMap.get(id);
        element.form = this._form;
        this._form.$data.cancelHidden = '';

        // 在上方展示出『正在回复某人』的提示栏
        this._headerMessage = null;
        this._headerMessage = new Bar({
            $data: {
                closeable: 'closeable',
                style: 'info',
                link: replaceUIString(UIStrings.POMMENT_REPLYING, {
                    name: this._threadMap.get(id).name,
                }),
            },
            $methods: {
                link: this._jumpToCurrent.bind(this),
                close: this._cancelReplyOther.bind(this),
            },
        });
    }

    _cancelReplyOther() {
        this._currentTarget = -1;
        this._headerMessage = null;
        this._moveFormTo({
            value: -1,
        });
    }

    _showPostID() {
        this._postIDHiddenStyle.textContent = 'pmnt-entry > div.upper > a.name > span.id { display: inline }';
    }

    _hidePostID() {
        this._postIDHiddenStyle.textContent = '';
    }

    _enablePostIDMagic() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Alt') {
                this._showPostID();
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Alt') {
                this._hidePostID();
            }
        });
    }

    async _submit() {
        this._form.message = null;
        if (this._form.email === '') {
            this._spawnFormError(UIStrings.FORM_EMPTY_EMAIL);
            return;
        }
        if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this._form.email)) {
            this._spawnFormError(UIStrings.FORM_BAD_EMAIL);
            return;
        }
        if (this._form.content === '') {
            this._spawnFormError(UIStrings.FORM_EMPTY_CONTENT);
            return;
        }
        if (strSizeof(this._form.content) > Config.maxChar) {
            this._spawnFormError(replaceUIString(UIStrings.FORM_BAD_CONTENT, {
                maxChar: Config.maxChar,
            }));
            return;
        }
        this._form.$data.submitUI = UIStrings.FORM_SUBMITTING;
        this._form.$data.disabled = 'disabled';
        this._form.contentWrapper.$data.disabled = 'disabled';
        try {
            const data = await this._sdk.submitComment({
                parent: this._currentTarget,
                name: this._form.name,
                email: this._form.email,
                website: this._form.website,
                content: this._form.content,
                receiveEmail: false,
            });
            const issub = this._currentTarget >= 0;
            this._printEntry({
                ...data,
                emailHashed: md5(data.email),
                byAdmin: false,
            }, issub, true);
        } catch (e) {
            console.error('[Pomment]', e);
            this._spawnFormError(UIStrings.FORM_SUBMIT_ERROR);
        }
        this._unfreezeForm();
    }

    _unfreezeForm() {
        this._form.$data.submitUI = UIStrings.FORM_SUBMIT;
        this._form.$data.disabled = null;
        this._form.contentWrapper.$data.disabled = null;
    }

    _spawnFormError(error) {
        this._form.message = null;
        this._form.message = new Bar({
            $data: {
                style: 'error',
                message: error,
                closeable: 'closeable',
            },
            $methods: {
                close({ state }) {
                    state.$umount();
                },
            },
        });
    }

    get loaded() {
        return this._loaded;
    }
}

export default PommentWidget;
