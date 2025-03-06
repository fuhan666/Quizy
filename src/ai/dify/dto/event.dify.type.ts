import { DifyStatus } from './dify.status.enum';

export type DifyEvent = {
  event:
    | 'workflow_started'
    | 'node_started'
    | 'node_finished'
    | 'workflow_finished'
    | 'tts_message'
    | 'tts_message_end'
    | (string & {});
  task_id: string;
  workflow_run_id?: string;
  data: {
    id: string;
    workflow_id?: string;
    node_id?: string;
    predecessor_node_id?: string;
    node_type?: string;
    title?: string;
    index?: number;
    inputs?: any;
    outputs?: any;
    status?: DifyStatus;
    elapsed_time?: number;
    execution_metadata?: {
      total_tokens: number;
      total_price: number;
      currency: string;
    };
    total_tokens?: number;
    total_steps?: string;
    finished_at?: number;
    sequence_number?: number;
    created_at: number;
  };

  // tts_message
  conversation_id?: string;
  message_id?: string;
  created_at?: number;
  audio?: string;
};
