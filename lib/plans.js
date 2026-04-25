export const PLANS = [
  {
    id: "free_trial",
    name: "Free Trial",
    price: 0,
    credits: 5,
    tagline: "Try it risk-free",
    features: [
      "5 free credits",
      "Full AI marketing kit generator",
      "All output formats",
      "Save unlimited kits",
    ],
    popular: false,
    cta: "Start Free",
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    credits: 30,
    tagline: "Best for solo agents",
    features: [
      "30 credits per month",
      "All AI formats included",
      "Save & export kits",
      "Email support",
    ],
    popular: false,
    cta: "Choose Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    credits: 120,
    tagline: "Best for active agents",
    features: [
      "120 credits per month",
      "Priority AI generation",
      "All AI formats included",
      "Priority support",
    ],
    popular: true,
    cta: "Choose Pro",
  },
  {
    id: "team",
    name: "Team",
    price: 99,
    credits: 350,
    tagline: "Best for teams & brokerages",
    features: [
      "350 credits per month",
      "Team-friendly workflow",
      "All AI formats included",
      "Dedicated support",
    ],
    popular: false,
    cta: "Choose Team",
  },
];

export function getPlan(id) {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}
