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

  const loadMeals = () => {
    const data = storage.getMealsByDate(selectedDate);
    setMeals(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const meal: Meal = {
      id: editingMeal?.id || Date.now().toString(),
      date: selectedDate,
      ...formData,
    };

    storage.saveMeal(meal);
    loadMeals();
    resetForm();
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

  const handleDelete = (id: string) => {
    if (confirm('この食事を削除しますか？')) {
      storage.deleteMeal(id);
      loadMeals();
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">食事管理</h1>

      <div className="mb-6 flex gap-4 items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {isFormOpen ? 'キャンセル' : '食事を追加'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
          <h2 className="text-xl font-semibold mb-4">
            {editingMeal ? '食事を編集' : '食事を追加'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">種類</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Meal['type'] })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="breakfast">朝食</option>
                <option value="lunch">昼食</option>
                <option value="dinner">夕食</option>
                <option value="snack">間食</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">食事名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">カロリー (kcal)</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">タンパク質 (g)</label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">炭水化物 (g)</label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">脂質 (g)</label>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingMeal ? '更新' : '追加'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">本日の合計</h2>
        <p className="text-2xl font-bold text-blue-600">{totalCalories} kcal</p>
      </div>

      <div className="space-y-4">
        {meals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            この日の食事記録はありません
          </div>
        ) : (
          meals.map((meal) => (
            <div key={meal.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      {getMealTypeLabel(meal.type)}
                    </span>
                    <h3 className="text-lg font-semibold">{meal.name}</h3>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>カロリー: {meal.calories} kcal</span>
                    <span>タンパク質: {meal.protein}g</span>
                    <span>炭水化物: {meal.carbs}g</span>
                    <span>脂質: {meal.fat}g</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(meal)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="text-red-600 hover:text-red-800 px-3 py-1"
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
