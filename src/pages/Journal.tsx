import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, BookOpen, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJournal } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import { geminiService } from "@/lib/gemini";
import { motion } from "framer-motion";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';

const Journal = () => {
  const [entry, setEntry] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const { entry: todayEntry, addEntry, loading } = useJournal();
  const { toast } = useToast();
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  // Fetch all past entries
  useEffect(() => {
    const fetchAllEntries = async () => {
      setLoadingEntries(true);
      try {
        const { api } = await import('@/lib/api');
        const response = await api.journal.getAll();
        setAllEntries(response.data || []);
      } catch (error) {
        console.error('Error fetching all entries:', error);
      } finally {
        setLoadingEntries(false);
      }
    };
    
    fetchAllEntries();
  }, [todayEntry]); // Refetch when today's entry changes

  // Generate AI journal prompt on mount
  useEffect(() => {
    const generatePrompt = async () => {
      const cachedPrompt = localStorage.getItem('dailyJournalPrompt');
      const cachedDate = localStorage.getItem('dailyJournalPromptDate');
      const today = new Date().toDateString();

      if (cachedPrompt && cachedDate === today) {
        setAiPrompt(cachedPrompt);
        return;
      }

      setLoadingPrompt(true);
      const response = await geminiService.generateJournalPrompt();

      if (response.success) {
        setAiPrompt(response.text);
        localStorage.setItem('dailyJournalPrompt', response.text);
        localStorage.setItem('dailyJournalPromptDate', today);
      }
      setLoadingPrompt(false);
    };

    generatePrompt();
  }, []);

  const handleSaveEntry = async () => {
    try {
      await addEntry({ notes: entry });
      toast({
        title: "Journal entry saved!",
        description: "Your thoughts have been recorded.",
      });
      setEntry("");
    } catch (error) {
      toast({
        title: "Error saving entry",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAffirmation = async () => {
    try {
      await addEntry({ notes: affirmation, mood: 'affirmation' });
      toast({
        title: "Affirmation saved!",
        description: "Your affirmation has been recorded.",
      });
      setAffirmation("");
    } catch (error) {
      toast({
        title: "Error saving affirmation",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const affirmations = [
    "I am worthy of achieving my health and wellness goals",
    "Every healthy choice I make brings me closer to my best self",
    "I have the power to create positive change in my life",
    "My body is strong, capable, and deserves to be nurtured",
    "I celebrate every small victory on my wellness journey"
  ];

  const [dailyAffirmation] = useState(() => 
    affirmations[Math.floor(Math.random() * affirmations.length)]
  );

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
          <Link to="/">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading">Journal</h1>
              <p className="text-muted-foreground text-sm">Reflect and grow daily</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <Tabs defaultValue="journal" className="w-full">
            <TabsList className="w-full bg-card/50 backdrop-blur-sm p-1.5 rounded-3xl mb-6 border border-border/50 shadow-sm">
              <TabsTrigger 
                value="journal"
                className="flex-1 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Journal
              </TabsTrigger>
              <TabsTrigger 
                value="affirmations" 
                className="flex-1 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Affirmations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="journal" className="space-y-6">
              {/* AI Writing Prompt */}
              {!todayEntry && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-6 border border-purple-500/20 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 font-heading">
                        Today's Reflection Prompt
                      </h3>
                      {loadingPrompt ? (
                        <div className="space-y-2">
                          <div className="h-4 bg-purple-500/20 rounded animate-pulse"></div>
                          <div className="h-4 bg-purple-500/20 rounded animate-pulse w-5/6"></div>
                        </div>
                      ) : (
                        <p className="text-purple-800 dark:text-purple-200 leading-relaxed italic">
                          {aiPrompt || "Take a moment to reflect on your wellness journey today..."}
                        </p>
                      )}
                      {aiPrompt && (
                        <p className="text-xs text-purple-600/70 mt-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI-generated prompt
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Today's Entry */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold font-heading">{today}</h2>
                </div>
                
                {todayEntry ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{todayEntry.notes}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>Saved at {new Date(todayEntry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Great job! Come back tomorrow to continue your journey.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Textarea
                        placeholder="How are you feeling today? What are you grateful for? What challenges did you face?"
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        className="min-h-[240px] bg-background/50 border-border/50 rounded-2xl p-5 text-base resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {entry.length} characters
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-12 shadow-glow transition-all hover:shadow-lg disabled:opacity-70"
                      onClick={handleSaveEntry}
                      disabled={!entry.trim() || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Save Entry
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Writing Tips */}
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 shadow-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                <h3 className="text-primary-foreground font-semibold mb-3 flex items-center gap-2 font-heading">
                  <Sparkles className="w-4 h-4" />
                  Writing Tips
                </h3>
                <ul className="space-y-2 text-primary-foreground/90 text-sm relative z-10">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-foreground/60">•</span>
                    <span>Write freely without judgment - this is your safe space</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-foreground/60">•</span>
                    <span>Focus on your emotions, not just events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-foreground/60">•</span>
                    <span>Include gratitude and positive moments from your day</span>
                  </li>
                </ul>
              </div>

              {/* Past Entries */}
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                <h2 className="text-lg font-semibold mb-4 font-heading">Past Entries</h2>
                {loadingEntries ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : allEntries.filter(e => e.mood !== 'affirmation').length > 0 ? (
                  <div className="space-y-3">
                    {allEntries
                      .filter(e => e.mood !== 'affirmation')
                      .slice(0, 10)
                      .map((pastEntry: any) => (
                        <div
                          key={pastEntry.id}
                          className="p-4 bg-secondary/20 rounded-2xl border border-border/50 hover:border-primary/30 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(pastEntry.createdAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                                {pastEntry.mood && pastEntry.mood !== 'affirmation' && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                                    {pastEntry.mood}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground/80 line-clamp-3 group-hover:line-clamp-none transition-all">
                                {pastEntry.content || pastEntry.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      Your journal history will appear here
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      Keep writing to build your collection
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="affirmations" className="space-y-6">
              {/* Daily Affirmation Card */}
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 shadow-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-primary-foreground/80 text-sm font-medium text-center mb-3 font-heading">
                    TODAY'S AFFIRMATION
                  </h3>
                  <p className="text-primary-foreground text-xl font-semibold text-center leading-relaxed font-heading">
                    "{dailyAffirmation}"
                  </p>
                </div>
              </div>

              {/* Create Your Own */}
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                <h2 className="text-lg font-semibold mb-4 font-heading">Create Your Own</h2>
                
                <div className="space-y-4">
                  <Textarea
                    placeholder="Write a personal affirmation that resonates with you..."
                    value={affirmation}
                    onChange={(e) => setAffirmation(e.target.value)}
                    className="min-h-[160px] bg-background/50 border-border/50 rounded-2xl p-5 text-base resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-12 shadow-glow transition-all hover:shadow-lg"
                    onClick={handleSaveAffirmation}
                    disabled={!affirmation.trim() || loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Save Affirmation
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Affirmation Ideas */}
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                <h3 className="font-semibold mb-4 font-heading">Need Inspiration?</h3>
                <div className="space-y-3">
                  {affirmations.filter(a => a !== dailyAffirmation).slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setAffirmation(suggestion)}
                      className="w-full text-left p-4 bg-secondary/30 hover:bg-secondary/50 rounded-2xl transition-all border border-border/50 hover:border-primary/30 group"
                    >
                      <p className="text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                        "{suggestion}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Past Affirmations */}
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                <h2 className="text-lg font-semibold mb-4 font-heading">Your Affirmations</h2>
                {loadingEntries ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : allEntries.filter(e => e.mood === 'affirmation').length > 0 ? (
                  <div className="space-y-3">
                    {allEntries
                      .filter(e => e.mood === 'affirmation')
                      .slice(0, 10)
                      .map((affirmationEntry: any) => (
                        <div
                          key={affirmationEntry.id}
                          className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground font-medium mb-2">
                                "{affirmationEntry.content || affirmationEntry.notes}"
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(affirmationEntry.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      Your saved affirmations will appear here
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      Create positive statements to empower yourself
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Journal;
