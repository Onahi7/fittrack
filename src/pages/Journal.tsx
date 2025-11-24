import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Journal = () => {
  const [entry, setEntry] = useState("");
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  const pastEntries = [
    { date: 'July 25, 2024', preview: 'Had a really productive day today. I managed to...' },
    { date: 'July 24, 2024', preview: 'Feeling a bit tired, but I\'m proud I stuck to...' },
    { date: 'July 23, 2024', preview: 'Today\'s affirmation was "I am capable of...' },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">My Journal</h1>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="w-full bg-secondary/50 p-1 rounded-3xl mb-6">
            <TabsTrigger 
              value="affirmations" 
              className="flex-1 rounded-2xl data-[state=active]:bg-card data-[state=active]:shadow-card"
            >
              Affirmations
            </TabsTrigger>
            <TabsTrigger 
              value="journal"
              className="flex-1 rounded-2xl data-[state=active]:bg-card data-[state=active]:shadow-card"
            >
              Journal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-6">
            {/* Today's Entry */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Today, {today}</h2>
              
              <Textarea
                placeholder="How are you feeling today?"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                className="min-h-[200px] bg-card border-border rounded-3xl p-6 text-base resize-none focus:border-primary transition-smooth"
              />
              
              <Button 
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow"
              >
                Save Entry
              </Button>
            </div>

            {/* Past Entries */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Past Entries</h2>
              <div className="space-y-3">
                {pastEntries.map((entry, index) => (
                  <div 
                    key={index}
                    className="bg-card rounded-2xl p-5 shadow-card border border-border hover:border-primary transition-smooth cursor-pointer"
                  >
                    <p className="text-sm text-muted-foreground mb-2">{entry.date}</p>
                    <p className="text-foreground">{entry.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="affirmations" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Daily Affirmation</h2>
              
              <div className="bg-gradient-primary rounded-3xl p-8 shadow-glow mb-6">
                <p className="text-primary-foreground text-xl font-semibold text-center leading-relaxed">
                  "I am capable of achieving my health goals, one day at a time."
                </p>
              </div>

              <Textarea
                placeholder="Write your own affirmation..."
                className="min-h-[150px] bg-card border-border rounded-3xl p-6 text-base resize-none focus:border-primary transition-smooth"
              />
              
              <Button 
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow"
              >
                Save Affirmation
              </Button>
            </div>

            {/* Past Affirmations */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Past Affirmations</h2>
              <div className="space-y-3">
                {pastEntries.map((entry, index) => (
                  <div 
                    key={index}
                    className="bg-card rounded-2xl p-5 shadow-card border border-border"
                  >
                    <p className="text-sm text-muted-foreground mb-2">{entry.date}</p>
                    <p className="text-foreground italic">"{entry.preview}"</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Journal;
