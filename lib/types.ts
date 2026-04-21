export type VideoVersion = 'A' | 'B';
export type ShareIntent = 'Yes' | 'Maybe' | 'No';
export type TestOrder = 'A_first' | 'B_first';

export interface VideoEngagement {
  didPlay: boolean;
  replayCount: number;
  watchedToEnd: boolean;
}

export interface RatingData {
  emotionalResponse: number;
  shareIntent: ShareIntent;
  purchaseIntent: number;
  openComment: string;
}

export interface Session {
  id: string;
  created_at: string;
  order_shown: string;
  emotional_response_a: number;
  share_intent_a: string;
  purchase_intent_a: number;
  open_comment_a: string | null;
  did_play_a: boolean;
  replay_count_a: number;
  watched_to_end_a: boolean;
  emotional_response_b: number;
  share_intent_b: string;
  purchase_intent_b: number;
  open_comment_b: string | null;
  did_play_b: boolean;
  replay_count_b: number;
  watched_to_end_b: boolean;
  final_preference: string;
  final_comment: string | null;
  completed: boolean;
}
