export interface MetricDefinition {
  key: string;
  shortLabel: string;
  name: string;
  description: string;
}

const MODULE_LABELS: Record<string, string> = {
  algorithm: 'ALGO',
  asr: 'ASR',
  llm: 'LLM',
  tts: 'TTS',
  transport: 'NET',
};

const METRIC_LABELS: Record<string, string> = {
  processing: 'PROC',
  ttlw: 'TTLW',
  ttft: 'TTFT',
  ftfs: 'FTFS',
  ttfb: 'TTFB',
  latency: 'LAT',
};

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    key: 'algorithm_processing',
    shortLabel: 'ALGO / PROC',
    name: 'Algorithm processing',
    description: 'Internal algorithm processing delay for the conversation turn.',
  },
  {
    key: 'asr_ttlw',
    shortLabel: 'ASR / TTLW',
    name: 'ASR Time To Last Word',
    description: 'Time from when the user finishes speaking until ASR outputs the last recognized word.',
  },
  {
    key: 'llm_ttft',
    shortLabel: 'LLM / TTFT',
    name: 'LLM Time To First Token',
    description: 'Time from when the LLM receives the request until it outputs its first token.',
  },
  {
    key: 'llm_ftfs',
    shortLabel: 'LLM / FTFS',
    name: 'First Token To First Sentence',
    description: 'Time from the LLM first token until its first complete sentence is available.',
  },
  {
    key: 'tts_ttfb',
    shortLabel: 'TTS / TTFB',
    name: 'TTS Time To First Byte',
    description: 'Time from when TTS receives text until it outputs the first audio byte.',
  },
  {
    key: 'transport',
    shortLabel: 'NET / LAT',
    name: 'Network transport',
    description: 'Network transmission delay for the turn.',
  },
  {
    key: 'e2e_latency_ms',
    shortLabel: 'E2E / TOTAL',
    name: 'End-to-end latency',
    description: 'Total latency across the complete conversation turn.',
  },
];

export const getMetricModuleLabel = (module: string): string => (
  MODULE_LABELS[module] ?? module.toUpperCase()
);

export const getMetricNameLabel = (metricName: string): string => (
  METRIC_LABELS[metricName] ?? metricName.toUpperCase()
);
