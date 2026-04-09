'use client'

import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface User {
  user_id: string
  student_id: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
}

export default function AboutPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      setUser(raw ? (JSON.parse(raw) as User) : null)
    } catch (error) {
      console.error('Failed to parse user:', error)
      setUser(null)
    }
    setIsHydrated(true)
  }, [])

  return (
    <AppBackground>
      {/* Header Component */}
      <MainHeader />

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">About StudyNest</h2>
              <p className="text-xl text-gray-600 mb-4">
                StudyNest is a campus space management solution designed to help students find the perfect study environment in real-time.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We understand the challenges of campus life: finding a quiet place to study, locating available lecture halls, and managing your academic workload. StudyNest solves these problems with real-time occupancy tracking and community-driven updates.
              </p>
              <div className="flex gap-4">
                {user ? (
                  <Link href="/study-areas" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                    Explore Study Areas
                  </Link>
                ) : (
                  <Link href="/login/signIN" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                    Get Started Now
                  </Link>
                )}
                <a href="#mission" className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition">
                  Learn More
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/logo.jpeg"
                  alt="StudyNest"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                To empower students with real-time information about campus study spaces, enabling them to make informed decisions and maximize their academic productivity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Mission Card 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Real-Time Updates</h4>
                <p className="text-gray-700">
                  Get instant access to occupancy levels of study areas and lecture halls as reported by our volunteer community.
                </p>
              </div>

              {/* Mission Card 2 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8">
                <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Privacy First</h4>
                <p className="text-gray-700">
                  Your exact location is never stored. We only count occupancy data anonymously and securely.
                </p>
              </div>

              {/* Mission Card 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8">
                <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Community Driven</h4>
                <p className="text-gray-700">
                  Volunteer contributors keep data accurate by reporting space availability and facility issues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to find your perfect study space
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8">
                <div className="h-14 w-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Real-time Occupancy</h4>
                <p className="text-gray-600">
                  Check live occupancy levels of study areas and lecture halls updated by our volunteer community.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8">
                <div className="h-14 w-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">GPS Location Tracking</h4>
                <p className="text-gray-600">
                  Find study spaces near you with our interactive map showing available locations and distances.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8">
                <div className="h-14 w-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Peak Hour Insights</h4>
                <p className="text-gray-600">
                  Learn when study spaces are typically crowded and find the best times to study.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8">
                <div className="h-14 w-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-2h2m-2 0h-2" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Report Issues</h4>
                <p className="text-gray-600">
                  Submit complaints about facility conditions to help improve campus spaces for everyone.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8">
                <div className="h-14 w-14 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Volunteer Opportunities</h4>
                <p className="text-gray-600">
                  Become a volunteer and help keep occupancy data accurate for the entire campus community.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8">
                <div className="h-14 w-14 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Privacy Protected</h4>
                <p className="text-gray-600">
                  Your personal data is never stored or shared. Complete anonymity guaranteed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built by students, for students, with the support of dedicated volunteers and academic advisors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <svg className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">Development Team</h4>
                <p className="text-gray-600">
                  Full-stack developers dedicated to building a seamless user experience
                </p>
              </div>

              {/* Team Member 2 */}
              <div className="text-center">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <svg className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">Volunteer Coordinator</h4>
                <p className="text-gray-600">
                  Managing our community of volunteers who keep data accurate
                </p>
              </div>

              {/* Team Member 3 */}
              <div className="text-center">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <svg className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">Product Manager</h4>
                <p className="text-gray-600">
                  Ensuring StudyNest meets the real needs of campus students
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-4xl font-bold text-white mb-4">Ready to Find Your Perfect Study Space?</h3>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of students already using StudyNest to make smarter study decisions
            </p>
            {user ? (
              <Link href="/study-areas" className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition">
                Explore Now
              </Link>
            ) : (
              <Link href="/login/signIN" className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition">
                Get Started Free
              </Link>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-white font-bold mb-4">StudyNest</h4>
                <p className="text-sm">Campus Free Space Finder</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="hover:text-white">Features</a></li>
                  <li><a href="#about" className="hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                  <li><a href="#" className="hover:text-white">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Connect</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Twitter</a></li>
                  <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                  <li><a href="#" className="hover:text-white">GitHub</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-center text-sm">
                © 2026 StudyNest. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </AppBackground>
  )
}
