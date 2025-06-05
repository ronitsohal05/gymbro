import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { getUserStats, getLogsByDate } from "../services/api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState({ meals: [], workouts: [] });
  const [calendarHighlights, setCalendarHighlights] = useState({});

  useEffect(() => {
    async function fetchData() {
      const userData = await getUserStats();
      setStats(userData.data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchLogs() {
      const isoDate = selectedDate.toISOString().split("T")[0];
      const response = await getLogsByDate(isoDate);
      setLogs(response.data);
    }
    fetchLogs();
  }, [selectedDate]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Your Dashboard</h1>

      {stats && (
        <div className="mb-6 bg-gray-100 p-4 rounded shadow space-y-2">
          <p><strong>Name:</strong> {stats.name}</p>
          <p><strong>Age:</strong> {stats.age}</p>
          <p><strong>Height:</strong> {stats.height} in</p>
          <p><strong>Weight:</strong> {stats.weight} lbs</p>
          <p><strong>Goal:</strong> {stats.goal}</p>

          <div className="mt-4 bg-white p-3 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Last 30 Days Summary</h3>
            <p>✅ <strong>{stats.past30Meals}</strong> meals logged</p>
            <p>💪 <strong>{stats.past30Workouts}</strong> workouts completed</p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Activity Calendar</h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={({ date }) => {
          const key = date.toISOString().split("T")[0];
          return (
            <div className="text-sm">
              {calendarHighlights[key]?.meals && "✅"}
              {calendarHighlights[key]?.workouts && "💪"}
            </div>
          );
        }}
      />

      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">Logs for {selectedDate.toDateString()}</h3>
        <div>
          <strong>Meals:</strong>
          <ul className="list-disc ml-6">
            {logs.meals.length ? logs.meals.map((m, i) => (
              <li key={i}>{m.category}: {m.items.join(", ")}</li>
            )) : <li>No meals logged</li>}
          </ul>
        </div>
        <div className="mt-2">
          <strong>Workouts:</strong>
          <ul className="list-disc ml-6">
            {logs.workouts.length ? logs.workouts.map((w, i) => (
              <li key={i}>{w.name} — {w.duration ? `${w.duration} min` : `${w.sets}x${w.reps}`}</li>
            )) : <li>No workouts logged</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
