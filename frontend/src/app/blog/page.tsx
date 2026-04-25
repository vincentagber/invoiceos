import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User, Clock, Search, Filter } from 'lucide-react';
import blogPosts from '@/data/blog-posts.json';

export const metadata = {
    title: 'InvoiceOS Blog | Invoicing Guides & Business Tips',
    description: 'Expert advice on invoicing, tax requirements, and small business growth from the InvoiceOS team.',
};

import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';

export default function BlogListingPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
            <SiteNavbar />

            <main className="max-w-7xl mx-auto py-32 px-6 lg:px-12">
                <div className="space-y-6 mb-24 text-center">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                        Institutional Intelligence
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-sans font-semibold text-slate-900 tracking-tighter uppercase leading-[0.9]">The Blog</h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Master your revenue operations. Expert guides on cross-border billing, tax compliance, and growth strategies.
                    </p>
                </div>

                {/* Featured Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {blogPosts.map((post) => (
                        <article key={post.slug} className="group bg-white rounded-[3rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 overflow-hidden flex flex-col">
                            <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-8 left-8 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur shadow-sm text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                                    {post.category}
                                </div>
                            </div>
                            <div className="p-10 space-y-8 flex-1 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-emerald-500" />
                                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-emerald-500" />
                                            5 min read
                                        </div>
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-sans font-semibold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors leading-tight">
                                        <Link href={`/blog/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </div>
                                <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 group-hover:gap-4 transition-all pt-6 border-t border-slate-50">
                                    View Guide <ArrowRight size={14} />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Newsletter Box */}
                <div className="mt-32 bg-slate-900 rounded-[4rem] p-12 lg:p-24 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-600/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-2xl space-y-10 text-center lg:text-left">
                        <h2 className="text-4xl lg:text-6xl font-sans font-semibold tracking-tighter uppercase leading-none">
                            Join 5,000+ <br /> Founders
                        </h2>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed">
                            Get weekly insights on revenue optimization and tax updates delivered directly to your inbox.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4">
                            <input 
                                type="email" 
                                placeholder="founder@company.com" 
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-medium focus:bg-white/10 focus:outline-none transition-all placeholder:text-slate-600"
                            />
                            <button className="bg-emerald-600 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all active:scale-95 shadow-xl shadow-emerald-900/20">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
