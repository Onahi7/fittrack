export interface MotivationalQuote {
  text: string;
  author?: string;
  category: 'motivation' | 'nutrition' | 'fitness' | 'mindset' | 'success';
}

export interface NutritionTip {
  title: string;
  content: string;
  icon: string;
  category: 'hydration' | 'meals' | 'general' | 'energy';
}

export const motivationalQuotes: MotivationalQuote[] = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "motivation"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    category: "success"
  },
  {
    text: "Your body can stand almost anything. It's your mind that you have to convince.",
    category: "mindset"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "motivation"
  },
  {
    text: "The only bad workout is the one that didn't happen.",
    category: "fitness"
  },
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
    category: "mindset"
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    category: "success"
  },
  {
    text: "You don't have to be extreme, just consistent.",
    category: "motivation"
  },
  {
    text: "Progress, not perfection.",
    category: "mindset"
  },
  {
    text: "Every meal is a chance to nourish your body.",
    category: "nutrition"
  },
  {
    text: "Strive for progress, not perfection.",
    category: "motivation"
  },
  {
    text: "The difference between try and triumph is a little 'umph'.",
    category: "motivation"
  },
  {
    text: "Your health is an investment, not an expense.",
    category: "mindset"
  },
  {
    text: "The body achieves what the mind believes.",
    category: "mindset"
  },
  {
    text: "It's not about perfect. It's about effort. And when you implement that effort into your life, that's where transformation happens.",
    category: "success"
  }
];

export const nutritionTips: NutritionTip[] = [
  {
    title: "Hydration First",
    content: "Start your day with a glass of water. Your body loses water overnight, and morning hydration kickstarts your metabolism.",
    icon: "💧",
    category: "hydration"
  },
  {
    title: "Protein Power",
    content: "Include protein in every meal to stay full longer and support muscle recovery. Aim for palm-sized portions.",
    icon: "🥩",
    category: "meals"
  },
  {
    title: "Colorful Plates",
    content: "Eat the rainbow! Different colored vegetables provide different nutrients. Aim for at least 3 colors per meal.",
    icon: "🌈",
    category: "meals"
  },
  {
    title: "Portion Control",
    content: "Use your hand as a guide: palm = protein, fist = veggies, cupped hand = carbs, thumb = fats.",
    icon: "✋",
    category: "meals"
  },
  {
    title: "Meal Timing",
    content: "Try to eat within an hour of waking up to jumpstart your metabolism and avoid energy crashes.",
    icon: "⏰",
    category: "energy"
  },
  {
    title: "Mindful Eating",
    content: "Eat slowly and without distractions. It takes 20 minutes for your brain to register fullness.",
    icon: "🧘",
    category: "general"
  },
  {
    title: "Pre-Plan Success",
    content: "Meal prep on Sundays. Having healthy options ready reduces the temptation for quick, unhealthy choices.",
    icon: "📋",
    category: "meals"
  },
  {
    title: "Fiber is Your Friend",
    content: "Aim for 25-30g of fiber daily. It keeps you full, aids digestion, and stabilizes blood sugar.",
    icon: "🌾",
    category: "general"
  },
  {
    title: "Smart Snacking",
    content: "Choose snacks that combine protein and fiber like apple with almond butter or Greek yogurt with berries.",
    icon: "🍎",
    category: "meals"
  },
  {
    title: "Water Before Meals",
    content: "Drink a glass of water 30 minutes before meals. It aids digestion and can help prevent overeating.",
    icon: "💧",
    category: "hydration"
  },
  {
    title: "Sleep & Nutrition Link",
    content: "Poor sleep increases hunger hormones. Aim for 7-9 hours to support your nutrition goals.",
    icon: "😴",
    category: "general"
  },
  {
    title: "Healthy Fats",
    content: "Don't fear fats! Avocados, nuts, and olive oil support hormone production and keep you satisfied.",
    icon: "🥑",
    category: "meals"
  }
];

export const successStories = [
  {
    name: "Sarah M.",
    achievement: "Lost 45 lbs in 6 months",
    story: "Daily tracking and accountability made all the difference. I finally feel in control!",
    streak: 180,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200"
  },
  {
    name: "James K.",
    achievement: "Gained 15 lbs of muscle",
    story: "The meal tracking helped me hit my protein goals consistently. Game changer!",
    streak: 120,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"
  },
  {
    name: "Maria L.",
    achievement: "365-day check-in streak",
    story: "One year of daily check-ins! The habit became my favorite part of the day.",
    streak: 365,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
  }
];

export function getDailyQuote(): MotivationalQuote {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % motivationalQuotes.length;
  return motivationalQuotes[index];
}

export function getDailyTip(): NutritionTip {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % nutritionTips.length;
  return nutritionTips[index];
}

export function getRandomSuccessStory() {
  const randomIndex = Math.floor(Math.random() * successStories.length);
  return successStories[randomIndex];
}
