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

  const loadStats = async () => {
    try {
      const weeklyStats = await storage.getWeeklyStats(endDate);
      setStats(weeklyStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
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
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">統計・グラフ</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">期間の終了日</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full md:w-auto px-4 py-3 border border-violet-200 rounded-xl bg-white text-gray-800 shadow-sm"
        />
        <p className="text-sm text-gray-500 mt-2">
          過去7日間のデータを表示します
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-rose-100">
          <p className="text-xs md:text-sm text-gray-600 mb-1">平均摂取</p>
          <p className="text-lg md:text-2xl font-bold text-rose-500">{avgConsumed} kcal</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-emerald-100">
          <p className="text-xs md:text-sm text-gray-600 mb-1">平均消費</p>
          <p className="text-lg md:text-2xl font-bold text-emerald-500">{avgBurned} kcal</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-violet-100">
          <p className="text-xs md:text-sm text-gray-600 mb-1">平均正味</p>
          <p className="text-lg md:text-2xl font-bold text-violet-500">{avgConsumed - avgBurned} kcal</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-600 mb-1">記録日数</p>
          <p className="text-lg md:text-2xl font-bold text-gray-700">{stats.length} 日</p>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-rose-100 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">カロリー推移</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="摂取"
              stroke="#fb7185"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="消費"
              stroke="#34d399"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="正味"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-rose-100 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">栄養素バランス</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={nutritionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="タンパク質" fill="#fb7185" radius={[4, 4, 0, 0]} />
            <Bar dataKey="炭水化物" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            <Bar dataKey="脂質" fill="#22d3ee" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-rose-100">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">日別詳細</h2>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-rose-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">日付</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">摂取</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">消費</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">正味</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">P</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">C</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">F</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.date} className="border-b border-rose-50 hover:bg-rose-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-800">{format(new Date(stat.date), 'M/d')}</td>
                  <td className="text-right py-3 px-4 text-sm text-gray-800">{stat.totalCaloriesConsumed}</td>
                  <td className="text-right py-3 px-4 text-sm text-gray-800">{stat.totalCaloriesBurned}</td>
                  <td className="text-right py-3 px-4 text-sm text-gray-800">{stat.netCalories}</td>
                  <td className="text-right py-3 px-4 text-sm text-gray-800">{stat.totalProtein.toFixed(1)}</td>
                  <td className="text-right py-3 px-4 text-sm text-gray-800">{stat.totalCarbs.toFixed(1)}</td>
                  <td className="text-right py-3 px-4 text-sm text-gray-800">{stat.totalFat.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
