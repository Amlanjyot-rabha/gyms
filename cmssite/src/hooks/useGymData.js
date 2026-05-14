import { useCallback, useEffect, useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { gymData as defaultData } from '../data/gymData'

export function useGymData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    
    // Fetch CMS from backend API
    axiosInstance.get('/cms')
      .then((res) => {
        if (!cancelled) {
          // If response is empty or missing fields, merge with defaultData to prevent frontend crashing
          const backendData = res.data?.data || res.data;
          // Here we ensure it works using structure expected by UI
          if (backendData && backendData.hero) {
             setData(backendData);
          } else {
             setData(defaultData);
          }
        }
      })
      .catch((e) => {
        console.error('Failed to fetch CMS, falling back to local.', e);
        if (!cancelled) setData(defaultData); // fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
      
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return { data, loading, error, refetch }
}
