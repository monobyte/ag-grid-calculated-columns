// Matches the nested structure from the .NET backend schema
export interface IBond {
  RecordId: string;
  MapIdCode: string;
  DisplayTier: string;
  TwBid?: number;
  TwAsk?: number;
  TwBidYield?: number;
  TwAskYield?: number;
  I_Ask?: number;
  I_Bid?: number;
  Composite: {
    MidPrice?: number;
    MidYield?: number;
    OpeningPrice?: number;
    OpeningYield?: number;
    ClosingPrice?: number;
    ClosingYield?: number;
    AnalyticsPv01?: number;
    ModDuration?: number;
  };
  Instrument: {
    AutoNeg?: number;
    CodeType: string;
    Country: string;
    CustomSegment?: string;
    MaturityBucket?: string;
    SecurityType: string;
    Segment: string;
    DateMaturity: number; // Using number for simplicity, can be formatted
    Currency: string;
    IsDefaultTier: boolean;
    LastUpdateTime: string; // ISO date string
  };
}
