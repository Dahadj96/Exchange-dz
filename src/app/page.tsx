'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  CheckCircle,
  MessageSquare,
  FileCheck,
  Globe,
  Zap,
  Lock,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { LegalDisclaimerModal } from '@/components/legal/LegalDisclaimerModal';

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 min-h-[90vh] flex items-center">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-slate-50" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="container mx-auto px-6 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200"
            >
              <Globe className="w-4 h-4" />
              منصة عالمية للأصول الرقمية
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 leading-tight"
            >
              تبادل الأصول الرقمية{' '}
              <span className="text-emerald-600">بأمان عالمي</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 leading-relaxed font-medium"
            >
              وسيط تقني يربط الأفراد عالمياً لتحويل الأرصدة عبر Wise وRedotPay والمزيد. تواصل آمن، سمعة موثقة، ونظام تقييم شفاف.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-5"
            >
              <Link
                href="/marketplace"
                className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black text-lg shadow-2xl shadow-emerald-600/30 transition-all flex items-center gap-3 group"
              >
                استكشف السوق
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ transform: 'scaleX(-1)' }} />
              </Link>
              <Link
                href="/signup"
                className="px-10 py-5 bg-white hover:bg-slate-50 text-slate-900 rounded-3xl font-black text-lg border-2 border-slate-200 transition-all"
              >
                إنشاء حساب مجاني
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-8 pt-6"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-600">تواصل مشفر</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-600">+5,000 مستخدم</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-600">نظام سمعة</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="relative p-8 bg-white rounded-[60px] shadow-2xl border border-slate-200">
              {/* Mock Dashboard Card */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900">عروض نشطة</h3>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                </div>

                {/* Sample Offers */}
                {[
                  { user: 'Ahmed K.', asset: 'Wise EUR', rate: '1.08', trust: 98 },
                  { user: 'Sarah M.', asset: 'RedotPay', rate: '1.05', trust: 95 },
                  { user: 'Omar T.', asset: 'USDT', rate: '1.00', trust: 92 },
                ].map((offer, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black">
                          {offer.user[0]}
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{offer.user}</div>
                          <div className="text-xs text-slate-500 font-medium">{offer.asset}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-black text-emerald-700">{offer.trust}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 font-medium">معدل التحويل</span>
                      <span className="text-lg font-black text-slate-900">{offer.rate}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const AssetTicker = () => {
  const assets = [
    { name: 'Wise EUR', rate: '1.08', change: '+0.02', color: 'emerald' },
    { name: 'RedotPay', rate: '1.05', change: '+0.01', color: 'blue' },
    { name: 'USDT', rate: '1.00', change: '0.00', color: 'indigo' },
    { name: 'Paysera', rate: '1.07', change: '-0.01', color: 'purple' },
  ];

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">مؤشر الأصول المباشر</h2>
            <p className="text-slate-500 font-medium text-lg">متابعة حية لمعدلات التحويل في السوق.</p>
          </div>
          <Link href="/rates" className="flex items-center gap-2 text-emerald-600 font-black hover:underline">
            عرض المزيد
            <ArrowRight className="w-4 h-4" style={{ transform: 'scaleX(-1)' }} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {assets.map((asset, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-6">
                <span className="font-black text-xl text-slate-900">{asset.name}</span>
                <div className={`w-10 h-10 rounded-2xl bg-${asset.color}-50 flex items-center justify-center text-${asset.color}-600`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black text-slate-900">{asset.rate}</div>
                <div className={`text-sm font-bold ${asset.change.startsWith('+') ? 'text-emerald-600' : asset.change.startsWith('-') ? 'text-red-600' : 'text-slate-400'}`}>
                  {asset.change} اليوم
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'تصفح العروض',
      desc: 'استكشف عروض تحويل الأصول من مستخدمين موثوقين حول العالم.',
      icon: Globe,
    },
    {
      number: '02',
      title: 'غرفة التداول الخاصة',
      desc: 'تواصل مباشرة عبر الدردشة المشفرة واتفق على التفاصيل.',
      icon: MessageSquare,
    },
    {
      number: '03',
      title: 'رفع الإثبات والتأكيد',
      desc: 'قم برفع إثبات التحويل وأكمل العملية بنظام التقييم الشفاف.',
      icon: FileCheck,
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">كيف تعمل المنصة؟</h2>
          <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">
            ثلاث خطوات بسيطة لتحويل آمن وموثوق للأصول الرقمية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative p-10 bg-slate-50 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all group">
              <div className="absolute top-8 left-8 text-6xl font-black text-emerald-100 group-hover:text-emerald-200 transition-colors">
                {step.number}
              </div>
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <step.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{step.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TrustFeatures = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'وسيط تقني فقط',
      desc: 'نحن لا نتعامل مع الأموال. نوفر بيئة آمنة للتواصل بين الأطراف مع نظام توثيق وتقييم.',
      color: 'emerald',
    },
    {
      icon: Users,
      title: 'نظام السمعة الرقمية',
      desc: 'كل مستخدم يملك سجل معاملات وتقييمات من المستخدمين الآخرين لضمان الشفافية.',
      color: 'blue',
    },
    {
      icon: Lock,
      title: 'رفع الإثباتات',
      desc: 'نظام رفع الوصولات والإثباتات يوفر طبقة إضافية من الأمان والتوثيق.',
      color: 'purple',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, i) => (
            <div key={i} className="text-center space-y-6">
              <div className={`w-20 h-20 bg-${feature.color}-50 text-${feature.color}-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm hover:scale-110 transition-transform`}>
                <feature.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PopularAssets = () => {
  const assets = [
    { name: 'Wise', icon: 'W', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'USDT', icon: 'U', color: 'bg-blue-50 text-blue-600' },
    { name: 'Paysera', icon: 'P', color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Payoneer', icon: 'Py', color: 'bg-orange-50 text-orange-600' },
    { name: 'RedotPay', icon: 'R', color: 'bg-red-50 text-red-600' },
    { name: 'Skrill', icon: 'S', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 lg:px-20 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-4">الأصول الأكثر تداولاً</h2>
        <p className="text-slate-500 mb-16 font-medium">اختر نوع الأصل الذي تريد تحويله وابدأ في تصفح العروض.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {assets.map((asset, i) => (
            <Link
              href={`/marketplace?asset=${asset.name}`}
              key={i}
              className="p-8 rounded-3xl border border-slate-200 hover:border-emerald-500/30 hover:shadow-xl transition-all group bg-white"
            >
              <div className={`w-14 h-14 rounded-2xl ${asset.color} flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                {asset.icon}
              </div>
              <span className="text-slate-900 font-bold">{asset.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const SafetySection = () => {
  const tips = [
    'تحقق دائماً من سمعة المستخدم وسجل معاملاته قبل البدء.',
    'استخدم غرفة التداول الخاصة للتواصل وتبادل الإثباتات.',
    'احتفظ بنسخ من جميع المحادثات والوصولات.',
    'لا تشارك معلوماتك السرية (كلمات سر، رموز تحقق) مع أي شخص.',
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-black mb-6 border border-red-100">
              <ShieldCheck className="w-4 h-4" />
              تداول بحذر
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">نصائح للتداول الآمن</h2>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
              بما أن المعاملات تتم مباشرة بين الأشخاص، إليك بعض القواعد الذهبية لحماية نفسك:
            </p>

            <div className="space-y-6">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-slate-700 font-bold">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="p-8 bg-slate-50 rounded-[60px] relative overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-blue-100 rounded-[40px] flex items-center justify-center">
                <ShieldCheck className="w-32 h-32 text-emerald-600" />
              </div>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const faqs = [
    {
      q: 'ما هي Global Balance Exchange؟',
      a: 'منصة وسيط تقني تربط الأفراد عالمياً لتحويل الأرصدة الرقمية. نحن لا نتعامل مع الأموال، بل نوفر بيئة آمنة للتواصل.',
    },
    {
      q: 'هل المنصة تتحكم في الأموال؟',
      a: 'لا، العمليات تتم مباشرة بين المستخدمين. نحن وسيط تقني فقط نوفر أدوات التواصل والتوثيق.',
    },
    {
      q: 'ما هي الأصول المدعومة؟',
      a: 'ندعم تحويلات Wise, RedotPay, USDT, Paysera, Payoneer, Skrill والمزيد.',
    },
    {
      q: 'كيف أتجنب الاحتيال؟',
      a: 'تحقق من نظام السمعة، راجع سجل المعاملات، واستخدم نظام رفع الإثباتات.',
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 lg:px-20 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">الأسئلة الشائعة</h2>
          <p className="text-slate-500 font-medium">كل ما تريد معرفته عن المنصة.</p>
        </div>

        <div className="space-y-6">
          {faqs.map((item, i) => (
            <div key={i} className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-emerald-200 transition-all">
              <h4 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                {item.q}
              </h4>
              <p className="text-slate-500 font-medium leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">ابدأ تحويل الأصول بأمان اليوم</h2>
            <p className="text-slate-300 text-lg mb-12 font-medium">
              انضم إلى آلاف المستخدمين حول العالم في بيئة آمنة وموثوقة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/signup"
                className="px-12 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black text-lg shadow-xl shadow-emerald-600/20 w-full sm:w-auto transition-all"
              >
                إنشاء حساب مجاني
              </Link>
              <Link
                href="/login"
                className="px-12 py-5 bg-white/10 hover:bg-white/20 text-white rounded-3xl font-black text-lg transition-all border border-white/10 w-full sm:w-auto"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  return (
    <>
      <LegalDisclaimerModal />
      <main className="min-h-screen bg-white">
        <Hero />
        <AssetTicker />
        <HowItWorks />
        <TrustFeatures />
        <PopularAssets />
        <SafetySection />
        <FAQ />
        <CTA />
      </main>
    </>
  );
}
