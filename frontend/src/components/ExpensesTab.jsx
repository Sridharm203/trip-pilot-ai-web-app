import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaCalculator, FaChartPie, FaPlus, FaTrash, FaCheck, FaExclamationTriangle, FaRobot } from 'react-icons/fa';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../services/api';

const ExpensesTab = ({ trip, readOnly = false }) => {
  const [expenses, setExpenses] = useState(trip.expenses || []);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(trip.start_date || '');
  const [adding, setAdding] = useState(false);

  // AI analysis states
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const categories = ['Food', 'Transport', 'Hotel', 'Shopping', 'Entertainment', 'Emergency'];
  const COLORS = {
    Food: '#FF6B6B',
    Transport: '#4DABF7',
    Hotel: '#37B24D',
    Shopping: '#FCC419',
    Entertainment: '#AE3EC9',
    Emergency: '#E03131'
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || adding) return;

    setAdding(true);
    try {
      const response = await api.post('trips/expenses/', {
        trip: trip.id,
        category,
        amount: parseFloat(amount),
        description,
        date
      });
      // Append locally
      setExpenses([response.data, ...expenses]);
      setAmount('');
      setDescription('');
      // Trigger local analysis reset so user knows to re-audit
      setAnalysis('');
    } catch (err) {
      console.error(err);
      alert("Failed to add expense.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense log?")) return;
    try {
      await api.delete(`trips/expenses/${expenseId}/`);
      setExpenses(expenses.filter(e => e.id !== expenseId));
      setAnalysis('');
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense.");
    }
  };

  const triggerAIAudit = async () => {
    setAnalyzing(true);
    setAnalysis('');
    try {
      const response = await api.get(`trips/${trip.id}/analyze-expenses/`);
      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
      setAnalysis("### AI Audit Error\nFailed to review budget. Try adding more expenses first!");
    } finally {
      setAnalyzing(false);
    }
  };

  // Metrics
  const totalBudget = parseFloat(trip.budget);
  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const remaining = totalBudget - totalSpent;
  const overBudget = remaining < 0;

  // Chart data 1: Category allocations
  const categoryDataMap = {};
  expenses.forEach(e => {
    categoryDataMap[e.category] = (categoryDataMap[e.category] || 0) + parseFloat(e.amount);
  });
  const categoryChartData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    value: categoryDataMap[key]
  }));

  // Chart data 2: Daily trends
  const dailyDataMap = {};
  expenses.forEach(e => {
    dailyDataMap[e.date] = (dailyDataMap[e.date] || 0) + parseFloat(e.amount);
  });
  const dailyChartData = Object.keys(dailyDataMap)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(key => ({
      date: key,
      amount: dailyDataMap[key]
    }));

  return (
    <div className="animate-fade-in-up">
      <h4 className="fw-bold mb-1">Expense Tracker</h4>
      <p className="text-muted small mb-4">Monitor allocations, view charts, and request AI budget audits</p>

      {/* Balance Grid */}
      <div className="row g-3 mb-4 text-center">
        <div className="col-md-4">
          <div className="card border-0 bg-light p-4 rounded-4 shadow-sm h-100">
            <small className="text-muted uppercase fw-bold d-block mb-1">Trip Budget</small>
            <span className="fs-3 fw-bold text-dark">${totalBudget.toLocaleString()}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-light p-4 rounded-4 shadow-sm h-100">
            <small className="text-muted uppercase fw-bold d-block mb-1">Total Expenses</small>
            <span className="fs-3 fw-bold text-primary">${totalSpent.toLocaleString()}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className={`card border-0 p-4 rounded-4 shadow-sm h-100 ${overBudget ? 'bg-danger-subtle text-danger-emphasis' : 'bg-success-subtle text-success-emphasis'}`}>
            <small className="uppercase fw-bold d-block mb-1">Remaining Balance</small>
            <span className="fs-3 fw-bold">
              {overBudget ? `-$${Math.abs(remaining).toLocaleString()}` : `$${remaining.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Log Form and Expense List */}
        <div className="col-lg-7">
          {/* Add Expense Form */}
          {!readOnly && (
            <div className="card border-0 glass-card p-4 mb-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <FaPlus className="text-primary" />
                <span>Log New Expense</span>
              </h6>
              <form onSubmit={handleAddExpense} className="row g-3">
                <div className="col-md-4 col-6">
                  <label className="form-label small fw-semibold">Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    className="form-control" 
                    placeholder="e.g. 24.50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                  />
                </div>
                <div className="col-md-4 col-6">
                  <label className="form-label small fw-semibold">Category</label>
                  <select 
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required 
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Description</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Lunch at Old Town Bistro"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary w-100" disabled={adding}>
                    {adding ? "Adding Log..." : "Add Expense"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Expense Log list */}
          <div className="card border-0 glass-card p-4">
            <h6 className="fw-bold text-dark mb-3">Spending Log</h6>
            {expenses.length > 0 ? (
              <div className="table-responsive" style={{ maxHeight: '350px' }}>
                <table className="table table-hover align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th className="text-end">Amount</th>
                      {!readOnly && <th className="text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td>{exp.date}</td>
                        <td>
                          <span 
                            className="badge text-white px-2.5 py-1.5 rounded"
                            style={{ backgroundColor: COLORS[exp.category] || '#6c757d' }}
                          >
                            {exp.category}
                          </span>
                        </td>
                        <td>{exp.description || '—'}</td>
                        <td className="text-end fw-bold text-dark">${parseFloat(exp.amount).toFixed(2)}</td>
                        {!readOnly && (
                          <td className="text-center">
                            <button 
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="btn btn-link text-danger p-1"
                              title="Delete Log"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 bg-light rounded-4">
                <p className="text-muted small mb-0">No expenses logged yet. Add your first cost log above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts & AI Analysis */}
        <div className="col-lg-5">
          {/* Charts Panel */}
          {expenses.length > 0 && (
            <div className="card border-0 glass-card p-4 mb-4">
              <h6 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                <FaChartPie className="text-info" />
                <span>Allocation & Daily Trend</span>
              </h6>
              
              <div className="mb-4" style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {dailyChartData.length > 0 && (
                <div style={{ height: '160px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyChartData}>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* AI Expense Analysis Panel */}
          {!readOnly && (
            <div className="card border-0 p-4 rounded-4 text-white shadow-sm" style={{ background: 'var(--gradient-dark)' }}>
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FaRobot className="text-info" />
                <span>AI Co-Pilot Budget Review</span>
              </h6>
              <p className="small text-white-50 mb-4">
                Let Gemini audit your spending categories and suggest optimization measures.
              </p>

              {analysis ? (
                <div className="bg-white text-dark p-3.5 rounded-4 small mb-3 overflow-auto" style={{ maxHeight: '250px' }}>
                  {analysis.split('\n').map((line, idx) => {
                    if (line.startsWith('###')) {
                      return <h6 className="fw-bold mt-2" key={idx}>{line.replace('###', '')}</h6>;
                    }
                    if (line.startsWith('-')) {
                      return <li className="ms-2 mb-1" key={idx}>{line.replace('-', '').trim()}</li>;
                    }
                    return <p className="mb-2" key={idx}>{line}</p>;
                  })}
                </div>
              ) : null}

              <button 
                onClick={triggerAIAudit}
                className="btn btn-info text-dark w-100 fw-bold py-2.5"
                disabled={analyzing || expenses.length === 0}
              >
                {analyzing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Auditing Expenses...
                  </>
                ) : (
                  "Audit Budget with AI"
                )}
              </button>
              {expenses.length === 0 && (
                <small className="text-white-50 d-block text-center mt-2.5 small">
                  Add at least one expense to enable AI audit.
                </small>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesTab;
