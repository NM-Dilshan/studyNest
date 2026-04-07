// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { createClient, isSupabaseConfigured } from '../lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If user is already logged in, redirect to dashboard
    if (user) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Modern Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.jpeg" 
              alt="StudyNest Logo" 
              width={160}
              height={64}
              className="h-9 sm:h-10 w-auto rounded-lg shadow-md"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">StudyNest</h1>
              <p className="hidden sm:block text-xs text-gray-500">Campus Free Space Finder</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="/login/signIN" className="text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
            <Link
              href="/login"
              className="bg-gradient-to-r from-[#2E6F95] to-[#255B79] text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-medium"
            >
              Get Started
            </Link>
          </nav>
        </div>

        <nav className="md:hidden border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">About</Link>
            <Link href="/login/signIN" className="text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
            <Link href="/login" className="text-[#2E6F95] font-semibold">Get Started</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Find Your Perfect
                <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#2E6F95] to-[#255B79]"> Study Space</span>
              </h1>
              <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                Stop wandering around campus. Get live availability of lecture halls and study areas, updated in real-time by volunteers.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-[#2E6F95] to-[#255B79] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:shadow-xl transition inline-flex items-center justify-center"
                >
                  Get Started
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="#features"
                  className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:border-gray-400 hover:bg-gray-50 transition inline-flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
              <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Real-time Updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">100% Free</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image / Illustration */}
            <div className="relative">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#eaf4fa] rounded-full opacity-60 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#d7ecf7] rounded-full opacity-60 blur-3xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-5 sm:p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="h-4 bg-gradient-to-r from-[#2E6F95] to-[#4FA3C7] rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-4 mt-4">
                      <div className="flex-1 bg-gradient-to-br from-[#f4fafd] to-[#eaf4fa] rounded-lg p-4 border border-[#bfdced]">
                        <div className="h-3 bg-[#2E6F95] rounded w-2/3 mb-2"></div>
                        <div className="h-2 bg-[#bfdced] rounded"></div>
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="h-3 bg-green-600 rounded w-2/3 mb-2"></div>
                        <div className="h-2 bg-green-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="scroll-mt-28 bg-white py-14 sm:py-20 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why StudyNest?</h2>
              <p className="mt-4 text-lg sm:text-xl text-gray-600">
                Everything you need to make the most of your campus study time.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-[#f4fafd] to-[#eaf4fa] rounded-xl p-6 sm:p-8 border border-[#bfdced] hover:shadow-lg transition">
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 bg-[#2E6F95] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3">Real‑Time Updates</h3>
                <p className="text-gray-700 text-center">
                  Live occupancy data from volunteer reports, so you know exactly where to go right now.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 sm:p-8 border border-green-200 hover:shadow-lg transition">
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3">Reliable Data</h3>
                <p className="text-gray-700 text-center">
                  Student ratings and volunteer reputation ensure you get accurate, trustworthy information every time.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-[#f4fafd] to-[#eaf4fa] rounded-xl p-6 sm:p-8 border border-[#bfdced] hover:shadow-lg transition">
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 bg-[#2E6F95] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3">Community Driven</h3>
                <p className="text-gray-700 text-center">
                  Contribute as a volunteer, earn reputation, and help fellow students find their perfect study space.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-[#2E6F95] to-[#255B79] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">500+</div>
                <p className="text-[#d7ecf7] text-base sm:text-lg">Active Users</p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">50+</div>
                <p className="text-[#d7ecf7] text-base sm:text-lg">Study Spaces</p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">1000+</div>
                <p className="text-[#d7ecf7] text-base sm:text-lg">Updates Daily</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-white py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ready to find your study space?</h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Join hundreds of students who are already using StudyNest to find the perfect place to study.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-gradient-to-r from-[#2E6F95] to-[#255B79] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:shadow-xl transition inline-flex items-center justify-center"
              >
                Create Your Account
              </Link>
              <Link
                href="/login"
                className="border-2 border-[#2E6F95] text-[#2E6F95] px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-[#eaf4fa] transition inline-flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/logo.jpeg" 
                  alt="StudyNest Logo" 
                  width={128}
                  height={48}
                  className="h-8 w-auto rounded-lg shadow-md"
                />
                <span className="text-xl font-bold text-white">StudyNest</span>
              </div>
              <p className="text-gray-400 text-sm">Campus Free Space Finder</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400 text-sm">&copy; {new Date().getFullYear()} StudyNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}