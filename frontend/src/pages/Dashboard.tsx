import { useState, useMemo } from "react";
import {
  FiSearch,
  FiBell,
  FiPlus,
  FiHelpCircle,
  FiLogOut,
  FiGrid,
  FiBookOpen,
  FiTrendingUp,
  FiSettings,
  FiShoppingCart,
  FiPieChart,
  FiChevronDown,
  FiArrowUpRight,
  FiInfo,
  FiShoppingBag,
  FiBriefcase,
  FiCoffee,
  FiDollarSign
} from "react-icons/fi";
import type { Expense } from "../types/Expense";

// Initial seed data from the mockup conforming to the Expense type
const INITIAL_TRANSACTIONS: Expense[] = [
  {
    _id: "1",
    user_id: "user1",
    date: "Oct 24, 2023",
    title: "Apple Store",
    category: "Technology",
    amount: -1299.00,
    description: "Completed"
  },
  {
    _id: "2",
    user_id: "user1",
    date: "Oct 23, 2023",
    title: "Salary Deposit",
    category: "Income",
    amount: 4500.00,
    description: "Received"
  },
  {
    _id: "3",
    user_id: "user1",
    date: "Oct 22, 2023",
    title: "L'Osteria Fine Dining",
    category: "Entertainment",
    amount: -142.50,
    description: "Pending"
  }
];

// Define static details for categories
const CATEGORY_COLORS: Record<string, { dot: string; text: string; bg: string; iconBg: string }> = {
  Technology: { dot: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-900/20", iconBg: "bg-blue-900/30" },
  Income: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-900/20", iconBg: "bg-emerald-900/30" },
  Entertainment: { dot: "bg-rose-400", text: "text-rose-400", bg: "bg-rose-900/20", iconBg: "bg-rose-900/30" },
  Food: { dot: "bg-violet-400", text: "text-violet-400", bg: "bg-violet-900/20", iconBg: "bg-violet-900/30" },
  Utilities: { dot: "bg-teal-400", text: "text-teal-400", bg: "bg-teal-900/20", iconBg: "bg-teal-900/30" },
  Default: { dot: "bg-gray-400", text: "text-gray-400", bg: "bg-gray-900/20", iconBg: "bg-gray-900/30" }
};

export default function Dashboard() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  // Search filter query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Trends chart timeframe: '6m' (6 Months) or '1y' (1 Year)
  const [selectedPeriod, setSelectedPeriod] = useState<"6m" | "1y">("6m");

  // Hover state for SVG Trends chart nodes
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Core local state for transactions (using the imported Expense type)
  const [transactions, setTransactions] = useState<Expense[]>(INITIAL_TRANSACTIONS);

  // Quick Add form states
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("Food");

  // Notifications toggle state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Your Salary Deposit of $4,500.00 was received.",
    "Budget alert: You have reached 62% of your limit.",
  ]);

  // Static budget settings
  const budgetLimit = 5000.00;

  // Compute metrics dynamically based on transactions list
  const metrics = useMemo(() => {
    // Starting values as of seed photo
    // Total Balance = $42,500.00
    // Monthly Spent = $3,120.50
    // Remaining Budget = $1,879.50
    const initialBalance = 42500.00;
    const initialSpent = 3120.50;

    // Sum up any newly added transaction amounts (relative to seed)
    // For newly added items, if amount is negative, it adds to spent, and subtracts from balance.
    // If positive (Income), it adds to balance.
    const addedSpent = transactions
      .filter(t => !INITIAL_TRANSACTIONS.some(init => init._id === t._id))
      .reduce((sum, t) => t.amount < 0 ? sum + Math.abs(t.amount) : sum, 0);

    const addedIncome = transactions
      .filter(t => !INITIAL_TRANSACTIONS.some(init => init._id === t._id))
      .reduce((sum, t) => t.amount > 0 ? sum + t.amount : sum, 0);

    const totalSpent = initialSpent + addedSpent;
    const totalBalance = initialBalance - addedSpent + addedIncome;
    const remainingBudget = Math.max(0, budgetLimit - totalSpent);

    const spentPercentageOfLimit = Math.min(100, Math.round((totalSpent / budgetLimit) * 100));
    const remainingPercentage = Math.max(0, 100 - spentPercentageOfLimit);

    return {
      balance: totalBalance,
      spent: totalSpent,
      remaining: remainingBudget,
      spentPercent: spentPercentageOfLimit,
      remainingPercent: remainingPercentage
    };
  }, [transactions]);

  // Filtered transactions for searching
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  // Quick Add submit handler
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAmount.trim()) return;

    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) return;

    const newTx: Expense = {
      _id: Date.now().toString(),
      user_id: "user1",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      title: formName.trim(),
      category: formCategory,
      // Except for Income, everything is treated as expense (negative amount)
      amount: formCategory === "Income" ? amt : -amt,
      description: "Completed"
    };

    setTransactions(prev => [newTx, ...prev]);

    // Add alert notification
    const categoryLabel = formCategory === "Income" ? "received" : "spent";
    setNotifications(prev => [
      `New transaction "${newTx.title}" saved. $${amt.toFixed(2)} ${categoryLabel}.`,
      ...prev
    ]);

    // Reset form
    setFormName("");
    setFormAmount("");
  };

  // Spending Trends Data coordinates generator
  // We use viewbox 0 0 600 220
  const trendsData = useMemo(() => {
    const data6m = {
      labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"],
      points: [
        { x: 50, y: 155, val: "$1,820.00" },
        { x: 150, y: 165, val: "$1,450.00" },
        { x: 250, y: 115, val: "$3,120.00" },
        { x: 350, y: 170, val: "$1,120.00" },
        { x: 450, y: 55, val: "$4,890.00" },
        { x: 550, y: 110, val: "$3,120.50" }
      ]
    };

    const data1y = {
      labels: ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
      points: [
        { x: 50, y: 120, val: "$2,950.00" },
        { x: 150, y: 80, val: "$4,100.00" },
        { x: 250, y: 145, val: "$2,120.00" },
        { x: 350, y: 70, val: "$4,350.00" },
        { x: 450, y: 130, val: "$2,650.00" },
        { x: 550, y: 50, val: "$4,980.00" }
      ]
    };

    return selectedPeriod === "6m" ? data6m : data1y;
  }, [selectedPeriod]);

  // Generate cubic bezier paths for Trends SVG chart
  const linePath = useMemo(() => {
    const pts = trendsData.points;
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const xm = (p0.x + p1.x) / 2;
      d += ` C ${xm},${p0.y} ${xm},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  }, [trendsData]);

  const fillPath = useMemo(() => {
    const pts = trendsData.points;
    if (pts.length === 0) return "";
    return `${linePath} L ${pts[pts.length - 1].x},200 L ${pts[0].x},200 Z`;
  }, [linePath, trendsData]);

  // Get transaction icons
  const getTransactionIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "technology":
        return <FiShoppingBag className="text-blue-400 text-lg" />;
      case "income":
        return <FiDollarSign className="text-emerald-400 text-lg" />;
      case "entertainment":
        return <FiCoffee className="text-rose-400 text-lg" />;
      case "food":
        return <FiCoffee className="text-violet-400 text-lg" />;
      case "utilities":
        return <FiShoppingCart className="text-teal-400 text-lg" />;
      default:
        return <FiBriefcase className="text-gray-400 text-lg" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0816] text-[#E0DEF7] font-sans flex">
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className="w-72 bg-[#120E22] border-r border-[#241A3A] flex flex-col justify-between p-8 shrink-0 hidden md:flex">
        <div className="space-y-12">
          {/* Logo Brand */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/30">
              <FiPlus className="text-white text-2xl rotate-45" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Finance Pro</span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-3">
            {[
              { name: "Dashboard", icon: <FiGrid className="text-lg" /> },
              { name: "Ledger", icon: <FiBookOpen className="text-lg" /> },
              { name: "Analytics", icon: <FiTrendingUp className="text-lg" /> },
              { name: "Settings", icon: <FiSettings className="text-lg" /> }
            ].map(item => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl font-medium transition duration-300 text-left relative overflow-hidden group ${
                    isActive
                      ? "bg-[#251E38] text-white shadow-md border-r-2 border-violet-500"
                      : "text-[#9E98B3] hover:text-white hover:bg-[#1B1530]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A78BFA] to-[#C084FC] shadow-[0_0_10px_#A78BFA]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Add Shortcut inside sidebar */}
          <button
            onClick={() => {
              const inputField = document.getElementById("txName");
              if (inputField) inputField.focus();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold transition duration-300 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <FiPlus className="text-xl transition-transform duration-300 group-hover:rotate-90" />
            <span>Quick Add</span>
          </button>
        </div>

        {/* Support and Logout */}
        <div className="space-y-4 pt-6 border-t border-[#241A3A]">
          <button className="w-full flex items-center gap-4 px-5 py-3 text-[#9E98B3] hover:text-white rounded-xl transition duration-300">
            <FiHelpCircle className="text-xl" />
            <span className="font-medium">Support</span>
          </button>
          <button className="w-full flex items-center gap-4 px-5 py-3 text-[#9E98B3] hover:text-red-400 rounded-xl transition duration-300">
            <FiLogOut className="text-xl" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* HEADER PANEL */}
        <header className="px-8 md:px-12 py-6 border-b border-[#241A3A] bg-[#120E22]/50 backdrop-blur-md sticky top-0 z-40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
            <p className="text-xs text-[#9E98B3] tracking-widest font-semibold mt-1">GLOBAL OVERVIEW</p>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            {/* Search Input Bar */}
            <div className="relative flex-1 md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search data..."
                className="w-full rounded-2xl bg-[#1D172F] py-3.5 pl-6 pr-14 text-sm text-white placeholder-[#6D6884] outline-none border border-[#2D2345] focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition duration-300 shadow-inner"
              />
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-[#2D2345] flex items-center justify-center hover:bg-violet-600 text-gray-300 hover:text-white transition duration-300">
                <FiSearch className="text-base" />
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="h-12 w-12 rounded-2xl bg-[#1D172F] border border-[#2D2345] flex items-center justify-center hover:bg-[#251E38] hover:text-white transition duration-300 relative text-gray-300 cursor-pointer"
              >
                <FiBell className="text-lg" />
                {notifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-violet-500 rounded-full ring-2 ring-[#1D172F] animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#171228] border border-[#2D2345] p-5 shadow-2xl z-50 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2D2345] pb-2">
                    <span className="font-semibold text-white">Notifications</span>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-[#9E98B3] py-2 text-center">No new notifications</p>
                    ) : (
                      notifications.map((note, index) => (
                        <div key={index} className="text-xs leading-relaxed text-[#D0CCE8] flex items-start gap-2 border-b border-[#2D2345]/50 pb-2">
                          <span className="text-violet-400 mt-0.5">•</span>
                          <span>{note}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-4 bg-[#1D172F] border border-[#2D2345] pl-5 pr-2 py-1.5 rounded-2xl">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white leading-tight">Alex Mercer</p>
                <p className="text-[10px] text-violet-400 tracking-wider font-semibold uppercase mt-0.5">Premium Tier</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"
                alt="Alex Mercer Avatar"
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-violet-500/20"
              />
            </div>
          </div>
        </header>

        {/* MAIN BODY LAYOUT GRID */}
        <div className="px-8 md:px-12 py-8 space-y-8 flex-1">
          
          {/* ==================== STAT METRICS ROW ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Total Balance */}
            <div className="bg-[#120E22] border border-[#241A3A] rounded-3xl p-7 relative overflow-hidden group hover:border-[#38265C] transition duration-500 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#9E98B3]">Total Balance</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center">
                  <FiDollarSign className="text-emerald-400 text-lg" />
                </div>
              </div>
              <h2 className="text-4xl font-extrabold text-white mt-6 tracking-tight">
                ${metrics.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1.5 mt-5 text-sm">
                <FiArrowUpRight className="text-emerald-400 text-base" />
                <span className="font-semibold text-emerald-400">+2.4%</span>
                <span className="text-[#9E98B3]">vs last month</span>
              </div>
            </div>

            {/* Card 2: Monthly Spent */}
            <div className="bg-[#120E22] border border-[#241A3A] rounded-3xl p-7 relative overflow-hidden group hover:border-[#38265C] transition duration-500 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#9E98B3]">Monthly Spent</span>
                <div className="w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-900/30 flex items-center justify-center">
                  <FiShoppingCart className="text-violet-400 text-lg" />
                </div>
              </div>
              <h2 className="text-4xl font-extrabold text-white mt-6 tracking-tight">
                ${metrics.spent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1.5 mt-5 text-sm">
                <FiArrowUpRight className="text-orange-400 text-base" />
                <span className="font-semibold text-orange-400">+12%</span>
                <span className="text-[#9E98B3]">higher than avg</span>
              </div>
            </div>

            {/* Card 3: Remaining Budget */}
            <div className="bg-[#120E22] border border-[#241A3A] rounded-3xl p-7 relative overflow-hidden group hover:border-[#38265C] transition duration-500 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#9E98B3]">Remaining Budget</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center">
                  <FiPieChart className="text-indigo-400 text-lg" />
                </div>
              </div>
              <h2 className="text-4xl font-extrabold text-white mt-6 tracking-tight">
                ${metrics.remaining.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              
              {/* Progress Slider */}
              <div className="mt-5 space-y-2">
                <div className="w-full h-2 rounded-full bg-[#1C172E] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_8px_#8B5CF6] transition-all duration-1000"
                    style={{ width: `${metrics.remainingPercent}%` }}
                  />
                </div>
                <div className="text-xs text-[#9E98B3]">
                  {metrics.spentPercent}% of limit reached
                </div>
              </div>
            </div>

          </div>

          {/* ==================== CHARTS GRID ROW ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Spending Trends Line Chart Card */}
            <div className="lg:col-span-2 bg-[#120E22] border border-[#241A3A] rounded-3xl p-7 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white tracking-tight">Spending Trends</h3>
                
                {/* 6 Months / 1 Year time period toggle */}
                <div className="flex items-center bg-[#1D172F] p-1 rounded-xl border border-[#2D2345]">
                  <button
                    onClick={() => setSelectedPeriod("6m")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition duration-300 ${
                      selectedPeriod === "6m"
                        ? "bg-[#251E38] text-white shadow-sm"
                        : "text-[#9E98B3] hover:text-white"
                    }`}
                  >
                    6 Months
                  </button>
                  <button
                    onClick={() => setSelectedPeriod("1y")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition duration-300 ${
                      selectedPeriod === "1y"
                        ? "bg-[#251E38] text-white shadow-sm"
                        : "text-[#9E98B3] hover:text-white"
                    }`}
                  >
                    1 Year
                  </button>
                </div>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="relative mt-8 h-56 w-full group/chart select-none">
                <svg
                  viewBox="0 0 600 220"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    {/* Glow and Area Gradients */}
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#C084FC" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="40" y1="50" x2="560" y2="50" stroke="#241A3A" strokeDasharray="5 5" />
                  <line x1="40" y1="110" x2="560" y2="110" stroke="#241A3A" strokeDasharray="5 5" />
                  <line x1="40" y1="170" x2="560" y2="170" stroke="#241A3A" strokeDasharray="5 5" />

                  {/* Filled Gradient Area Path */}
                  <path d={fillPath} fill="url(#areaGradient)" className="transition-all duration-700 ease-in-out" />

                  {/* Bezier Line Path */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    className="transition-all duration-700 ease-in-out"
                  />

                  {/* Interactive Nodes */}
                  {trendsData.points.map((pt, idx) => (
                    <g key={idx} className="cursor-pointer">
                      {/* Invisible hover zone */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="18"
                        fill="transparent"
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />
                      {/* Visual node marker */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPointIndex === idx ? "7" : "4.5"}
                        fill="#FFFFFF"
                        stroke="#8B5CF6"
                        strokeWidth="3.5"
                        className="transition-all duration-200 shadow-md pointer-events-none"
                      />
                      
                      {/* Vertical line indicator on hover */}
                      {hoveredPointIndex === idx && (
                        <line
                          x1={pt.x}
                          y1={pt.y}
                          x2={pt.x}
                          y2="200"
                          stroke="#8B5CF6"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          className="pointer-events-none"
                        />
                      )}
                    </g>
                  ))}
                </svg>

                {/* Custom Tooltip absolute bubble */}
                {hoveredPointIndex !== null && (
                  <div
                    className="absolute bg-[#1A142A] border border-violet-500/50 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-200"
                    style={{
                      left: `${(trendsData.points[hoveredPointIndex].x / 600) * 100}%`,
                      top: `${(trendsData.points[hoveredPointIndex].y / 220) * 100 - 8}%`
                    }}
                  >
                    <span className="text-[#9E98B3] mr-1.5">{trendsData.labels[hoveredPointIndex]}:</span>
                    {trendsData.points[hoveredPointIndex].val}
                  </div>
                )}
              </div>

              {/* X Axis Month Labels */}
              <div className="flex justify-between px-6 mt-4 border-t border-[#241A3A] pt-4">
                {trendsData.labels.map((label, idx) => (
                  <span key={idx} className="text-xs font-bold text-[#6D6884]">{label}</span>
                ))}
              </div>
            </div>

            {/* Spending Category Doughnut Chart Card */}
            <div className="bg-[#120E22] border border-[#241A3A] rounded-3xl p-7 flex flex-col justify-between shadow-lg">
              <h3 className="text-xl font-bold text-white tracking-tight">Spending Category</h3>
              
              {/* Doughnut SVG Container */}
              <div className="relative flex justify-center items-center my-6">
                <svg viewBox="0 0 120 120" className="w-44 h-44 transform -rotate-90">
                  <circle cx="60" cy="60" r="40" fill="transparent" stroke="#1D172F" strokeWidth="8" />
                  
                  {/* Food (40%): Segment size 100.5, rotated to start around 1 o'clock (-40 deg) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="transparent"
                    stroke="#8B5CF6"
                    strokeWidth="8"
                    strokeDasharray="98 251.3"
                    strokeLinecap="round"
                    className="transition-all duration-1000 origin-center"
                    transform="rotate(-40 60 60)"
                  />
                  {/* Utilities (25%): Segment size 62.8, offset to start right after Food */}
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeDasharray="59 251.3"
                    strokeLinecap="round"
                    className="transition-all duration-1000 origin-center"
                    transform="rotate(93 60 60)"
                  />
                  {/* Entertainment (20%): Segment size 50.3, offset */}
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="transparent"
                    stroke="#F43F5E"
                    strokeWidth="8"
                    strokeDasharray="47 251.3"
                    strokeLinecap="round"
                    className="transition-all duration-1000 origin-center"
                    transform="rotate(185 60 60)"
                  />
                </svg>

                {/* Text centered inside the donut hole */}
                <div className="absolute text-center">
                  <p className="text-[11px] text-[#9E98B3] uppercase tracking-wider font-semibold">Top Spent</p>
                  <p className="text-2xl font-black text-white mt-0.5">Food</p>
                </div>
              </div>

              {/* Doughnut Legend details */}
              <div className="space-y-3.5 border-t border-[#241A3A] pt-4">
                {[
                  { name: "Food", percent: "40%", dot: "bg-violet-500" },
                  { name: "Utilities", percent: "25%", dot: "bg-emerald-400" },
                  { name: "Entertainment", percent: "20%", dot: "bg-rose-400" }
                ].map(cat => (
                  <div key={cat.name} className="flex items-center justify-between text-sm font-semibold">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.dot}`} />
                      <span className="text-[#9E98B3]">{cat.name}</span>
                    </div>
                    <span className="text-white">{cat.percent}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ==================== TRANSACTIONS & QUICK ADD ROW ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Transactions List Card */}
            <div className="lg:col-span-2 bg-[#120E22] border border-[#241A3A] rounded-3xl p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#241A3A]">
                  <h3 className="text-xl font-bold text-white tracking-tight">Recent Transactions</h3>
                  <button className="text-sm font-bold text-violet-400 hover:text-violet-300 transition duration-300">
                    View All Ledger
                  </button>
                </div>

                {/* Transactions Grid Table */}
                <div className="mt-6 space-y-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="text-[11px] font-bold text-[#6D6884] uppercase tracking-widest border-b border-[#241A3A]/40 pb-3">
                        <th className="pb-4 font-bold">Date</th>
                        <th className="pb-4 font-bold">Merchant / Category</th>
                        <th className="pb-4 font-bold text-right">Amount</th>
                        <th className="pb-4 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#241A3A]/20">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-sm text-[#9E98B3]">
                            No transactions matching search found.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map(tx => {
                          const config = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Default;
                          const isIncome = tx.amount > 0;
                          return (
                            <tr key={tx._id} className="group hover:bg-[#1A142D]/20 transition duration-200">
                              {/* Date Column */}
                              <td className="py-4.5 text-sm font-semibold text-[#9E98B3]">{tx.date}</td>
                              
                              {/* Merchant / Category */}
                              <td className="py-4.5">
                                <div className="flex items-center gap-4">
                                  <div className={`w-11 h-11 rounded-2xl ${config.iconBg} flex items-center justify-center shrink-0`}>
                                    {getTransactionIcon(tx.category)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white leading-snug">{tx.title}</p>
                                    <p className="text-xs text-[#9E98B3] mt-0.5">{tx.category}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Amount (Income positive vs Expense negative) */}
                              <td className={`py-4.5 text-right text-sm font-extrabold ${isIncome ? "text-emerald-400" : "text-white"}`}>
                                {isIncome ? "+" : "-"}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* Status Badges */}
                              <td className="py-4.5 text-center">
                                <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${
                                  tx.description === "Received"
                                    ? "bg-emerald-950/40 border border-emerald-900/30 text-emerald-400"
                                    : tx.description === "Completed"
                                    ? "bg-[#251E38] border border-[#2D2345] text-[#9E98B3]"
                                    : "bg-[#2D2034] border border-[#442D4B] text-orange-400"
                                }`}>
                                  {tx.description || "Completed"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Add Form & Dynamic Alert */}
            <div className="bg-[#120E22] border border-[#241A3A] rounded-3xl p-7 flex flex-col justify-between shadow-lg space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Quick Add</h3>
              
              {/* Form Input fields */}
              <form onSubmit={handleSaveTransaction} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="txName" className="text-xs font-bold text-[#9E98B3] uppercase tracking-wider">Transaction Name</label>
                  <input
                    id="txName"
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Netflix Subscription"
                    className="w-full rounded-2xl bg-[#1D172F] py-3.5 px-5 text-sm text-white placeholder-[#6D6884] outline-none border border-[#2D2345] focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition duration-300 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="txAmount" className="text-xs font-bold text-[#9E98B3] uppercase tracking-wider">Amount</label>
                    <input
                      id="txAmount"
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={formAmount}
                      onChange={e => setFormAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-2xl bg-[#1D172F] py-3.5 px-5 text-sm text-white placeholder-[#6D6884] outline-none border border-[#2D2345] focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition duration-300 shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="txCategory" className="text-xs font-bold text-[#9E98B3] uppercase tracking-wider">Category</label>
                    <div className="relative">
                      <select
                        id="txCategory"
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value)}
                        className="w-full rounded-2xl bg-[#1D172F] py-3.5 pl-5 pr-10 text-sm text-white outline-none border border-[#2D2345] focus:border-violet-500 transition duration-300 appearance-none shadow-inner cursor-pointer"
                      >
                        <option value="Food">Food</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Technology">Technology</option>
                        <option value="Income">Income</option>
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Submission Button */}
                <button
                  type="submit"
                  className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition duration-300 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  Save Transaction
                </button>
              </form>

              {/* Informational Alert Box (Allowance limit indicator) */}
              <div className="bg-[#132A26] border border-[#1C5248]/30 rounded-2xl p-4.5 flex items-start gap-4 text-emerald-400">
                <FiInfo className="text-lg shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed font-semibold">
                  You have used <span className="font-extrabold text-white text-sm">{metrics.spentPercent}%</span> of your monthly allowance.
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}