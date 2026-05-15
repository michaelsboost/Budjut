function budjutUnified() {
    return {
        // --- Data ---
        transactions: [],          // list of transaction objects
        settings: {
            currencyCode: 'USD',   // ISO currency code (USD, EUR, etc.)
            monthlyGoal: 0         // user's monthly savings target
        },
        txSearch: '',              // search/filter text
        txFilterType: 'all',       // 'all', 'income', 'expense'
        showTxModal: false,
        editingId: null,           // if not null, we are editing an existing transaction
        txForm: {
            type: 'expense',
            amount: '',
            category: 'Food',
            date: new Date().toISOString().slice(0,10),
            note: ''
        },
        expenseCategories: ['Food','Bills','Transportation','Rent','Utilities','Health','Debt','Entertainment','Shopping','Miscellaneous'],
        incomeCategories: ['Salary', 'Freelance', 'Gift', 'Refund', 'Other Income'],
        pieChart: null,

        // --- Lifecycle ---
        init() {
            this.loadData();
            // Watch for changes to re-render chart and save
            this.$watch('transactions', () => {
                this.saveData();
                this.renderPieChart();
            });
            this.$watch('settings', () => { this.saveData(); }, { deep: true });
            this.$nextTick(() => { this.renderPieChart(); });
            // Keyboard shortcut: press 'N' to open new transaction modal
            window.addEventListener('keydown', (e) => {
                if (e.key === 'n' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.openQuickAdd();
                }
            });
        },

        // --- Storage & helpers ---
        loadData() {
            let storedTx = localStorage.getItem('budjut_transactions');
            if (storedTx) {
                try { this.transactions = JSON.parse(storedTx); } catch(e) { this.transactions = []; }
            }
            let storedSettings = localStorage.getItem('budjut_settings');
            if (storedSettings) {
                try {
                    let parsed = JSON.parse(storedSettings);
                    // Migration: old versions used 'currency' symbol – convert to currencyCode
                    if (parsed.currency && !parsed.currencyCode) {
                        const symbolToCode = { '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY' };
                        this.settings.currencyCode = symbolToCode[parsed.currency] || 'USD';
                    } else {
                        this.settings.currencyCode = parsed.currencyCode || 'USD';
                    }
                    this.settings.monthlyGoal = parsed.monthlyGoal || 0;
                } catch(e) { this.settings = { currencyCode: 'USD', monthlyGoal: 0 }; }
            } else {
                this.settings = { currencyCode: 'USD', monthlyGoal: 0 };
            }
        },
        saveData() {
            localStorage.setItem('budjut_transactions', JSON.stringify(this.transactions));
            localStorage.setItem('budjut_settings', JSON.stringify(this.settings));
        },
        saveSettings() { this.saveData(); },

        // --- Formatting (multi-currency using Intl) ---
        formatMoney(val) {
            let num = typeof val === 'number' ? val : 0;
            try {
                return new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: this.settings.currencyCode,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(num);
            } catch(e) {
                // fallback if currency code invalid
                return this.settings.currencyCode + ' ' + num.toFixed(2);
            }
        },
        formatDate(d) {
            return d ? new Date(d).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' }) : '';
        },

        // --- Toast notifications (replaces alert) ---
        showToast(msg, type = 'info') {
            let existing = document.querySelector('.budjut-toast');
            if(existing) existing.remove();
            let toast = document.createElement('div');
            toast.className = `budjut-toast fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 glass-card rounded-xl px-5 py-3 text-sm font-medium text-white ${type === 'error' ? 'border-red-500' : 'border-emerald-500'} border`;
            toast.innerText = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        },

        // --- Financial calculations ---
        totalBalance() {
            return this.transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        },
        monthlyIncome() {
            const now = new Date();
            const yearMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2,'0');
            return this.transactions.filter(t => t.type === 'income' && t.date.startsWith(yearMonth)).reduce((sum, t) => sum + t.amount, 0);
        },
        monthlyExpenses() {
            const now = new Date();
            const yearMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2,'0');
            return this.transactions.filter(t => t.type === 'expense' && t.date.startsWith(yearMonth)).reduce((sum, t) => sum + t.amount, 0);
        },
        monthlyRemaining() { return this.monthlyIncome() - this.monthlyExpenses(); },
        weeklyIncomeAvg() {
            const oneWeekAgo = Date.now() - 7 * 86400000;
            return this.transactions.filter(t => t.type === 'income' && new Date(t.date) >= new Date(oneWeekAgo)).reduce((sum, t) => sum + t.amount, 0);
        },
        paycheckCountdown() {
            let daysUntilFriday = (5 - new Date().getDay() + 7) % 7;
            return daysUntilFriday === 0 ? 7 : daysUntilFriday;
        },
        dailySpendingPace() {
            const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
            const dayOfMonth = new Date().getDate();
            const spentThisMonth = this.transactions.filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth).reduce((sum, t) => sum + t.amount, 0);
            return dayOfMonth > 0 ? spentThisMonth / dayOfMonth : 0;
        },

        // --- Transaction filtering & helpers ---
        filteredTransactions() {
            let filtered = [...this.transactions].sort((a,b) => new Date(b.date) - new Date(a.date));
            if (this.txFilterType !== 'all') filtered = filtered.filter(t => t.type === this.txFilterType);
            if (this.txSearch.trim() !== '') {
                const term = this.txSearch.trim().toLowerCase();
                filtered = filtered.filter(t => t.category.toLowerCase().includes(term) || (t.note && t.note.toLowerCase().includes(term)));
            }
            return filtered;
        },
        uniqueCategories() {
            const cats = new Set();
            this.transactions.forEach(t => cats.add(t.category));
            return Array.from(cats).slice(0, 8); // show at most 8 chips
        },
        deleteTransaction(id) {
            if (confirm('Remove permanently?')) {
                this.transactions = this.transactions.filter(t => t.id !== id);
                this.showToast('Transaction deleted', 'info');
            }
        },
        editTransaction(id) {
            const tx = this.transactions.find(t => t.id === id);
            if (tx) {
                this.editingId = id;
                this.txForm = {
                    type: tx.type,
                    amount: tx.amount,
                    category: tx.category,
                    date: tx.date,
                    note: tx.note || ''
                };
                this.showTxModal = true;
            }
        },
        openQuickAdd() {
            this.editingId = null;
            this.txForm = {
                type: 'expense',
                amount: '',
                category: 'Food',
                date: new Date().toISOString().slice(0,10),
                note: ''
            };
            this.showTxModal = true;
        },
        closeModal() {
            this.showTxModal = false;
            this.editingId = null;
        },
        saveTransaction() {
            let amountNum = parseFloat(this.txForm.amount);
            if (isNaN(amountNum) || amountNum <= 0) {
                this.showToast('Enter a positive amount', 'error');
                return;
            }
            if (this.editingId) {
                // update existing
                const index = this.transactions.findIndex(t => t.id === this.editingId);
                if (index !== -1) {
                    this.transactions[index] = {
                        ...this.transactions[index],
                        amount: amountNum,
                        type: this.txForm.type,
                        category: this.txForm.category,
                        date: this.txForm.date,
                        note: this.txForm.note?.trim() || ''
                    };
                    this.showToast('Transaction updated', 'info');
                }
            } else {
                // add new
                this.transactions = [{
                    id: Date.now(),
                    amount: amountNum,
                    type: this.txForm.type,
                    category: this.txForm.category,
                    date: this.txForm.date,
                    note: this.txForm.note?.trim() || ''
                }, ...this.transactions];
                this.showToast('Transaction added', 'info');
            }
            this.closeModal();
        },

        // --- Pie Chart ---
        renderPieChart() {
            const canvas = document.getElementById('pieChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const now = new Date();
            const monthPrefix = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2,'0');
            const catMap = new Map();
            this.transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthPrefix)).forEach(t => {
                catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
            });
            const labels = Array.from(catMap.keys()), data = Array.from(catMap.values());
            if (this.pieChart) this.pieChart.destroy();
            if (labels.length === 0) {
                this.pieChart = new Chart(ctx, {
                    type: 'pie',
                    data: { labels: ['No expenses'], datasets: [{ data: [1], backgroundColor: ['#334155'] }] },
                    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: '#cbd5e1' } } } }
                });
                return;
            }
            this.pieChart = new Chart(ctx, {
                type: 'pie',
                data: { labels, datasets: [{ data, backgroundColor: ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#ec489a','#14b8a6','#f97316','#6b7280','#a855f7','#eab308'] }] },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 11 } } },
                        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${this.formatMoney(ctx.raw)}` } }
                    }
                }
            });
        },

        // --- Financial health insights (no external API) ---
        savingsRate() {
            const inc = this.monthlyIncome();
            if (inc === 0) return 0;
            const remaining = this.monthlyRemaining();
            return Math.max(0, (remaining / inc) * 100);
        },
        healthScore() {
            let score = 50;
            const rate = this.savingsRate();
            if (rate >= 20) score = 85 + Math.min(15, rate - 20);
            else if (rate >= 10) score = 65 + (rate - 10);
            else if (rate >= 5) score = 45 + (rate - 5);
            else score = 20 + rate;
            const essential = this.essentialExpenseRatio();
            if (essential < 0.5) score += 5; else if (essential > 0.8) score -= 10;
            return Math.min(100, Math.max(0, score));
        },
        healthLabel() {
            const score = this.healthScore();
            if (score >= 80) return "🔥 Excellent financial shape";
            if (score >= 60) return "👍 Healthy habits — keep going!";
            if (score >= 40) return "⚠️ Room for improvement";
            return "🚨 Needs attention — small steps help";
        },
        essentialExpenseRatio() {
            const essentialCats = new Set(['Rent','Utilities','Bills','Health','Food']);
            const totalExp = this.monthlyExpenses();
            if (totalExp === 0) return 0.5;
            const essentialSum = this.transactions.filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0,7)) && essentialCats.has(t.category)).reduce((s,t)=>s+t.amount,0);
            return essentialSum / totalExp;
        },
        savingsAdvice() {
            const rate = this.savingsRate();
            if (rate >= 20) return "🌟 Great! You're saving 20%+. Keep automating savings.";
            if (rate >= 10) return "💪 Good start. Try to cut 5% more from non‑essentials.";
            if (rate > 0) return "📈 You're saving, but aim for at least 10% of income.";
            return "⚠️ No savings this month. Consider reducing dining/entertainment by 15%.";
        },
        smartTips() {
            const tips = [];
            const monthExp = this.monthlyExpenses();
            const monthInc = this.monthlyIncome();
            const essentialRatio = this.essentialExpenseRatio();
            if (monthInc === 0 && this.transactions.length === 0) return [];
            if (monthInc > 0 && monthExp > monthInc) tips.push({ icon: "⚠️", message: "Spending exceeds income — review bills & subscriptions immediately." });
            if (essentialRatio < 0.4 && monthExp > 0) tips.push({ icon: "🍿", message: "High 'fun spending' relative to needs. 50/30/20 rule: limit wants to 30% of income." });
            if (essentialRatio > 0.85) tips.push({ icon: "🏠", message: "Essentials dominate budget. Check if rent/utilities can be negotiated down." });
            const foodSpend = this.transactions.filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0,7)) && t.category === 'Food').reduce((s,t)=>s+t.amount,0);
            if (foodSpend > (monthInc * 0.15) && monthInc > 0) tips.push({ icon: "🍔", message: `Food expenses exceed 15% of income. Meal prepping could save ${this.formatMoney(foodSpend*0.2)}.` });
            const entSpend = this.transactions.filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0,7)) && ['Entertainment','Shopping'].includes(t.category)).reduce((s,t)=>s+t.amount,0);
            if (entSpend > 200) tips.push({ icon: "🎮", message: "Entertainment/Shopping above $200. Try a 30-day no-buy challenge." });
            if (this.savingsRate() < 5 && monthInc > 0) tips.push({ icon: "💰", message: "Set up an automatic transfer of 5% to savings each payday." });
            if (tips.length === 0 && this.transactions.length > 3) tips.push({ icon: "✅", message: "Great balance! Keep tracking and maintain a 3–6 month emergency fund." });
            return tips.slice(0,5);
        },

        // --- Data import/export ---
        exportCSV() {
            if (!this.transactions.length) { this.showToast('No data to export', 'error'); return; }
            const csv = Papa.unparse(this.transactions.map(t => ({ amount: t.amount, type: t.type, category: t.category, date: t.date, note: t.note || '' })));
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            a.download = `budjut_export_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
            this.showToast('CSV exported', 'info');
        },
        importCSVFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                Papa.parse(file, {
                    header: true,
                    complete: (results) => {
                        let newEntries = [];
                        for (let row of results.data) {
                            if (row.amount && (row.type === 'income' || row.type === 'expense') && row.category) {
                                let amt = parseFloat(row.amount);
                                if (!isNaN(amt) && amt > 0) {
                                    newEntries.push({
                                        id: Date.now() + Math.random() * 10000,
                                        amount: amt,
                                        type: row.type,
                                        category: row.category,
                                        date: row.date?.match(/\d{4}-\d{2}-\d{2}/) ? row.date : new Date().toISOString().slice(0,10),
                                        note: row.note || ''
                                    });
                                }
                            }
                        }
                        if (newEntries.length) {
                            this.transactions = [...newEntries, ...this.transactions];
                            this.showToast(`✅ Imported ${newEntries.length} transactions`, 'info');
                        } else {
                            this.showToast('No valid rows found', 'error');
                        }
                        this.saveData();
                    }
                });
            };
            input.click();
        },
        backupJSON() {
            const backup = { transactions: this.transactions, settings: this.settings };
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
            a.download = `budjut_backup_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
            this.showToast('JSON backup created', 'info');
        },
        restoreJSON() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const restored = JSON.parse(ev.target.result);
                        if (restored.transactions) this.transactions = restored.transactions;
                        if (restored.settings) {
                            this.settings.currencyCode = restored.settings.currencyCode || 'USD';
                            this.settings.monthlyGoal = restored.settings.monthlyGoal || 0;
                        }
                        this.saveData();
                        this.showToast('Restore complete', 'info');
                    } catch(e) { this.showToast('Invalid file', 'error'); }
                };
                reader.readAsText(file);
            };
            input.click();
        },
        resetAllData() {
            if (confirm('Permanently delete all data?')) {
                this.transactions = [];
                this.settings = { currencyCode: 'USD', monthlyGoal: 0 };
                this.saveData();
                this.showToast('Factory reset done', 'info');
            }
        },

        // --- Share feature (Web Share API) ---
        async shareBudget() {
            const total = this.totalBalance();
            const monthRemaining = this.monthlyRemaining();
            const score = this.healthScore();
            const text = `💰 My monthly budget summary:\n• Total balance: ${this.formatMoney(total)}\n• This month's remaining: ${this.formatMoney(monthRemaining)}\n• Financial health score: ${Math.round(score)}/100\n📊 Tracked with Budjut – smart & private.`;
            try {
                await navigator.share({
                    title: 'Budjut Budget Snapshot',
                    text: text,
                    url: window.location.href
                });
            } catch(e) { /* user cancelled, do nothing */ }
        }
    };
}