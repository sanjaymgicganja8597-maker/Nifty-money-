
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  history: number[]; // For sparklines
  type?: 'EQUITY' | 'INDEX';
  sector?: string;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  ltp: number; // Last Traded Price
  type: 'INTRADAY' | 'DELIVERY';
  side: 'LONG' | 'SHORT';
  targetPrice?: number;
  stopLossPrice?: number;
  timeframe?: string;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  product: 'INTRADAY' | 'DELIVERY';
  orderType: 'MARKET' | 'LIMIT';
  quantity: number;
  price: number;
  status: 'EXECUTED' | 'PENDING' | 'REJECTED' | 'TARGET_HIT' | 'STOPLOSS_HIT';
  timestamp: Date;
  realizedPnL?: number; // Profit or Loss realized on this trade (if SELL)
}

export interface PortfolioStats {
  totalValue: number;
  investedValue: number;
  dayPnL: number;
  totalPnL: number;
  availableMargin: number;
}

export interface PerformanceMetric {
  label: string;
  value: string | number;
  trend?: number;
  isCurrency?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
}
