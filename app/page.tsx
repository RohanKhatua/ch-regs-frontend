'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const useSeatCount = (intervalMs = 30000) => {
  const [seats, setSeats] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = useCallback(async () => {
    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/seats?_=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch')
      }
      const data = await response.json()
      const availableSeats: string = data.availableSeats
      const registrations = 800 - parseInt(availableSeats)
      setSeats(registrations.toString())
      setError(null)
    } catch (error) {
      console.error(error)
      setError('Error fetching seat count')
    }
  }, [])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, intervalMs)
    return () => clearInterval(interval)
  }, [fetchCount, intervalMs])

  return { seats, error }
}

const AnimatedDigit = ({ digit }: { digit: string }) => (
  <div className="relative inline-block w-16 h-20 overflow-hidden mx-1">
    <AnimatePresence>
      <motion.span
        key={digit}
        className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-red-500"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          textShadow: '0 0 3px rgba(255, 0, 0, 0.5)',
        }}
      >
        {digit}
      </motion.span>
    </AnimatePresence>
  </div>
)

export default function Home() {
  const { seats, error } = useSeatCount(30000)

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500 text-2xl">
        <p>{error}</p>
      </div>
    )
  }

  if (!seats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500 text-2xl">
        <p>Loading...</p>
      </div>
    )
  }

  const registrationString = seats.toString().padStart(4, '0')

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg text-center border border-red-500" style={{
        boxShadow: '0 0 10px rgba(255, 0, 0, 0.2), 0 0 20px rgba(255, 0, 0, 0.1)',
      }}>
        <h1 className="text-4xl font-bold mb-6 text-red-500" style={{
          textShadow: '0 0 5px rgba(255, 0, 0, 0.5), 0 0 10px rgba(255, 0, 0, 0.3)',
        }}>
          Cryptic Hunt 2024
        </h1>
        <div className="flex justify-center">
          {registrationString.split('').map((digit, index) => (
            <AnimatedDigit key={index} digit={digit} />
          ))}
        </div>
        <p className="mt-6 text-gray-400 text-xl">Registrations</p>
      </div>
    </div>
  )
}