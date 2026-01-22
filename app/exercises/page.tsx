'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Exercise } from '../types/diet';
import { storage } from '../utils/storage';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    duration: 0,
    caloriesBurned: 0,
    type: 'cardio' as Exercise['type'],
  });

  useEffect(() => {
    loadExercises();
  }, [selectedDate]);

  const loadExercises = async () => {
    try {
      const data = await storage.getExercisesByDate(selectedDate);
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const exercise: Exercise = {
      id: editingExercise?.id || Date.now().toString(),
      date: selectedDate,
      ...formData,
    };

    try {
      await storage.saveExercise(exercise);
      await loadExercises();
      resetForm();
    } catch (error) {
      console.error('Failed to save exercise:', error);
      alert('運動の保存に失敗しました');
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      duration: exercise.duration,
      caloriesBurned: exercise.caloriesBurned,
      type: exercise.type,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('この運動を削除しますか？')) {
      try {
        await storage.deleteExercise(id);
        await loadExercises();
      } catch (error) {
        console.error('Failed to delete exercise:', error);
        alert('運動の削除に失敗しました');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      duration: 0,
      caloriesBurned: 0,
      type: 'cardio',
    });
    setEditingExercise(null);
    setIsFormOpen(false);
  };

  const getExerciseTypeLabel = (type: Exercise['type']) => {
    const labels = {
      cardio: '有酸素運動',
      strength: '筋トレ',
      flexibility: 'ストレッチ',
      other: 'その他',
    };
    return labels[type];
  };

  const totalCaloriesBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const totalDuration = exercises.reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">運動管理</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-3 border border-emerald-200 rounded-xl bg-white text-gray-800 shadow-sm"
        />
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-md font-medium"
        >
          {isFormOpen ? 'キャンセル' : '運動を追加'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm mb-6 border border-emerald-100">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
            {editingExercise ? '運動を編集' : '運動を追加'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">種類</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Exercise['type'] })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                required
              >
                <option value="cardio">有酸素運動</option>
                <option value="strength">筋力トレーニング</option>
                <option value="flexibility">ストレッチ</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">運動名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                placeholder="例: ジョギング、腕立て伏せ"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">時間 (分)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">消費カロリー</label>
                <input
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={(e) => setFormData({ ...formData, caloriesBurned: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 md:flex-none bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-md font-medium"
              >
                {editingExercise ? '更新' : '追加'}
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

      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm mb-6 border border-emerald-100">
        <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-800">本日の合計</h2>
        <div className="flex gap-6 md:gap-8">
          <div>
            <p className="text-xs md:text-sm text-gray-600 mb-1">消費カロリー</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-500">{totalCaloriesBurned} kcal</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-600 mb-1">運動時間</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-500">{totalDuration} 分</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {exercises.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-emerald-100">
            この日の運動記録はありません
          </div>
        ) : (
          exercises.map((exercise) => (
            <div key={exercise.id} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-emerald-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full font-medium">
                      {getExerciseTypeLabel(exercise.type)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800">{exercise.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>{exercise.duration}分</span>
                    <span>{exercise.caloriesBurned} kcal</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="text-emerald-500 hover:text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
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
