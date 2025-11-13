import CurrentYear from "@/components/current-year";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HomeHeader } from "@/components/home-header";
import {
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  Brain,
  Mic,
  PenTool,
  BookOpen,
  Headphones,
  CheckCircle2,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  // If user is authenticated, redirect to dashboard

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Scoring",
      description:
        "Get instant, accurate feedback on your responses using advanced AI technology",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "All 22 Question Types",
      description:
        "Practice every PTE Academic question type with unlimited attempts",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description:
        "Track your progress with comprehensive score breakdowns and insights",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Users,
      title: "Teacher Mode",
      description:
        "Link with teachers to monitor student progress and provide guidance",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const questionTypes = [
    { name: "Read Aloud", icon: Mic, category: "Speaking", count: "6-7" },
    {
      name: "Repeat Sentence",
      icon: Mic,
      category: "Speaking",
      count: "10-12",
    },
    { name: "Describe Image", icon: Mic, category: "Speaking", count: "5-6" },
    { name: "Re-tell Lecture", icon: Mic, category: "Speaking", count: "2-3" },
    {
      name: "Answer Short Question",
      icon: Mic,
      category: "Speaking",
      count: "5-6",
    },
    {
      name: "Summarize Written Text",
      icon: PenTool,
      category: "Writing",
      count: "2",
    },
    { name: "Essay", icon: PenTool, category: "Writing", count: "1" },
    {
      name: "Reading: Fill in Blanks",
      icon: BookOpen,
      category: "Reading",
      count: "5-6",
    },
    {
      name: "Multiple Choice Multiple",
      icon: BookOpen,
      category: "Reading",
      count: "2-3",
    },
    {
      name: "Re-order Paragraphs",
      icon: BookOpen,
      category: "Reading",
      count: "2-3",
    },
    {
      name: "Summarize Spoken Text",
      icon: Headphones,
      category: "Listening",
      count: "1",
    },
    {
      name: "Multiple Choice Multiple",
      icon: Headphones,
      category: "Listening",
      count: "2-3",
    },
  ];

  const stats = [
    { label: "Practice Questions", value: "5000+", icon: BookOpen },
    { label: "Active Students", value: "10K+", icon: Users },
    { label: "Average Score Improvement", value: "+15", icon: TrendingUp },
    { label: "Success Rate", value: "94%", icon: Award },
  ];

  return (
    <main className="min-h-screen">
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950/30">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

        {/* Floating orbs with enhanced animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 -right-48 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute -bottom-32 -left-48 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "8s", animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold mb-8 border border-blue-300/30 dark:border-blue-700/30 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
            <Sparkles className="h-4 w-4 animate-pulse" />
            AI-Powered PTE Preparation Platform
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
            Master PTE Academic with
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              AI-Powered Practice
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Practice all{" "}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              22 PTE question types
            </span>
            , get instant AI feedback, and track your progress with detailed
            analytics. Achieve your target score faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl shadow-blue-500/50 dark:shadow-blue-500/30 hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 rounded-2xl font-bold"
            >
              <Link href="/sign-up">
                Start Free Practice
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-10 py-7 border-2 border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 hover:scale-105 rounded-2xl font-semibold shadow-xl"
            >
              <Link href="/dashboard">View Demo</Link>
            </Button>
          </div>

          {/* Stats - Enhanced with glassmorphism */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="group relative text-center p-6 rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative py-32 bg-white dark:bg-gray-950"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.03),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 bg-blue-100/80 dark:bg-blue-900/30 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-400 mb-6 border border-blue-200/50 dark:border-blue-800/30">
              ✨ Powerful Features
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools and features designed to help you achieve your
              target PTE score
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2 group"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${feature.gradient
                        .split(" ")[1]
                        ?.replace("from-", "")
                        ?.replace("-500", "-500/10")} 0%, ${feature.gradient
                        .split(" ")[2]
                        ?.replace("to-", "")
                        ?.replace("-500", "-500/10")} 100%)`,
                    }}
                  ></div>
                  <CardContent className="relative pt-10 pb-10 px-6">
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Question Types Section */}
      <section
        id="question-types"
        className="relative py-32 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-950/20"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 bg-purple-100/80 dark:bg-purple-900/30 rounded-full text-sm font-semibold text-purple-700 dark:text-purple-400 mb-6 border border-purple-200/50 dark:border-purple-800/30">
              📚 Complete Coverage
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Practice All PTE Question Types
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Master every section with our comprehensive question bank
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {questionTypes.map((type, idx) => {
              const Icon = type.icon;
              const colors: Record<string, string> = {
                Speaking: "bg-gradient-to-br from-blue-500 to-cyan-500",
                Writing: "bg-gradient-to-br from-green-500 to-emerald-500",
                Reading: "bg-gradient-to-br from-purple-500 to-pink-500",
                Listening: "bg-gradient-to-br from-orange-500 to-red-500",
              };
              const bgColors: Record<string, string> = {
                Speaking:
                  "from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10",
                Writing:
                  "from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10",
                Reading:
                  "from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10",
                Listening:
                  "from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10",
              };

              return (
                <Card
                  key={idx}
                  className={`group relative overflow-hidden hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-1 border-0 bg-gradient-to-br ${
                    bgColors[type.category]
                  }`}
                >
                  <CardContent className="relative p-7">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`p-3 rounded-xl ${
                            colors[type.category]
                          } shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                            {type.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {type.category}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 rounded-full border border-gray-200/50 dark:border-gray-700/50">
                        {type.count}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="px-10 py-7 text-lg rounded-2xl border-2 font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Link href="/academic/pte-practice-test">
                View All Question Types
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "10s" }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "12s", animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-sm font-semibold text-white mb-8 border border-white/30">
            🚀 Ready to Excel?
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight">
            Ready to Achieve Your
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
              Target Score?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Join thousands of students who have improved their PTE scores with
            our AI-powered platform
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-12">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg px-12 py-7 bg-white text-blue-600 hover:bg-gray-100 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
            >
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-12 py-7 bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 hover:bg-white/20 font-bold rounded-2xl hover:scale-105 transition-all duration-300"
            >
              <Link href="/dashboard">Try Demo</Link>
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-10 text-white/95">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">No credit card required</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Unlimited practice</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Instant AI feedback</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center mb-4">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="ml-3 text-xl font-bold text-white">
                  Pedagogist&apos;s PTE
                </span>
              </Link>
              <p className="text-sm text-gray-400 mb-4">
                AI-powered PTE Academic preparation platform. Practice all
                question types and achieve your target score.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/academic/pte-practice-test"
                    className="hover:text-white transition-colors"
                  >
                    Practice Tests
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mock-tests"
                    className="hover:text-white transition-colors"
                  >
                    Mock Tests
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="hover:text-white transition-colors"
                  >
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    PTE Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Speaking Tips
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Writing Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                © <CurrentYear /> Pedagogist&apos;s PTE. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">YouTube</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
