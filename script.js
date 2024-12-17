document.addEventListener("DOMContentLoaded", () => {
    const expenseDate = document.getElementById("expense-date");
    const expenseDesc = document.getElementById("expense-desc");
    const expenseAmount = document.getElementById("expense-amount");
    const expenseCategory = document.getElementById("expense-category");
    const addExpenseBtn = document.getElementById("add-expense");

    const filterStartDate = document.getElementById("filter-start-date");
    const filterEndDate = document.getElementById("filter-end-date");
    const filterCategory = document.getElementById("filter-category");
    const applyFiltersBtn = document.getElementById("apply-filters");

    const expenseList = document.getElementById("expense-list");
    const totalAmount = document.getElementById("total-amount");
    const exportBtn = document.getElementById("export-expenses");
    const themeToggle = document.getElementById("theme-toggle");

    const ctx = document.getElementById("expense-chart").getContext("2d");

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let chart;

    // Render Expenses
    function renderExpenses(filteredExpenses = expenses) {
        expenseList.innerHTML = "";
        let total = 0;

        filteredExpenses.forEach((expense, index) => {
            total += expense.amount;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.desc}</td>
                <td>${expense.category}</td>
                <td>${expense.amount.toFixed(2)}</td>
                <td>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;
            expenseList.appendChild(row);
        });

        totalAmount.textContent = total.toFixed(2);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        updateChart(filteredExpenses);
    }

    // Add Expense
    addExpenseBtn.addEventListener("click", () => {
        const date = expenseDate.value;
        const desc = expenseDesc.value.trim();
        const amount = parseFloat(expenseAmount.value);
        const category = expenseCategory.value;

        if (date && desc && !isNaN(amount) && amount > 0) {
            expenses.push({ date, desc, amount, category });
            expenseDate.value = "";
            expenseDesc.value = "";
            expenseAmount.value = "";
            renderExpenses();
        } else {
            alert("Please fill in all fields with valid data.");
        }
    });

    // Delete Expense
    expenseList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const index = e.target.dataset.index;
            expenses.splice(index, 1);
            renderExpenses();
        }
    });

    // Filter Expenses
    applyFiltersBtn.addEventListener("click", () => {
        const startDate = filterStartDate.value;
        const endDate = filterEndDate.value;
        const category = filterCategory.value;

        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            return (
                (!start || expenseDate >= start) &&
                (!end || expenseDate <= end) &&
                (category === "All" || expense.category === category)
            );
        });

        renderExpenses(filteredExpenses);
    });

    // Export to CSV
    exportBtn.addEventListener("click", () => {
        let csvContent = "data:text/csv;charset=utf-8,Date,Description,Category,Amount\n";

        expenses.forEach(expense => {
            csvContent += `${expense.date},${expense.desc},${expense.category},${expense.amount}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "expenses.csv");
        document.body.appendChild(link);
        link.click();
    });

    // Theme Toggle
    themeToggle.addEventListener("change", () => {
        document.body.classList.toggle("dark-mode", themeToggle.checked);
    });

    // Update Chart
    function updateChart(data) {
        const categories = ["Food", "Transport", "Entertainment", "Utilities", "Other"];
        const totals = categories.map(category => {
            return data
                .filter(expense => expense.category === category)
                .reduce((sum, expense) => sum + expense.amount, 0);
        });

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: categories,
                datasets: [{
                    label: "Expenses by Category",
                    data: totals,
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }

    // Initial Render
    renderExpenses();
});
// Register Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then((reg) => console.log("Service Worker Registered", reg))
            .catch((err) => console.log("Service Worker Registration Failed", err));
    });
}
