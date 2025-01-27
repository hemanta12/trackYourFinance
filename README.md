# Finance Tracker Web App

A full-stack application to help you track and manage your personal finances. 
Easily log incomes and expenses, visualize spending habits, and plan budgets—all from a clean, intuitive interface.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Finance Tracker Web App** allows you to log your incomes and expenses, view them in user-friendly dashboards, and manage budgets and recurring transactions. Built with a Node.js/Express.js backend and a React.js frontend, it leverages a MySQL database for robust data handling. The ultimate goal is to provide a secure, simple, and insightful solution for personal finance management.

---

## Features

- **User Authentication**
  - **Google OAuth 2.0** and **username/password** (hashed) logins.
  - Secure routes protected by JWT sessions.

- **Income & Expense Management**
  - Create, read, update, and delete (CRUD) operations.
  - Categorize expenses by category, shop/website, and date.

- **Dashboard & Analytics**
  - Visualize income/expenses trends over time.
  - Charts for monthly, quarterly, and yearly spending.
  - Compare actual spending to budget goals.

- **Budget Planning**
  - Set monthly or annual budgets.
  - View budget progress and get alerts when approaching limits.

- **Recurring Transactions**
  - Automate regular income/expense entries.
  - Customize frequency and track them in the dashboard.

- **Data Export **
  - Export transactions in CSV or Excel format for external use.

---

## Screenshots

> **Note:** Below is an example placeholder. .

| Dashboard View | Expense List |
|----------------|--------------|
| ![Dashboard Mock](docs/images/dashboard-mock.png) | ![Expense List Mock](docs/images/expense-mock.png) |

---

## Project Structure

Below is the current folder structure for **TrackMyFinance**.

```bash
TRACKMYFINANCE/
├── backend
│   ├── config
│   │   ├── db.js
│   │   └── passport.js
│   ├── controllers
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── incomeController.js
│   │   └── listController.js
│   ├── middlewares
│   │   └── jwtMiddleware.js
│   ├── models
│   ├── routes
│   │   ├── analyticsRoute.js
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── incomeRoutes.js
│   │   └── listRoutes.js
│   ├── utils
│   ├── .env
│   ├── .gitignore
│   ├── createExpensesTable.js
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
│   └── README.md
└── frontend
    ├── node_modules
    ├── public
    ├── src
    │   ├── components
    │   │   ├── AnalyticsChart.js
    │   │   ├── Button.js
    │   │   ├── ExpenseForm.js
    │   │   ├── ExpenseList.js
    │   │   ├── IncomeForm.js
    │   │   ├── IncomeList.js
    │   │   ├── Input.js
    │   │   ├── Navigation.js
    │   │   └── PrivateRoute.js
    │   ├── pages
    │   │   ├── Dashboard.js
    │   │   ├── Expenses.js
    │   │   ├── Income.js
    │   │   ├── LoginPage.js
    │   │   └── SignupPage.js
    │   ├── redux
    │   │   ├── expensesSlice.js
    │   │   ├── incomeSlice.js
    │   │   ├── listSlice.js
    │   │   └── store.js
    │   ├── services
    │   │   └── api.js
    │   ├── styles
    │   │   ├── AnalyticsChart.module.css
    │   │   ├── Button.module.css
    │   │   ├── Dashboard.module.css
    │   │   ├── ExpenseForm.module.css
    │   │   ├── ExpenseList.module.css
    │   │   ├── IncomeForm.module.css
    │   │   ├── IncomeList.module.css
    │   │   ├── Input.module.css
    │   │   ├── LoginPage.module.css
    │   │   ├── Navigation.module.css
    │   │   └── SignupPage.module.css
    │   ├── utils
    │   │   └── debounce.js
    │   ├── App.js
    │   ├── index.js
    │   └── reportWebVitals.js
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    └── README.md
```

- **backend**: Node.js/Express APIs, controllers, routes, DB setup, and authentication.
- **frontend**: React application, components, pages, Redux slices, and styling.


---

## Installation

### Prerequisites
1. **Node.js** (>= 14.x) and **npm** (or **yarn**).
2. **MySQL** database running locally or in the cloud.
3. A **Google Cloud** project set up if you plan to use Google OAuth 2.0.

### Backend Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/finance-tracker.git
   cd finance-tracker/backend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**: Create a `.env` file in `backend/` (or configure your environment) with the following:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=finance_tracker
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```
4. **Create Database and Tables**: Ensure MySQL is running and create the database, then run your migration scripts or use a migration tool like Sequelize/Knex:
   ```sql
   CREATE DATABASE finance_tracker;
   ```
   Next, either manually run SQL to create tables or use ORM migrations.

5. **Start the Server**:
   ```bash
   npm run dev   # or npm start
   ```
   By default, the API will be available at `http://localhost:5000` (unless specified otherwise).

### Frontend Setup

1. In a separate terminal, navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**: Create a `.env` file if using something like `REACT_APP_` variables for your setup. Example:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
4. **Run the Development Server**:
   ```bash
   npm start
   ```
   The React app typically runs on `http://localhost:3000`. This will proxy certain requests to the backend if configured.

---

## Usage

1. **Register or Login**:
   - Using **Google**: Click the "Sign in with Google" button. You’ll be redirected to Google OAuth, then back to the app.
   - Using **Username/Password**: Enter your credentials in the signup or login form. Passwords are hashed for security.

2. **Add Transactions**:
   - Navigate to the **Incomes** or **Expenses** section.
   - Click **Add new income** or **Add new expense**, fill out details, and save.

3. **View Dashboard**:
   - Access your dashboard for charts and analytical insights into your finances.
   - Drill down by category, shop, or time period.

4. **Manage Budgets**:
   - In the **Budget** section, set monthly or annual budgets.
   - Track how much you’ve spent relative to your budget over time.

5. **Recurring Transactions**:
   - Mark any expense or income as recurring (daily, weekly, monthly, etc.).
   - These will auto-generate without needing manual entries each time.

---

## Roadmap

The project follows a structured roadmap of phases to ensure a robust, iterative development process:

1. **Phase 1**: **Planning and Setup**  
   - Define tech stack, set up repo, CI/CD, create mockups.

2. **Phase 2**: **Core Features**  
   - Income/Expense CRUD, user authentication, DB schemas.

3. **Phase 3**: **Dashboard & Analytics**  
   - Data aggregation, charts, real-time analytics.

4. **Phase 4**: **Advanced Features**  
   - Budgets, recurring transactions, multi-account support.

5. **Phase 5**: **Testing & Deployment**  
   - Unit/integration tests, performance optimization, deploy to cloud.

6. **Phase 6**: **Feedback & Iteration**  
   - User surveys, feature additions, continuous improvements.


---



````
