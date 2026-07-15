'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Wifi,
  Zap,
  Volume2,
  Wind,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface StudyAreaCardProps {
  id: string
  name: string
  building?: string
  floor?: string
  capacity: number
  currentCount: number
  crowdStatus: 'Low Crowd' | 'Medium Crowd' | 'High Crowd'
  trendStatus: 'Getting crowded' | 'Getting quieter' | 'Stable'
  lastUpdated: string | Date
  facilities: {
    wifi: boolean
    chargingPorts: boolean
    silentZone: boolean
    ac: boolean
  }
}

export function StudyAreaCard({
  id,
  name,
  building,
  floor,
  capacity,
  currentCount,
  crowdStatus,
  trendStatus,
  lastUpdated,
  facilities,
}: StudyAreaCardProps) {
  const occupancyPercent = (currentCount / capacity) * 100
  const availableSeats = capacity - currentCount

  const crowdColor = 
    crowdStatus === 'Low Crowd'
      ? 'bg-green-100 text-green-800'
      : crowdStatus === 'Medium Crowd'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800'

  const crowdBgColor =
    crowdStatus === 'Low Crowd'
      ? 'bg-green-500'
      : crowdStatus === 'Medium Crowd'
        ? 'bg-yellow-500'
        : 'bg-red-500'

  const trendIcon =
    trendStatus === 'Getting crowded' ? (
      <TrendingUp className="w-4 h-4 text-orange-500" />
    ) : trendStatus === 'Getting quieter' ? (
      <TrendingDown className="w-4 h-4 text-blue-500" />
    ) : (
      <div className="w-4 h-4 text-gray-500">—</div>
    )

  const trendColor =
    trendStatus === 'Getting crowded'
      ? 'text-orange-600'
      : trendStatus === 'Getting quieter'
        ? 'text-blue-600'
        : 'text-gray-600'

  return (
    <Link href={`/study-areas/${id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer h-full">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4" />
            {building && <span>{building}</span>}
            {floor && <span>• Floor {floor}</span>}
          </div>
        </div>

        {/* Occupancy Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {currentCount}/{capacity} seats
            </span>
            <span className="text-sm text-gray-600">
              {occupancyPercent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${crowdBgColor}`}
              style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${crowdColor}`}
          >
            {crowdStatus}
          </span>
          <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            {trendIcon}
            {trendStatus}
          </span>
        </div>

        {/* Available Seats Info */}
        <div className="bg-blue-50 rounded p-2 mb-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">{availableSeats}</span> seats available
          </p>
        </div>

        {/* Facilities */}
        <div className="flex gap-3 flex-wrap">
          {facilities.wifi && (
            <div className="flex items-center gap-1 text-gray-600">
              <Wifi className="w-4 h-4" />
              <span className="text-xs">WiFi</span>
            </div>
          )}
          {facilities.chargingPorts && (
            <div className="flex items-center gap-1 text-gray-600">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Charging</span>
            </div>
          )}
          {facilities.silentZone && (
            <div className="flex items-center gap-1 text-gray-600">
              <Volume2 className="w-4 h-4" />
              <span className="text-xs">Silent</span>
            </div>
          )}
          {facilities.ac && (
            <div className="flex items-center gap-1 text-gray-600">
              <Wind className="w-4 h-4" />
              <span className="text-xs">A/C</span>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Updated{' '}
            {lastUpdated instanceof Date
              ? lastUpdated.toLocaleTimeString()
              : new Date(lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Link>
  )
}