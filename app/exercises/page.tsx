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

  const loadExercises = () => {
    const data = storage.getExercisesByDate(selectedDate);
    setExercises(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const exercise: Exercise = {
      id: editingExercise?.id || Date.now().toString(),
      date: selectedDate,
      ...formData,
    };

    storage.saveExercise(exercise);
    loadExercises();
    resetForm();
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

  const handleDelete = (id: string) => {
    if (confirm('この運動を削除しますか？')) {
      storage.deleteExercise(id);
      loadExercises();
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
      strength: '筋力トレーニング',
      flexibility: 'ストレッチ',
      other: 'その他',
    };
    return labels[type];
  };

  const totalCaloriesBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const totalDuration = exercises.reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">運動管理</h1>

      <div className="mb-6 flex gap-4 items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          {isFormOpen ? 'キャンセル' : '運動を追加'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
          <h2 className="text-xl font-semibold mb-4">
            {editingExercise ? '運動を編集' : '運動を追加'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">種類</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Exercise['type'] })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="cardio">有酸素運動</option>
                <option value="strength">筋力トレーニング</option>
                <option value="flexibility">ストレッチ</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">運動名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="例: ジョギング、腕立て伏せ"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">時間 (分)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">消費カロリー (kcal)</label>
                <input
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={(e) => setFormData({ ...formData, caloriesBurned: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingExercise ? '更新' : '追加'}
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
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-gray-600">消費カロリー</p>
            <p className="text-2xl font-bold text-green-600">{totalCaloriesBurned} kcal</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">運動時間</p>
            <p className="text-2xl font-bold text-green-600">{totalDuration} 分</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {exercises.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            この日の運動記録はありません
          </div>
        ) : (
          exercises.map((exercise) => (
            <div key={exercise.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                      {getExerciseTypeLabel(exercise.type)}
                    </span>
                    <h3 className="text-lg font-semibold">{exercise.name}</h3>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>時間: {exercise.duration}分</span>
                    <span>消費カロリー: {exercise.caloriesBurned} kcal</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="text-green-600 hover:text-green-800 px-3 py-1"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
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
