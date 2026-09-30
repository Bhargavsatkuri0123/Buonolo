import { useEffect, useState } from "react";
import { ArrowLeft, DollarSign, PiggyBank } from "lucide-react";
import { Profile, Theme } from "../types";

interface CostOfLivingPlannerProps {
  profile: Profile;
  T: Theme;
  onBack: () => void;
}

const categories = [
  ["housing", "Rent & housing"],
  ["utilities", "Utilities"],
  ["food", "Groceries & dining"],
  ["transit", "Transportation"],
  ["health", "Health insurance"],
  ["phone", "Phone & internet"],
  ["leisure", "Leisure"],
  ["other", "Other"],
] as const;

type Category = typeof categories[number][0];
type CityBudget = { name: string; income: number; expenses: Record<Category, number> };
type PlannerState = { currency: string; cities: [CityBudget, CityBudget] };

const emptyExpenses = (): Record<Category, number> => ({
  housing: 0,
  utilities: 0,
  food: 0,
  transit: 0,
  health: 0,
  phone: 0,
  leisure: 0,
  other: 0,
});

const createInitialState = (city: string): PlannerState => ({
  currency: "EUR",
  cities: [
    { name: city, income: 0, expenses: emptyExpenses() },
    { name: "Compare city", income: 0, expenses: emptyExpenses() },
  ],
});

export const CostOfLivingPlanner = ({ profile, T, onBack }: CostOfLivingPlannerProps) => {
  const storageKey = `meet-peanut-cost-planner-${profile.id || "guest"}`;
  const [plan, setPlan] = useState<PlannerState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) as PlannerState : createInitialState(profile.city || "Current city");
    } catch {
      return createInitialState(profile.city || "Current city");
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(plan));
    } catch {
      // Keep the planner usable when browser storage is unavailable.
    }
  }, [plan, storageKey]);

  const currency = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0,
  });

  const updateCity = (index: 0 | 1, update: Partial<CityBudget>) => {
    setPlan(current => ({
      ...current,
      cities: current.cities.map((city, cityIndex) => cityIndex === index ? { ...city, ...update } : city) as PlannerState["cities"],
    }));
  };

  const monthlyTotal = (city: CityBudget) => Object.values(city.expenses).reduce((sum, amount) => sum + amount, 0);
  const monthlyRemainder = (city: CityBudget) => city.income - monthlyTotal(city);
  const inputClass = `w-full rounded-lg border ${T.line} ${T.input} px-3 py-2 text-sm ${T.text} outline-none focus:border-orange-500`;

  return (
    <section className="pb-24">
      <header className="mb-5 flex items-center gap-3">
        <button onClick={onBack} aria-label="Back to tools" className={`p-2 rounded-lg border ${T.line} ${T.card} ${T.text}`}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className={`text-xl font-bold ${T.text}`}>Cost of Living Planner</h2>
          <p className={`text-sm ${T.sub}`}>Monthly budget comparison</p>
        </div>
      </header>

      <div className={`mb-4 flex items-center gap-3 rounded-xl border ${T.line} ${T.card} p-4`}>
        <DollarSign size={18} className="text-emerald-600" />
        <label className={`text-sm font-semibold ${T.text}`} htmlFor="budget-currency">Currency</label>
        <select
          id="budget-currency"
          value={plan.currency}
          onChange={event => setPlan(current => ({ ...current, currency: event.target.value }))}
          className={`ml-auto rounded-lg border ${T.line} ${T.input} px-3 py-2 text-sm ${T.text}`}
        >
          {["EUR", "USD", "GBP", "JPY", "CAD", "AUD", "INR"].map(currencyCode => <option key={currencyCode}>{currencyCode}</option>)}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {plan.cities.map((city, index) => {
          const cityIndex = index as 0 | 1;
          const remainder = monthlyRemainder(city);
          return (
            <article key={cityIndex} className={`min-w-0 rounded-xl border ${T.line} ${T.card} p-4`}>
              <label className={`mb-4 block text-sm font-bold ${T.text}`}>
                City
                <input
                  value={city.name}
                  onChange={event => updateCity(cityIndex, { name: event.target.value })}
                  className={`${inputClass} mt-1`}
                  aria-label={`City ${index + 1}`}
                />
              </label>
              <label className={`mb-4 block text-sm font-semibold ${T.text}`}>
                Monthly take-home income
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={city.income || ""}
                  onChange={event => updateCity(cityIndex, { income: Math.max(0, Number(event.target.value) || 0) })}
                  className={`${inputClass} mt-1`}
                />
              </label>

              <div className="space-y-2">
                {categories.map(([key, label]) => (
                  <label key={key} className={`flex items-center gap-3 text-sm ${T.text}`}>
                    <span className="min-w-0 flex-1">{label}</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={city.expenses[key] || ""}
                      onChange={event => updateCity(cityIndex, {
                        expenses: { ...city.expenses, [key]: Math.max(0, Number(event.target.value) || 0) },
                      })}
                      aria-label={`${label} in ${city.name || `city ${index + 1}`}`}
                      className={`w-32 rounded-lg border ${T.line} ${T.input} px-3 py-2 text-right text-sm ${T.text} outline-none focus:border-orange-500`}
                    />
                  </label>
                ))}
              </div>

              <div className={`mt-4 border-t ${T.line} pt-3`}>
                <div className={`flex justify-between text-sm ${T.sub}`}>
                  <span>Estimated monthly expenses</span>
                  <span>{currency.format(monthlyTotal(city))}</span>
                </div>
                <div className={`mt-2 flex items-center justify-between font-bold ${remainder < 0 ? "text-red-600" : "text-emerald-700 dark:text-emerald-400"}`}>
                  <span className="flex items-center gap-2"><PiggyBank size={17} /> Remaining</span>
                  <span>{currency.format(remainder)}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className={`mt-4 rounded-xl border ${T.line} ${T.card} p-4`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${T.sub}`}>Monthly difference</p>
        <p className={`mt-1 text-lg font-bold ${T.text}`}>
          {currency.format(monthlyTotal(plan.cities[1]) - monthlyTotal(plan.cities[0]))} in expenses
        </p>
      </div>
    </section>
  );
};