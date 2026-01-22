'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { storage } from './utils/storage';
import { DailyStats } from './types/diet';

export default function Home() {
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadStats();
  }, [selectedDate]);

  const loadStats = async () => {
    try {
      const stats = await storage.getDailyStats(selectedDate);
      setTodayStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (!todayStats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-rose-400 text-lg">読み込み中...</div>
      </div>
    );
  }

  const netCalories = todayStats.netCalories;
  const calorieStatus = netCalories > 0 ? 'カロリー過多' : netCalories < 0 ? 'カロリー不足' : 'バランス良好';
  const statusColor = netCalories > 500 ? 'text-red-600' : netCalories < -500 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 text-gray-800">ダイエット管理アプリ</h1>
        <p className="text-gray-600 text-sm md:text-base">食事と運動を記録して健康的なダイエットをサポート</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">日付</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full md:w-auto px-4 py-3 border border-rose-200 rounded-xl bg-white text-gray-800 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-rose-400 to-rose-500 text-white p-5 md:p-6 rounded-2xl shadow-lg">
          <h3 className="text-sm font-medium mb-2 opacity-90">摂取カロリー</h3>
          <p className="text-3xl md:text-4xl font-bold">{todayStats.totalCaloriesConsumed}</p>
          <p className="text-sm opacity-90">kcal</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white p-5 md:p-6 rounded-2xl shadow-lg">
          <h3 className="text-sm font-medium mb-2 opacity-90">消費カロリー</h3>
          <p className="text-3xl md:text-4xl font-bold">{todayStats.totalCaloriesBurned}</p>
          <p className="text-sm opacity-90">kcal</p>
        </div>

        <div className="bg-gradient-to-br from-violet-400 to-violet-500 text-white p-5 md:p-6 rounded-2xl shadow-lg">
          <h3 className="text-sm font-medium mb-2 opacity-90">正味カロリー</h3>
          <p className="text-3xl md:text-4xl font-bold">{todayStats.netCalories}</p>
          <p className="text-sm opacity-90">kcal</p>
        </div>
      </div>

      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-rose-100 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">栄養素</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-600 mb-1">タンパク質</p>
            <p className="text-xl md:text-2xl font-bold text-rose-500">{todayStats.totalProtein.toFixed(1)}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-600 mb-1">炭水化物</p>
            <p className="text-xl md:text-2xl font-bold text-amber-500">{todayStats.totalCarbs.toFixed(1)}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-600 mb-1">脂質</p>
            <p className="text-xl md:text-2xl font-bold text-cyan-500">{todayStats.totalFat.toFixed(1)}g</p>
          </div>
        </div>
      </div>

      <div className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm mb-6 md:mb-8 border-l-4 ${
        netCalories > 500 ? 'border-red-400' : netCalories < -500 ? 'border-yellow-400' : 'border-green-400'
      }`}>
        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-800">今日の状態</h2>
        <p className={`text-xl md:text-2xl font-bold ${statusColor}`}>{calorieStatus}</p>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          {netCalories > 0
            ? `摂取カロリーが消費カロリーより ${netCalories}kcal 多いです`
            : netCalories < 0
            ? `消費カロリーが摂取カロリーより ${Math.abs(netCalories)}kcal 多いです`
            : 'カロリーバランスが取れています'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/meals"
          className="bg-white hover:bg-rose-50 p-5 md:p-6 rounded-2xl border border-rose-200 transition-all hover:shadow-md active:scale-98"
        >
          <h3 className="text-lg font-semibold text-rose-600 mb-2">食事管理</h3>
          <p className="text-sm text-gray-600">食事を記録して摂取カロリーを管理</p>
        </Link>

        <Link
          href="/exercises"
          className="bg-white hover:bg-emerald-50 p-5 md:p-6 rounded-2xl border border-emerald-200 transition-all hover:shadow-md active:scale-98"
        >
          <h3 className="text-lg font-semibold text-emerald-600 mb-2">運動管理</h3>
          <p className="text-sm text-gray-600">運動を記録して消費カロリーを管理</p>
        </Link>

        <Link
          href="/stats"
          className="bg-white hover:bg-violet-50 p-5 md:p-6 rounded-2xl border border-violet-200 transition-all hover:shadow-md active:scale-98"
        >
          <h3 className="text-lg font-semibold text-violet-600 mb-2">統計・グラフ</h3>
          <p className="text-sm text-gray-600">データを分析してグラフで可視化</p>
        </Link>
      </div>
    </div>
  );
}
