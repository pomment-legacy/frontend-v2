type Closeable = "" | "closeable";
type Style = "" | "success" | "info" | "warn" | "error";

interface BarData {
    style: Style;
    message: string;
    link: string;
    closeable: Closeable;
}

interface BarMethods {
    link: function;
}

interface BarProps {
    $data: BarData;
    $methods: BarMethods;
}

class Bar {
    constructor(props: BarProps);
}

export default Bar;
