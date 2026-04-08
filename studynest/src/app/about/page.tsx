'use client';

import MainHeader from '@/components/MainHeader'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'

interface User {
  user_id: string
  student_id: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
}

interface DashboardStats {
  volunteers: { total: number; activeToday: number }
  activeSpaces: { total: number; halls: number; areas: number }
}

export default function AboutPage() {
  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({})
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({})
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [animatedStats, setAnimatedStats] = useState({ volunteers: 0, spaces: 0 })
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Load user from localStorage after hydration
    let parsedUser: User | null = null
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        parsedUser = JSON.parse(userData)
      } catch (error) {
        console.error('Failed to parse user:', error)
      }
    }
    
    // Update both states after reading external data (post-hydration)
    // eslint-disable-next-line
    setUser(parsedUser)
    setMounted(true)

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()

    // Setup Intersection Observer for scroll animations
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }))
        }
      })
    }, options)

    // Observe sections
    const sections = document.querySelectorAll('[data-scroll-animate]')
    sections.forEach((section) => observerRef.current?.observe(section))

    return () => {
      sections.forEach((section) => observerRef.current?.unobserve(section))
    }
  }, [])

  // Animate stats counters
  useEffect(() => {
    if (!stats?.volunteers?.total || !stats?.activeSpaces?.total) return

    const animateCounter = (target: number, duration: number, callback: (val: number) => void) => {
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const value = Math.floor(target * progress)
        callback(value)
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }

    animateCounter(stats.volunteers.total, 1500, (val) =>
      setAnimatedStats((prev) => ({ ...prev, volunteers: val }))
    )
    animateCounter(stats.activeSpaces.total, 1500, (val) =>
      setAnimatedStats((prev) => ({ ...prev, spaces: val }))
    )
  }, [stats])

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }))
  }

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
                {mounted ? (
                  user ? (
                    <Link href="/study-areas" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                      Explore Study Areas
                    </Link>
                  ) : (
                    <Link href="/login/signIN" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                      Get Started Now
                    </Link>
                  )
                ) : (
                  <Link href="/login/signIN" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                    Get Started Now
                  </Link>
                )}
                <a href="#mission" onClick={(e) => handleSmoothScroll(e, 'mission')} className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer">
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
        <section id="mission" className="bg-white py-16" data-scroll-animate>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-12 transition-all duration-700 ${visibleSections['mission'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                To empower students with real-time information about campus study spaces, enabling them to make informed decisions and maximize their academic productivity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Mission Card 1 */}
              <div
                className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 cursor-pointer transition-all duration-300 transform hover:shadow-lg ${
                  expandedCards['mission-1'] ? 'md:col-span-3' : ''
                }`}
                onClick={() => toggleCard('mission-1')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Real-Time Updates</h4>
                  </div>
                  <button className="text-2xl text-blue-600 font-bold flex-shrink-0">
                    {expandedCards['mission-1'] ? '−' : '+'}
                  </button>
                </div>
                <p className="text-gray-700">
                  Get instant access to occupancy levels of study areas and lecture halls as reported by our volunteer community.
                </p>
                {expandedCards['mission-1'] && (
                  <div className="mt-4 pt-4 border-t border-blue-200 text-gray-600 animate-in fade-in duration-300">
                    <p>
                      Our system updates occupancy data in real-time, ensuring you always have the most current information about available study spaces across campus.
                    </p>
                  </div>
                )}
              </div>

              {/* Mission Card 2 */}
              <div
                className={`bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 cursor-pointer transition-all duration-300 transform hover:shadow-lg ${
                  expandedCards['mission-2'] ? 'md:col-span-3' : ''
                }`}
                onClick={() => toggleCard('mission-2')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Privacy First</h4>
                  </div>
                  <button className="text-2xl text-green-600 font-bold flex-shrink-0">
                    {expandedCards['mission-2'] ? '−' : '+'}
                  </button>
                </div>
                <p className="text-gray-700">
                  Your exact location is never stored. We only count occupancy data anonymously and securely.
                </p>
                {expandedCards['mission-2'] && (
                  <div className="mt-4 pt-4 border-t border-green-200 text-gray-600 animate-in fade-in duration-300">
                    <p>
                      We are committed to protecting your privacy. Location data is processed locally on your device and never transmitted or stored on our servers.
                    </p>
                  </div>
                )}
              </div>

              {/* Mission Card 3 */}
              <div
                className={`bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8 cursor-pointer transition-all duration-300 transform hover:shadow-lg ${
                  expandedCards['mission-3'] ? 'md:col-span-3' : ''
                }`}
                onClick={() => toggleCard('mission-3')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Community Driven</h4>
                  </div>
                  <button className="text-2xl text-purple-600 font-bold flex-shrink-0">
                    {expandedCards['mission-3'] ? '−' : '+'}
                  </button>
                </div>
                <p className="text-gray-700">
                  Volunteer contributors keep data accurate by reporting space availability and facility issues.
                </p>
                {expandedCards['mission-3'] && (
                  <div className="mt-4 pt-4 border-t border-purple-200 text-gray-600 animate-in fade-in duration-300">
                    <p>
                      Our volunteer network is the backbone of StudyNest. Volunteers actively contribute to keeping occupancy data accurate and timely.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Live Statistics Section */}
        {stats && stats.volunteers && stats.activeSpaces && (
          <section className="bg-gradient-to-r from-indigo-50 to-blue-50 py-16" data-scroll-animate>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`text-center mb-12 transition-all duration-700 ${visibleSections['stats'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <h3 className="text-4xl font-bold text-gray-900 mb-4">By The Numbers</h3>
                <p className="text-xl text-gray-600">Real-time metrics from our active community</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Volunteers Count */}
                <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition transform hover:scale-105">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 0a4 4 0 110-8m0 8a4 4 0 110 8" />
                    </svg>
                  </div>
                  <h4 className="text-gray-600 text-sm font-medium mb-2">Active Volunteers</h4>
                  <p className="text-5xl font-bold text-indigo-600">{animatedStats.volunteers}+</p>
                  <p className="text-sm text-gray-500 mt-2">{stats.volunteers?.activeToday || 0} active today</p>
                </div>

                {/* Active Spaces Count */}
                <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition transform hover:scale-105">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-gray-600 text-sm font-medium mb-2">Active Spaces</h4>
                  <p className="text-5xl font-bold text-green-600">{animatedStats.spaces}+</p>
                  <p className="text-sm text-gray-500 mt-2">{stats.activeSpaces?.halls || 0} halls, {stats.activeSpaces?.areas || 0} areas</p>
                </div>

                {/* User Welcome */}
                {mounted && user && (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition transform hover:scale-105">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
                      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h-2m0 0H10m2 0h2m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-gray-600 text-sm font-medium mb-2">Welcome</h4>
                    <p className="text-lg font-bold text-purple-600">{user.name}</p>
                    <p className="text-sm text-gray-500 mt-2 capitalize">{user.role}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="features" className="py-16" data-scroll-animate>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-12 transition-all duration-700 ${visibleSections['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to find your perfect study space
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 cursor-pointer transform hover:scale-105"
                onClick={() => toggleCard('feature-1')}
              >
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <button className="text-2xl text-indigo-600 font-bold">
                    {expandedCards['feature-1'] ? '−' : '+'}
                  </button>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Real-time Occupancy</h4>
                <p className="text-gray-600">
                  Check live occupancy levels of study areas and lecture halls updated by our volunteer community.
                </p>
                {expandedCards['feature-1'] && (
                  <div className="mt-4 pt-4 border-t border-indigo-200 text-gray-600 animate-in fade-in duration-300">
                    <p>Get instant updates every time volunteers submit occupancy data. See exactly which spaces are available right now.</p>
                  </div>
                )}
              </div>

              {/* Feature 2 */}
              <div
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 cursor-pointer transform hover:scale-105"
                onClick={() => toggleCard('feature-2')}
              >
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 bg-green-100 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <button className="text-2xl text-green-600 font-bold">
                    {expandedCards['feature-2'] ? '−' : '+'}
                  </button>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">GPS Location Tracking</h4>
                <p className="text-gray-600">
                  Find study spaces near you with our interactive map showing available locations and distances.
                </p>
                {expandedCards['feature-2'] && (
                  <div className="mt-4 pt-4 border-t border-green-200 text-gray-600 animate-in fade-in duration-300">
                    <p>Use your device GPS to locate nearby study areas. Our map shows distance, directions, and real-time availability.</p>
                  </div>
                )}
              </div>

              {/* Feature 3 */}
              <div
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 cursor-pointer transform hover:scale-105"
                onClick={() => toggleCard('feature-3')}
              >
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <button className="text-2xl text-blue-600 font-bold">
                    {expandedCards['feature-3'] ? '−' : '+'}
                  </button>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Peak Hour Insights</h4>
                <p className="text-gray-600">
                  Learn when study spaces are typically crowded and find the best times to study.
                </p>
                {expandedCards['feature-3'] && (
                  <div className="mt-4 pt-4 border-t border-blue-200 text-gray-600 animate-in fade-in duration-300">
                    <p>Analytics show peak hours for each space. Plan your study time for maximum productivity and comfort.</p>
                  </div>
                )}
              </div>

              {/* Feature 4 */}
              <div
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 cursor-pointer transform hover:scale-105"
                onClick={() => toggleCard('feature-4')}
              >
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 bg-red-100 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-2h2m-2 0h-2" />
                    </svg>
                  </div>
                  <button className="text-2xl text-red-600 font-bold">
                    {expandedCards['feature-4'] ? '−' : '+'}
                  </button>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Report Issues</h4>
                <p className="text-gray-600">
                  Submit complaints about facility conditions to help improve campus spaces for everyone.
                </p>
                {expandedCards['feature-4'] && (
                  <div className="mt-4 pt-4 border-t border-red-200 text-gray-600 animate-in fade-in duration-300">
                    <p>Found an issue? Report it directly through the app. Your feedback helps us maintain quality facilities.</p>
                  </div>
                )}
              </div>

              {/* Feature 5 */}
              <div
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 cursor-pointer transform hover:scale-105"
                onClick={() => toggleCard('feature-5')}
              >
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                    <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <button className="text-2xl text-yellow-600 font-bold">
                    {expandedCards['feature-5'] ? '−' : '+'}
                  </button>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Volunteer Opportunities</h4>
                <p className="text-gray-600">
                  Become a volunteer and help keep occupancy data accurate for the entire campus community.
                </p>
                {expandedCards['feature-5'] && (
                  <div className="mt-4 pt-4 border-t border-yellow-200 text-gray-600 animate-in fade-in duration-300">
                    <p>Join our community of volunteers and contribute to making campus better for everyone.</p>
                  </div>
                )}
              </div>

              {/* Feature 6 */}
              <div
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 cursor-pointer transform hover:scale-105"
                onClick={() => toggleCard('feature-6')}
              >
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 bg-pink-100 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                    <svg className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button className="text-2xl text-pink-600 font-bold">
                    {expandedCards['feature-6'] ? '−' : '+'}
                  </button>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Privacy Protected</h4>
                <p className="text-gray-600">
                  Your personal data is never stored or shared. Complete anonymity guaranteed.
                </p>
                {expandedCards['feature-6'] && (
                  <div className="mt-4 pt-4 border-t border-pink-200 text-gray-600 animate-in fade-in duration-300">
                    <p>We use industry-standard encryption and never sell your data. Your privacy is our commitment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-white py-16" data-scroll-animate>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-12 transition-all duration-700 ${visibleSections['team'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built by students, for students, with the support of dedicated volunteers and academic advisors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="text-center hover:transform hover:scale-105 transition duration-300">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition">
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
              <div className="text-center hover:transform hover:scale-105 transition duration-300">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition">
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
              <div className="text-center hover:transform hover:scale-105 transition duration-300">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition">
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
    </div>
  )
}
