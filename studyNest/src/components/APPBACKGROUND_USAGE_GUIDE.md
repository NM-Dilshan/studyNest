/**
 * USAGE EXAMPLES: How to Apply AppBackground to Different Pages
 * 
 * The AppBackground component is reusable across all pages in your StudyNest app.
 * Simply wrap your page content with the AppBackground component to get the
 * premium soft glassmorphism background.
 */

// ============================================================================
// EXAMPLE 1: Requests Page (/requests)
// ============================================================================

import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'

export default function RequestsPage() {
  return (
    <AppBackground>
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Your requests content here */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Requests</h1>
          {/* Rest of your page content */}
        </div>
      </main>
    </AppBackground>
  )
}

// ============================================================================
// EXAMPLE 2: Lecture Halls Page (/student/halls)
// ============================================================================

import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'

export default function HallsPage() {
  return (
    <AppBackground>
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Find Lecture Halls</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your hall cards with glassmorphism effect */}
            <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-md bg-white/40 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900">Lecture Hall A101</h2>
              <p className="text-gray-600">Building A, Floor 1</p>
            </div>
          </div>
        </div>
      </main>
    </AppBackground>
  )
}

// ============================================================================
// EXAMPLE 3: Study Areas Page (/study-areas)
// ============================================================================

import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'

export default function StudyAreasPage() {
  return (
    <AppBackground>
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Study Areas</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Your study area cards */}
          </div>
        </div>
      </main>
    </AppBackground>
  )
}

// ============================================================================
// EXAMPLE 4: About Page (/about)
// ============================================================================

import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'

export default function AboutPage() {
  return (
    <AppBackground>
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About StudyNest</h1>
          <div className="space-y-8">
            {/* Your about content */}
          </div>
        </div>
      </main>
    </AppBackground>
  )
}

// ============================================================================
// EXAMPLE 5: Complaints Page (/Naveen/my-complaints)
// ============================================================================

import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'

export default function ComplaintsPage() {
  return (
    <AppBackground>
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">My Complaints</h1>
          <div className="space-y-4">
            {/* Your complaint list items */}
          </div>
        </div>
      </main>
    </AppBackground>
  )
}

// ============================================================================
// BEST PRACTICES FOR USING AppBackground
// ============================================================================

/*
1. ✅ ALWAYS WRAP THE ENTIRE PAGE:
   <AppBackground>
     <MainHeader />
     <main>
       <div className="relative z-10">
         Your content here
       </div>
     </main>
   </AppBackground>

2. ✅ USE RELATIVE Z-INDEX FOR CONTENT:
   - The background is fixed and has z-10 for blobs
   - Wrap your main content in relative containers
   - This ensures content appears above the background

3. ✅ OPTIONAL: CUSTOM CLASSNAME:
   <AppBackground className="custom-class">
     Your content
   </AppBackground>

4. ✅ RESPONSIVE DESIGN:
   - AppBackground works on all screen sizes
   - The background blobs automatically adapt
   - Your content maintains proper spacing

5. ✅ WITH DIALOGS/MODALS:
   - Dialogs should have z-50 or higher to appear above background
   - Example: fixed inset-0 bg-black/50 flex items-center justify-center z-50

6. ❌ DON'T:
   - Don't use position-fixed for background (already done by component)
   - Don't apply full page background colors to wrapper
   - Don't double-wrap with multiple AppBackground instances

7. 🎨 COLOR SCHEMES:
   - Pastel Blue: from-blue-600 via-purple-600 to-pink-600
   - Mint Green: from-emerald-600 via-cyan-600 to-teal-600
   - Purple Pink: from-purple-600 via-pink-600 to-rose-600
   - All work well with the soft blurred background

8. 🎯 PERFORMANCE:
   - Background uses CSS animations (no JavaScript)
   - Blur effects are GPU-accelerated
   - Safe to use on all pages without performance issues
*/

// ============================================================================
// CARD STYLING TEMPLATE (for use on any page with AppBackground)
// ============================================================================

export function GlassmorphismCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
      
      {/* Content */}
      <div className="relative p-6 sm:p-8 backdrop-blur-md border border-white/30 shadow-xl">
        <div className="h-14 w-14 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-blue-200/50 backdrop-blur-sm">
          {/* Icon here */}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Card Title</h3>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">Card description</p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-xs font-medium border border-blue-200/50 backdrop-blur-sm">
          Badge
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// IMPLEMENTATION CHECKLIST
// ============================================================================

/*
For each page you want to apply the background:

1. Import AppBackground:
   import AppBackground from '@/components/AppBackground'

2. Wrap your entire page:
   <AppBackground>
     {/* existing content */}
   </AppBackground>

3. Verify relative z-index on content:
   - Main container: relative z-10 (optional, default works)
   - Cards: relative z-10 (usually inherited)
   - Modals/Dialogs: z-50 or higher

4. Test on mobile:
   - Check layout on small screens
   - Ensure text is readable
   - Verify touch interactions work

5. Optional customization:
   - Add custom className if needed
   - Use consistent card styling from template above
   - Keep gradient colors consistent with design system

✅ Pages Ready to Implement:
  - /home (DONE)
  - /requests
  - /student/halls
  - /study-areas
  - /about
  - /Naveen/my-complaints
  - /volunteer/dashboard
  - /admin/dashboard
*/
