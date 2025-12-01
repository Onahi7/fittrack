import { ArrowLeft, HelpCircle, MessageCircle, Mail, Book, ExternalLink, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';

const faqs = [
  {
    question: "How do I log a meal?",
    answer: "Navigate to 'Log Meal' from the home screen. You can manually enter meal details, scan a barcode, or use AI to analyze a photo of your food."
  },
  {
    question: "What are Fittrack Points?",
    answer: "Fittrack Points are earned by completing daily tasks like logging meals, drinking water, journaling, and checking in. They unlock achievements and help track your consistency."
  },
  {
    question: "How does the streak system work?",
    answer: "Your streak increases each day you complete your daily check-in. Missing a day resets your streak to zero. Premium members can use 'Streak Freeze' to protect their streak."
  },
  {
    question: "Can I track intermittent fasting?",
    answer: "Yes! Use the Fasting Timer feature to track your fasting windows. It includes preset fasting schedules (16:8, 18:6, 20:4) and custom timers."
  },
  {
    question: "How do I add a buddy?",
    answer: "Go to the Buddies section and search for friends using their username or email. You can also invite friends who aren't on the app yet."
  },
  {
    question: "What's the difference between Free and Premium?",
    answer: "Premium includes AI meal planning, unlimited progress photos, advanced analytics, streak freeze, priority support, and ad-free experience. Check the Premium page for full details."
  },
  {
    question: "How do I change my goals?",
    answer: "Visit your Profile, tap 'Edit Profile', and update your health goals, target weight, or calorie targets."
  },
  {
    question: "Is my data secure?",
    answer: "Yes! All data is encrypted and stored securely. We never share your personal information with third parties. Read our Privacy Policy for more details."
  },
  {
    question: "Can I export my data?",
    answer: "Yes! Go to Profile > Reports to download PDF or CSV exports of your progress data, meal logs, and analytics."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can manage your subscription in Profile > Premium. Cancellations take effect at the end of your billing period."
  }
];

const supportChannels = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team",
    action: "Start Chat",
    available: "Mon-Fri, 9AM-6PM WAT"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "support@fittrac.me",
    action: "Send Email",
    available: "24-48 hour response time"
  },
  {
    icon: Book,
    title: "User Guide",
    description: "Complete app documentation",
    action: "View Guide",
    available: "Available anytime"
  }
];

export default function Help() {
  const navigate = useNavigate();

  const handleContactSupport = (type: string) => {
    if (type === 'email') {
      window.location.href = 'mailto:support@fittrac.me';
    } else if (type === 'guide') {
      window.open('https://docs.intentional.app', '_blank');
    }
    // Chat would open a live chat widget
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <Button variant="ghost" size="icon" className="mb-4" onClick={() => navigate('/profile')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold font-heading">Help & Support</h1>
          <p className="text-muted-foreground mt-1">Get answers and assistance</p>
        </div>

        <div className="px-6 space-y-6">
          {/* Contact Support */}
          <div className="grid gap-4 sm:grid-cols-3">
            {supportChannels.map((channel) => (
              <div 
                key={channel.title} 
                className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-card border border-border/50 hover:shadow-glow hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                onClick={() => handleContactSupport(channel.title.toLowerCase().replace(' ', ''))}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <channel.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{channel.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{channel.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">{channel.available}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-heading">FAQ</h2>
                <p className="text-sm text-muted-foreground">Common questions</p>
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50 last:border-0">
                  <AccordionTrigger className="text-left hover:text-primary transition-colors py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* App Version */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">App Version</span>
              <span className="font-medium bg-secondary/50 px-3 py-1 rounded-full">1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-4">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">November 2025</span>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </PageTransition>
  );
}
