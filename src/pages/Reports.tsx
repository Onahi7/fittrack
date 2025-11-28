import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, TrendingUp, Award, Target, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion } from "framer-motion";

const Reports = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/progress">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold font-heading">Reports & Analytics</h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Coming Soon Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary to-accent rounded-3xl p-8 shadow-glow text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 font-heading">
                Advanced Analytics Coming Soon
              </h2>
              <p className="text-white/80 leading-relaxed max-w-md mx-auto">
                We're building detailed insights and reports to help you track your wellness journey better. Stay tuned!
              </p>
            </div>
          </motion.div>

          {/* Planned Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50"
          >
            <h3 className="text-lg font-semibold mb-4 font-heading">What's Coming</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Weight Trends</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your weight changes over time with detailed charts and projections
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Activity Heatmaps</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize your daily habits and consistency patterns
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Goal Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor your progress towards your health and fitness goals
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Achievements Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Celebrate your milestones and unlock new achievements
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">PDF Export</h4>
                  <p className="text-sm text-muted-foreground">
                    Download comprehensive reports to share with your healthcare provider
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Current Alternative */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50 text-center"
          >
            <p className="text-muted-foreground mb-4">
              In the meantime, check out your current progress
            </p>
            <Link to="/progress">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow px-8">
                View Progress
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Reports;
