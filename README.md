# TrackYourFinance  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## See it in action: https://track-my-finance.vercel.app

## Description
TrackYourFinance is a simple personal finance manager that helps you record and categorize your income and expenses. You can see how much you earn, where you spend, and how much money remains. It has user authentication (JWT and Google OAuth) to keep your data private.

## Why It Exists
Many finance tools can be confusing. TrackYourFinance tries to be clear and straightforward. It puts all your records in one place, so you can see where your money goes and where you might want to spend less.

## Key Highlights
- **Safe Login:** Choose email/password or Google OAuth.
- **Transactions:** Add income and expenses with dates, categories, and payment methods.
- **Dashboard:** Instant overview of your total income, expenses, and net balance.
- **REST API:** Flexible if you want to manage data from external scripts or clients.

## Features (A Typical User Scenario)
1. **Sign Up or Log In**  
   - You go to the homepage and create a new account or log in with your Google account.
   - After signing in, you land on your personal dashboard.

2. **See Your Dashboard**  
   - The dashboard shows your total income, total expenses, and net money.
   - You can quickly see if your income is keeping up with your spending.

3. **Add Your First Income**  
   - Click “Add Income” to record money from a paycheck, freelance gig, or even a gift.
   - Enter the date, amount, and source (like “Salary” or “Freelance”).

4. **Record Your Expenses**  
   - Click “Add Expense” to log purchases like groceries, rent, or entertainment.
   - Specify the date, payment method (cash, credit, etc.), and category (food, rent, etc.).
   - The dashboard updates in real time so you can see the impact on your net money.

5. **Organize with Categories and Budgets**  
   - Create custom categories (e.g., "Travel" or "Subscriptions").
   - Allocate a budget for each category if you like to keep a spending goal in mind.
   - This helps you compare your actual spend vs. your intended budget over time.

6. **View Lists and Details**  
   - Check full lists of your income and expense records in an easy-to-read table.
   - Sort or filter to find past records.
   - Make edits or deletions as needed.

At every step, your data is secured on the backend with Node.js, Express, MySQL, and protected by JWT or Google OAuth.

## Installation

### Prerequisites
- **Node.js** 
- **MySQL** (create a user/password)
- **Git** (if you plan to clone directly)

### Steps
```bash
# Clone the repository
git clone https://github.com/yourusername/TrackYourFinance.git
cd TrackYourFinance

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables
Create a file called `.env` in the `backend` folder:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdatabase
JWT_SECRET=YourJWTSecret
GOOGLE_CLIENT_ID=YourGoogleClientID
GOOGLE_CLIENT_SECRET=YourGoogleClientSecret
```
Keep `.env` out of version control.

## Usage

1. **Start the Backend**
   ```bash
   # In the backend folder
   node index.js
   ```
   Visit `http://localhost:5000` to verify it's running.

2. **Start the Frontend**
   ```bash
   # In the frontend folder
   npm start
   ```
   Go to `http://localhost:3000` to use the app.

3. **Log In or Sign Up**
   - Create an account or log in using Google.
   - Add income or expense entries. Watch your dashboard update right away.

## Tech Stack
- **Frontend:** React, Redux, Axios
- **Backend:** Node.js, Express, MySQL
- **Authentication:** JWT, Google OAuth (via Passport)
- **Helpers:** dotenv (env variables), bcrypt (password hashing), cors (middleware)

## License
This project is licensed under the [MIT License](LICENSE).

## Contact
- Email: thapahemanta.dev@gmail.com 
- LinkedIn: https://www.linkedin.com/in/thapahemanta/
