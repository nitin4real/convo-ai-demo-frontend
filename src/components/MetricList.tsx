import React, { useEffect, useRef } from 'react';
import infoIcon from '../assets/info-outline-rounded.svg';
import {
  getMetricModuleLabel,
  getMetricNameLabel,
  METRIC_DEFINITIONS,
} from '../constant/metric-definitions';
import { IMetricMessage } from '../types/agent.types';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface MetricListProps {
  metrics: IMetricMessage[];
  isVisible: boolean;
}

interface TurnMetric {
  turn_id: number;
  modules: Record<string, Record<string, number>>;
  e2e_latency_ms?: number;
}

interface MetricColumn {
  module: string;
  metricName: string;
}

const MODULE_ORDER = ['algorithm', 'asr', 'llm', 'tts', 'transport'];
const METRIC_ORDER = ['processing', 'ttlw', 'ttft', 'ftfs', 'ttfb', 'latency'];

const getSortIndex = (order: string[], value: string): number => {
  const index = order.indexOf(value);
  return index === -1 ? order.length : index;
};

export const MetricList: React.FC<MetricListProps> = ({ metrics, isVisible }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && isVisible) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [metrics, isVisible]);

  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.turn_id]) {
      acc[metric.turn_id] = {
        turn_id: metric.turn_id,
        modules: {},
      };
    }

    const turn = acc[metric.turn_id];
    const module = metric.module.toLowerCase();
    if (module === 'e2e') {
      turn.e2e_latency_ms = metric.latency_ms;
      return acc;
    }

    turn.modules[module] ??= {};
    turn.modules[module][metric.metric_name] = metric.latency_ms;
    return acc;
  }, {} as Record<number, TurnMetric>);

  const turnMetrics = Object.values(groupedMetrics).sort((a, b) => a.turn_id - b.turn_id);
  const columnMap = new Map<string, MetricColumn>();
  turnMetrics.forEach(turn => {
    Object.entries(turn.modules).forEach(([module, moduleMetrics]) => {
      Object.keys(moduleMetrics).forEach(metricName => {
        columnMap.set(`${module}:${metricName}`, { module, metricName });
      });
    });
  });
  const columns = Array.from(columnMap.values()).sort((left, right) => {
    const moduleDifference = getSortIndex(MODULE_ORDER, left.module) -
      getSortIndex(MODULE_ORDER, right.module);
    if (moduleDifference !== 0) {
      return moduleDifference;
    }
    return getSortIndex(METRIC_ORDER, left.metricName) -
      getSortIndex(METRIC_ORDER, right.metricName);
  });

  const getTotal = (turn: TurnMetric): number => {
    if (turn.e2e_latency_ms !== undefined) {
      return turn.e2e_latency_ms;
    }

    return Object.values(turn.modules).reduce(
      (moduleTotal, moduleMetrics) => moduleTotal + Object.values(moduleMetrics)
        .reduce((metricTotal, latency) => metricTotal + latency, 0),
      0
    );
  };

  return (
    <Card className="shadow-lg p-1 h-full flex flex-col">
      <div className="px-2 py-1.5 border-b flex-shrink-0">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-semibold">Metrics</h2>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Explain latency metrics"
                title="About these metrics"
              >
                <img
                  src={infoIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 dark:invert"
                />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-5">
              <DialogHeader>
                <DialogTitle>Latency metrics</DialogTitle>
                <DialogDescription>
                  Each value is measured in milliseconds for one conversation turn.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {METRIC_DEFINITIONS.map(metric => (
                  <div key={metric.key} className="grid grid-cols-[72px_1fr] gap-3">
                    <span className="font-mono text-[11px] font-semibold text-primary">
                      {metric.shortLabel}
                    </span>
                    <div>
                      <p className="text-xs font-medium">{metric.name}</p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {metric.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Performance metrics by turn (in ms)
        </p>
      </div>
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <div className="border rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-1 flex flex-col min-h-0 overflow-hidden">
          {turnMetrics.length > 0 ? (
            <div
              ref={containerRef}
              className="flex-1 overflow-auto"
            >
              <div className="p-1 min-w-max">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-background z-10">
                    <tr className="border-b">
                      <th className="text-left px-1 py-1 text-[10px] font-medium min-w-[38px] leading-tight">
                        <span className="block">TURN</span>
                        <span className="block text-[8px] font-normal text-muted-foreground">ID</span>
                      </th>
                      {columns.map(({ module, metricName }) => (
                        <th
                          key={`${module}-${metricName}`}
                          className="text-left px-1 py-1 text-[10px] font-medium min-w-[42px] whitespace-nowrap leading-tight"
                        >
                          <span className="block">{getMetricModuleLabel(module)}</span>
                          <span className="block text-[8px] font-normal text-muted-foreground">
                            {getMetricNameLabel(metricName)}
                          </span>
                        </th>
                      ))}
                      <th className="text-left px-1 py-1 text-[10px] font-bold min-w-[44px] whitespace-nowrap leading-tight">
                        <span className="block">E2E</span>
                        <span className="block text-[8px] font-normal text-muted-foreground">
                          TOTAL
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnMetrics.map(turn => (
                      <tr key={turn.turn_id} className="border-b hover:bg-muted/50">
                        <td className="px-1 py-1.5 font-medium text-[11px]">{turn.turn_id}</td>
                        {columns.map(({ module, metricName }) => (
                          <td key={`${module}-${metricName}`} className="px-1 py-1.5 text-[11px]">
                            {turn.modules[module]?.[metricName] !== undefined
                              ? turn.modules[module][metricName].toFixed(0)
                              : '-'}
                          </td>
                        ))}
                        <td className="px-1 py-1.5 text-[11px] font-bold">
                          {getTotal(turn).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-muted-foreground">No metrics yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
