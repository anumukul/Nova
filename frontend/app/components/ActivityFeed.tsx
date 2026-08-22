"use client";

import { useEffect, useState, useRef } from "react";
import { fetchContribEvents, ContribEvent } from "../lib/events";
import { stroopsToXlm } from "../lib/constants";

interface ActivityFeedProps {
  refreshKey: number;
}

export default function ActivityFeed({ refreshKey }: ActivityFeedProps) {
  const [events, setEvents] = useState<ContribEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const nextLedgerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      try {
        const { events: initial, nextLedger } = await fetchContribEvents();
        if (mounted) {
          setEvents(initial.reverse());
          nextLedgerRef.current = nextLedger;
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInitial();

    const interval = setInterval(async () => {
      if (!nextLedgerRef.current) return;
      try {
        const { events: newEvents, nextLedger } = await fetchContribEvents(
          nextLedgerRef.current
        );
        if (mounted && newEvents.length > 0) {
          setEvents((prev) => [...newEvents.reverse(), ...prev]);
          nextLedgerRef.current = nextLedger;
        }
      } catch (error) {
        console.error("Failed to poll events:", error);
        nextLedgerRef.current = undefined;
      }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshKey]);

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-6)}`;

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
        <h3 className="text-xl font-bold mb-4">Activity Feed</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
      <h3 className="text-xl font-bold mb-4">Activity Feed</h3>

      {events.length === 0 ? (
        <p className="text-slate-400 text-center py-8">
          No contributions yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event, idx) => (
            <div
              key={`${event.ledger}-${event.contributor}-${idx}`}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {event.contributor.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {truncateAddress(event.contributor)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Ledger #{event.ledger}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-400">
                  +{stroopsToXlm(event.amount).toFixed(4)} XLM
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
