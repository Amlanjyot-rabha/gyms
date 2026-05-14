import { useEffect, useState } from 'react'
import { Navbar }       from '../sections/Navbar'
import { Hero }         from '../sections/Hero'
import { BannerSlider } from '../sections/BannerSlider'
import { About }        from '../sections/About'
import { Trainers }     from '../sections/Trainers'
import { Gallery }      from '../sections/Gallery'
import { Testimonials } from '../sections/Testimonials'
import { Membership }   from '../sections/Membership'
import { Contact }      from '../sections/Contact'
import { Footer }       from '../sections/Footer'
import { AuthModal }    from '../components/AuthModal'
import './HomePage.css'

export function HomePage({ data, theme, onToggleTheme }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan]       = useState(null)

  useEffect(() => {
    document.title = data.meta?.documentTitle ?? 'Gym'
    document.documentElement.lang = data.meta?.htmlLang ?? 'en'
  }, [data.meta?.documentTitle, data.meta?.htmlLang])

  const handleJoinClick = (e) => {
    e?.preventDefault()
    setSelectedPlan(null)
    setIsAuthModalOpen(true)
  }

  const handlePlanSelect = (plan, e) => {
    e?.preventDefault()
    setSelectedPlan(plan)
    setIsAuthModalOpen(true)
  }

  // Backward-compatible: older CMS docs won't have these fields
  const banners    = data?.banners    ?? []
  const siteStatus = data?.siteStatus ?? 'open'

  return (
    <>
      <a className="skip-link" href={data.skipLink?.href ?? '#main-content'}>
        {data.skipLink?.label ?? 'Skip to main content'}
      </a>

      <Navbar
        branding={data.branding}
        navigation={data.navigation}
        siteStatus={siteStatus}
        onJoin={handleJoinClick}
      />

      <main id="main-content">
        <Hero hero={data.hero} onJoin={handleJoinClick} />

        {banners.length > 0 && (
          <BannerSlider banners={banners} />
        )}

        <About about={data.about} />
        <Membership membershipPlans={data.membershipPlans} onPlanSelect={handlePlanSelect} />
        <Trainers trainers={data.trainers} />
        <Gallery gallery={data.gallery} />
        <Testimonials testimonials={data.testimonials} />
        <Contact contact={data.contact} />
      </main>

      <Footer branding={data.branding} footer={data.footer} navigation={data.navigation} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        selectedPlan={selectedPlan}
      />
    </>
  )
}
