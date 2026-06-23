"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Globe, 
  FileText, 
  Trash2, 
  Factory,
  BarChart3,
  CheckCircle2,
  Settings,
  Database,
  Search,
  MessageSquare,
  Activity,
  Zap,
  Lock,
  Smartphone,
  Play
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0F] text-slate-200 selection:bg-blue-500/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=2500" // A beautiful modern city skyline
            alt="Hero Background"
            fill
            className="object-cover opacity-50"
            priority
          />
          {/* Gradient Overlay for the dark fade effect at the bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0F]/30 via-[#0B0B0F]/60 to-[#0B0B0F] z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0B0B0F]/50 to-[#0B0B0F] z-10" />
        </div>

        <div className="container mx-auto px-4 relative z-20 text-center flex flex-col items-center">
          
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium text-white mb-6 tracking-tight max-w-5xl leading-[1.1]">
            Report Issues. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Transform Your City.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            CivicBridge unites residents and local authorities by providing 
            real-time issue tracking. Report potholes, faulty lighting, and more to 
            drive direct community improvement.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)]"
            >
              Start Reporting <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#learn-more"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-full text-sm font-medium transition-all backdrop-blur-md flex items-center gap-2"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURE SPLIT SECTION --- */}
      <section className="py-24 relative z-10 container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-medium text-white mb-6 leading-tight">
              Track civic issues in <br /> one single place
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed font-light">
              CivicBridge offers a centralized dashboard to track, manage, and resolve all community reports seamlessly. Stop relying on scattered emails and fragmented systems. Empower citizens and authorities with a unified platform for direct communication and efficient problem solving.
            </p>
            
            <div className="space-y-4">
              {[
                { title: "Customizable database", icon: <Database className="w-5 h-5 text-blue-400" /> },
                { title: "Advanced search filters", icon: <Search className="w-5 h-5 text-emerald-400" /> },
                { title: "Real-time activity logs", icon: <Activity className="w-5 h-5 text-purple-400" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    {item.icon}
                  </div>
                  <span className="text-slate-200 font-medium">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="bg-[#13131A] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
              
              <div className="space-y-3 relative z-10">
                {[
                  { name: "Pothole Repair", status: "In Progress", date: "Today, 10:42 AM", priority: "High" },
                  { name: "Street Light Outage", status: "Resolved", date: "Yesterday, 2:15 PM", priority: "Medium" },
                  { name: "Park Maintenance", status: "Open", date: "Jun 18, 9:00 AM", priority: "Low" },
                  { name: "Water Leak", status: "In Progress", date: "Jun 17, 4:30 PM", priority: "Critical" },
                  { name: "Illegal Dumping", status: "Resolved", date: "Jun 15, 11:20 AM", priority: "High" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${row.status === 'Resolved' ? 'bg-emerald-500' : row.status === 'In Progress' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                      <span className="text-sm font-medium text-slate-200">{row.name}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-xs text-slate-400">
                      <span className="w-24">{row.date}</span>
                      <span className="w-20 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-center">{row.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIAL / USED BY SECTION --- */}
      <section className="py-24 border-y border-white/5 bg-[#0a0a0d]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-2xl font-medium text-white mb-4">Trusted by over 400+<br/>communities nationwide.</h3>
            <p className="text-slate-400">Join the growing network of smart cities improving resident satisfaction through transparency.</p>
          </div>
          
          <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden shadow-[0_0_50px_-15px_rgba(255,255,255,0.05)] border border-white/10 group">
            <Image
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=1600"
              alt="Testimonial Video Placeholder"
              width={1600}
              height={900}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white group-hover:scale-110">
                  <Play className="w-6 h-6 ml-1" />
                </button>
              </div>
              <div className="relative z-10 max-w-2xl">
                <p className="text-xl md:text-3xl font-medium text-white mb-6 leading-tight">
                  "CivicBridge transformed how we respond to constituent needs. Response times dropped by 40%, and our community feels more heard and engaged than ever before."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                    <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" alt="Avatar" width={48} height={48} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Michael Foster</h4>
                    <p className="text-sm text-slate-400">City Planner, Metropolis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- LIGHT / BENTO GRID SECTION --- */}
      <section className="py-24 bg-[#F8F9FA] text-[#0B0B0F]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">Modernizing civic workflows, <br/> from the ground up.</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Equip your municipality with the tools needed to resolve issues faster and communicate transparently with every resident.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-[400px]">
              <div className="flex-1 bg-slate-50 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden border border-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                <div className="bg-white shadow-lg border border-slate-100 rounded-lg p-4 z-10 w-3/4">
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-50 rounded w-full" />
                    <div className="h-2 bg-slate-50 rounded w-4/5" />
                    <div className="h-2 bg-slate-50 rounded w-5/6" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">Automated routing</h3>
              <p className="text-slate-500 text-sm">Reports are instantly categorized and routed to the correct department without manual sorting.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-[400px]">
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden border border-blue-100/50">
                <div className="flex items-center gap-4 z-10">
                  <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="h-px w-8 bg-blue-200" />
                  <div className="w-16 h-16 rounded-full bg-blue-600 shadow-md shadow-blue-600/20 flex items-center justify-center text-white">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">Verified access</h3>
              <p className="text-slate-500 text-sm">Role-based permissions ensure that sensitive reports and internal communications stay secure.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-[400px]">
              <div className="flex-1 bg-slate-50 rounded-xl mb-6 p-6 border border-slate-100 relative overflow-hidden">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-32 bg-white shadow-xl rounded-l-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><MessageSquare className="w-4 h-4"/></div>
                    <div className="h-3 bg-slate-100 rounded w-24" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-50 rounded w-full" />
                    <div className="h-2 bg-slate-50 rounded w-5/6" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">Real-time updates</h3>
              <p className="text-slate-500 text-sm">Residents receive automatic status notifications via email or SMS when their report is updated.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-[400px]">
              <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl mb-6 flex items-end justify-center overflow-hidden border border-slate-200/50">
                 <div className="w-3/4 h-3/4 bg-white rounded-t-2xl shadow-[0_-10px_40px_rgb(0,0,0,0.05)] border-t border-x border-slate-100 p-4 flex flex-col gap-2">
                    <div className="w-full h-8 bg-slate-50 rounded-md" />
                    <div className="w-full h-8 bg-slate-50 rounded-md" />
                    <div className="w-full h-8 bg-blue-50 rounded-md border border-blue-100" />
                 </div>
              </div>
              <h3 className="text-xl font-medium mb-2">Actionable insights</h3>
              <p className="text-slate-500 text-sm">Generate visual reports on response times, recurring issues, and budget allocation instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CENTER TEXT SECTION --- */}
      <section className="py-32 container mx-auto px-4 text-center max-w-4xl relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
        
        <h2 className="text-3xl md:text-5xl font-medium text-white leading-tight mb-8">
          Bridge the gap between citizens and local government. CivicBridge is built for scale.
        </h2>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of engaged citizens today. Report, upvote, and track issues to improve your town directly from your fingertips.
        </p>
        
      </section>

   
      {/* --- CORE FEATURES GLOW CARDS --- */}
      <section className="py-32 container mx-auto px-4 max-w-6xl relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">Built for the future. <br/> Designed for today.</h2>
          <p className="text-slate-400">Explore the powerful features that make CivicBridge the best choice.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Mobile App Card */}
          <div className="bg-[#13131A] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-48 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full" />
              <div className="w-24 h-48 bg-[#0a0a0d] border-2 border-white/10 rounded-2xl relative z-10 p-2 shadow-2xl flex flex-col gap-2">
                <div className="w-full h-4 bg-white/5 rounded-full" />
                <div className="w-full h-20 bg-white/5 rounded-lg mt-auto" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-white mb-2 relative z-10">Mobile experience</h3>
            <p className="text-slate-400 text-sm relative z-10">Report issues on the go with our fully responsive mobile platform.</p>
          </div>

          {/* Analytics Card */}
          <div className="bg-[#13131A] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-48 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)]" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                {/* Concentric circles */}
                <div className="absolute w-32 h-32 rounded-full border border-white/10" />
                <div className="absolute w-24 h-24 rounded-full border border-white/20" />
                <div className="absolute w-16 h-16 rounded-full border border-white/30 flex items-center justify-center bg-white/5 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-medium text-white mb-2 relative z-10">Advanced tracking</h3>
            <p className="text-slate-400 text-sm relative z-10">Monitor issue resolution times and community engagement metrics.</p>
          </div>

          {/* Security Card */}
          <div className="bg-[#13131A] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-48 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full" />
              <div className="w-32 h-12 bg-white/5 border border-white/10 rounded-full flex items-center px-4 relative z-10 backdrop-blur-md">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="h-2 w-12 bg-white/20 rounded-full" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-white mb-2 relative z-10">Data protection</h3>
            <p className="text-slate-400 text-sm relative z-10">Enterprise-grade security ensures all community data is safe.</p>
          </div>
        </div>

        {/* Horizontal Mini Cards */}
        <div className="grid md:grid-cols-3 gap-6">
           {[
             { title: "Geo-location tagging", desc: "Pinpoint exact report locations instantly." },
             { title: "Interactive maps", desc: "Visualize problem areas across the city." },
             { title: "Public API access", desc: "Integrate with existing municipal systems seamlessly." }
           ].map((feat, i) => (
             <div key={i} className="bg-[#13131A] rounded-2xl p-6 border border-white/5 flex items-center justify-between group hover:bg-[#1a1a24] transition-colors cursor-pointer">
               <div>
                 <h4 className="text-white font-medium mb-1">{feat.title}</h4>
                 <p className="text-xs text-slate-500">{feat.desc}</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-500 transition-all">
                 <ArrowRight className="w-4 h-4" />
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* --- BOTTOM CTA SECTION --- */}
      <section className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[150px] pointer-events-none rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-medium text-white mb-8 tracking-tight">
            Better communities. <br/> From the ground up.
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-[#0B0B0F] px-8 py-3.5 rounded-full text-sm font-semibold transition-all hover:bg-slate-200"
            >
              Get Started Now
            </Link>
            <Link
              href="/contact"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-full text-sm font-medium transition-all backdrop-blur-md"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#050505] pt-20 pb-10 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2">
              <Link href="/" className="font-extrabold text-xl tracking-tight text-white mb-4 block">
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  CivicBridge
                </span>
              </Link>
              <p className="text-slate-500 text-sm max-w-xs mb-6">
                Building better communities through transparent communication and actionable data.
              </p>
              <div className="flex gap-4">
                 {/* Social icons placeholders */}
                 {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer">
                     <div className="w-4 h-4 bg-current opacity-50" />
                   </div>
                 ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-slate-300 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-slate-300 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} CivicBridge. All rights reserved.</p>
            <div className="flex gap-6">
              <span>Made with ❤️ for communities</span>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}