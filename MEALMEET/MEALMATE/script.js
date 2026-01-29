function calculate() {
  let weight = Number(document.getElementById("weight").value);
  let height = Number(document.getElementById("height").value) / 100;
  let age = Number(document.getElementById("age").value);
  let goal = document.getElementById("goal").value;

  if (!weight || !height || !age) return;

  let bmi = (weight / (height * height)).toFixed(1);

  let bmr = 10 * weight + 6.25 * (height * 100) - 5 * age + 5;
  let calories = bmr * 1.55;

  if (goal === "lose") calories -= 400;
  if (goal === "gain") calories += 300;

  let protein = Math.round(weight * 2);
  let fats = Math.round((calories * 0.25) / 9);
  let carbs = Math.round((calories - (protein * 4 + fats * 9)) / 4);

  let result = document.getElementById("result");
  result.classList.remove("hidden");

  result.innerHTML = `
    <h3>Your Plan</h3>
    <p><strong>BMI:</strong> ${bmi}</p>
    <p><strong>Calories:</strong> ${calories.toFixed(0)} kcal/day</p>
    <p><strong>Protein:</strong> ${protein} g</p>
    <p><strong>Carbs:</strong> ${carbs} g</p>
    <p><strong>Fats:</strong> ${fats} g</p>
    <hr>
    <p><strong>Meal Timing:</strong></p>
    <ul>
      <li>Breakfast: 7–9 AM</li>
      <li>Lunch: 12–1 PM</li>
      <li>Snack: 4–5 PM</li>
      <li>Dinner: 7–8 PM</li>
    </ul>
  `;
}
function generateWeeklyPlan() {
  const weeklyPlan = document.getElementById("weeklyPlan");
  const goal = document.getElementById("goal").value;

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  // Group meals by type
  const breakfasts = DATA.meals.filter(m => m.type === "breakfast" && m.goal === goal);
  const lunches    = DATA.meals.filter(m => m.type === "lunch" && m.goal === goal);
  const dinners    = DATA.meals.filter(m => m.type === "dinner" && m.goal === goal);

  if (!breakfasts.length || !lunches.length || !dinners.length) {
    weeklyPlan.innerHTML = "<p>No meals available for this goal.</p>";
    return;
  }

  let html = `
    <h3>📅 Weekly Meal Plan</h3>
    <table class="weekly-table">
      <tr>
        <th>Day</th>
        <th>Breakfast</th>
        <th>Lunch</th>
        <th>Dinner</th>
      </tr>
  `;

  days.forEach((day, i) => {
    html += `
      <tr>
        <td>${day}</td>
        <td>${breakfasts[i % breakfasts.length].name}</td>
        <td>${lunches[i % lunches.length].name}</td>
        <td>${dinners[i % dinners.length].name}</td>
      </tr>
    `;
  });

  html += `</table>`;
  weeklyPlan.innerHTML = html;
}
