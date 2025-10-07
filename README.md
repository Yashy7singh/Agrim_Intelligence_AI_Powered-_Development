# Agrim_Intelligence_AI_Powered-_Development
## 🚀 How to Run the Application

Clone or Download the project folder.

git clone https://github.com/Yashy7singh/Agrim_Intelligence_AI_Powered-_Development


Open the folder in Cursor AI or your preferred code editor.

Simply open index.html in your browser.
(No server required — runs fully on client-side using localStorage.)

## ✨ Key Features Implemented

✅ Add Expense Form

Add expense details: amount, category, date, and optional description

Validation ensures amount > 0 and date is not in the future

✅ Expense List Display

Displays all expenses in a structured table/card view

Each expense includes delete functionality

✅ Filtering

Filter by category or date range

Clear filters with one click

✅ Statistics Dashboard

Shows total spending, transactions count, and category-wise breakdown

Dynamic updates on add/delete/filter actions

✅ LocalStorage Integration

All expenses persist in the browser even after page reload

💡 Bonus Feature (Optional)

Dark Mode Toggle 🌙

Users can switch between light and dark themes

Preference is saved in localStorage



## 🧠 Cursor Usage Documentation
🔹 3–5 Interesting Prompts Used

1) “Create a basic Personal Expense Tracker web app structure using HTML, CSS, and JavaScript. The app should include a section for adding expenses, a list to display them, a filter panel, and a statistics dashboard. Use responsive layout and a clean, modern design. Keep the JavaScript logic in a separate file (script.js) and prepare the structure to use localStorage for saving expenses.”

2) "Implement the 'Add Expense' form in JavaScript. It should include input fields for amount, category, date, and description. Validate that the amount is positive and date is not in the future. On submit, save the expense data (as objects) to localStorage and refresh the displayed expense list dynamically."

3) "Write JavaScript code that loads all expenses from localStorage and displays them in a clean, styled list format (date, category, amount, description). Add a delete button next to each item that removes that expense from localStorage and updates the list in real-time."

4) "Add a filtering feature that allows users to filter expenses by category and date range (from–to). Include a 'Clear Filters' button that resets the view to show all expenses. Ensure that the filtering works dynamically without reloading the page."

5) “Add a dark/light mode toggle button that saves user preference in localStorage.”



## 🔹 How Cursor Helped Solve Challenges

Faster Prototyping: Cursor’s AI autocompletion and prompt-based code generation saved time in creating boilerplate HTML/JS logic.

Debugging Assistance: Cursor highlighted logical errors in localStorage handling and suggested fixes for data parsing (JSON.parse() / JSON.stringify()).

Code Styling: Cursor’s inline suggestions improved readability and modularity, such as separating form validation logic into helper functions.



## 🔹 Modifications Made to AI-Generated Code

Improved Validation: The AI initially allowed “0” as an amount — manually fixed to enforce > 0.

Enhanced Responsiveness: Added custom CSS media queries instead of default inline styles.

Optimized LocalStorage Updates: Replaced repeated full refreshes with incremental DOM updates for better performance.
