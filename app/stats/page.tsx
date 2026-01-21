'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DailyStats } from '../types/diet';
import { storage } from '../utils/storage';

export default function StatsPage() {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadStats();
  }, [endDate]);

  const loadStats = () => {
    const weeklyStats = storage.getWeeklyStats(endDate);
    setStats(weeklyStats);
  };

  const chartData = stats.map((stat) => ({
    date: format(new Date(stat.date), 'M/d'),
    摂取: stat.totalCaloriesConsumed,
    消費: stat.totalCaloriesBurned,
    正味: stat.netCalories,
  }));

  const nutritionData = stats.map((stat) => ({
    date: format(new Date(stat.date), 'M/d'),
    タンパク質: stat.totalProtein,
    炭水化物: stat.totalCarbs,
    脂質: stat.totalFat,
  }));

  const totalConsumed = stats.reduce((sum, s) => sum + s.totalCaloriesConsumed, 0);
  const totalBurned = stats.reduce((sum, s) => sum + s.totalCaloriesBurned, 0);
  const avgConsumed = stats.length > 0 ? Math.round(totalConsumed / stats.length) : 0;
  const avgBurned = stats.length > 0 ? Math.round(totalBurned / stats.length) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">統計・グラフ</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">期間の終了日</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <p className="text-sm text-gray-600 mt-1">
          過去7日間のデータを表示します
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">平均摂取カロリー</p>
          <p className="text-2xl font-bold text-blue-600">{avgConsumed} kcal</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">平均消費カロリー</p>
          <p className="text-2xl font-bold text-green-600">{avgBurned} kcal</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">平均正味カロリー</p>
          <p className="text-2xl font-bold text-purple-600">{avgConsumed - avgBurned} kcal</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">記録日数</p>
          <p className="text-2xl font-bold text-gray-700">{stats.length} 日</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">カロリー推移</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="摂取"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="消費"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="正味"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">栄養素バランス</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={nutritionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="タンパク質" fill="#ef4444" />
            <Bar dataKey="炭水化物" fill="#f59e0b" />
            <Bar dataKey="脂質" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">日別詳細</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">日付</th>
                <th className="text-right py-2 px-4">摂取 (kcal)</th>
                <th className="text-right py-2 px-4">消費 (kcal)</th>
                <th className="text-right py-2 px-4">正味 (kcal)</th>
                <th className="text-right py-2 px-4">タンパク質 (g)</th>
                <th className="text-right py-2 px-4">炭水化物 (g)</th>
                <th className="text-right py-2 px-4">脂質 (g)</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.date} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{format(new Date(stat.date), 'yyyy/MM/dd (E)', { locale: undefined })}</td>
                  <td className="text-right py-2 px-4">{stat.totalCaloriesConsumed}</td>
                  <td className="text-right py-2 px-4">{stat.totalCaloriesBurned}</td>
                  <td className="text-right py-2 px-4">{stat.netCalories}</td>
                  <td className="text-right py-2 px-4">{stat.totalProtein.toFixed(1)}</td>
                  <td className="text-right py-2 px-4">{stat.totalCarbs.toFixed(1)}</td>
                  <td className="text-right py-2 px-4">{stat.totalFat.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
