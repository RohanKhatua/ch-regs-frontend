"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis
} from "recharts";
import { INTERVAL_MS, TOTAL_SEATS } from "@/lib/constants";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DataPoint {
  timestamp: number;
  seats: number;
}

const useSeatCount = () => {
  const [seats, setSeats] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/seats");
      if (!response.ok) throw new Error("Failed to fetch");
      const { currentSeats, historicalData } = await response.json();
      setSeats(currentSeats);
      setHistoricalData(historicalData);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Error fetching seat count - data might be stale");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { seats, error, loading, historicalData };
};

const AnimatedDigit = ({ digit }: { digit: string }) => (
  <div className="relative inline-block w-16 h-20 overflow-hidden mx-1">
    <AnimatePresence>
      <motion.span
        key={digit}
        className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-red-500"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ textShadow: "0 0 3px rgba(255, 0, 0, 0.5)" }}
      >
        {digit}
      </motion.span>
    </AnimatePresence>
  </div>
);

const RegistrationDisplay = ({ seats }: { seats: number | null }) => {
  const registrationString = useMemo(
    () => (seats !== null ? seats.toString().padStart(4, "0") : "0000"),
    [seats],
  );

  return (
    <div className="flex justify-center">
      {registrationString.split("").map((digit, index) => (
        <AnimatedDigit key={index} digit={digit} />
      ))}
    </div>
  );
};

const chartConfig = {
  seats: {
    label: "Seats",
    color: "#ef4444",
  }
} satisfies ChartConfig;


const RegistrationGraph = ({ data }: { data: DataPoint[] }) => (
  <div className="w-full h-64 mt-6">
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">

      <LineChart data={data}>
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleString('en-IN', {
            weekday: 'short',
            hour: 'numeric',
            minute: 'numeric',
          })}
        />
        <YAxis width={35} domain={["auto", "auto"]} />
        <Line
          type="monotone"
          dataKey="seats"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
        <ChartTooltip
          content={({ payload }) => {
            if (!payload || payload.length === 0) return null;
            const { timestamp, seats } = payload[0].payload;
            return (
              <div className="p-2 bg-gray-800 text-white rounded border border-red-500">
                <p>{`Time: ${new Date(timestamp).toLocaleString('en-IN', {
                  weekday: 'short',
                  hour: 'numeric',
                  minute: 'numeric',
                })}`}</p>
                <p>{`Seats: ${seats}`}</p>
              </div>
            );
          }}
        />
      </LineChart>

    </ChartContainer>
  </div>
);

const DynamicBorder = ({ percentage }: { percentage: number }) => {
  return (
    <div
      className="absolute inset-0 rounded-lg overflow-hidden"
      style={{
        padding: '2px',
      }}
    >
      <div
        className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-1000 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
      <div
        className="absolute top-0 right-0 h-full bg-red-500 transition-all duration-1000 ease-in-out"
        style={{ width: `${100 - percentage}%` }}
      />
      <div className="w-full h-full bg-gray-800 rounded-lg relative" />
    </div>
  );
};

export default function Home() {
  const { seats, error, loading, historicalData } = useSeatCount();
  const percentage = seats ? Math.min((seats / TOTAL_SEATS) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="relative bg-gray-800 rounded-lg shadow-lg text-center w-full max-w-lg overflow-hidden">
        <DynamicBorder percentage={percentage} />
        <div className="relative p-6 sm:p-10">
          <h1
            className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-red-500"
            style={{
              textShadow:
                "0 0 5px rgba(255, 0, 0, 0.5), 0 0 10px rgba(255, 0, 0, 0.3)",
            }}
          >
            Cryptic Hunt 2024
          </h1>
          <RegistrationDisplay seats={seats} />
          <p className="mt-4 sm:mt-6 text-gray-400 text-lg sm:text-xl">
            Registrations
          </p>
          <RegistrationGraph data={historicalData} />
        </div>
      </div>
      <div className="h-10 mt-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {loading && seats === null && (
          <div className="text-red-500 text-sm flex items-center">
            <LoaderCircle className="w-6 h-6 mr-2 animate-spin" />
            <span>Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}