'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { useUserStore } from '@/stores/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  MapPin, 
  Clock, 
  Trophy,
  Coins,
  CheckCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

// モックデータ
const mockRace = {
  id: '1',
  date: '2025-01-05',
  venue: '中山',
  raceNumber: 11,
  raceName: '中山金杯',
  grade: 'G3',
  distance: 2000,
  surface: 'turf',
  condition: '良',
  weather: '晴',
  status: 'betting',
  startTime: '15:35',
  bettingEndTime: '15:30',
  horses: [
    { number: 1, name: 'ボッケリーニ', jockey: 'Ｃルメール', odds: 3.2, popularity: 1, age: 7, sex: 'male' },
    { number: 2, name: 'エヒト', jockey: '横山武史', odds: 5.8, popularity: 2, age: 6, sex: 'male' },
    { number: 3, name: 'リカンカブール', jockey: '戸崎圭太', odds: 7.5, popularity: 3, age: 5, sex: 'male' },
    { number: 4, name: 'マイネルウィルトス', jockey: '菅原明良', odds: 12.3, popularity: 5, age: 8, sex: 'male' },
    { number: 5, name: 'レッドランメルト', jockey: '池添謙一', odds: 9.8, popularity: 4, age: 5, sex: 'male' },
    { number: 6, name: 'ククナ', jockey: '田辺裕信', odds: 15.6, popularity: 6, age: 6, sex: 'female' },
    { number: 7, name: 'フェーングロッテン', jockey: '松山弘平', odds: 18.2, popularity: 7, age: 5, sex: 'male' },
    { number: 8, name: 'ヤマニンサルバム', jockey: '北村宏司', odds: 25.4, popularity: 8, age: 6, sex: 'male' },
  ],
}

const BET_TYPES = [
  { id: 'win', name: '単勝', description: '1着を予想', selections: 1 },
  { id: 'place', name: '複勝', description: '3着以内を予想', selections: 1 },
]

export default function RaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user: authUser, session } = useAuth()
  const { user, updateCoins } = useUserStore()
  
  const [selectedBetType, setSelectedBetType] = useState('win')
  const [selectedHorses, setSelectedHorses] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState(100)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [betSuccess, setBetSuccess] = useState(false)

  const race = mockRace // 実際はAPIから取得
  const currentBetType = BET_TYPES.find(bt => bt.id === selectedBetType)!

  const handleHorseSelect = (horseNumber: number) => {
    if (selectedHorses.includes(horseNumber)) {
      setSelectedHorses(selectedHorses.filter(n => n !== horseNumber))
    } else if (selectedHorses.length < currentBetType.selections) {
      setSelectedHorses([...selectedHorses, horseNumber])
    } else {
      // 選択数を超えている場合は最初の選択を外して新しいのを追加
      setSelectedHorses([horseNumber])
    }
  }

  const getSelectedOdds = () => {
    if (selectedHorses.length === 0) return 0
    const horse = race.horses.find(h => h.number === selectedHorses[0])
    if (!horse) return 0
    
    if (selectedBetType === 'place') {
      return Math.max(1.1, horse.odds / 3)
    }
    return horse.odds
  }

  const expectedPayout = Math.floor(betAmount * getSelectedOdds())

  const handleSubmit = async () => {
    if (!authUser) {
      router.push('/login')
      return
    }

    if (selectedHorses.length !== currentBetType.selections) return
    if (betAmount < 10 || betAmount > (user?.coins || 0)) return

    setIsSubmitting(true)
    
    // 実際はAPIを呼び出す
    try {
      // 仮の成功処理
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newCoins = (user?.coins || 0) - betAmount
      updateCoins(newCoins)
      setBetSuccess(true)
    } catch (error) {
      console.error('Failed to place bet:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (betSuccess) {
    const selectedHorse = race.horses.find(h => h.number === selectedHorses[0])
    
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto bg-amber-950/50 border-amber-800/50">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">予想完了！</h2>
            <p className="text-amber-400/70 mb-6">
              レース結果をお楽しみに
            </p>
            
            <div className="bg-amber-900/30 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-amber-400/70">レース</span>
                <span className="text-amber-100">{race.raceName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-amber-400/70">予想タイプ</span>
                <span className="text-amber-100">{currentBetType.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-amber-400/70">予想馬</span>
                <span className="text-amber-100">{selectedHorse?.number}番 {selectedHorse?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-amber-400/70">賭け金</span>
                <span className="text-amber-100">{betAmount.toLocaleString()}コイン</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400/70">オッズ</span>
                <span className="text-yellow-400">{getSelectedOdds().toFixed(1)}倍</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 border-amber-700 text-amber-200 hover:bg-amber-800/50"
                onClick={() => {
                  setBetSuccess(false)
                  setSelectedHorses([])
                }}
              >
                続けて予想
              </Button>
              <Link href="/bets" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 font-bold">
                  予想履歴へ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 戻るボタン */}
      <Link href="/races" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        レース一覧に戻る
      </Link>

      {/* レース情報ヘッダー */}
      <Card className="bg-amber-950/50 border-amber-800/50 mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-amber-800/50 text-amber-200">
              {race.venue} {race.raceNumber}R
            </Badge>
            {race.grade && (
              <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">
                <Trophy className="h-3 w-3 mr-1" />
                {race.grade}
              </Badge>
            )}
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              予想受付中
            </Badge>
          </div>
          <CardTitle className="text-2xl font-serif text-amber-100">
            {race.raceName}
          </CardTitle>
          <CardDescription className="flex flex-wrap gap-4 text-amber-400/70">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {race.venue}競馬場
            </span>
            <span>
              {race.surface === 'turf' ? '芝' : 'ダート'} {race.distance}m
            </span>
            <span>馬場: {race.condition}</span>
            <span>天候: {race.weather}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {race.startTime} 発走
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 出走馬一覧 */}
        <div className="lg:col-span-2">
          <Card className="bg-amber-950/50 border-amber-800/50">
            <CardHeader>
              <CardTitle className="text-amber-100">出走馬</CardTitle>
              <CardDescription className="text-amber-400/70">
                予想する馬をクリックして選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-amber-800/50">
                    <TableHead className="text-amber-400">馬番</TableHead>
                    <TableHead className="text-amber-400">馬名</TableHead>
                    <TableHead className="text-amber-400">騎手</TableHead>
                    <TableHead className="text-amber-400 text-right">オッズ</TableHead>
                    <TableHead className="text-amber-400 text-center">人気</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {race.horses.map(horse => (
                    <TableRow 
                      key={horse.number}
                      className={`border-amber-800/50 cursor-pointer transition-colors ${
                        selectedHorses.includes(horse.number)
                          ? 'bg-yellow-500/20'
                          : 'hover:bg-amber-800/30'
                      }`}
                      onClick={() => handleHorseSelect(horse.number)}
                    >
                      <TableCell>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          selectedHorses.includes(horse.number)
                            ? 'bg-yellow-500 text-amber-950'
                            : 'bg-amber-800/50 text-amber-200'
                        }`}>
                          {horse.number}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-amber-100">
                        {horse.name}
                        <span className="text-xs text-amber-500 ml-2">
                          {horse.sex === 'male' ? '牡' : '牝'}{horse.age}
                        </span>
                      </TableCell>
                      <TableCell className="text-amber-300">{horse.jockey}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${
                          horse.odds < 5 ? 'text-yellow-400' : 
                          horse.odds < 10 ? 'text-amber-300' : 'text-amber-400/70'
                        }`}>
                          {horse.odds.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`
                          ${horse.popularity === 1 ? 'border-yellow-500 text-yellow-400' : ''}
                          ${horse.popularity === 2 ? 'border-gray-400 text-gray-300' : ''}
                          ${horse.popularity === 3 ? 'border-amber-600 text-amber-500' : ''}
                          ${horse.popularity > 3 ? 'border-amber-800 text-amber-600' : ''}
                        `}>
                          {horse.popularity}番人気
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* 予想フォーム */}
        <div className="lg:col-span-1">
          <Card className="bg-amber-950/50 border-amber-800/50 sticky top-24">
            <CardHeader>
              <CardTitle className="text-amber-100">予想する</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 予想タイプ選択 */}
              <div>
                <label className="text-sm font-medium text-amber-200 mb-2 block">
                  予想タイプ
                </label>
                <Tabs value={selectedBetType} onValueChange={(v) => {
                  setSelectedBetType(v)
                  setSelectedHorses([])
                }}>
                  <TabsList className="w-full bg-amber-900/50">
                    {BET_TYPES.map(bt => (
                      <TabsTrigger 
                        key={bt.id} 
                        value={bt.id}
                        className="flex-1 data-[state=active]:bg-amber-700"
                      >
                        {bt.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <p className="text-xs text-amber-400/70 mt-2">
                  {currentBetType.description}
                </p>
              </div>

              {/* 選択した馬 */}
              <div>
                <label className="text-sm font-medium text-amber-200 mb-2 block">
                  選択した馬
                </label>
                {selectedHorses.length === 0 ? (
                  <div className="p-4 rounded-lg bg-amber-900/30 border border-dashed border-amber-700 text-center text-amber-400/70">
                    馬を選択してください
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    {selectedHorses.map(num => {
                      const horse = race.horses.find(h => h.number === num)
                      return (
                        <div key={num} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-yellow-500 text-amber-950 flex items-center justify-center text-sm font-bold">
                              {num}
                            </span>
                            <span className="text-amber-100 font-medium">{horse?.name}</span>
                          </div>
                          <span className="text-yellow-400 font-bold">
                            {getSelectedOdds().toFixed(1)}倍
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 賭け金 */}
              <div>
                <label className="text-sm font-medium text-amber-200 mb-2 block">
                  賭け金
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
                    min={10}
                    max={user?.coins || 10000}
                    className="pl-10 bg-amber-900/50 border-amber-700 text-amber-100"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 5000].map(amount => (
                    <Button
                      key={amount}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-amber-700 text-amber-200 hover:bg-amber-800/50"
                      onClick={() => setBetAmount(amount)}
                    >
                      {amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-amber-400/70 mt-2">
                  保有: {user?.coins?.toLocaleString() || '---'} コイン
                </p>
              </div>

              {/* 予想配当 */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-amber-400/70">的中時の配当</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {expectedPayout.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-amber-400/70 text-right mt-1">
                  {betAmount.toLocaleString()} × {getSelectedOdds().toFixed(1)} = {expectedPayout.toLocaleString()}コイン
                </p>
              </div>

              {/* 予想ボタン */}
              <Button
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 font-bold hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50"
                disabled={
                  selectedHorses.length !== currentBetType.selections ||
                  betAmount < 10 ||
                  betAmount > (user?.coins || 0) ||
                  isSubmitting
                }
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : !authUser ? (
                  'ログインして予想する'
                ) : (
                  '予想を確定する'
                )}
              </Button>

              {!authUser && (
                <p className="text-xs text-center text-amber-400/70">
                  予想するにはログインが必要です
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

