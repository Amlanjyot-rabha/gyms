import { gymData } from './data/gymData'
import { Button } from './components/Button'
import { PageSkeleton } from './components/PageSkeleton'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { useGymData } from './hooks/useGymData'
import { HomePage } from './pages/HomePage'
import './App.css'

function AppShell() {
  const { data, loading, error, refetch } = useGymData()
  const { theme, toggleTheme } = useTheme()

  if (loading && !data) {
    return <PageSkeleton ariaLabel={gymData.loading.ariaBusyLabel} />
  }

  if (error) {
    return (
      <div className="app-error" role="alert">
        <h1 className="app-error__title">{gymData.error.title}</h1>
        <p className="app-error__desc">{gymData.error.description}</p>
        <Button type="button" variant="primary" onClick={refetch}>
          {gymData.error.retryLabel}
        </Button>
      </div>
    )
  }

  return <HomePage data={data} theme={theme} onToggleTheme={toggleTheme} />
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
