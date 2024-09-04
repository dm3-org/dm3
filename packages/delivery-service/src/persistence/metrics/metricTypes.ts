type IntervalMetric = {
    messageCount: number;
    messageSizeBytes: number;
    notificationCount: number;
};

type MetricsMap = Map<Date, IntervalMetric>;

export type { MetricsMap, IntervalMetric };

export interface MetricsObject {
    [date: string]: IntervalMetric;
}
