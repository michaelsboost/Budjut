# 💸 Budjut – Smart Budgeting Without the Noise

===================

![](https://raw.githubusercontent.com/michaelsboost/Budjut/gh-pages/imgs/screenshot.jpeg)

## 🌟 Overview

Budjut is a lightweight, browser-based budgeting app built for everyday people who want simple financial control without subscriptions, ads, or invasive tracking. Designed to be fast, private, and easy to use, Budjut helps users track both income and expenses, monitor financial health in real-time, and manage budgeting data with CSV import/export support.

[![MIT License](https://img.shields.io/github/license/michaelsboost/Budjut)](LICENSE) [![GitHub Stars](https://img.shields.io/github/stars/michaelsboost/Budjut)](https://github.com/michaelsboost/Budjut/stargazers) [![GitHub Issues](https://img.shields.io/github/issues/michaelsboost/Budjut)](https://github.com/michaelsboost/Budjut/issues)

> 🛠️ Built using [kodeWeave](https://michaelsboost.github.io/kodeWeave/)
> Browser-based. Lightweight. Offline-friendly. No install required.

## 🚀 **Launch the App**

Live version: **[Budjut App](https://michaelsboost.com/Budjut/)**

> 📲 **Progressive Web App (PWA) Friendly**
> Install it to your home screen and manage your finances offline, anytime.

---

### **🧠 Philosophy**

Budjut avoids unnecessary complexity, social feeds, and bloated finance tools. It focuses on clarity, speed, ownership, and privacy.

> “A budget is telling your money where to go instead of wondering where it went.” – Dave Ramsey

⚡ Fast enough to feel native. Small enough to stay out of your way.

## 🛠️ Key Features

**💰 Complete Transaction Management**
- Add, edit, and delete both income and expense transactions
- Categorized entries with optional notes
- Real-time balance calculation

**📊 Financial Health Dashboard**
- Total balance overview with net worth snapshot
- Monthly income vs. expense breakdown
- Spending percentage progress bar
- Daily spending pace tracker
- Weekly paycheck estimator with countdown

**🧠 Smart Financial Insights**
- Real-time health score (0-100) based on savings rate
- Personalized savings advice and tips
- Essential vs. discretionary spending analysis
- Actionable recommendations based on your habits

**📈 Visual Analytics**
- Interactive pie chart for monthly expense category breakdown
- Visual progress bars for savings goals and expense ratios

**🎯 Goal Setting**
- Monthly savings goal tracker
- Visual progress monitoring toward your target

**💱 Multi-Currency Support**
- USD, EUR, GBP, JPY, CAD, AUD
- Automatic formatting using Intl.NumberFormat

**📁 CSV Import & Export**
- Export all transaction data to CSV
- Import CSV files with automatic validation
- Seamless data migration

**💾 Persistent Local Storage**
- Automatic saving of all transactions and settings
- JSON backup and restore functionality
- No account creation required
- No cloud dependency or server storage

**⚡ Quick Actions**
- Floating action button for rapid entry
- Keyboard shortcut: press 'N' to add new transaction
- Search and filter transactions by category or note
- One-click category filter chips

**🎨 Modern Minimal UI**
- Responsive dark-mode interface
- Glassmorphism design with subtle animations
- Mobile-friendly and touch-optimized
- Smooth hover and transition effects

**🔒 Privacy Focused**
- Entirely client-side
- No tracking
- No analytics
- Your data stays on your device

---

## **⚡ Getting Started**

### **1️⃣ Install & Run Locally**

```sh
# Clone the repository
git clone https://github.com/michaelsboost/Budjut.git
cd Budjut

# Open index.html in a browser
```

### **2️⃣ Dependencies**

- Alpine.js 3.14.1 (reactive functionality)
- Chart.js 4.4.0 (data visualization)
- PapaParse 5.4.1 (CSV parsing)
- TailwindCSS (styling)
- Vanilla JavaScript
- HTML5 LocalStorage API

### **📁 CSV Format Example**

```csv
amount,type,category,date,note
850,expense,Rent,2025-01-01,
100,expense,Electric,2025-01-05,
3000,income,Salary,2025-01-01,Monthly paycheck
```

**CSV Columns:**
| Column | Type | Description |
|--------|------|-------------|
| amount | number | Transaction amount (positive) |
| type | string | `income` or `expense` |
| category | string | Category name |
| date | string | YYYY-MM-DD format |
| note | string | Optional description |

### **3️⃣ Expense Categories**

**Default expense categories:**
Food, Bills, Transportation, Rent, Utilities, Health, Debt, Entertainment, Shopping, Miscellaneous

**Default income categories:**
Salary, Freelance, Gift, Refund, Other Income

---

## **🎮 Tips & Shortcuts**

| Action | Method |
|--------|--------|
| New transaction | Click blue ✦ button or press `N` key |
| Search transactions | Type in search box or click category chip |
| Filter by type | Use dropdown (All / Income / Expense) |
| Edit transaction | Click ✏️ icon on any transaction row |
| Delete transaction | Click 🗑️ icon (appears on hover) |
| Share budget summary | Click Share button (supported browsers) |

---

## **🧮 Financial Health Scoring**

Budjut calculates a health score (0-100) based on:
- Monthly savings rate (income - expenses / income)
- Essential vs. discretionary spending ratio
- Spending patterns relative to income

| Score Range | Rating |
|-------------|--------|
| 80-100 | 🔥 Excellent financial shape |
| 60-79 | 👍 Healthy habits — keep going! |
| 40-59 | ⚠️ Room for improvement |
| 0-39 | 🚨 Needs attention — small steps help |

---

## **🤝 Contributing**

Want to contribute?

- Fork the repo
- Create a feature branch (`feature-budget-analytics`)
- Submit a pull request 🎉 and help improve financial accessibility 💸

---

## **📜 License**

Licensed under the **MIT License** — free to use, share, and remix.

**Developed by:** [Michael Schwartz](https://michaelsboost.com/)
**Maintained by:** The community

## **☕ Support the Developer**

If Budjut was helpful for you, consider supporting future projects:

- 🎨 Check out my Graphic Design Course: https://michaelsboost.com/graphicdesign
- 🛒 Register as a customer on my store: https://michaelsboost.com/store
- ☕ Buy me a coffee: http://ko-fi.com/michaelsboost
- 👕 Purchase a T-Shirt: https://michaelsboost.com/gear
- 🖼️ Buy my art prints: https://deviantart.com/michaelsboost/prints
- 💰 Donate via PayPal: https://michaelsboost.com/donate
- 💵 Donate via Cash App: https://cash.me/$michaelsboost

Your support helps fund future open-source projects and tools for the community 🚀