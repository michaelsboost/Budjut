function budjutApp() {
    return {
        expenses: [],
        weeklyPay: 350,
        monthlyIncome: 1516.67,
        formName: '',
        formAmount: '',
        editingId: null,
        csvHasHeader: true,
        importMessage: '',
        importMessageType: 'success',
        monthCalculationNote: '',

        get totalExpenses() {
            return this.expenses.reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : parseFloat(e.amount) || 0), 0);
        },
        get remaining() {
            return this.monthlyIncome - this.totalExpenses;
        },

        saveToLocalStorage() {
            const state = {
                expenses: this.expenses,
                weeklyPay: this.weeklyPay,
                monthlyIncome: this.monthlyIncome
            };
            localStorage.setItem('budjut_app_data', JSON.stringify(state));
        },

        loadFromLocalStorage() {
            const raw = localStorage.getItem('budjut_app_data');
            if (!raw) return false;
            try {
                const data = JSON.parse(raw);
                this.expenses = data.expenses || [];
                this.expenses = this.expenses.map(e => ({ ...e, amount: parseFloat(e.amount) || 0 }));
                this.weeklyPay = data.weeklyPay ?? 350;
                this.monthlyIncome = data.monthlyIncome ?? 1516.67;
                return true;
            } catch(e) { return false; }
        },

        shareApp() {
            if (navigator.share) {
                navigator.share({
                    title: 'Budjut Budget Planner',
                    text: 'Take control of my weekly income & expenses!',
                    url: window.location.href,
                }).catch(e => { if (e.name !== 'AbortError') console.warn(e); });
            } else {
                alert('✨ Copy this link to share Budjut with friends!');
            }
        },

        updateFromWeeklyPay() {
            if (this.weeklyPay > 0) {
                this.monthlyIncome = parseFloat((this.weeklyPay * (52 / 12)).toFixed(2));
                this.monthCalculationNote = `💰 Weekly $${this.weeklyPay} → approx. $${this.monthlyIncome.toFixed(2)} / month`;
                this.saveToLocalStorage();
            } else {
                this.monthCalculationNote = '';
            }
        },

        updateFromMonthlyIncome() {
            if (this.monthlyIncome > 0) {
                if (this.weeklyPay > 0) {
                    const impliedWeekly = this.monthlyIncome / (52 / 12);
                    this.monthCalculationNote = `📊 monthly set: equivalent weekly ≈ $${impliedWeekly.toFixed(2)}`;
                }
                this.saveToLocalStorage();
            }
        },

        init() {
            const loaded = this.loadFromLocalStorage();
            if (!loaded || !this.expenses.length) {
                this.loadDefaultExpenses();
            }
            if (this.weeklyPay && (!this.monthlyIncome || this.monthlyIncome === 0)) {
                this.updateFromWeeklyPay();
            }
            if (!this.monthlyIncome) this.monthlyIncome = 1516.67;
            this.saveToLocalStorage();
        },

        loadDefaultExpenses() {
            this.expenses = [
                { id: this.generateId(), name: 'Rent', amount: 850 },
                { id: this.generateId(), name: 'Gas', amount: 60 },
                { id: this.generateId(), name: 'Electric', amount: 100 },
                { id: this.generateId(), name: 'Cell Phone', amount: 45 },
                { id: this.generateId(), name: 'Groceries', amount: 200 }
            ];
        },

        generateId() {
            return Date.now() + '-' + Math.random().toString(36).substr(2, 8);
        },

        addExpense() {
            const name = this.formName.trim();
            let amount = parseFloat(this.formAmount);
            if (!name) { alert('Please enter an expense name.'); return; }
            if (isNaN(amount) || amount <= 0) { alert('Amount must be a positive number.'); return; }
            this.expenses.push({ id: this.generateId(), name, amount });
            this.resetFormFields();
            this.saveToLocalStorage();
        },

        deleteExpense(id) {
            if (confirm('Delete this expense permanently?')) {
                this.expenses = this.expenses.filter(e => e.id !== id);
                if (this.editingId === id) this.cancelEdit();
                this.saveToLocalStorage();
            }
        },

        startEdit(expense) {
            this.editingId = expense.id;
            this.formName = expense.name;
            this.formAmount = expense.amount;
        },

        updateExpense() {
            if (!this.editingId) return;
            const updatedName = this.formName.trim();
            const updatedAmount = parseFloat(this.formAmount);
            if (!updatedName) { alert('Expense name cannot be empty.'); return; }
            if (isNaN(updatedAmount) || updatedAmount <= 0) { alert('Amount must be a positive number.'); return; }
            const index = this.expenses.findIndex(e => e.id === this.editingId);
            if (index !== -1) {
                this.expenses[index] = { ...this.expenses[index], name: updatedName, amount: updatedAmount };
                this.saveToLocalStorage();
            }
            this.cancelEdit();
        },

        cancelEdit() {
            this.editingId = null;
            this.resetFormFields();
        },

        resetFormFields() {
            this.formName = '';
            this.formAmount = '';
        },

        clearAllExpenses() {
            if (this.expenses.length === 0) return;
            if (confirm('⚠️ Delete ALL expenses? This action cannot be undone.')) {
                this.expenses = [];
                this.cancelEdit();
                this.saveToLocalStorage();
            }
        },

        resetToDefaults() {
            if (confirm('Reset to default budget: Rent $850, Gas $60, Electric $100, Cell $45, Groceries $200 and weekly pay $350?')) {
                this.loadDefaultExpenses();
                this.weeklyPay = 350;
                this.updateFromWeeklyPay();
                this.cancelEdit();
                this.saveToLocalStorage();
                this.importMessage = '';
            }
        },

        exportToCSV() {
            if (!this.expenses.length) { alert('No expenses to export.'); return; }
            const headers = ['Name', 'Amount'];
            const rows = this.expenses.map(exp => {
                let name = exp.name.includes(',') ? `"${exp.name}"` : exp.name;
                return `${name},${exp.amount.toFixed(2)}`;
            });
            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = 'budjut_expenses.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },

        handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => this.parseCSVAndImport(e.target.result);
            reader.onerror = () => this.showImportMessage('Error reading file', 'error');
            reader.readAsText(file);
            event.target.value = '';
        },

        parseCSVAndImport(csvText) {
            if (!csvText.trim()) { this.showImportMessage('CSV file is empty.', 'error'); return; }
            if (!confirm('⚠️ Import will REPLACE all current expenses with CSV data. Continue?')) return;
            const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length === 0) { this.showImportMessage('No data rows found.', 'error'); return; }
            let startIndex = this.csvHasHeader ? 1 : 0;
            if (this.csvHasHeader && lines.length < 2) { this.showImportMessage('CSV has only header, no data rows.', 'error'); return; }
            const newExpenses = [];
            let errorCount = 0;
            for (let i = startIndex; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line === '') continue;
                let splitIndex = line.indexOf(',');
                if (splitIndex === -1) { errorCount++; continue; }
                let namePart = line.substring(0, splitIndex).trim();
                let amountPart = line.substring(splitIndex + 1).trim();
                if (namePart.startsWith('"') && namePart.endsWith('"')) namePart = namePart.slice(1, -1);
                let amount = parseFloat(amountPart);
                if (isNaN(amount) || amount <= 0 || namePart === '') { errorCount++; continue; }
                newExpenses.push({ id: this.generateId(), name: namePart, amount });
            }
            if (newExpenses.length === 0) { this.showImportMessage('No valid expenses found. Use format: Name,Amount', 'error'); return; }
            this.expenses = newExpenses;
            this.cancelEdit();
            this.saveToLocalStorage();
            let msg = `✅ Imported ${newExpenses.length} expenses.`;
            if (errorCount > 0) msg += ` Skipped ${errorCount} invalid row(s).`;
            this.showImportMessage(msg, 'success');
        },

        downloadExampleCSV() {
            const exampleRows = [['Name', 'Amount'], ['Internet', '65.00'], ['Gym Membership', '45.50'], ['Coffee Shop', '30.00']];
            const csvExample = exampleRows.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvExample], { type: 'text/csv' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = 'example_expenses.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },

        showImportMessage(msg, type) {
            this.importMessage = msg;
            this.importMessageType = type;
            setTimeout(() => { if (this.importMessage === msg) this.importMessage = ''; }, 4300);
        }
    };
}