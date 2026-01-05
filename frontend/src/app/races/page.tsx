'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  Filter,
  Trophy
} from 'lucide-react'

// モックデータ（実際はAPIから取得）
const mockRaces = [
  {
    id: '1',
    date: '2025-01-05',
    venue: '中山',
    raceNumber: 11,
    raceName: '中山金杯',
    grade: 'G3',
    distance: 2000,
    surface: 'turf',
    condition: '良',
    status: 'betting',
    startTime: '15:35',
    horseCount: 16,
  },
  {
    id: '2',
    date: '2025-01-05',
    venue: '京都',
    raceNumber: 11,
    raceName: '京都金杯',
    grade: 'G3',
    distance: 1600,
    surface: 'turf',
    condition: '良',
    status: 'betting',
    startTime: '15:25',
    horseCount: 18,
  },
  {
    id: '3',
    date: '2025-01-05',
    venue: '中山',
    raceNumber: 10,
    raceName: '4歳上1勝クラス',
    grade: null,
    distance: 1800,
    surface: 'turf',
    condition: '良',
    status: 'upcoming',
    startTime: '15:00',
    horseCount: 14,
  },
  {
    id: '4',
    date: '2025-01-05',
    venue: '京都',
    raceNumber: 10,
    raceName: '4歳上2勝クラス',
    grade: null,
    distance: 1400,
    surface: 'dirt',
    condition: '稍重',
    status: 'betting',
    startTime: '14:55',
    horseCount: 12,
  },
]

export default function RacesPage() {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredRaces = mockRaces.filter(race => {
    if (selectedVenue && race.venue !== selectedVenue) return false
    if (selectedStatus !== 'all' && race.status !== selectedStatus) return false
    return true
  })

  const venues = [...new Set(mockRaces.map(race => race.venue))]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'betting':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">予想受付中</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">まもなく開始</Badge>
      case 'running':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">レース中</Badge>
      case 'finished':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">終了</Badge>
      default:
        return null
    }
  }

  const getGradeBadge = (grade: string | null) => {
    if (!grade) return null
    const gradeColors: Record<string, string> = {
      'G1': 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
      'G2': 'bg-pink-500/30 text-pink-300 border-pink-500/50',
      'G3': 'bg-purple-500/30 text-purple-300 border-purple-500/50',
    }
    return (
      <Badge className={gradeColors[grade] || 'bg-amber-500/30 text-amber-300 border-amber-500/50'}>
        <Trophy className="h-3 w-3 mr-1" />
        {grade}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-amber-400" />
          レース一覧
        </h1>
        <p className="text-amber-400/70 mt-2">
          今日のレースから予想するレースを選んでください
        </p>
      </div>

      {/* フィルター */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* 競馬場フィルター */}
        <div className="flex gap-2 items-center">
          <MapPin className="h-4 w-4 text-amber-400" />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedVenue === null ? 'default' : 'outline'}
              className={selectedVenue === null 
                ? 'bg-amber-600 text-amber-100' 
                : 'border-amber-700 text-amber-200 hover:bg-amber-800/50'
              }
              onClick={() => setSelectedVenue(null)}
            >
              すべて
            </Button>
            {venues.map(venue => (
              <Button
                key={venue}
                size="sm"
                variant={selectedVenue === venue ? 'default' : 'outline'}
                className={selectedVenue === venue 
                  ? 'bg-amber-600 text-amber-100' 
                  : 'border-amber-700 text-amber-200 hover:bg-amber-800/50'
                }
                onClick={() => setSelectedVenue(venue)}
              >
                {venue}
              </Button>
            ))}
          </div>
        </div>

        {/* ステータスフィルター */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="bg-amber-900/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-700">
              すべて
            </TabsTrigger>
            <TabsTrigger value="betting" className="data-[state=active]:bg-amber-700">
              予想受付中
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-amber-700">
              まもなく
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* レース一覧 */}
      <div className="space-y-4">
        {filteredRaces.length === 0 ? (
          <Card className="bg-amber-950/50 border-amber-800/50">
            <CardContent className="py-12 text-center">
              <p className="text-amber-400/70">該当するレースがありません</p>
            </CardContent>
          </Card>
        ) : (
          filteredRaces.map(race => (
            <Link key={race.id} href={`/races/${race.id}`}>
              <Card className="bg-amber-950/50 border-amber-800/50 hover:border-amber-600/50 transition-all hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* レース番号 */}
                      <div className="w-12 h-12 rounded-full bg-amber-800/50 flex items-center justify-center">
                        <span className="text-lg font-bold text-amber-100">{race.raceNumber}R</span>
                      </div>
                      
                      {/* レース情報 */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-amber-100">{race.raceName}</h3>
                          {getGradeBadge(race.grade)}
                          {getStatusBadge(race.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-amber-400/70">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {race.venue}
                          </span>
                          <span>
                            {race.surface === 'turf' ? '芝' : 'ダート'} {race.distance}m
                          </span>
                          <span>{race.condition}</span>
                          <span>{race.horseCount}頭</span>
                        </div>
                      </div>
                    </div>

                    {/* 発走時刻 */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-200">
                          <Clock className="h-4 w-4" />
                          <span className="font-bold">{race.startTime}</span>
                        </div>
                        <p className="text-xs text-amber-400/70">発走予定</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

