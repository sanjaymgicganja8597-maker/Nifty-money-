import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries, ISeriesApi } from 'lightweight-charts';

interface TradingViewChartProps {
  data: { time: string | number; open: number; high: number; low: number; close: number }[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, colors }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // 1. Initialize Chart (Run once)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors?.backgroundColor || 'transparent' },
        textColor: colors?.textColor || '#D9D9D9',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });

    chartRef.current = chart;

    // Add Series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00E396',
      downColor: '#FF4560',
      borderVisible: false,
      wickUpColor: '#00E396',
      wickDownColor: '#FF4560',
    });
    seriesRef.current = candlestickSeries;

    // Set initial data if available to prevent empty chart flash
    if (data && data.length > 0) {
      candlestickSeries.setData(data);
      chart.timeScale().fitContent();
    }

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []); // Empty dependency array to run only on mount

  // 2. Handle Data Updates
  useEffect(() => {
    if (seriesRef.current && data) {
      seriesRef.current.setData(data);
      // Fit content whenever data changes completely (e.g. stock switch)
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data]);

  // 3. Handle Color/Options Updates
  useEffect(() => {
    if (chartRef.current && colors) {
      chartRef.current.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: colors.backgroundColor || 'transparent' },
          textColor: colors.textColor || '#D9D9D9',
        },
      });
    }
  }, [colors]);

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
};