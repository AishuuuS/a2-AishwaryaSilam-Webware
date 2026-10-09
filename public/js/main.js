console.log("main.js loaded");

const freqSelect = document.getElementById("habit-frequency");
const customInput = document.getElementById("habit-custom-frequency");
const habitForm = document.getElementById("habit-form");
const habitIdInput = document.getElementById("habit-id");
const submitBtn = document.getElementById("submit-btn");

// Show/hide custom frequency input
freqSelect.addEventListener("change", () => {
  if (freqSelect.value === "custom") {
    customInput.style.display = "inline-block";
    customInput.required = true;
  } else {
    customInput.style.display = "none";
    customInput.required = false;
  }
});

// Today's date (YYYY-MM-DD format)
function todayDate() {
  return new Date().toISOString().split("T")[0];
}

// Load habits from server and populate table
async function loadHabits() {
  const res = await fetch("/api/habits");
  const habits = await res.json();

  const tbody = document.querySelector("#habit-table tbody");
  tbody.innerHTML = "";

  const today = todayDate();

  habits.forEach((habit) => {
    const tr = document.createElement("tr");

    // Add "overdue" class if next_due is before today
    const overdueClass = habit.next_due < today ? "overdue" : "";

    tr.innerHTML = `
      <td>${habit.id}</td>
      <td>${habit.name}</td>
      <td>${habit.frequency}</td>
      <td class="${overdueClass}">${habit.next_due}</td>
      <td>
        <button class="edit-btn" data-id="${habit.id}">Edit</button>
        <button class="delete-btn" data-id="${habit.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Delete button handler
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await fetch(`/api/habits/${id}`, { method: "DELETE" });
      loadHabits();
    });
  });

  // Edit button handler
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const habit = habits.find((h) => h.id == id);
      habitIdInput.value = habit.id;
      document.getElementById("habit-name").value = habit.name;

      if ([1, 7, 30].includes(habit.frequency)) {
        freqSelect.value = habit.frequency;
        customInput.style.display = "none";
      } else {
        freqSelect.value = "custom";
        customInput.style.display = "inline-block";
        customInput.value = habit.frequency;
      }

      submitBtn.textContent = "Update Habit";
    });
  });
}

// Add or edit habit
habitForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = habitIdInput.value;
  const name = document.getElementById("habit-name").value.trim();
  let frequency = freqSelect.value === "custom" ? parseInt(customInput.value) : parseInt(freqSelect.value);
  if (!name || !frequency || frequency < 1) return;

  if (id) {
    // True edit with PUT
    await fetch(`/api/habits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, frequency }),
    });
  } else {
    // Add new habit
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, frequency }),
    });
  }

  habitForm.reset();
  habitIdInput.value = "";
  submitBtn.textContent = "Add Habit";
  customInput.style.display = "none";
  loadHabits();
});

// Initial table load
loadHabits();

// Auto-refresh table daily (24 hours)
setInterval(loadHabits, 86400000); 
// For testing purposes, you can use 10000 (10 sec) instead
