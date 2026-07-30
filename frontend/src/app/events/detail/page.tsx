export const metadata = {
  title: "CIAAF ZHENGZHOU 2026 | 24th China International Auto Aftermarket Fair",
};

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-50 font-sans">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div 
          className="relative w-full py-16 sm:py-20 md:py-28 lg:py-32 px-4 sm:px-6 flex flex-col items-center justify-center text-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75)), url('/images/events/event4.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-yellow-300 mb-3 sm:mb-4 tracking-tight leading-tight">
            CIAAF ZHENGZHOU 2026
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white mb-1 sm:mb-2 font-medium">
            24th China International Auto Aftermarket Fair
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-semibold text-xs sm:text-sm">
              📅 June 26–28, 2026
            </span>
            <span className="bg-gradient-to-r from-red-500 to-red-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-semibold text-xs sm:text-sm">
              📍 Zhengzhou, China
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        {/* Event Overview */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-red-500 border-l-4 border-red-500 pl-3 sm:pl-4">
            Event Overview
          </h2>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-yellow-300">Theme</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">"New Exhibition · New Central Plains · New Opportunities"</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-yellow-300">Venue</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">Zhongyuan International Convention and Exhibition Center (Zhengzhou Airport Economy Zone)</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-yellow-300">Date</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">June 26–28, 2026</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-yellow-300">Scale</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">120,000 m² | 3,000+ exhibitors | 100,000+ professional buyers (including overseas from SE Asia, Middle East, etc.)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Exhibition Zones */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-red-500 border-l-4 border-red-500 pl-3 sm:pl-4">
            Core Exhibition Zones
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { 
                icon: "⚡",
                img: "/images/events/event5.jpeg", 
                title: "New Energy Aftermarket", 
                desc: "Battery repair, charging pile operation, smart diagnosis, recycling" 
              },
              { 
                icon: "🔧",
                img: "/images/events/event6.jpeg", 
                title: "Modification & Upgrading", 
                desc: "Performance parts, exterior styling, in-car electronics" 
              },
              { 
                icon: "✨",
                img: "/images/events/event7.jpeg", 
                title: "Car Care & Beauty", 
                desc: "Cleaning, coatings, detailing, interior accessories" 
              },
              { 
                icon: "🛠️",
                img: "/images/events/event1.jpg", 
                title: "Smart Garage Equipment", 
                desc: "Diagnostic tools, workshop gear, tire service" 
              },
              { 
                icon: "🌍",
                img: "/images/events/event2.jpg", 
                title: "International Brands & Cross-border", 
                desc: "Global brands, export services, cross-border e-commerce" 
              },
              { 
                icon: "📱",
                img: "/images/events/event3.png", 
                title: "Douyin E-commerce Zone", 
                desc: "Live streaming, online store solutions, social commerce" 
              },
            ].map((zone, idx) => (
              <div key={idx} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl shadow-slate-200 hover:-translate-y-1 sm:hover:-translate-y-2 transition-transform duration-300 group">
                <div className="relative">
                  <img src={zone.img} alt={zone.title} className="w-full h-40 sm:h-48 object-cover" />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    {zone.icon}
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-1 sm:mb-2">{zone.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{zone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Concurrent Activities */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-red-500 border-l-4 border-red-500 pl-3 sm:pl-4">
            Key Concurrent Activities
          </h2>
          
          {/* Central Plains Car Meet */}
          <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <img src="/images/events/event4.jpeg" alt="Central Plains Car Meet" className="w-full h-48 sm:h-56 md:h-full object-cover" />
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl sm:text-3xl">🏎️</span>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 leading-snug">Central Plains Car Meet (RevFest)</h3>
                </div>
                <p className="text-xs sm:text-sm text-red-500 font-semibold mb-2 sm:mb-3">June 26–27</p>
                <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 sm:mt-1 shrink-0">•</span>
                    <span>Drift shows by top Chinese drift drivers & 1087X team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 sm:mt-1 shrink-0">•</span>
                    <span>Car culture display, test drives, influencer meetups</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Global Film & Wrap Competition */}
          <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 sm:p-6 order-2 md:order-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl sm:text-3xl">🎨</span>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 leading-snug">Global Film & Wrap Competition</h3>
                </div>
                <p className="text-xs sm:text-sm text-red-500 font-semibold mb-2 sm:mb-3">June 26–28</p>
                <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 sm:mt-1 shrink-0">•</span>
                    <span>Categories: PPF, window tint, color change, custom wrap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 sm:mt-1 shrink-0">•</span>
                    <span>Open to all technicians & shops; judged by owners + experts</span>
                  </li>
                </ul>
              </div>
              <img src="/images/events/event5.jpeg" alt="Film & Wrap Competition" className="w-full h-48 sm:h-56 md:h-full object-cover order-1 md:order-2" />
            </div>
          </div>

          {/* 3 Major Industry Contests */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg sm:shadow-xl mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl">🏆</span>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">3 Major Industry Contests</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-bold text-red-700 mb-1 sm:mb-2 text-sm sm:text-base">Car Modification Contest</h4>
                <p className="text-xs sm:text-sm text-slate-600">"Top 10 Builds of the Year"</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-bold text-blue-700 mb-1 sm:mb-2 text-sm sm:text-base">Car Audio Competition</h4>
                <p className="text-xs sm:text-sm text-slate-600">Sound quality & installation craftsmanship</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-bold text-yellow-700 mb-1 sm:mb-2 text-sm sm:text-base">Auto Detailing & Refinish</h4>
                <p className="text-xs sm:text-sm text-slate-600">Technical skills benchmark</p>
              </div>
            </div>
          </div>
        </section>

        {/* Summits & Forums */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-red-500 border-l-4 border-red-500 pl-3 sm:pl-4">
            Summits & Forums (20+ Sessions)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              "New Energy Vehicle Aftermarket Summit",
              "Smart Garage & Digital Operation Summit",
              "Auto Body & Paint Development Conference",
              "Wear Parts & Supply Chain Forum",
              "Cross-border E-commerce & Export Forum",
            ].map((forum, idx) => (
              <div key={idx} className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-white hover:from-slate-700 hover:to-slate-600 transition-colors">
                <span className="text-blue-400 text-lg sm:text-xl shrink-0">📢</span>
                <p className="font-medium text-sm sm:text-base leading-snug">{forum}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Global Sourcing & Matchmaking */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-red-500 border-l-4 border-red-500 pl-3 sm:pl-4">
            Global Sourcing & Matchmaking
          </h2>
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-1 sm:mb-2">200+</div>
                <p className="text-sm sm:text-base text-slate-600">One-on-one meeting booths</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🌏</div>
                <p className="text-sm sm:text-base text-slate-600">Overseas buyer delegations from SE Asia, Middle East, Latin America</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🤝</div>
                <p className="text-sm sm:text-base text-slate-600">"Zhengzhou + Indonesia" dual-show linkage for Southeast Asia market expansion</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Attend */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-red-500 border-l-4 border-red-500 pl-3 sm:pl-4">
            Why Attend
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: "🔍", title: "Source New Products", desc: "Discover the latest technologies across the auto aftermarket" },
              { icon: "🤝", title: "Network", desc: "Connect with 100,000+ buyers & 3,000+ exhibitors" },
              { icon: "📚", title: "Learn", desc: "Attend 20+ industry summits & live demos" },
              { icon: "🏁", title: "Experience", desc: "Witness China's top car modification & tuning culture" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md sm:shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-4">{item.icon}</div>
                <h3 className="font-bold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Venue Preview */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-red-500 border-l-4 border-red-500 pl-3 sm:pl-4">
            Zhengzhou Exhibition Venue
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl">
              <img src="/images/events/event6.jpeg" alt="Zhengzhou Convention Center" className="w-full h-48 sm:h-64 object-cover" />
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-1 sm:mb-2 leading-snug">Zhongyuan International Convention & Exhibition Center</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Modern exhibition facility with over 120,000 sqm of exhibition space in Zhengzhou Airport Economy Zone</p>
              </div>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl">
              <img src="/images/events/event7.jpeg" alt="Auto Exhibition" className="w-full h-48 sm:h-64 object-cover" />
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-1 sm:mb-2 leading-snug">Professional Exhibition Halls</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">State-of-the-art facilities designed for automotive aftermarket showcases and events</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white text-center py-8 sm:py-12 px-4">
        <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">CIAAF ZHENGZHOU 2026</h3>
        <p className="text-sm sm:text-base text-slate-300 mb-1 sm:mb-2">24th China International Auto Aftermarket Fair</p>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">June 26 – 28, 2026 | Zhongyuan International Convention & Exhibition Center, Zhengzhou Airport Economy Zone</p>
      </footer>
    </div>
  );
};

export default Page;
