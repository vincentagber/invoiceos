import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import blogPosts from '@/data/blog-posts.json';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = blogPosts.find(p => p.slug === params.slug);
    if (!post) return { title: 'Post Not Found' };
    
    return {
        title: `${post.title} | InvoiceOS Blog`,
        description: post.excerpt,
    };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = blogPosts.find(p => p.slug === params.slug);
    
    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Nav */}
            <nav className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
                <Link href="/blog" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={16} /> Back to Blog
                </Link>
                <Link href="/">
                    <img src="/logo.png" alt="InvoiceOS" className="h-8 w-auto object-contain" />
                </Link>
                <Link href="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95">
                    Start Free
                </Link>
            </nav>

            <article className="max-w-4xl mx-auto py-20 px-6">
                <header className="space-y-8 mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        {post.category}
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-y border-slate-100 py-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                <User size={14} />
                            </div>
                            {post.author}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} />
                            5 Min Read
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-p:font-medium prose-p:leading-relaxed prose-p:text-slate-600 prose-a:text-indigo-600 prose-strong:text-slate-900 prose-img:rounded-[2rem] prose-img:shadow-2xl">
                    <p className="text-xl text-slate-500 font-medium italic border-l-4 border-indigo-500 pl-6 mb-12">
                        {post.excerpt}
                    </p>
                    
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    
                    <div className="mt-16 p-10 bg-slate-900 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                        <h3 className="text-xl font-black uppercase tracking-tight relative z-10">Global Tax Compliance</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed relative z-10">
                            InvoiceOS is built to handle IRS (US) and FIRS (Nigeria) standards automatically. Our engine calculates VAT (7.5%) and Sales Tax based on your client's location.
                        </p>
                        <div className="flex gap-4 relative z-10">
                            <Link href="/register" className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                                Get Compliant Now
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Share this guide</h3>
                        <div className="flex gap-4">
                            {[Twitter, Linkedin, Facebook, Share2].map((Icon, idx) => (
                                <button key={idx} className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-90">
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-24 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[3rem] p-12 lg:p-16 text-white text-center space-y-8 shadow-2xl shadow-indigo-600/20">
                    <h2 className="text-3xl lg:text-5xl font-black tracking-tight uppercase leading-none">
                        Ready to automate your billing?
                    </h2>
                    <p className="text-lg text-indigo-100 font-medium max-w-xl mx-auto">
                        Join thousands of founders who use InvoiceOS to save 10+ hours a month on admin.
                    </p>
                    <Link href="/register" className="inline-block bg-white text-indigo-600 px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-white/10">
                        Create Your Free Account
                    </Link>
                </div>
            </article>

            {/* Bottom Nav */}
            <footer className="bg-slate-50 border-t border-slate-200 py-16">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
                    <img src="/logo.png" alt="InvoiceOS" className="h-8 w-auto mx-auto opacity-30 grayscale" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        © 2025 InvoiceOS Engine. Built for the modern entrepreneur.
                    </p>
                </div>
            </footer>
        </div>
    );
}
