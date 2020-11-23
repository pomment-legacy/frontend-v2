/* global grecaptcha */

import './sass/frontend.scss';
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
        this.reCAPTCHA = props.reCAPTCHA;
        this._showReceiveEmail = typeof props.showReceiveEmail === 'boolean' ? props.showReceiveEmail : true;
        this._loaded = false;
        this._threadData = {};
        this._threadElementMap = new Map();
        this._threadMap = new Map();
        this._server = props.server;
        this._url = props.url;
        this._title = props.title;
        this._currentTarget = null;
        this._responseKey = null;
        this.$data.poweredBy = UIStrings.POMMENT_POWERED_BY;
        Object.keys(this).forEach((e) => {
            Object.defineProperty(this, e, {
                enumerable: false,
            });
        });
        if (this.reCAPTCHA) {
            grecaptcha.ready(async () => {
                this._responseKey = await grecaptcha.execute(this.reCAPTCHA, { action: 'submit_comment' });
                console.info('[Pomment]', 'reCAPTCHA v3 is ready!');
            });
        }
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
            const rawThreadDataLoader = await fetch(`${this._server}/v3/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: this._url,
                }),
            });
            if (!rawThreadDataLoader.ok) {
                throw new Error(`Server returned ${rawThreadDataLoader.status}`);
            }
            const rawThreadData = await rawThreadDataLoader.json();
            this._loaded = true;
            this._form = new Form({
                root: this,
                $data: {
                    reHidden: this._showReceiveEmail ? '' : 'hidden',
                },
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

    _printEntry(e, sub) {
        const avatarSize = Config.avatarSize;
        let name;
        let avatar;
        let website;
        let showAvatar;
        if (e.name === null && !e.byAdmin) {
            name = UIStrings.ENTRY_NAMELESS;
            e.name = UIStrings.ENTRY_NAMELESS;
            avatar = '';
            website = '';
            showAvatar = false;
        } else {
            const oName = e.name;
            const oAvatar = e.avatar === null ? `${this.avatarPrefix + e.emailHashed}?s=${avatarSize}` : e.avatar;
            name = e.byAdmin ? (this.adminName || oName) : oName;
            avatar = e.byAdmin ? (this.adminAvatar || oAvatar) : oAvatar;
            website = e.byAdmin ? '' : (e.website || '');
            if (website !== '') {
                try {
                    const url = new URL(website);
                    // eslint-disable-next-line no-script-url
                    if (url.protocol === 'javascript:') {
                        website = '';
                    } else {
                        website = url.toString();
                    }
                } catch (err) {
                    website = `http://${website}`;
                }
            }
            showAvatar = true;
        }
        const singleItem = new Comment({
            $methods: {
                jump: this._jumpTo.bind(this),
                reply: this._moveFormTo.bind(this),
            },
            $data: {
                id: e.uuid,
                name,
                avatar,
                website,
                content: e.content,
                datetime: new Date(e.createdAt).toISOString(),
                date: timeSince(e.createdAt),
                admin: UIStrings.ENTRY_ADMIN,
                adminHidden: e.byAdmin ? '' : 'hidden',
                parent: e.parent,
                reply: UIStrings.ENTRY_REPLY,
                showUnknownAvatar: showAvatar ? 'none' : 'flex',
                nameless: showAvatar ? '' : 'nameless',
            },
        });
        if (sub) {
            const parent = this._threadMap.get(e.parent);
            const parentName = parent.byAdmin ? (this.adminName || parent.name) : parent.name;
            singleItem.$data.replyOf = replaceUIString(UIStrings.ENTRY_REPLY_OF, {
                parentName,
            });
        }
        this._threadMap.set(e.uuid, e);
        this._threadElementMap.set(e.uuid, singleItem);
        return singleItem;
    }

    _printList() {
        this._comments = [];
        this._threadData.forEach((e) => {
            const el = this._printEntry(e);
            this._comments.push(el);
            if (e.sub) {
                e.sub.forEach((f) => {
                    el.subComments.push(this._printEntry(f, true));
                });
            }
        });
    }

    _jumpTo(props) {
        const id = props.value;
        const element = this._threadElementMap.get(id).$refs.comment;
        window.scrollTo({
            top: element.offsetTop - this.fixedHeight,
            behavior: 'smooth',
        });
    }

    _jumpToCurrent() {
        if (this._currentTarget) {
            this._jumpTo({ value: this._currentTarget });
        }
    }

    _moveFormTo(props) {
        this._form.$umount();
        let id = null;
        if (typeof props !== 'undefined' && props !== null) {
            id = props.state.$data.id;
        }
        this._currentTarget = id;
        if (id === null) {
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
        const want = this._threadMap.get(id);
        const name = want.byAdmin ? this.adminName : want.name;
        this._headerMessage = null;
        this._headerMessage = new Bar({
            $data: {
                closeable: 'closeable',
                style: 'info',
                link: replaceUIString(UIStrings.POMMENT_REPLYING, {
                    name,
                }),
            },
            $methods: {
                link: this._jumpToCurrent.bind(this),
                close: this._cancelReplyOther.bind(this),
            },
        });
    }

    _cancelReplyOther() {
        this._headerMessage = null;
        this._moveFormTo();
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
        if (this.reCAPTCHA && this._responseKey === null) {
            this._spawnFormError(UIStrings.FORM_RECAPTCHA_NOT_READY);
            return;
        }
        this._form.$data.submitUI = UIStrings.FORM_SUBMITTING;
        this._form.$data.disabled = 'disabled';
        this._form.contentWrapper.$data.disabled = 'disabled';
        try {
            const rawDataLoader = await fetch(`${this._server}/v3/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: this._title,
                    url: this._url,
                    name: this._form.name,
                    email: this._form.email,
                    website: this._form.website,
                    parent: this._currentTarget,
                    content: this._form.content,
                    receiveEmail: this._showReceiveEmail ? this._form.receiveEmail : false,
                    responseKey: this._responseKey,
                }),
            });
            if (!rawDataLoader.ok) {
                throw new Error(`Server returned ${rawDataLoader.status}`);
            }
            const rawData = await rawDataLoader.json();
            const data = {
                ...rawData,
                emailHashed: `${md5(rawData.email)}`,
                byAdmin: false,
                avatar: null,
            };
            if (data.parent) {
                const parent = this._threadMap.get(data.parent).parent;
                if (parent) {
                    // 新增加的评论隶属于隶属于其它评论的评论
                    const root = this._threadElementMap.get(parent);
                    const newElem = this._printEntry(data, true);
                    root.subComments.push(newElem);
                } else {
                    // 新增加的评论隶属于独立的评论
                    const root = this._threadElementMap.get(data.parent);
                    const newElem = this._printEntry(data, true);
                    root.subComments.push(newElem);
                }
            } else {
                // 新增加的评论不隶属于任何评论
                const newElem = this._printEntry(data);
                this._comments.unshift(newElem);
            }
            this._form.content = '';
        } catch (e) {
            console.error('[Pomment]', e);
            this._spawnFormError(UIStrings.FORM_SUBMIT_ERROR);
        }
        this._unfreezeForm();
    }

    async _unfreezeForm() {
        this._form.$data.submitUI = UIStrings.FORM_SUBMIT;
        this._form.$data.disabled = null;
        this._form.contentWrapper.$data.disabled = null;
        if (this.reCAPTCHA) {
            this._responseKey = null;
            this._responseKey = await grecaptcha.execute(this.reCAPTCHA, { action: 'submit_comment' });
            console.info('[Pomment]', 'reCAPTCHA v3 is ready again!');
        }
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
