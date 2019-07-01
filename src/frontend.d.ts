interface PWProps {
    server: string;
    url?: string;
    title?: string;
    avatarPrefix?: string;
    fixedHeight?: number;
    adminName?: string;
    adminAvatar?: string;
    showReceiveEmail?: boolean;
    SDKProvider?: Function;
}

declare class PommentWidget {
    constructor(props: PWProps);
    load(...mountProps: any[]): Promise<any>;
    readonly loaded: boolean;
}

export default PommentWidget;
