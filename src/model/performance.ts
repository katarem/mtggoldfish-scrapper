enum PerformanceValue {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    ULTRA = 'ultra',
    FAST = 'fast',
    ULTRA_FAST = 'ultrafast'
}


class Performance {

    value: PerformanceValue = PerformanceValue.MEDIUM;

    constructor(value: PerformanceValue) {
        if (value) this.value = value;
    }

    getConcurrentPages() {
        switch (this.value) {
            case PerformanceValue.LOW:
                return 5;
            case PerformanceValue.MEDIUM:
                return 10;
            case PerformanceValue.HIGH:
                return 15;
            case PerformanceValue.ULTRA:
                return 20;
            case PerformanceValue.FAST:
                return 30;
            case PerformanceValue.ULTRA_FAST:
                return 40;
            default:
                return 10;
        }
    }

}

export { Performance, PerformanceValue };