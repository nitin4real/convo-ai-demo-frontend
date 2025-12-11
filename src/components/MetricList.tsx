import React, { useEffect, useRef } from 'react';
import { IMetricMessage } from '../types/agent.types';
import { Card, CardContent } from './ui/card';

interface MetricListProps {
  metrics: IMetricMessage[];
  isVisible: boolean;
}

interface ModuleMetrics {
  [metric_name: string]: number;
}

interface TurnMetric {
  turn_id: number;
  asr?: ModuleMetrics;
  llm?: ModuleMetrics;
  tts?: ModuleMetrics;
}

export const MetricList: React.FC<MetricListProps> = ({ metrics, isVisible }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && isVisible) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [metrics, isVisible]);

  // Group metrics by turn_id, module, and metric_name
  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.turn_id]) {
      acc[metric.turn_id] = {
        turn_id: metric.turn_id,
      };
    }

    const module = metric.module.toLowerCase();
    if (module === 'asr' || module === 'llm' || module === 'tts') {
      if (!acc[metric.turn_id][module]) {
        acc[metric.turn_id][module] = {};
      }
      acc[metric.turn_id][module]![metric.metric_name] = metric.latency_ms;
    }
    return acc;
  }, {} as Record<number, TurnMetric>);

  const turnMetrics = Object.values(groupedMetrics).sort((a, b) => a.turn_id - b.turn_id);

  // Get all unique metric names for each module
  const getMetricNamesForModule = (module: 'asr' | 'llm' | 'tts'): string[] => {
    const metricNames = new Set<string>();
    turnMetrics.forEach(turn => {
      if (turn[module]) {
        Object.keys(turn[module]!).forEach(name => metricNames.add(name));
      }
    });
    return Array.from(metricNames).sort();
  };

  const asrMetricNames = getMetricNamesForModule('asr');
  const llmMetricNames = getMetricNamesForModule('llm');
  const ttsMetricNames = getMetricNamesForModule('tts');

  return (
    <Card className="shadow-lg p-2 h-full flex flex-col">
      <div className="p-2 border-b flex-shrink-0">
        <h2 className="text-base font-semibold">Metrics</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Performance metrics by turn (in ms)
        </p>
      </div>
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <div className="border rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-1 flex flex-col min-h-0 overflow-hidden">
          {turnMetrics.length > 0 ? (
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
            >
              <div className="p-4">
                <table className="w-full border-collapse table-fixed">
                  <thead className="sticky top-0 bg-background z-10">
                    <tr className="border-b">
                      <th className="text-left px-2 py-1 text-xs font-medium w-16">Turn ID</th>
                      {asrMetricNames.length > 0 && (
                        <>
                          {asrMetricNames.map((metricName) => (
                            <th key={`asr-${metricName}`} className="text-left px-2 py-1 text-xs font-medium">
                              ASR
                            </th>
                          ))}
                        </>
                      )}
                      {llmMetricNames.length > 0 && (
                        <>
                          {llmMetricNames.map((metricName) => (
                            <th key={`llm-${metricName}`} className="text-left px-2 py-1 text-xs font-medium">
                              LLM
                            </th>
                          ))}
                        </>
                      )}
                      {ttsMetricNames.length > 0 && (
                        <>
                          {ttsMetricNames.map((metricName) => (
                            <th key={`tts-${metricName}`} className="text-left px-2 py-1 text-xs font-medium">
                              TTS
                            </th>
                          ))}
                        </>
                      )}
                      <th className="text-left px-2 py-1 text-xs font-bold w-16">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnMetrics.map((turn) => (
                      <tr key={turn.turn_id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium text-xs w-16">{turn.turn_id}</td>
                        {asrMetricNames.map((metricName) => (
                          <td key={`asr-${metricName}`} className="p-2 text-xs">
                            {turn.asr?.[metricName] !== undefined
                              ? turn.asr[metricName].toFixed(0)
                              : '-'}
                          </td>
                        ))}
                        {llmMetricNames.map((metricName) => (
                          <td key={`llm-${metricName}`} className="p-2 text-xs">
                            {turn.llm?.[metricName] !== undefined
                              ? turn.llm[metricName].toFixed(0)
                              : '-'}
                          </td>
                        ))}
                        {ttsMetricNames.map((metricName) => (
                          <td key={`tts-${metricName}`} className="p-2 text-xs">
                            {turn.tts?.[metricName] !== undefined
                              ? turn.tts[metricName].toFixed(0)
                              : '-'}
                          </td>
                        ))}
                        <td className="p-2 text-xs font-bold">
                          {(
                            (turn.asr ? Object.values(turn.asr).reduce((a, b) => a + b, 0) : 0) +
                            (turn.llm ? Object.values(turn.llm).reduce((a, b) => a + b, 0) : 0) +
                            (turn.tts ? Object.values(turn.tts).reduce((a, b) => a + b, 0) : 0)
                          ).toFixed(0)}
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

