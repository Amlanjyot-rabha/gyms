import { useEffect } from 'react'
import { Navbar } from '../sections/Navbar'
import { Hero } from '../sections/Hero'
import { About } from '../sections/About'
import { Trainers } from '../sections/Trainers'
import { Gallery } from '../sections/Gallery'
import { Testimonials } from '../sections/Testimonials'
import { Membership } from '../sections/Membership'
import { Contact } from '../sections/Contact'
import { Footer } from '../sections/Footer'
import './HomePage.css'

export function HomePage({ data, theme, onToggleTheme }) {
  useEffect(() => {
    document.title = data.meta.documentTitle
    document.documentElement.lang = data.meta.htmlLang
  }, [data.meta.documentTitle, data.meta.htmlLang])

  return (
    <>
      <a className="skip-link" href={data.skipLink.href}>
        {data.skipLink.label}
      </a>
      <Navbar
        branding={data.branding}
        navigation={data.navigation}
        themeToggle={data.theme.toggleLabels}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <main id="main-content">
        <Hero hero={data.hero} />
        <About about={data.about} />
        <Trainers trainers={data.trainers} />
        <Gallery gallery={data.gallery} />
        <Testimonials testimonials={data.testimonials} />
        <Membership membershipPlans={data.membershipPlans} />
        <Contact contact={data.contact} />
      </main>
      <Footer branding={data.branding} footer={data.footer} navigation={data.navigation} />
    </>
  )
}
