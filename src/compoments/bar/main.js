import BarTemplate from './bar.eft';

const initProps = {
    $methods: {
        close({ state }) {
            state.$umount();
        },
    },
};

class Bar extends BarTemplate {
    constructor(props) {
        super(Object.assign({}, initProps, props));
    }
}

export default Bar;
