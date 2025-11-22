
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Search, 
  Activity, 
  Briefcase, 
  User, 
  Bot, 
  LayoutDashboard,
  RefreshCcw,
  X,
  Clock,
  PieChart,
  Settings,
  LogOut,
  ChevronRight,
  CreditCard,
  BarChart2,
  UserCircle,
  Target,
  ShieldAlert,
  Bell,
  Wallet,
  Calendar,
  List,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, ReferenceLine, CartesianGrid } from 'recharts';
import { Stock, Position, Order, PortfolioStats, Notification } from './types';
import { analyzeStock } from './services/geminiService';
import { TradingViewChart } from './components/TradingViewChart';

// --- Mock Data Generators ---
const INITIAL_CAPITAL = 10000; // ₹10,000 for a better trading experience

const generateMockHistory = (basePrice: number, points: number = 50) => {
  let current = basePrice;
  const history = [];
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * (basePrice * 0.02);
    current += change;
    history.push(current);
  }
  return history;
};

// --- Comprehensive NSE Stock List Simulation ---
const COMPREHENSIVE_STOCKS: Stock[] = [
  // Indices
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', price: 22450.00, change: 120.50, changePercent: 0.54, volume: 15000000, history: generateMockHistory(22450), type: 'INDEX', sector: 'Indices' },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank', price: 47800.00, change: -150.00, changePercent: -0.31, volume: 8000000, history: generateMockHistory(47800), type: 'INDEX', sector: 'Indices' },
  
  // Heavyweights
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2980.50, change: 15.00, changePercent: 0.50, volume: 250000, history: generateMockHistory(2980), type: 'EQUITY', sector: 'Energy' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1450.00, change: -10.00, changePercent: -0.68, volume: 450000, history: generateMockHistory(1450), type: 'EQUITY', sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1620.00, change: 22.00, changePercent: 1.37, volume: 120000, history: generateMockHistory(1620), type: 'EQUITY', sector: 'Technology' },
  { symbol: 'TCS', name: 'Tata Consultancy Svcs', price: 3950.00, change: -45.00, changePercent: -1.12, volume: 320000, history: generateMockHistory(3950), type: 'EQUITY', sector: 'Technology' },
  { symbol: 'ITC', name: 'ITC Limited', price: 435.00, change: 2.50, changePercent: 0.57, volume: 800000, history: generateMockHistory(435), type: 'EQUITY', sector: 'FMCG' },
  { symbol: 'LT', name: 'Larsen & Toubro', price: 3600.00, change: 40.00, changePercent: 1.12, volume: 150000, history: generateMockHistory(3600), type: 'EQUITY', sector: 'Construction' },
  
  // Banking & Finance
  { symbol: 'SBIN', name: 'State Bank of India', price: 760.00, change: 8.00, changePercent: 1.06, volume: 600000, history: generateMockHistory(760), type: 'EQUITY', sector: 'Banking' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1080.00, change: -5.00, changePercent: -0.46, volume: 400000, history: generateMockHistory(1080), type: 'EQUITY', sector: 'Banking' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 1050.00, change: 12.00, changePercent: 1.15, volume: 300000, history: generateMockHistory(1050), type: 'EQUITY', sector: 'Banking' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6800.00, change: -120.00, changePercent: -1.73, volume: 50000, history: generateMockHistory(6800), type: 'EQUITY', sector: 'Finance' },
  
  // Auto
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 980.00, change: 18.00, changePercent: 1.87, volume: 1200000, history: generateMockHistory(980), type: 'EQUITY', sector: 'Auto' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', price: 1850.00, change: 25.00, changePercent: 1.37, volume: 180000, history: generateMockHistory(1850), type: 'EQUITY', sector: 'Auto' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 11500.00, change: -200.00, changePercent: -1.71, volume: 20000, history: generateMockHistory(11500), type: 'EQUITY', sector: 'Auto' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors', price: 3800.00, change: 45.00, changePercent: 1.20, volume: 35000, history: generateMockHistory(3800), type: 'EQUITY', sector: 'Auto' },

  // Commodities & Energy
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', price: 155.00, change: 1.50, changePercent: 0.97, volume: 850000, history: generateMockHistory(155), type: 'EQUITY', sector: 'Metals' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 3100.00, change: 80.00, changePercent: 2.65, volume: 950000, history: generateMockHistory(3100), type: 'EQUITY', sector: 'Diversified' },
  { symbol: 'ONGC', name: 'ONGC', price: 270.00, change: -3.00, changePercent: -1.10, volume: 600000, history: generateMockHistory(270), type: 'EQUITY', sector: 'Energy' },
  { symbol: 'NTPC', name: 'NTPC Limited', price: 340.00, change: 2.00, changePercent: 0.59, volume: 500000, history: generateMockHistory(340), type: 'EQUITY', sector: 'Energy' },
  { symbol: 'COALINDIA', name: 'Coal India', price: 450.00, change: 5.00, changePercent: 1.12, volume: 400000, history: generateMockHistory(450), type: 'EQUITY', sector: 'Energy' },

  // Pharma
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', price: 1550.00, change: -15.00, changePercent: -0.96, volume: 100000, history: generateMockHistory(1550), type: 'EQUITY', sector: 'Pharma' },
  { symbol: 'CIPLA', name: 'Cipla Ltd', price: 1400.00, change: 10.00, changePercent: 0.72, volume: 90000, history: generateMockHistory(1400), type: 'EQUITY', sector: 'Pharma' },
  
  // New Age / Tech
  { symbol: 'ZOMATO', name: 'Zomato Ltd', price: 180.00, change: 4.50, changePercent: 2.56, volume: 2500000, history: generateMockHistory(180), type: 'EQUITY', sector: 'Technology' },
  { symbol: 'PAYTM', name: 'Paytm', price: 420.00, change: -12.00, changePercent: -2.78, volume: 1500000, history: generateMockHistory(420), type: 'EQUITY', sector: 'Finance' },
  
  // Expensive
  { symbol: 'MRF', name: 'MRF Ltd', price: 135000.00, change: 500.00, changePercent: 0.37, volume: 1000, history: generateMockHistory(135000), type: 'EQUITY', sector: 'Auto' },
  { symbol: 'BOSCHLTD', name: 'Bosch Limited', price: 30000.00, change: -150.00, changePercent: -0.50, volume: 5000, history: generateMockHistory(30000), type: 'EQUITY', sector: 'Auto' },
];

// Helper to format currency
const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

const generateCandles = (currentPrice: number) => {
    const candles = [];
    const now = Math.floor(Date.now() / 1000);
    let currentTime = now - (100 * 5 * 60); // 100 candles ago (5 min intervals)

    let price = currentPrice * 0.95; // Start slightly lower
    
    for (let i = 0; i < 100; i++) {
        const open = price;
        const close = price + (Math.random() - 0.5) * (price * 0.01);
        const high = Math.max(open, close) + Math.random() * (price * 0.005);
        const low = Math.min(open, close) - Math.random() * (price * 0.005);
        
        candles.push({
            time: currentTime,
            open,
            high,
            low,
            close
        });
        
        price = close;
        currentTime += 5 * 60; // Add 5 minutes
    }
    return candles;
}

function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'WATCHLIST' | 'MARKET' | 'PORTFOLIO' | 'HISTORY' | 'PERFORMANCE' | 'PROFILE' | 'AI'>('DASHBOARD');
  const [stocks, setStocks] = useState<Stock[]>(COMPREHENSIVE_STOCKS);
  const [selectedStock, setSelectedStock] = useState<Stock>(COMPREHENSIVE_STOCKS[0]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [capital, setCapital] = useState(INITIAL_CAPITAL);
  
  // Dashboard State
  const [dashboardFilter, setDashboardFilter] = useState<'GAINERS' | 'LOSERS'>('GAINERS');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTypeFilter, setSearchTypeFilter] = useState<'ALL' | 'EQUITY' | 'INDEX'>('ALL');
  const [searchSectorFilter, setSearchSectorFilter] = useState<string>('ALL');
  const [watchlistSearch, setWatchlistSearch] = useState('');

  // Order Form State
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [executionType, setExecutionType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [productType, setProductType] = useState<'INTRADAY' | 'DELIVERY'>('INTRADAY');
  const [quantity, setQuantity] = useState<string>('1');
  const [limitInputPrice, setLimitInputPrice] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('Day');
  
  // Performance State
  const [performancePeriod, setPerformancePeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [simulatedSentiment, setSimulatedSentiment] = useState<'BULLISH' | 'BEARISH' | 'NEUTRAL'>('NEUTRAL');

  // Chart Data State
  const [candleData, setCandleData] = useState<any[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- Effects ---

  // 1. Market Simulator, Auto-Square off & Limit Order Matching
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => {
        const updatedStocks = prevStocks.map(stock => {
          // Simulate price changes
          const volatility = 0.002;
          const change = (Math.random() - 0.5) * (stock.price * volatility);
          const newPrice = stock.price + change;
          const newHistory = [...stock.history.slice(1), newPrice];
          
          return {
            ...stock,
            price: newPrice,
            change: newPrice - stock.history[0],
            changePercent: ((newPrice - stock.history[0]) / stock.history[0]) * 100,
            history: newHistory
          };
        });

        // --- Position & Order Management ---
        setPositions(currentPositions => {
           const remainingPositions: Position[] = [...currentPositions];
           let capitalChange = 0;
           const newOrders: Order[] = [];
           const noteBuffer: Omit<Notification, 'id'>[] = [];

           // A. Auto-Square Off Logic (Target/Stoploss)
           const positionsToClose: number[] = [];

           remainingPositions.forEach((pos, index) => {
               const stock = updatedStocks.find(s => s.symbol === pos.symbol);
               if (!stock) return;

               let triggered = false;
               let triggerType: 'TARGET_HIT' | 'STOPLOSS_HIT' | null = null;

               if (pos.side === 'LONG') {
                   if (pos.targetPrice && stock.price >= pos.targetPrice) {
                       triggered = true; triggerType = 'TARGET_HIT';
                   } else if (pos.stopLossPrice && stock.price <= pos.stopLossPrice) {
                       triggered = true; triggerType = 'STOPLOSS_HIT';
                   }
               } else { // SHORT
                   if (pos.targetPrice && stock.price <= pos.targetPrice) {
                       triggered = true; triggerType = 'TARGET_HIT';
                   } else if (pos.stopLossPrice && stock.price >= pos.stopLossPrice) {
                       triggered = true; triggerType = 'STOPLOSS_HIT';
                   }
               }

               if (triggered && triggerType) {
                   positionsToClose.push(index);
                   const exitPrice = stock.price;
                   let realizedPnL = 0;
                   
                   if (pos.side === 'LONG') {
                       // Sell Long
                       const sellValue = pos.quantity * exitPrice;
                       realizedPnL = sellValue - (pos.quantity * pos.avgPrice);
                       capitalChange += sellValue;
                   } else {
                       // Cover Short
                       const margin = pos.quantity * pos.avgPrice;
                       realizedPnL = (pos.avgPrice - exitPrice) * pos.quantity;
                       capitalChange += (margin + realizedPnL);
                   }

                   noteBuffer.push({
                       type: triggerType === 'TARGET_HIT' ? 'SUCCESS' : 'ERROR',
                       title: `${triggerType === 'TARGET_HIT' ? 'Target' : 'Stoploss'} Hit: ${pos.symbol}`,
                       message: `${pos.side === 'LONG' ? 'Sold' : 'Covered'} ${pos.quantity} @ ${formatINR(stock.price)}`
                   });

                   newOrders.push({
                       id: Math.random().toString(36).substr(2, 9),
                       symbol: pos.symbol,
                       type: pos.side === 'LONG' ? 'SELL' : 'BUY',
                       product: pos.type,
                       orderType: 'MARKET',
                       quantity: pos.quantity,
                       price: stock.price,
                       status: triggerType as any,
                       timestamp: new Date(),
                       realizedPnL: realizedPnL
                   });
               }
           });

           for (let i = positionsToClose.length - 1; i >= 0; i--) {
               remainingPositions.splice(positionsToClose[i], 1);
           }
           
           if (capitalChange !== 0) setCapital(prev => prev + capitalChange);
           if (newOrders.length > 0) {
               setOrders(prev => [...newOrders, ...prev]);
               noteBuffer.forEach(n => addNotification(n));
           }
           
           // B. Limit Order Matching
           setOrders(currentOrders => {
               const pendingOrders = currentOrders.filter(o => o.status === 'PENDING');
               if (pendingOrders.length === 0) return currentOrders;

               const processedOrderIds: string[] = [];
               let limitCapitalChange = 0; 
               
               pendingOrders.forEach(order => {
                   const stock = updatedStocks.find(s => s.symbol === order.symbol);
                   if (!stock) return;

                   let executed = false;
                   if (order.type === 'BUY' && stock.price <= order.price) {
                       executed = true;
                   } else if (order.type === 'SELL' && stock.price >= order.price) {
                       executed = true;
                   }

                   if (executed) {
                       processedOrderIds.push(order.id);
                       const fillPrice = order.price; 
                       
                       let remainingQty = order.quantity;

                       if (order.type === 'BUY') {
                           // 1. Cover Short?
                           const shortIdx = remainingPositions.findIndex(p => p.symbol === order.symbol && p.side === 'SHORT');
                           if (shortIdx !== -1) {
                               const shortPos = remainingPositions[shortIdx];
                               const coverQty = Math.min(shortPos.quantity, remainingQty);
                               
                               const pnl = (shortPos.avgPrice - fillPrice) * coverQty;
                               const marginReleased = shortPos.avgPrice * coverQty;
                               limitCapitalChange += (marginReleased + pnl);

                               if (shortPos.quantity === coverQty) {
                                   remainingPositions.splice(shortIdx, 1);
                               } else {
                                   remainingPositions[shortIdx] = { ...shortPos, quantity: shortPos.quantity - coverQty };
                               }
                               remainingQty -= coverQty;
                           }

                           // 2. Add Long
                           if (remainingQty > 0) {
                               const longIdx = remainingPositions.findIndex(p => p.symbol === order.symbol && p.side === 'LONG');
                               if (longIdx !== -1) {
                                   const longPos = remainingPositions[longIdx];
                                   const newAvg = ((longPos.quantity * longPos.avgPrice) + (remainingQty * fillPrice)) / (longPos.quantity + remainingQty);
                                   remainingPositions[longIdx] = { ...longPos, quantity: longPos.quantity + remainingQty, avgPrice: newAvg };
                               } else {
                                   remainingPositions.push({
                                       symbol: order.symbol, quantity: remainingQty, avgPrice: fillPrice, ltp: stock.price,
                                       type: order.product, side: 'LONG'
                                   });
                               }
                           }

                       } else { // SELL
                           // 1. Close Long?
                           const longIdx = remainingPositions.findIndex(p => p.symbol === order.symbol && p.side === 'LONG');
                           if (longIdx !== -1) {
                               const longPos = remainingPositions[longIdx];
                               const sellQty = Math.min(longPos.quantity, remainingQty);
                               
                               limitCapitalChange += (sellQty * fillPrice);
                               
                               if (longPos.quantity === sellQty) {
                                   remainingPositions.splice(longIdx, 1);
                               } else {
                                   remainingPositions[longIdx] = { ...longPos, quantity: longPos.quantity - sellQty };
                               }
                               remainingQty -= sellQty;
                           }

                           // 2. Open Short
                           if (remainingQty > 0) {
                               const shortIdx = remainingPositions.findIndex(p => p.symbol === order.symbol && p.side === 'SHORT');
                               if (shortIdx !== -1) {
                                   const shortPos = remainingPositions[shortIdx];
                                   const newAvg = ((shortPos.quantity * shortPos.avgPrice) + (remainingQty * fillPrice)) / (shortPos.quantity + remainingQty);
                                   remainingPositions[shortIdx] = { ...shortPos, quantity: shortPos.quantity + remainingQty, avgPrice: newAvg };
                               } else {
                                   remainingPositions.push({
                                       symbol: order.symbol, quantity: remainingQty, avgPrice: fillPrice, ltp: stock.price,
                                       type: order.product, side: 'SHORT'
                                   });
                               }
                           }
                       }
                       
                       addNotification({ 
                           type: 'SUCCESS', 
                           title: 'Limit Order Filled', 
                           message: `${order.type} ${order.quantity} ${order.symbol} @ ${formatINR(fillPrice)}` 
                       });
                   }
               });

               if (limitCapitalChange !== 0) setCapital(prev => prev + limitCapitalChange);
               
               return currentOrders.map(o => 
                   processedOrderIds.includes(o.id) ? { ...o, status: 'EXECUTED' } : o
               );
           });

           return remainingPositions;
        });

        return updatedStocks;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 2. Update Portfolio Values
  const stats: PortfolioStats = useMemo(() => {
    let investedValue = 0;
    let currentValue = 0;

    positions.forEach(pos => {
      const stock = stocks.find(s => s.symbol === pos.symbol);
      const currentPrice = stock ? stock.price : pos.ltp;
      
      const invested = pos.quantity * pos.avgPrice;
      investedValue += invested;

      if (pos.side === 'LONG') {
          currentValue += pos.quantity * currentPrice;
      } else {
          const pnl = (pos.avgPrice - currentPrice) * pos.quantity;
          currentValue += (invested + pnl);
      }
    });

    return {
      totalValue: capital + currentValue,
      investedValue,
      dayPnL: currentValue - investedValue,
      totalPnL: currentValue - investedValue,
      availableMargin: capital
    };
  }, [capital, positions, stocks]);

  // 3. Performance Analysis
  const performanceData = useMemo(() => {
    const closedTrades = orders.filter(o => o.realizedPnL !== undefined);
    
    // Win Rate & Profit Factor
    const wins = closedTrades.filter(o => (o.realizedPnL || 0) > 0);
    const losses = closedTrades.filter(o => (o.realizedPnL || 0) <= 0);
    
    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
    
    const grossProfit = wins.reduce((acc, curr) => acc + (curr.realizedPnL || 0), 0);
    const grossLoss = Math.abs(losses.reduce((acc, curr) => acc + (curr.realizedPnL || 0), 0));
    const profitFactor = grossLoss === 0 ? grossProfit > 0 ? 999 : 0 : grossProfit / grossLoss;
    
    // Risk Metrics
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const riskRewardRatio = avgLoss === 0 ? (avgWin > 0 ? 999 : 0) : avgWin / avgLoss;

    const totalReturns = closedTrades.reduce((acc, curr) => acc + (curr.realizedPnL || 0), 0);

    const maxProfit = wins.length > 0 ? Math.max(...wins.map(o => o.realizedPnL || 0)) : 0;
    const maxLoss = losses.length > 0 ? Math.min(...losses.map(o => o.realizedPnL || 0)) : 0;

    // Chart Data
    const groupedData: Record<string, number> = {};
    const dailyData: Record<string, number> = {};

    closedTrades.forEach(order => {
        const date = new Date(order.timestamp);
        const dateStr = date.toDateString();
        dailyData[dateStr] = (dailyData[dateStr] || 0) + (order.realizedPnL || 0);

        let key = '';
        if (performancePeriod === 'DAILY') {
            key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
        } else if (performancePeriod === 'WEEKLY') {
            const onejan = new Date(date.getFullYear(), 0, 1);
            const week = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
            key = `W${week}`;
        } else {
            key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        groupedData[key] = (groupedData[key] || 0) + (order.realizedPnL || 0);
    });

    const chartData = Object.entries(groupedData).map(([name, pl]) => ({ name, pl }));

    const stockPerformance: Record<string, { pnl: number, trades: number, wins: number }> = {};
    closedTrades.forEach(o => {
      if (!stockPerformance[o.symbol]) stockPerformance[o.symbol] = { pnl: 0, trades: 0, wins: 0 };
      stockPerformance[o.symbol].pnl += o.realizedPnL || 0;
      stockPerformance[o.symbol].trades += 1;
      if ((o.realizedPnL || 0) > 0) stockPerformance[o.symbol].wins += 1;
    });

    const stockBreakdown = Object.entries(stockPerformance)
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => b.pnl - a.pnl);

    return { 
        winRate, 
        profitFactor, 
        totalReturns, 
        chartData, 
        dailyData,
        stockBreakdown,
        totalTrades: closedTrades.length,
        riskRewardRatio,
        winningTradesCount: wins.length,
        losingTradesCount: losses.length,
        avgWin,
        avgLoss,
        maxProfit,
        maxLoss
    };
  }, [orders, performancePeriod]);

  // 4. Generate chart data
  useEffect(() => {
      setCandleData(generateCandles(selectedStock.price));
      setAiAnalysis('');
      
      if (selectedStock.changePercent > 1.5) setSimulatedSentiment('BULLISH');
      else if (selectedStock.changePercent < -1.5) setSimulatedSentiment('BEARISH');
      else if (selectedStock.changePercent > 0) setSimulatedSentiment('BULLISH');
      else setSimulatedSentiment('NEUTRAL');

      setTargetPrice('');
      setStopLossPrice('');
      setLimitInputPrice(selectedStock.price.toFixed(2));
  }, [selectedStock.symbol]);

  // 5. Sorted Stocks for Dashboard
  const sortedStocks = useMemo(() => {
      const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
      return {
          gainers: sorted.filter(s => s.changePercent > 0),
          losers: [...stocks].sort((a, b) => a.changePercent - b.changePercent).filter(s => s.changePercent < 0)
      };
  }, [stocks]);

  // --- Handlers ---

  const addNotification = (note: Omit<Notification, 'id'>) => {
      const id = Math.random().toString(36);
      setNotifications(prev => [...prev, { ...note, id }]);
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
  };

  const availableSectors = useMemo(() => Array.from(new Set(stocks.map(s => s.sector).filter(Boolean))), [stocks]);

  const searchResults = useMemo(() => {
      if (!searchQuery && !isSearchFocused) return [];
      if (!searchQuery && searchTypeFilter === 'ALL' && searchSectorFilter === 'ALL') return [];

      return stocks.filter(s => {
          const matchesText = !searchQuery || s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              s.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesType = searchTypeFilter === 'ALL' || s.type === searchTypeFilter;
          const matchesSector = searchSectorFilter === 'ALL' || s.sector === searchSectorFilter;
          return matchesText && matchesType && matchesSector;
      });
  }, [stocks, searchQuery, isSearchFocused, searchTypeFilter, searchSectorFilter]);

  const handleSelectStock = (stock: Stock) => {
      setSelectedStock(stock);
      setSearchQuery('');
      setIsSearchFocused(false);
      setActiveTab('MARKET');
      setSearchTypeFilter('ALL');
      setSearchSectorFilter('ALL');
  };

  const handleExecuteOrder = () => {
    const qty = parseInt(quantity);
    const currentPrice = selectedStock.price;
    const target = targetPrice ? parseFloat(targetPrice) : undefined;
    const sl = stopLossPrice ? parseFloat(stopLossPrice) : undefined;
    const limitP = limitInputPrice ? parseFloat(limitInputPrice) : currentPrice;

    if (isNaN(qty) || qty <= 0) {
        addNotification({ type: 'ERROR', title: 'Invalid Quantity', message: 'Please enter a valid quantity.' });
        return;
    }
    if (executionType === 'LIMIT' && (isNaN(limitP) || limitP <= 0)) {
        addNotification({ type: 'ERROR', title: 'Invalid Limit Price', message: 'Please enter a valid limit price.' });
        return;
    }

    if (orderType === 'BUY') {
        const entryP = executionType === 'LIMIT' ? limitP : currentPrice;
        if (target && target <= entryP) { addNotification({ type: 'ERROR', title: 'Invalid Target', message: 'Buy Target must be > Entry Price.' }); return; }
        if (sl && sl >= entryP) { addNotification({ type: 'ERROR', title: 'Invalid Stoploss', message: 'Buy Stoploss must be < Entry Price.' }); return; }
    } else {
        const entryP = executionType === 'LIMIT' ? limitP : currentPrice;
        if (target && target >= entryP) { addNotification({ type: 'ERROR', title: 'Invalid Target', message: 'Short Target must be < Entry Price.' }); return; }
        if (sl && sl <= entryP) { addNotification({ type: 'ERROR', title: 'Invalid Stoploss', message: 'Short Stoploss must be > Entry Price.' }); return; }
    }

    let status: 'EXECUTED' | 'PENDING' = 'EXECUTED';
    if (executionType === 'LIMIT') {
        if (orderType === 'BUY' && limitP < currentPrice) {
            status = 'PENDING';
        } else if (orderType === 'SELL' && limitP > currentPrice) {
            status = 'PENDING';
        }
    }
    
    const estimatedCost = qty * (status === 'PENDING' ? limitP : currentPrice);
    
    if (status === 'PENDING') {
        if (estimatedCost > capital) {
             addNotification({ type: 'ERROR', title: 'Insufficient Funds', message: 'Not enough capital to place limit order.' });
             return;
        }
        setCapital(prev => prev - estimatedCost); 
        setOrders(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            symbol: selectedStock.symbol,
            type: orderType,
            product: productType,
            orderType: 'LIMIT',
            quantity: qty,
            price: limitP,
            status: 'PENDING',
            timestamp: new Date(),
        }, ...prev]);
        
        addNotification({ type: 'SUCCESS', title: 'Limit Order Placed', message: `${orderType} ${qty} ${selectedStock.symbol} @ ${limitP}` });
        return;
    }

    setPositions(prev => {
        const newPositions = [...prev];
        let currentCapital = capital;
        const newOrders: Order[] = [];
        let remainingQtyToProcess = qty;
        const execPrice = currentPrice; 

        if (orderType === 'BUY') {
            const existingShortIndex = newPositions.findIndex(p => p.symbol === selectedStock.symbol && p.type === productType && p.side === 'SHORT');
            if (existingShortIndex !== -1) {
                const existingShort = newPositions[existingShortIndex];
                const coverQty = Math.min(existingShort.quantity, remainingQtyToProcess);
                const pnl = (existingShort.avgPrice - execPrice) * coverQty;
                const marginReleased = (existingShort.avgPrice * coverQty);
                
                currentCapital += (marginReleased + pnl);
                
                newOrders.push({
                    id: Math.random().toString(36).substr(2, 9),
                    symbol: selectedStock.symbol, type: 'BUY', product: productType, orderType: executionType,
                    quantity: coverQty, price: execPrice, status: 'EXECUTED', timestamp: new Date(), realizedPnL: pnl
                });

                if (existingShort.quantity === coverQty) newPositions.splice(existingShortIndex, 1);
                else newPositions[existingShortIndex] = { ...existingShort, quantity: existingShort.quantity - coverQty };

                remainingQtyToProcess -= coverQty;
            }

            if (remainingQtyToProcess > 0) {
                const cost = remainingQtyToProcess * execPrice;
                if (cost > currentCapital) {
                    addNotification({ type: 'ERROR', title: 'Insufficient Funds', message: 'Not enough capital.' });
                    return prev;
                }
                currentCapital -= cost;
                
                const existingLongIndex = newPositions.findIndex(p => p.symbol === selectedStock.symbol && p.type === productType && p.side === 'LONG');
                if (existingLongIndex !== -1) {
                    const existing = newPositions[existingLongIndex];
                    const newAvg = ((existing.quantity * existing.avgPrice) + cost) / (existing.quantity + remainingQtyToProcess);
                    newPositions[existingLongIndex] = { ...existing, quantity: existing.quantity + remainingQtyToProcess, avgPrice: newAvg, targetPrice: target, stopLossPrice: sl };
                } else {
                    newPositions.push({
                        symbol: selectedStock.symbol, quantity: remainingQtyToProcess, avgPrice: execPrice, ltp: execPrice,
                        type: productType, side: 'LONG', targetPrice: target, stopLossPrice: sl, timeframe
                    });
                }
                
                newOrders.push({
                    id: Math.random().toString(36).substr(2, 9),
                    symbol: selectedStock.symbol, type: 'BUY', product: productType, orderType: executionType,
                    quantity: remainingQtyToProcess, price: execPrice, status: 'EXECUTED', timestamp: new Date()
                });
            }

        } else { 
            const existingLongIndex = newPositions.findIndex(p => p.symbol === selectedStock.symbol && p.type === productType && p.side === 'LONG');
            if (existingLongIndex !== -1) {
                const existingLong = newPositions[existingLongIndex];
                const sellQty = Math.min(existingLong.quantity, remainingQtyToProcess);
                const pnl = (execPrice - existingLong.avgPrice) * sellQty;
                currentCapital += (sellQty * execPrice);

                newOrders.push({
                    id: Math.random().toString(36).substr(2, 9),
                    symbol: selectedStock.symbol, type: 'SELL', product: productType, orderType: executionType,
                    quantity: sellQty, price: execPrice, status: 'EXECUTED', timestamp: new Date(), realizedPnL: pnl
                });

                if (existingLong.quantity === sellQty) newPositions.splice(existingLongIndex, 1);
                else newPositions[existingLongIndex] = { ...existingLong, quantity: existingLong.quantity - sellQty };

                remainingQtyToProcess -= sellQty;
            }

            if (remainingQtyToProcess > 0) {
                const marginRequired = remainingQtyToProcess * execPrice;
                if (marginRequired > currentCapital) {
                     addNotification({ type: 'ERROR', title: 'Insufficient Funds', message: 'Not enough capital for Short.' });
                     return prev; 
                }
                currentCapital -= marginRequired;

                const existingShortIndex = newPositions.findIndex(p => p.symbol === selectedStock.symbol && p.type === productType && p.side === 'SHORT');
                if (existingShortIndex !== -1) {
                    const existing = newPositions[existingShortIndex];
                    const newAvg = ((existing.quantity * existing.avgPrice) + marginRequired) / (existing.quantity + remainingQtyToProcess);
                    newPositions[existingShortIndex] = { ...existing, quantity: existing.quantity + remainingQtyToProcess, avgPrice: newAvg, targetPrice: target, stopLossPrice: sl };
                } else {
                    newPositions.push({
                        symbol: selectedStock.symbol, quantity: remainingQtyToProcess, avgPrice: execPrice, ltp: execPrice,
                        type: productType, side: 'SHORT', targetPrice: target, stopLossPrice: sl, timeframe
                    });
                }

                newOrders.push({
                    id: Math.random().toString(36).substr(2, 9),
                    symbol: selectedStock.symbol, type: 'SELL', product: productType, orderType: executionType,
                    quantity: remainingQtyToProcess, price: execPrice, status: 'EXECUTED', timestamp: new Date()
                });
            }
        }

        setCapital(currentCapital);
        setOrders(prevOrders => [...newOrders, ...prevOrders]);
        addNotification({ type: 'SUCCESS', title: 'Order Executed', message: `${orderType} ${qty} ${selectedStock.symbol}` });
        
        return newPositions;
    });

    setTargetPrice('');
    setStopLossPrice('');
    setLimitInputPrice('');
  };

  const handleExitPosition = (pos: Position) => {
    const stock = stocks.find(s => s.symbol === pos.symbol);
    const exitPrice = stock ? stock.price : pos.ltp;
    
    let realizedPnL = 0;
    let capitalReturn = 0;

    if (pos.side === 'LONG') {
        const sellValue = pos.quantity * exitPrice;
        const costValue = pos.quantity * pos.avgPrice;
        realizedPnL = sellValue - costValue;
        capitalReturn = sellValue; 
    } else {
        const margin = pos.quantity * pos.avgPrice;
        realizedPnL = (pos.avgPrice - exitPrice) * pos.quantity;
        capitalReturn = margin + realizedPnL;
    }

    setCapital(prev => prev + capitalReturn);
    setPositions(prev => prev.filter(p => p !== pos)); 
    
    setOrders(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        symbol: pos.symbol,
        type: pos.side === 'LONG' ? 'SELL' : 'BUY',
        product: pos.type,
        orderType: 'MARKET',
        quantity: pos.quantity,
        price: exitPrice,
        status: 'EXECUTED',
        timestamp: new Date(),
        realizedPnL: realizedPnL
    }, ...prev]);

    addNotification({ type: 'SUCCESS', title: 'Position Exited', message: `${pos.side === 'LONG' ? 'Sold' : 'Covered'} ${pos.quantity} ${pos.symbol}` });
  };

  const runAiAnalysis = async () => {
    setIsAiLoading(true);
    setShowAiModal(true);
    const trend = selectedStock.changePercent > 0 ? 'UP' : selectedStock.changePercent < 0 ? 'DOWN' : 'FLAT';
    const result = await analyzeStock(selectedStock.name, selectedStock.price, trend);
    setAiAnalysis(result);
    setIsAiLoading(false);
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-primary/20 text-primary border-l-4 border-primary' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium hidden md:block">{label}</span>
    </button>
  );

  const BottomNavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition-all duration-200 ${
        activeTab === id 
          ? 'text-primary' 
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  const calendarDays = useMemo(() => {
      const days = [];
      for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d);
      }
      return days;
  }, []);

  return (
    <div className="flex h-screen bg-bg text-white overflow-hidden font-sans">
      
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          {notifications.map(n => (
              <div key={n.id} className={`glass-panel pointer-events-auto p-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] border-l-4 animate-in slide-in-from-right fade-in duration-300 ${
                  n.type === 'SUCCESS' ? 'border-bullish' : n.type === 'ERROR' ? 'border-bearish' : 'border-primary'
              }`}>
                  {n.type === 'SUCCESS' && <div className="bg-bullish/20 p-2 rounded-full"><TrendingUp size={16} className="text-bullish"/></div>}
                  {n.type === 'ERROR' && <div className="bg-bearish/20 p-2 rounded-full"><ShieldAlert size={16} className="text-bearish"/></div>}
                  {n.type === 'INFO' && <div className="bg-primary/20 p-2 rounded-full"><Bell size={16} className="text-primary"/></div>}
                  <div>
                      <h4 className="font-bold text-sm">{n.title}</h4>
                      <p className="text-xs text-gray-400">{n.message}</p>
                  </div>
              </div>
          ))}
      </div>

      <aside className="w-64 bg-surface/50 hidden md:flex flex-col border-r border-white/5 backdrop-blur-xl">
        <div className="p-6 flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(123,97,255,0.5)]">
            <TrendingUp size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Nifty<span className="text-primary font-light">Money</span></h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem id="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="WATCHLIST" icon={List} label="Market Watch" />
          <SidebarItem id="MARKET" icon={Activity} label="Trade" />
          <SidebarItem id="PORTFOLIO" icon={Wallet} label="Portfolio" />
          <SidebarItem id="HISTORY" icon={Clock} label="History" />
          <SidebarItem id="PERFORMANCE" icon={BarChart2} label="Analysis" />
          <SidebarItem id="AI" icon={Bot} label="NiftyBot AI" />
        </nav>

        <div className="p-4 border-t border-white/5">
            <SidebarItem id="PROFILE" icon={User} label="Profile" />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-surface/30 backdrop-blur-sm shrink-0 z-30">
            <div className="flex items-center space-x-4 md:hidden">
                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                    <TrendingUp size={18} className="text-white" />
                 </div>
                 <h1 className="text-lg font-bold tracking-tight">Nifty<span className="text-primary font-light">Money</span></h1>
            </div>
            <div className="flex-1 max-w-xl mx-4 relative hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search NSE/BSE stocks, indices..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 300)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-gray-200 placeholder-gray-600"
                    />
                    {(isSearchFocused || searchQuery) && (
                        <div className={`absolute top-full left-0 right-0 mt-2 bg-[#151515] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto transition-all duration-200 ${isSearchFocused ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                            <div className="p-3 border-b border-white/5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Filter size={14} className="text-gray-500" />
                                    <div className="flex gap-2">
                                        {(['ALL', 'EQUITY', 'INDEX'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={(e) => { e.preventDefault(); setSearchTypeFilter(type); }}
                                                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${searchTypeFilter === type ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                            >
                                                {type === 'ALL' ? 'All Types' : type === 'INDEX' ? 'Indices' : 'Equity'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                     <button
                                        onClick={(e) => { e.preventDefault(); setSearchSectorFilter('ALL'); }}
                                        className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${searchSectorFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        All Sectors
                                    </button>
                                    {availableSectors.map(sector => (
                                        <button
                                            key={sector}
                                            onClick={(e) => { e.preventDefault(); setSearchSectorFilter(sector!); }}
                                            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${searchSectorFilter === sector ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            {sector}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {searchResults.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    {searchQuery ? 'No stocks found matching your search.' : 'Start typing to search NSE stocks.'}
                                </div>
                            ) : (
                                searchResults.map(stock => (
                                    <button 
                                        key={stock.symbol}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); 
                                            handleSelectStock(stock);
                                        }}
                                        className="w-full p-3 hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-0 transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-white group-hover:bg-primary/20">
                                                 {stock.symbol[0]}
                                             </div>
                                             <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm text-white">{stock.symbol}</p>
                                                    <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-400">{stock.type}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">{stock.name} • {stock.sector}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm">{formatINR(stock.price)}</p>
                                            <p className={`text-xs ${stock.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                                {stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-6">
                <div className="text-right hidden md:block">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Available Margin</p>
                    <p className="font-mono font-bold text-primary">{formatINR(stats.availableMargin)}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total P&L</p>
                    <p className={`font-mono font-bold ${stats.totalPnL >= 0 ? 'text-bullish neon-text-green' : 'text-bearish neon-text-red'}`}>
                        {stats.totalPnL >= 0 ? '+' : ''}{formatINR(stats.totalPnL)}
                    </p>
                </div>
                <button onClick={() => setActiveTab('PROFILE')} className="md:hidden w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                     <User size={16} />
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 pb-24 md:pb-6">
            
            {activeTab === 'DASHBOARD' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#2a2149] to-[#111] border border-white/10 shadow-2xl">
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
                            
                            <div className="relative z-10">
                                <p className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-1">Total Net Worth</p>
                                <h1 className="text-4xl font-bold font-mono tracking-tight text-white">
                                    {formatINR(stats.totalValue)}
                                </h1>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                                        <span className="text-xs text-gray-400 block">Day's P&L</span>
                                        <span className={`text-sm font-bold font-mono ${stats.dayPnL >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                            {stats.dayPnL >= 0 ? '+' : ''}{formatINR(stats.dayPnL)}
                                        </span>
                                    </div>
                                    <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                                        <span className="text-xs text-gray-400 block">Available Cash</span>
                                        <span className="text-sm font-bold font-mono text-primary">{formatINR(stats.availableMargin)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="flex border-b border-white/5">
                                <button 
                                    onClick={() => setDashboardFilter('GAINERS')}
                                    className={`flex-1 py-4 text-sm font-bold transition-colors relative ${dashboardFilter === 'GAINERS' ? 'text-bullish bg-bullish/5' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Top Gainers
                                    {dashboardFilter === 'GAINERS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bullish"></div>}
                                </button>
                                <button 
                                    onClick={() => setDashboardFilter('LOSERS')}
                                    className={`flex-1 py-4 text-sm font-bold transition-colors relative ${dashboardFilter === 'LOSERS' ? 'text-bearish bg-bearish/5' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Top Losers
                                    {dashboardFilter === 'LOSERS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bearish"></div>}
                                </button>
                            </div>
                            
                            <div className="divide-y divide-white/5">
                                {(dashboardFilter === 'GAINERS' ? sortedStocks.gainers : sortedStocks.losers).slice(0, 5).map(stock => (
                                    <div 
                                        key={stock.symbol} 
                                        className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => handleSelectStock(stock)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stock.changePercent >= 0 ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'}`}>
                                                {stock.changePercent >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{stock.symbol}</p>
                                                <p className="text-xs text-gray-500">{stock.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm">{formatINR(stock.price)}</p>
                                            <p className={`text-xs font-bold ${stock.changePercent >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                                {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-panel rounded-2xl p-5 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-gray-400">
                                    <Briefcase size={16} />
                                    Active Positions
                                </h3>
                                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {positions.length}
                                </span>
                            </div>

                            {positions.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-3 min-h-[200px]">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                        <Briefcase size={20} opacity={0.5} />
                                    </div>
                                    <p className="text-xs text-center px-4">You have no active positions.</p>
                                    <button onClick={() => setActiveTab('MARKET')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition">
                                        Find Stocks
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                                    {positions.map((pos, idx) => {
                                        const stock = stocks.find(s => s.symbol === pos.symbol);
                                        const currentPrice = stock ? stock.price : pos.ltp;
                                        let pl = 0;
                                        if (pos.side === 'LONG') {
                                            pl = (currentPrice - pos.avgPrice) * pos.quantity;
                                        } else {
                                            pl = (pos.avgPrice - currentPrice) * pos.quantity;
                                        }
                                        return (
                                            <div key={idx} className="bg-surface hover:bg-[#252525] transition-colors p-3 rounded-xl border border-white/5 relative group cursor-pointer" onClick={() => setActiveTab('PORTFOLIO')}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-sm">{pos.symbol}</div>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${pos.side === 'LONG' ? 'bg-bullish/20 text-bullish' : 'bg-bearish/20 text-bearish'}`}>
                                                            {pos.side}
                                                        </span>
                                                    </div>
                                                    <div className={`font-mono font-bold text-sm ${pl >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                                        {pl >= 0 ? '+' : ''}{formatINR(pl)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'WATCHLIST' && (
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                    <div className="glass-panel p-4 rounded-2xl mb-4 flex items-center space-x-4 sticky top-0 z-20">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search & Add" 
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                value={watchlistSearch}
                                onChange={(e) => setWatchlistSearch(e.target.value)}
                            />
                        </div>
                        <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 transition">
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="glass-panel rounded-2xl overflow-hidden flex-1 custom-scrollbar">
                        <div className="divide-y divide-white/5">
                            {stocks
                                .filter(s => 
                                    s.symbol.toLowerCase().includes(watchlistSearch.toLowerCase()) || 
                                    s.name.toLowerCase().includes(watchlistSearch.toLowerCase())
                                )
                                .map(stock => (
                                <div 
                                    key={stock.symbol} 
                                    className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer active:bg-white/10" 
                                    onClick={() => handleSelectStock(stock)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${stock.change >= 0 ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'}`}>
                                            {stock.change >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white">{stock.symbol}</p>
                                            <p className="text-xs text-gray-500">{stock.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-mono font-bold text-sm ${stock.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                            {formatINR(stock.price)}
                                        </p>
                                        <p className={`text-xs ${stock.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                            {stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {(activeTab === 'MARKET' || activeTab === 'AI') && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
                    
                    <div className="lg:col-span-8 flex flex-col space-y-6 order-2 lg:order-1">
                        <div className="glass-panel p-4 rounded-2xl flex justify-between items-center">
                             <div className="flex items-center space-x-4">
                                 <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg">
                                     {selectedStock.symbol[0]}
                                 </div>
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <h2 className="text-lg font-bold leading-none">{selectedStock.symbol}</h2>
                                         <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">{selectedStock.type}</span>
                                     </div>
                                     <p className="text-sm text-gray-400">{selectedStock.name}</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-2xl font-mono font-bold">{selectedStock.price.toFixed(2)}</p>
                                 <p className={`text-sm font-mono ${selectedStock.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                     {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                                 </p>
                             </div>
                        </div>

                        <div className="flex-1 glass-panel rounded-2xl overflow-hidden relative p-4 flex flex-col min-h-[500px]">
                             <div className="flex-1 w-full bg-[#0a0a0a] rounded-lg overflow-hidden">
                                <TradingViewChart data={candleData} colors={{ backgroundColor: '#0a0a0a' }} />
                             </div>
                             <div className="mt-4 flex items-center justify-between">
                                 <div className="flex items-center space-x-3">
                                     <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold border ${
                                         simulatedSentiment === 'BULLISH' ? 'bg-bullish/10 text-bullish border-bullish/20' : 
                                         simulatedSentiment === 'BEARISH' ? 'bg-bearish/10 text-bearish border-bearish/20' : 
                                         'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                     }`}>
                                         {simulatedSentiment === 'BULLISH' && <TrendingUp size={14} />}
                                         {simulatedSentiment === 'BEARISH' && <TrendingDown size={14} />}
                                         {simulatedSentiment === 'NEUTRAL' && <Activity size={14} />}
                                         <span>Sentiment: {simulatedSentiment}</span>
                                     </div>
                                 </div>

                                 <button 
                                    onClick={runAiAnalysis}
                                    className="flex items-center space-x-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition text-sm border border-primary/30"
                                 >
                                     <Bot size={16} />
                                     <span>Analyze with NiftyBot</span>
                                 </button>
                             </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col order-1 lg:order-2">
                        <h3 className="font-bold mb-6 text-lg">Place Order</h3>
                        
                        <div className="flex bg-black/40 p-1 rounded-lg mb-6">
                            <button onClick={() => setOrderType('BUY')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${orderType === 'BUY' ? 'bg-bullish text-black' : 'text-gray-400 hover:text-white'}`}>BUY</button>
                            <button onClick={() => setOrderType('SELL')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${orderType === 'SELL' ? 'bg-bearish text-white' : 'text-gray-400 hover:text-white'}`}>SELL</button>
                        </div>

                        <div className="space-y-4 flex-1">
                             <div>
                                 <div className="flex bg-white/5 rounded-lg p-1 mb-2">
                                     <button onClick={() => setExecutionType('MARKET')} className={`flex-1 text-xs py-1.5 rounded transition-all ${executionType === 'MARKET' ? 'bg-white/10 text-white font-bold' : 'text-gray-500'}`}>Market</button>
                                     <button onClick={() => setExecutionType('LIMIT')} className={`flex-1 text-xs py-1.5 rounded transition-all ${executionType === 'LIMIT' ? 'bg-white/10 text-white font-bold' : 'text-gray-500'}`}>Limit</button>
                                 </div>
                             </div>

                             <div>
                                 <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Product</label>
                                 <div className="flex space-x-3">
                                     <label className={`flex-1 cursor-pointer border ${productType === 'INTRADAY' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30'} rounded-lg p-3 text-center transition-all`}>
                                         <input type="radio" name="product" className="hidden" checked={productType === 'INTRADAY'} onChange={() => setProductType('INTRADAY')} />
                                         <span className="text-sm font-bold">Intraday</span>
                                         <p className="text-[10px] text-gray-500 mt-1">MIS • 5x Margin</p>
                                     </label>
                                     <label className={`flex-1 cursor-pointer border ${productType === 'DELIVERY' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30'} rounded-lg p-3 text-center transition-all`}>
                                         <input type="radio" name="product" className="hidden" checked={productType === 'DELIVERY'} onChange={() => setProductType('DELIVERY')} />
                                         <span className="text-sm font-bold">Delivery</span>
                                         <p className="text-[10px] text-gray-500 mt-1">CNC • 1x Margin</p>
                                     </label>
                                 </div>
                             </div>

                             <div className="flex space-x-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Quantity</label>
                                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 font-mono focus:border-primary focus:outline-none text-sm" />
                                </div>
                                <div className="flex-1">
                                     <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Timeframe</label>
                                     <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-2 font-mono focus:border-primary focus:outline-none text-sm h-[46px]">
                                         <option>Day</option>
                                         <option>Week</option>
                                         <option>Month</option>
                                     </select>
                                </div>
                             </div>

                             <div>
                                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                                    {executionType === 'LIMIT' ? 'Limit Price' : 'Price'}
                                </label>
                                <div className="relative">
                                    <input 
                                        type={executionType === 'LIMIT' ? "number" : "text"}
                                        value={executionType === 'LIMIT' ? limitInputPrice : selectedStock.price.toFixed(2)}
                                        onChange={(e) => executionType === 'LIMIT' && setLimitInputPrice(e.target.value)}
                                        readOnly={executionType === 'MARKET'}
                                        className={`w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 font-mono ${executionType === 'LIMIT' ? 'focus:border-primary' : 'opacity-70 cursor-not-allowed'}`}
                                    />
                                    {executionType === 'MARKET' && <span className="absolute right-4 top-3.5 text-xs text-gray-500">Market</span>}
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-3">
                                 <div>
                                     <label className="block text-[10px] text-bullish mb-1 uppercase tracking-wider flex items-center gap-1"><Target size={10} /> Target</label>
                                     <input type="number" placeholder="Optional" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="w-full bg-black/40 border border-bullish/30 focus:border-bullish rounded-lg py-2 px-3 font-mono text-sm focus:outline-none" />
                                 </div>
                                 <div>
                                     <label className="block text-[10px] text-bearish mb-1 uppercase tracking-wider flex items-center gap-1"><ShieldAlert size={10} /> Stoploss</label>
                                     <input type="number" placeholder="Optional" value={stopLossPrice} onChange={(e) => setStopLossPrice(e.target.value)} className="w-full bg-black/40 border border-bearish/30 focus:border-bearish rounded-lg py-2 px-3 font-mono text-sm focus:outline-none" />
                                 </div>
                             </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-400">Margin Required</span>
                                 <span className="font-mono font-bold">
                                     {formatINR(parseInt(quantity || '0') * (executionType === 'LIMIT' && limitInputPrice ? parseFloat(limitInputPrice) : selectedStock.price))}
                                 </span>
                             </div>
                             <button onClick={handleExecuteOrder} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 ${orderType === 'BUY' ? 'bg-bullish text-black hover:bg-green-400' : 'bg-bearish text-white hover:bg-red-500'}`}>
                                 {orderType} {selectedStock.symbol}
                             </button>
                        </div>
                    </div>
                </div>
            )}

             {activeTab === 'HISTORY' && (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Clock className="text-primary" /> 
                            Order History
                        </h2>
                        <div className="text-sm text-gray-400">
                            Total Orders: {orders.length}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase border-b border-white/10 bg-white/5">
                                    <th className="p-4">Time</th>
                                    <th className="p-4">Symbol</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4 text-right">Qty</th>
                                    <th className="p-4 text-right">Price</th>
                                    <th className="p-4 text-right">P&L</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orders.length === 0 ? (
                                    <tr><td colSpan={8} className="p-12 text-center text-gray-500">No orders executed yet.</td></tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/5">
                                            <td className="p-4 text-xs text-gray-400">{new Date(order.timestamp).toLocaleTimeString()}</td>
                                            <td className="p-4 font-bold">{order.symbol}</td>
                                            <td className="p-4"><span className={`text-xs px-2 py-1 rounded font-bold ${order.type === 'BUY' ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'}`}>{order.type}</span></td>
                                            <td className="p-4 text-xs text-gray-300">{order.orderType}</td>
                                            <td className="p-4 text-right font-mono">{order.quantity}</td>
                                            <td className="p-4 text-right font-mono">{formatINR(order.price)}</td>
                                            <td className="p-4 text-right font-mono">{order.realizedPnL ? formatINR(order.realizedPnL) : '-'}</td>
                                            <td className="p-4 text-center">
                                                <span className={`text-[10px] px-2 py-1 rounded border ${
                                                    order.status === 'EXECUTED' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                                                    order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                    'bg-white/5 text-gray-400'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
             )}

             {activeTab === 'PORTFOLIO' && (
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                             <div>
                                 <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="text-primary" /> Portfolio Holdings</h2>
                             </div>
                             <div className="flex gap-4">
                                 <div className="text-right"><p className="text-xs text-gray-400 uppercase">Total Value</p><p className="font-mono font-bold text-lg">{formatINR(stats.totalValue)}</p></div>
                                 <div className="text-right"><p className="text-xs text-gray-400 uppercase">Total P&L</p><p className={`font-mono font-bold text-lg ${stats.totalPnL >= 0 ? 'text-bullish' : 'text-bearish'}`}>{formatINR(stats.totalPnL)}</p></div>
                             </div>
                         </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {positions.map((pos, idx) => {
                            const stock = stocks.find(s => s.symbol === pos.symbol);
                            const currentPrice = stock ? stock.price : pos.ltp;
                            const pl = (pos.side === 'LONG' ? currentPrice - pos.avgPrice : pos.avgPrice - currentPrice) * pos.quantity;
                            return (
                                <div key={idx} className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-white/5 transition">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center font-bold text-xl text-gray-400">{pos.symbol[0]}</div>
                                        <div>
                                            <h3 className="font-bold text-lg">{pos.symbol} <span className={`text-xs px-2 py-0.5 rounded ${pos.side === 'LONG' ? 'text-bullish' : 'text-bearish'}`}>{pos.side}</span></h3>
                                            <div className="text-sm text-gray-400">{pos.quantity} Qty • Avg: {pos.avgPrice.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full md:w-auto gap-8">
                                        <div className="text-right"><p className="text-xs text-gray-400">LTP</p><p className="font-mono font-bold">{currentPrice.toFixed(2)}</p></div>
                                        <div className="text-right"><p className="text-xs text-gray-400">P&L</p><p className={`font-mono font-bold ${pl >= 0 ? 'text-bullish' : 'text-bearish'}`}>{formatINR(pl)}</p></div>
                                        <button onClick={() => handleExitPosition(pos)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition">Exit</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
             )}

             {activeTab === 'PERFORMANCE' && (
                <div className="max-w-4xl mx-auto pb-20">
                    <div className="glass-panel p-6 rounded-2xl mb-6 bg-gradient-to-br from-[#1e1e1e] to-black relative overflow-hidden">
                        <div className="relative z-10 text-center">
                             <p className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-2">Total Realized P&L</p>
                             <h1 className={`text-5xl font-mono font-bold mb-4 ${performanceData.totalReturns >= 0 ? 'text-bullish neon-text-green' : 'text-bearish neon-text-red'}`}>
                                 {performanceData.totalReturns >= 0 ? '+' : ''}{formatINR(performanceData.totalReturns)}
                             </h1>
                             <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                 <Target size={16} className="text-primary"/>
                                 <span className="text-sm font-bold text-gray-300">Win Rate: <span className="text-white">{performanceData.winRate.toFixed(1)}%</span></span>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                         <div className="glass-panel p-4 rounded-xl text-center">
                             <p className="text-[10px] uppercase text-gray-500 font-bold">Trades</p>
                             <p className="text-xl font-mono font-bold">{performanceData.totalTrades}</p>
                         </div>
                         <div className="glass-panel p-4 rounded-xl text-center">
                             <p className="text-[10px] uppercase text-gray-500 font-bold">Profit Factor</p>
                             <p className="text-xl font-mono font-bold">{performanceData.profitFactor.toFixed(2)}</p>
                         </div>
                         <div className="glass-panel p-4 rounded-xl text-center">
                             <p className="text-[10px] uppercase text-gray-500 font-bold">Avg Win</p>
                             <p className="text-xl font-mono font-bold text-bullish">{formatINR(performanceData.avgWin)}</p>
                         </div>
                         <div className="glass-panel p-4 rounded-xl text-center">
                             <p className="text-[10px] uppercase text-gray-500 font-bold">Avg Loss</p>
                             <p className="text-xl font-mono font-bold text-bearish">{formatINR(performanceData.avgLoss)}</p>
                         </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2"><Calendar size={18} className="text-primary"/> P&L Calendar (Last 30 Days)</h3>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((date, i) => {
                                const dateStr = date.toDateString();
                                const pnl = performanceData.dailyData[dateStr];
                                return (
                                    <div key={i} className="aspect-square rounded-lg relative group bg-white/5 flex items-center justify-center border border-white/5">
                                        <span className="text-[10px] text-gray-500 absolute top-1 left-1">{date.getDate()}</span>
                                        {pnl !== undefined && (
                                            <div className={`absolute inset-0 rounded-lg flex items-center justify-center ${pnl > 0 ? 'bg-bullish/20 border-bullish/50' : 'bg-bearish/20 border-bearish/50'} border`}>
                                                <span className={`text-[10px] font-bold ${pnl > 0 ? 'text-bullish' : 'text-bearish'}`}>
                                                    {pnl > 0 ? 'G' : 'L'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl overflow-hidden">
                         <div className="p-4 border-b border-white/5 bg-white/5">
                             <h3 className="font-bold">Stock-wise Performance</h3>
                         </div>
                         <div className="divide-y divide-white/5">
                             {performanceData.stockBreakdown.length === 0 ? (
                                 <p className="p-6 text-center text-gray-500 text-sm">No closed trades yet.</p>
                             ) : (
                                 performanceData.stockBreakdown.map((item) => (
                                     <div key={item.symbol} className="p-4 flex justify-between items-center">
                                         <div>
                                             <p className="font-bold text-sm">{item.symbol}</p>
                                             <p className="text-xs text-gray-500">{item.trades} Trades • {item.wins} Wins</p>
                                         </div>
                                         <p className={`font-mono font-bold text-sm ${item.pnl >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                             {item.pnl >= 0 ? '+' : ''}{formatINR(item.pnl)}
                                         </p>
                                     </div>
                                 ))
                             )}
                         </div>
                    </div>
                </div>
             )}
             
             {activeTab === 'PROFILE' && (
                 <div className="max-w-2xl mx-auto pb-20">
                      <div className="glass-panel p-8 rounded-2xl text-center mb-6 relative overflow-hidden">
                          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-primary to-blue-600 p-1 mb-4">
                              <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center">
                                  <UserCircle size={48} className="text-gray-400" />
                              </div>
                          </div>
                          <h2 className="text-2xl font-bold">Virtual Trader</h2>
                          <p className="text-gray-400 text-sm">Pro Member</p>
                      </div>

                      <div className="space-y-4">
                          <div className="glass-panel p-4 rounded-xl flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                  <div className="bg-primary/20 p-2 rounded-lg"><Wallet size={20} className="text-primary"/></div>
                                  <div>
                                      <p className="text-xs text-gray-400">Initial Capital</p>
                                      <p className="font-bold">{formatINR(INITIAL_CAPITAL)}</p>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="glass-panel p-4 rounded-xl flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                  <div className="bg-green-500/20 p-2 rounded-lg"><TrendingUp size={20} className="text-green-500"/></div>
                                  <div>
                                      <p className="text-xs text-gray-400">Profitable Days</p>
                                      {/* Fix: Explicitly cast v to number to resolve 'unknown' type error */}
                                      <p className="font-bold">{Object.values(performanceData.dailyData).filter((v: number) => v > 0).length}</p>
                                  </div>
                              </div>
                          </div>

                          <button className="w-full p-4 glass-panel rounded-xl flex items-center justify-between hover:bg-white/5 transition group">
                              <div className="flex items-center gap-3">
                                  <Settings size={20} className="text-gray-400 group-hover:text-white"/>
                                  <span className="text-gray-300 group-hover:text-white">App Settings</span>
                              </div>
                              <ChevronRight size={18} className="text-gray-500"/>
                          </button>
                          
                          <button className="w-full p-4 glass-panel rounded-xl flex items-center justify-between hover:bg-red-500/10 transition group border border-transparent hover:border-red-500/30">
                              <div className="flex items-center gap-3">
                                  <LogOut size={20} className="text-red-400"/>
                                  <span className="text-red-400">Reset Account</span>
                              </div>
                          </button>
                      </div>
                 </div>
             )}

        </div>
        
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center h-20 pb-safe z-40 px-2">
           <BottomNavItem id="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
           <BottomNavItem id="WATCHLIST" icon={List} label="Watchlist" />
           <BottomNavItem id="PORTFOLIO" icon={Wallet} label="Portfolio" />
           <BottomNavItem id="PERFORMANCE" icon={BarChart2} label="Analysis" />
           <BottomNavItem id="PROFILE" icon={User} label="Profile" />
        </div>
      </main>

      {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative shadow-[0_0_50px_rgba(123,97,255,0.2)] border-primary/30">
                  <button onClick={() => setShowAiModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white"><X size={24} /></button>
                  <div className="flex items-center space-x-3 mb-6">
                      <Bot size={24} className="text-primary" />
                      <h2 className="text-xl font-bold">NiftyBot Analysis</h2>
                  </div>
                  <div className="min-h-[200px] bg-[#0a0a0a] rounded-xl p-4 border border-white/10 text-sm leading-relaxed">
                      {isAiLoading ? <p className="text-primary animate-pulse">Analyzing...</p> : <p className="whitespace-pre-line">{aiAnalysis}</p>}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;
