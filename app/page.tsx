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

  const loadStats = () => {
    const stats = storage.getDailyStats(selectedDate);
    setTodayStats(stats);
  };

  if (!todayStats) {
    return <div>Loading...</div>;
  }

  const netCalories = todayStats.netCalories;
  const calorieStatus = netCalories > 0 ? 'カロリー過多' : netCalories < 0 ? 'カロリー不足' : 'バランス良好';
  const statusColor = netCalories > 500 ? 'text-red-600' : netCalories < -500 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ダイエット管理アプリ</h1>
        <p className="text-gray-600">食事と運動を記録して健康的なダイエットをサポート</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">日付</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-medium mb-2 opacity-90">摂取カロリー</h3>
          <p className="text-3xl font-bold">{todayStats.totalCaloriesConsumed}</p>
          <p className="text-sm opacity-90">kcal</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-medium mb-2 opacity-90">消費カロリー</h3>
          <p className="text-3xl font-bold">{todayStats.totalCaloriesBurned}</p>
          <p className="text-sm opacity-90">kcal</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-medium mb-2 opacity-90">正味カロリー</h3>
          <p className="text-3xl font-bold">{todayStats.netCalories}</p>
          <p className="text-sm opacity-90">kcal</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">栄養素</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">タンパク質</p>
            <p className="text-2xl font-bold text-red-500">{todayStats.totalProtein.toFixed(1)}g</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">炭水化物</p>
            <p className="text-2xl font-bold text-orange-500">{todayStats.totalCarbs.toFixed(1)}g</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">脂質</p>
            <p className="text-2xl font-bold text-cyan-500">{todayStats.totalFat.toFixed(1)}g</p>
          </div>
        </div>
      </div>

      <div className={`bg-white p-6 rounded-lg shadow mb-8 border-l-4 ${
        netCalories > 500 ? 'border-red-500' : netCalories < -500 ? 'border-yellow-500' : 'border-green-500'
      }`}>
        <h2 className="text-xl font-semibold mb-2">今日の状態</h2>
        <p className={`text-2xl font-bold ${statusColor}`}>{calorieStatus}</p>
        <p className="text-gray-600 mt-2">
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
          className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border border-blue-200 transition-colors"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-2">食事管理</h3>
          <p className="text-sm text-blue-600">食事を記録して摂取カロリーを管理</p>
        </Link>

        <Link
          href="/exercises"
          className="bg-green-50 hover:bg-green-100 p-6 rounded-lg border border-green-200 transition-colors"
        >
          <h3 className="text-lg font-semibold text-green-800 mb-2">運動管理</h3>
          <p className="text-sm text-green-600">運動を記録して消費カロリーを管理</p>
        </Link>

        <Link
          href="/stats"
          className="bg-purple-50 hover:bg-purple-100 p-6 rounded-lg border border-purple-200 transition-colors"
        >
          <h3 className="text-lg font-semibold text-purple-800 mb-2">統計・グラフ</h3>
          <p className="text-sm text-purple-600">データを分析してグラフで可視化</p>
        </Link>
      </div>
    </div>
  );
}
