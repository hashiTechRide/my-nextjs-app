'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Meal } from '../types/diet';
import { storage } from '../utils/storage';

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const [formData, setFormData] = useState({
    type: 'breakfast' as Meal['type'],
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    loadMeals();
  }, [selectedDate]);

  const loadMeals = async () => {
    try {
      const data = await storage.getMealsByDate(selectedDate);
      setMeals(data);
    } catch (error) {
      console.error('Failed to load meals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const meal: Meal = {
      id: editingMeal?.id || Date.now().toString(),
      date: selectedDate,
      ...formData,
    };

    try {
      await storage.saveMeal(meal);
      await loadMeals();
      resetForm();
    } catch (error) {
      console.error('Failed to save meal:', error);
      alert('食事の保存に失敗しました');
    }
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      type: meal.type,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('この食事を削除しますか？')) {
      try {
        await storage.deleteMeal(id);
        await loadMeals();
      } catch (error) {
        console.error('Failed to delete meal:', error);
        alert('食事の削除に失敗しました');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'breakfast',
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
    setEditingMeal(null);
    setIsFormOpen(false);
  };

  const getMealTypeLabel = (type: Meal['type']) => {
    const labels = {
      breakfast: '朝食',
      lunch: '昼食',
      dinner: '夕食',
      snack: '間食',
    };
    return labels[type];
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">食事管理</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-3 border border-rose-200 rounded-xl bg-white text-gray-800 shadow-sm"
        />
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-gradient-to-r from-rose-400 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all shadow-md font-medium"
        >
          {isFormOpen ? 'キャンセル' : '食事を追加'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm mb-6 border border-rose-100">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
            {editingMeal ? '食事を編集' : '食事を追加'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">種類</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Meal['type'] })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                required
              >
                <option value="breakfast">朝食</option>
                <option value="lunch">昼食</option>
                <option value="dinner">夕食</option>
                <option value="snack">間食</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">食事名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                placeholder="例: ご飯、サラダ"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">カロリー</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">タンパク質</label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">炭水化物</label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">脂質</label>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 md:flex-none bg-gradient-to-r from-rose-400 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all shadow-md font-medium"
              >
                {editingMeal ? '更新' : '追加'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 md:flex-none bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm mb-6 border border-rose-100">
        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-800">本日の合計</h2>
        <p className="text-2xl md:text-3xl font-bold text-rose-500">{totalCalories} kcal</p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {meals.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-rose-100">
            この日の食事記録はありません
          </div>
        ) : (
          meals.map((meal) => (
            <div key={meal.id} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-rose-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-rose-100 text-rose-700 text-sm px-3 py-1 rounded-full font-medium">
                      {getMealTypeLabel(meal.type)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800">{meal.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>{meal.calories} kcal</span>
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fat}g</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(meal)}
                    className="text-rose-500 hover:text-rose-700 px-4 py-2 rounded-lg hover:bg-rose-50 transition-colors font-medium"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="text-gray-500 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
