interface PWProps {
    server: string;
    url?: string;
    title?: string;
    avatarPrefix?: string;
    fixedHeight?: number;
}

class PommentWidget {
    constructor(props: PWProps): PommentWidget;
    load(...mountProps: any[]): Promise<any>;
    readonly loaded: boolean;
}

export default PommentWidget;
