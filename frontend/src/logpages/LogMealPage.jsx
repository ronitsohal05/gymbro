import { useState } from "react";
import { logMeal } from "../services/api";

export default function LogMealPage() {
  const [mealItems, setMealItems] = useState([""]);
  const [mealType, setMealType] = useState("breakfast");
  const [message, setMessage] = useState("");

  const handleItemChange = (index, value) => {
    const updated = [...mealItems];
    updated[index] = value;
    setMealItems(updated);
  };

  const addItem = () => setMealItems([...mealItems, ""]);

  const removeItem = (index) => {
    const updated = [...mealItems];
    updated.splice(index, 1);
    setMealItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();

    try {
      await logMeal({
        date: timestamp,
        type: mealType,
        items: mealItems.filter((item) => item.trim() !== "")
      });
      setMessage("Meal logged!");
      setMealItems([""]);
    } catch (err) {
      console.error(err);
      setMessage("Failed to log meal.");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Log a Meal</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-4">
          <span>Meal Type</span>
          <select
            className="w-full border p-2 rounded"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="other">Other</option>
          </select>
        </label>

        {mealItems.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              className="w-full border p-2 rounded"
              placeholder={`Meal item ${index + 1}`}
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              required
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="mb-4 text-blue-600 hover:underline"
        >
          + Add Another Item
        </button>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded"
        >
          Log Meal
        </button>

        {message && <p className="mt-4 text-green-600">{message}</p>}
      </form>
    </div>
  );
}
