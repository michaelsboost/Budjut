window.budgetApp = function budgetApp() {
    return {
        activePanel: null,
        currentMonth: new Date().toISOString().slice(0,7),
        categories: [],
        monthsData: {},
        expandedCategories: [],
        categoryModalOpen: false, editCategoryMode: false, categoryForm: { id: null, name: '', emoji: '📦', type: 'need', planned: 0 },
        expenseModalOpen: false, editExpenseMode: false, expenseForm: { id: null, type: 'expense', name: '', categoryId: '', amount: '', date: new Date().toISOString().slice(0,10), note: '' },
        editIncomeModal: false, tempIncomePlanned: 0,
        ledgerSearch: '', ledgerCategoryFilter: '',
        trendChart: null, categoryChart: null, comparisonChart: null, miniTrendReportsChart: null,
        
        // ========== NEW WEIGHTED SCORE & FACTORS (with rounding) ==========
        get healthScore() {
            let score = 0;
            if (this.actualIncome > 0) {
                let cashRatio = this.cashLeft / this.actualIncome;
                score += Math.max(0, Math.min(30, cashRatio * 100));
            }
            if (this.totalPlanned > 0) {
                let controlRatio = this.totalActual / this.totalPlanned;
                if (controlRatio <= 0.85) score += 25;
                else if (controlRatio <= 1) score += 20;
                else if (controlRatio <= 1.15) score += 12;
                else score += 5;
            }
            let sr = parseFloat(this.savingsRatePercent);
            if (sr >= 20) score += 20;
            else if (sr >= 10) score += 14;
            else if (sr > 0) score += 7;
            if (this.actualIncome > 0) score += this.totalPlanned <= this.actualIncome ? 15 : 5;
            score += Math.max(0, 10 - this.overBudgetCount * 3);
            return Math.round(Math.max(0, Math.min(100, score)));
        },
        get healthLabel() {
            let s = this.healthScore;
            if (s >= 90) return 'Elite';
            if (s >= 75) return 'Strong';
            if (s >= 60) return 'Stable';
            if (s >= 40) return 'Needs Focus';
            return 'At Risk';
        },
        get scoreMotivationMessage() {
            let s = this.healthScore;
            if (s >= 90) return "You're building real momentum. Keep protecting the pattern.";
            if (s >= 75) return "Your money pattern is healthy. Small improvements could make it elite.";
            if (s >= 60) return "You're okay, but the pattern needs tightening.";
            if (s >= 40) return "Your current pattern could create stress later. Start with one adjustment.";
            return "Your money pattern needs attention now. Focus on cash flow and overspending first.";
        },
        // ROUNDED FACTOR POINTS
        get factorCashFlowPoints() { if (this.actualIncome <= 0) return 0; let cashRatio = this.cashLeft / this.actualIncome; return Math.round(Math.max(0, Math.min(30, cashRatio * 100))); },
        get factorCashFlowMsg() { if (this.cashLeft > 0) return `Positive cash left (${this.formatMoney(this.cashLeft)}) gives strong momentum.`; if (this.cashLeft === 0) return `Break-even — try to create a small surplus.`; return `Negative cash flow (${this.formatMoney(this.cashLeft)}) is risky.`; },
        get factorControlPoints() { if (this.totalPlanned <= 0) return 0; let ratio = this.totalActual / this.totalPlanned; if (ratio <= 0.85) return 25; if (ratio <= 1) return 20; if (ratio <= 1.15) return 12; return 5; },
        get factorControlMsg() { let ratio = this.totalActual / this.totalPlanned; if (ratio <= 0.85) return `You're spending ${Math.round((1-ratio)*100)}% under plan — excellent control.`; if (ratio <= 1) return `Spending is within plan — great.`; if (ratio <= 1.15) return `Slightly over plan (${Math.round((ratio-1)*100)}%) — tighten a bit.`; return `Spending is ${Math.round((ratio-1)*100)}% over plan — review categories.`; },
        get factorSavingsPoints() { let sr = parseFloat(this.savingsRatePercent); if (sr >= 20) return 20; if (sr >= 10) return 14; if (sr > 0) return 7; return 0; },
        get factorSavingsMsg() { let sr = parseFloat(this.savingsRatePercent); if (sr >= 20) return `Savings rate ${sr}% — excellent! Keep going.`; if (sr >= 10) return `Savings rate ${sr}% — good, but room to reach 20%.`; if (sr > 0) return `Savings rate ${sr}% — low. Try to increase gradually.`; return `No savings yet. Start with a small automatic transfer.`; },
        get factorBalancePoints() { if (this.actualIncome <= 0) return 0; return this.totalPlanned <= this.actualIncome ? 15 : 5; },
        get factorBalanceMsg() { return this.totalPlanned <= this.actualIncome ? `Planned spending (${this.formatMoney(this.totalPlanned)}) is within income — balanced.` : `Planned spending exceeds income by ${this.formatMoney(this.totalPlanned - this.actualIncome)} — reduce plan or increase income.`; },
        get factorDisciplinePoints() { return Math.max(0, 10 - this.overBudgetCount * 3); },
        get factorDisciplineMsg() { if (this.overBudgetCount === 0) return `No categories over budget — perfect discipline.`; if (this.overBudgetCount === 1) return `1 category over budget — adjust its plan or spending.`; return `${this.overBudgetCount} categories over budget — review them now.`; },
        // NEW: Next Best Move
        get nextBestMove() {
            if (this.actualIncome <= 0) return 'Add income first so Budjut can read your pattern.';
            if (this.cashLeft < 0) return 'Your first move is to stop the cash bleed.';
            if (this.totalActual > this.totalPlanned) return 'Your spending is drifting. Review your top category.';
            if (parseFloat(this.savingsRatePercent) < 10) return 'Your next move is building a small savings habit.';
            if (this.totalPlanned > this.actualIncome) return 'Your plan is too heavy. Trim the budget before the month gets stressful.';
            if (this.healthScore >= 90) return 'Protect the pattern. You are building momentum.';
            return 'Keep tracking. One smart adjustment can push your score higher.';
        },
        
        get circumferenceBigHealth() { let r=52; return 2 * Math.PI * r; },
        get savingsRatePercent() { let inc = this.actualIncome; if (inc <= 0) return '0.00'; let saved = inc - this.totalActual; return Math.max(0, Math.min(100, (saved / inc) * 100)).toFixed(2); },
        get plannedIncome() { return this.monthsData[this.currentMonth]?.incomePlanned || 0; },
        get actualIncome() {
            let m = this.monthsData[this.currentMonth];
            if (!m) return 0;
            return (m.incomeEntries || []).reduce((s, i) => s + i.amount, 0);
        },
        get totalPlanned() { let m=this.monthsData[this.currentMonth]; if(!m) return 0; return this.categories.reduce((s,c)=>s+(m.categoryPlans[c.id]||0),0); },
        get totalActual() { let m=this.monthsData[this.currentMonth]; if(!m) return 0; return m.transactions.reduce((s,t)=>s+t.amount,0); },
        get remainingBudget() { return this.totalPlanned - this.totalActual; },
        get cashLeft() { return this.actualIncome - this.totalActual; },
        get totalRemainingAll() { return this.categories.reduce((s,c)=>s+this.getRemaining(c.id),0); },
        get allCurrentTransactions() { return this.monthsData[this.currentMonth]?.transactions || []; },
        get avgTransactionAmount() { let t=this.allCurrentTransactions; if(t.length===0) return 0; return t.reduce((s,tt)=>s+tt.amount,0)/t.length; },
        get largestTransaction() { let t=this.allCurrentTransactions; if(t.length===0) return null; return t.reduce((max, tx)=> tx.amount > max.amount ? tx : max, t[0]); },
        get totalTransactionsAllTime() { return Object.values(this.monthsData).reduce((sum, month)=> sum + (month.transactions?.length || 0) + (month.incomeEntries?.length || 0), 0); },
        get savedMonthCount() { return Object.keys(this.monthsData).length; },
        get localStorageSize() { let size = new Blob([localStorage.getItem('budjut_data') || '']).size; return size < 1024 ? size + ' B' : (size/1024).toFixed(1)+' KB'; },
        get previousMonthSpend() { let d=new Date(this.currentMonth+'-01'); d.setMonth(d.getMonth()-1); let prevKey=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; return this.monthsData[prevKey]?.transactions.reduce((s,t)=>s+t.amount,0) || 0; },
        get monthOverMonthDifference() { return this.totalActual - this.previousMonthSpend; },
        get monthOverMonthPercent() { let prev=this.previousMonthSpend; if(prev===0) return this.totalActual>0 ? 100 : 0; return (this.monthOverMonthDifference/prev)*100; },
        get plannedVsActualPercent() { if(this.totalPlanned===0) return 0; return Math.round((this.totalActual/this.totalPlanned)*100); },
        get needsSpent() { return this.categories.filter(c => c.type === 'need').reduce((s, c) => s + this.getActual(c.id), 0); },
        get wantsSpent() { return this.categories.filter(c => c.type === 'want').reduce((s, c) => s + this.getActual(c.id), 0); },
        get savingsSpent() { return this.categories.filter(c => c.type === 'savings').reduce((s, c) => s + this.getActual(c.id), 0); },
        get needsPercent() { if (this.actualIncome <= 0) return 0; return Math.round((this.needsSpent / this.actualIncome) * 100); },
        get wantsPercent() { if (this.actualIncome <= 0) return 0; return Math.round((this.wantsSpent / this.actualIncome) * 100); },
        get savingsPercentReal() { if (this.actualIncome <= 0) return 0; return Math.round((this.savingsSpent / this.actualIncome) * 100); },
        get realMonthlySurplus() { return this.actualIncome - this.totalActual; },
        get projectedMonthlySavings() { return this.savingsSpent + Math.max(0, this.realMonthlySurplus); },
        get projectedYearlySavings() { return this.projectedMonthlySavings * 12; },
        get projectionMessage() {
            if (this.actualIncome <= 0) return 'Add income to see your future projection.';
            if (this.projectedMonthlySavings <= 0) return 'At this pace, there is no savings momentum yet. Small spending changes help.';
            return `You saved or kept ${this.formatMoney(this.projectedMonthlySavings)} this month. At this pace, that becomes ${this.formatMoney(this.projectedYearlySavings)} in 12 months.`;
        },
        get topCategories() { return this.categories.map(c=>({id:c.id, name:c.name, emoji:c.emoji, planned:this.getPlanned(c.id), spent:this.getActual(c.id), remaining:this.getRemaining(c.id)})).filter(c=>c.planned>0).sort((a,b)=>b.spent - a.spent).slice(0,3); },
        get overBudgetCount() { return this.categories.filter(c=>this.getRemaining(c.id)<0).length; },
        get topSpendingCategory() { let spends=this.categories.map(c=>({name:c.name, amount:this.getActual(c.id)})).filter(c=>c.amount>0).sort((a,b)=>b.amount-a.amount); return spends[0] || { name: null, amount:0 }; },
        get incomeSegment() { if (this.actualIncome <= 0) return 0; return 100; },
        get actualSegment() { if (this.actualIncome <= 0) return 0; return Math.min(100, Math.round((this.totalActual / this.actualIncome) * 100)); },
        get cashLeftSegment() { if (this.actualIncome <= 0) return 0; let left = Math.max(0, this.actualIncome - this.totalActual); return Math.min(100, Math.round((left / this.actualIncome) * 100)); },
        get allLedgerEntries() {
            let entries = [];
            Object.entries(this.monthsData).forEach(([monthKey, month]) => {
                (month.transactions || []).forEach(tx => { entries.push({ ...tx, type: 'expense', monthKey, displayAmount: -tx.amount }); });
                (month.incomeEntries || []).forEach(tx => { entries.push({ ...tx, type: 'income', categoryId: '', monthKey, displayAmount: tx.amount }); });
            });
            return entries.sort((a,b) => b.date.localeCompare(a.date));
        },
        get filteredLedgerTransactions() {
            let t = this.allLedgerEntries;
            if (this.ledgerCategoryFilter) t = t.filter(tx => tx.categoryId === this.ledgerCategoryFilter);
            if (this.ledgerSearch.trim()) {
                let s = this.ledgerSearch.trim().toLowerCase();
                t = t.filter(tx => tx.name.toLowerCase().includes(s) || tx.type.toLowerCase().includes(s) || this.getCategoryName(tx.categoryId).toLowerCase().includes(s) || (tx.note || '').toLowerCase().includes(s));
            }
            return t;
        },
        getPlanned(catId) { return this.monthsData[this.currentMonth]?.categoryPlans[catId] || 0; },
        getActual(catId) { let m=this.monthsData[this.currentMonth]; if(!m) return 0; return m.transactions.filter(t=>t.categoryId===catId).reduce((s,t)=>s+t.amount,0); },
        getRemaining(catId) { return this.getPlanned(catId)-this.getActual(catId); },
        getProgressWidth(catId) { let p=this.getPlanned(catId); if(p===0) return '0%'; let percent=(this.getActual(catId)/p)*100; return `${Math.min(100,percent)}%`; },
        getProgressColor(catId) { return this.getRemaining(catId)>=0 ? '#10b981' : '#f43f5e'; },
        getCategoryTransactions(catId) { let m=this.monthsData[this.currentMonth]; if(!m) return []; return m.transactions.filter(t=>t.categoryId===catId).sort((a,b)=>b.date.localeCompare(a.date)); },
        getCategoryName(catId) { return this.categories.find(c=>c.id===catId)?.name || 'Uncategorized'; },
        getMonthlyDataArray() {
            let [year, month] = this.currentMonth.split('-').map(Number);
            let months = [];
            for (let i = 2; i >= 0; i--) {
                let m = month - i;
                let y = year;
                while (m <= 0) { m += 12; y--; }
                let key = `${y}-${String(m).padStart(2, '0')}`;
                let date = new Date(y, m - 1, 1);
                let total = this.monthsData[key]?.transactions?.reduce((s, t) => s + t.amount, 0) || 0;
                months.push({ month: key, label: date.toLocaleDateString('en-US', { month: 'short' }), total });
            }
            return months;
        },
        getComparisonData() { let data=[]; for(let cat of this.categories.slice(0,5)) { let p=this.getPlanned(cat.id), a=this.getActual(cat.id); if(p>0||a>0) data.push({name:cat.name, planned:p, actual:a}); } return data; },
        
        persistAndRefresh() { localStorage.setItem('budjut_data', JSON.stringify({categories:this.categories, monthsData:this.monthsData})); this.$forceUpdate(); this.updateMiniTrendReports(); },
        ensureMonthData() {
            if (!this.monthsData[this.currentMonth]) {
                this.monthsData[this.currentMonth] = { incomePlanned: 0, incomeEntries: [], categoryPlans: {}, transactions: [] };
            }
            if (!this.monthsData[this.currentMonth].incomeEntries) this.monthsData[this.currentMonth].incomeEntries = [];
            if (this.monthsData[this.currentMonth].incomeActual !== undefined) {
                this.monthsData[this.currentMonth].incomeEntries.push({ id: Date.now(), name: 'Starting income', amount: this.monthsData[this.currentMonth].incomeActual, date: this.currentMonth + '-01', note: 'Migrated income' });
                delete this.monthsData[this.currentMonth].incomeActual;
            }
            if (this.monthsData[this.currentMonth].incomePlanned === undefined) this.monthsData[this.currentMonth].incomePlanned = 0;
        },
        initApp() { 
            try {
                let stored = localStorage.getItem('budjut_data');
                if (stored) {
                    let d = JSON.parse(stored);
                    this.categories = Array.isArray(d.categories) ? d.categories : [];
                    this.monthsData = d.monthsData && typeof d.monthsData === 'object' ? d.monthsData : {};
                } else {
                    this.categories = [];
                    this.monthsData = {};
                }
            } catch (err) { localStorage.removeItem('budjut_data'); this.categories = []; this.monthsData = {}; }
            this.ensureMonthData();
            this.persistAndRefresh();
            this.switchMonth();
        },
        seedSampleData() { 
            this.categories = [
                { id:'cat1', name:'Rent / Housing', emoji:'🏠', type:'need' },
                { id:'cat2', name:'Groceries', emoji:'🛒', type:'need' },
                { id:'cat3', name:'Transportation', emoji:'🚗', type:'need' },
                { id:'cat4', name:'Utilities / Bills', emoji:'💡', type:'need' },
                { id:'cat5', name:'Restaurants', emoji:'🍔', type:'want' },
                { id:'cat6', name:'Shopping', emoji:'🛍️', type:'want' },
                { id:'cat7', name:'Entertainment', emoji:'🎮', type:'want' },
                { id:'cat8', name:'Savings', emoji:'💰', type:'savings' },
                { id:'cat9', name:'Debt Payoff', emoji:'💳', type:'savings' }
            ];
            let cur=this.currentMonth; 
            this.monthsData[cur] = {
                incomePlanned: 3200,
                incomeEntries: [
                    { id: Date.now()+100, name: 'Paycheck', amount: 2400, date: cur+'-05', note: 'Salary' },
                    { id: Date.now()+101, name: 'Freelance', amount: 450, date: cur+'-20', note: 'Side gig' }
                ],
                categoryPlans: {cat1:1200,cat2:400,cat3:150,cat4:300,cat5:200,cat6:150,cat7:100,cat8:300,cat9:200},
                transactions: [
                    {id:Date.now()+1,name:'Rent',amount:1200,categoryId:'cat1',date:cur+'-01',note:''},
                    {id:Date.now()+2,name:'Groceries',amount:85,categoryId:'cat2',date:cur+'-05',note:'Whole Foods'},
                    {id:Date.now()+3,name:'Gas station',amount:45,categoryId:'cat3',date:cur+'-10',note:''},
                    {id:Date.now()+4,name:'Dinner out',amount:60,categoryId:'cat5',date:cur+'-12',note:'Italian'},
                    {id:Date.now()+5,name:'Electric bill',amount:95,categoryId:'cat4',date:cur+'-15',note:''}
                ]
            };
            let prevMonth = new Date(this.currentMonth+'-01'); prevMonth.setMonth(prevMonth.getMonth()-1); let prevKey = prevMonth.toISOString().slice(0,7);
            if(!this.monthsData[prevKey]) this.monthsData[prevKey]={incomePlanned:3100,incomeEntries:[{id:Date.now()+102,name:'Paycheck',amount:3100,date:prevKey+'-10',note:''}],categoryPlans:{cat1:1200,cat2:400,cat3:150,cat4:300,cat5:200,cat6:150,cat7:100,cat8:300,cat9:200},transactions:[{id:Date.now()+6,name:'Groceries',amount:120,categoryId:'cat2',date:prevKey+'-12',note:''}]};
        },
        loadDummyData() { if (confirm('Load demo data? This will replace your current data.')) { this.categories = []; this.monthsData = {}; this.seedSampleData(); this.ensureMonthData(); this.persistAndRefresh(); alert('Demo data loaded.'); } },
        switchMonth() { this.ensureMonthData(); this.$forceUpdate(); this.updateMiniTrendReports(); this.ledgerSearch=''; this.ledgerCategoryFilter=''; },
        toggleCategoryExpand(id) { if(this.expandedCategories.includes(id)) this.expandedCategories=this.expandedCategories.filter(c=>c!==id); else this.expandedCategories.push(id); },
        openAddCategoryModal() { this.editCategoryMode=false; this.categoryForm={ id:null, name:'', emoji:'📦', type:'need', planned:0 }; this.categoryModalOpen=true; },
        editCategoryDetails(cat) { this.editCategoryMode=true; this.categoryForm={ id:cat.id, name:cat.name, emoji:cat.emoji, type:cat.type, planned:this.getPlanned(cat.id) }; this.categoryModalOpen=true; },
        saveCategory() { if(!this.categoryForm.name.trim()) return; if(this.editCategoryMode){ let idx=this.categories.findIndex(c=>c.id===this.categoryForm.id); if(idx!==-1) this.categories[idx]={...this.categories[idx], name:this.categoryForm.name, emoji:this.categoryForm.emoji, type:this.categoryForm.type }; this.ensureMonthData(); this.monthsData[this.currentMonth].categoryPlans[this.categoryForm.id]=parseFloat(this.categoryForm.planned)||0; } else { let newId='cat_'+Date.now(); this.categories.push({ id:newId, name:this.categoryForm.name, emoji:this.categoryForm.emoji, type:this.categoryForm.type }); this.ensureMonthData(); this.monthsData[this.currentMonth].categoryPlans[newId]=parseFloat(this.categoryForm.planned)||0; } this.categoryModalOpen=false; this.persistAndRefresh(); },
        deleteCategoryAction(catId) { if(Object.values(this.monthsData).some(m=>m.transactions.some(t=>t.categoryId===catId))){alert('Has transactions');return;} this.categories=this.categories.filter(c=>c.id!==catId); for(let m in this.monthsData) delete this.monthsData[m].categoryPlans[catId]; this.persistAndRefresh(); },
        openAddExpense(catId=null) { this.editExpenseMode = false; this.expenseForm = { id: null, type: 'expense', name: '', categoryId: catId || (this.categories[0]?.id || ''), amount: '', date: new Date().toISOString().slice(0,10), note: '' }; this.expenseModalOpen = true; },
        saveExpense() {
            if (!this.expenseForm.name.trim() || !this.expenseForm.amount || parseFloat(this.expenseForm.amount) <= 0) { alert('Invalid'); return; }
            this.ensureMonthData();
            let amt = parseFloat(this.expenseForm.amount);
            let month = this.monthsData[this.currentMonth];
            if (this.expenseForm.type === 'income') {
                month.incomeEntries.push({ id: Date.now(), name: this.expenseForm.name, amount: amt, date: this.expenseForm.date, note: this.expenseForm.note });
            } else {
                month.transactions.push({ id: Date.now(), name: this.expenseForm.name, amount: amt, categoryId: this.expenseForm.categoryId, date: this.expenseForm.date, note: this.expenseForm.note });
            }
            this.expenseModalOpen = false;
            this.persistAndRefresh();
        },
        deleteTransaction(txId) { for (let monthKey in this.monthsData) { let month = this.monthsData[monthKey]; month.transactions = (month.transactions || []).filter(t => t.id !== txId); month.incomeEntries = (month.incomeEntries || []).filter(t => t.id !== txId); } this.persistAndRefresh(); },
        openIncomeModal() { this.tempIncomePlanned = this.plannedIncome; this.editIncomeModal = true; },
        saveMonthlyIncome() { this.ensureMonthData(); this.monthsData[this.currentMonth].incomePlanned = parseFloat(this.tempIncomePlanned) || 0; this.editIncomeModal = false; this.persistAndRefresh(); },
        exportCSV() { let rows=[['Date','Name','Amount','Category','Note']]; let month=this.monthsData[this.currentMonth]; if(month) month.transactions.forEach(tx=>{ let cat=this.getCategoryName(tx.categoryId); let esc=v=>`"${String(v).replace(/"/g,'""')}"`; rows.push([esc(tx.date),esc(tx.name),tx.amount,esc(cat),esc(tx.note||'')]); }); let csv=rows.map(r=>r.join(',')).join('\n'); let a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='budjut_transactions.csv'; a.click(); },
        importCSV(e) { let file=e.target.files[0]; if(!file)return; let reader=new FileReader(); reader.onload=ev=>{ let lines=ev.target.result.split('\n'); for(let i=1;i<lines.length;i++){ let cols=lines[i].match(/(".*?"|[^,]*)(,|$)/g).map(c=>c.replace(/^"|"$/g,'').replace(/""/g,'"').replace(/,$/,'')); if(cols.length<3)continue; let date=cols[0],name=cols[1],amount=parseFloat(cols[2]),catName=cols[3],note=cols[4]||''; if(isNaN(amount))continue; let cat=this.categories.find(c=>c.name===catName); if(!cat)continue; this.ensureMonthData(); this.monthsData[this.currentMonth].transactions.push({id:Date.now()+i,name,amount,categoryId:cat.id,date:date||this.currentMonth+'-01',note}); } this.persistAndRefresh(); alert('Imported'); }; reader.readAsText(file); },
        exportJSON() { let data={categories:this.categories,monthsData:this.monthsData}; let a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})); a.download='budjut_backup.json'; a.click(); },
        restoreJSON(e) { let file=e.target.files[0]; if(!file)return; let reader=new FileReader(); reader.onload=ev=>{ try{let d=JSON.parse(ev.target.result); this.categories=d.categories||[]; this.monthsData=d.monthsData||{}; this.persistAndRefresh(); alert('Restored');}catch(e){alert('Invalid JSON');} }; reader.readAsText(file); },
        factoryReset() { if (confirm('Delete all Budjut data? This cannot be undone.')) { localStorage.removeItem('budjut_data'); this.categories = []; this.monthsData = {}; this.expandedCategories = []; this.ledgerSearch = ''; this.ledgerCategoryFilter = ''; this.activePanel = null; this.ensureMonthData(); this.persistAndRefresh(); alert('All data cleared.'); } },
        async shareApp() {
            const shareData = { title: 'Budjut', text: 'Budjut — money pattern score & smart budgeting.', url: window.location.href };
            try {
                if (navigator.share && window.isSecureContext) { await navigator.share(shareData); return; }
                if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(shareData.url); alert('Budjut link copied to clipboard.'); return; }
                const tempInput = document.createElement('textarea'); tempInput.value = shareData.url; document.body.appendChild(tempInput); tempInput.select(); document.execCommand('copy'); document.body.removeChild(tempInput); alert('Budjut link copied to clipboard.');
            } catch (err) { alert('Sharing is not available here. Try after publishing the app online.'); }
        },
        donateToProject() { window.open('https://michaelsboost.com/donate/', '_blank', 'noopener,noreferrer'); },
        formatMoney(v) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2}).format(v||0); },
        openPanel(panel) { this.activePanel = panel; if(panel === 'reports') this.$nextTick(() => this.updateReportsCharts()); },
        updateReportsCharts() { let tc=document.getElementById('trendChart'); let cc=document.getElementById('categoryChart'); let cmp=document.getElementById('comparisonChart'); if(tc) this.createTrendChart(tc); if(cc) this.createCategoryChart(cc); if(cmp) this.createComparisonChart(cmp); },
        createTrendChart(canvas) { if(this.trendChart) this.trendChart.destroy(); let months=this.getMonthlyDataArray(); this.trendChart=new Chart(canvas,{type:'bar',data:{labels:months.map(m=>m.label),datasets:[{label:'Spending',data:months.map(m=>m.total),backgroundColor:'#3b82f6'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#cbd5e1'}}},scales:{y:{grid:{color:'rgba(148,163,184,0.15)'},ticks:{color:'#94a3b8'}},x:{ticks:{color:'#94a3b8'}}}}}); },
        createCategoryChart(canvas) { if(this.categoryChart) this.categoryChart.destroy(); let spends=this.categories.map(c=>({name:c.name,value:this.getActual(c.id)})).filter(c=>c.value>0); this.categoryChart=new Chart(canvas,{type:'doughnut',data:{labels:spends.map(c=>c.name),datasets:[{data:spends.map(c=>c.value),backgroundColor:['#3b82f6','#10b981','#f59e0b','#f43f5e','#8b5cf6']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#cbd5e1'}}}}}); },
        createComparisonChart(canvas) { if(this.comparisonChart) this.comparisonChart.destroy(); let data=this.getComparisonData(); this.comparisonChart=new Chart(canvas,{type:'bar',data:{labels:data.map(d=>d.name),datasets:[{label:'Planned',data:data.map(d=>d.planned),backgroundColor:'#3b82f6'},{label:'Actual',data:data.map(d=>d.actual),backgroundColor:'#f43f5e'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#cbd5e1'}}},scales:{y:{grid:{color:'rgba(148,163,184,0.15)'},ticks:{color:'#94a3b8'}},x:{ticks:{color:'#94a3b8'}}}}}); },
        updateMiniTrendReports() {
            this.$nextTick(() => {
                let canvas = document.getElementById('miniTrendReports');
                if (!canvas || typeof Chart === 'undefined') return;
                if (this.miniTrendReportsChart) this.miniTrendReportsChart.destroy();
                let months = this.getMonthlyDataArray();
                this.miniTrendReportsChart = new Chart(canvas, { type: 'line', data: { labels: months.map(m=>m.label), datasets: [{ data: months.map(m=>m.total), borderColor: '#f59e0b', borderWidth: 2, fill: true, backgroundColor: 'rgba(245,158,11,0.15)', pointRadius: 0, tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } } });
            });
        }
    }
}