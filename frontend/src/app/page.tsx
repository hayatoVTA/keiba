import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Trophy, TrendingUp, Gift, Users, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ヒーローセクション */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* 背景パターン */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />

        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2 text-sm">
            🎉 新規登録で10,000コインプレゼント
          </Badge>

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-amber-100 mb-6 leading-tight">
            実際のレースで
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
              予想の腕を試せ
            </span>
          </h1>

          <p className="text-lg md:text-xl text-amber-300/80 mb-8 max-w-2xl mx-auto">
            競馬チャンプは、JRAの実際のレースデータを使った無料の競馬予想ゲーム。
            <br className="hidden md:block" />
            コインを賭けて予想し、的中すればコインが増える！
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 font-bold text-lg px-8 py-6 hover:from-yellow-400 hover:to-amber-400 shadow-lg shadow-amber-500/25"
              >
                今すぐ無料で始める
              </Button>
            </Link>
            <Link href="/races">
              <Button
                size="lg"
                variant="outline"
                className="border-amber-400 text-amber-200 hover:bg-amber-800/50 text-lg px-8 py-6"
              >
                レースを見る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 px-4 bg-amber-900/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-amber-100 mb-12">
            競馬チャンプの特徴
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-amber-950/50 border-amber-800/50 hover:border-amber-600/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-yellow-400" />
                </div>
                <CardTitle className="text-amber-100">完全無料で遊べる</CardTitle>
                <CardDescription className="text-amber-400/70">
                  登録で10,000コインもらえて、毎日ログインでボーナスも！
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-amber-950/50 border-amber-800/50 hover:border-amber-600/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-amber-100">リアルなオッズ</CardTitle>
                <CardDescription className="text-amber-400/70">
                  実際のレースデータとオッズを使用。本物と同じ感覚で予想！
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-amber-950/50 border-amber-800/50 hover:border-amber-600/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-amber-100">全国ランキング</CardTitle>
                <CardDescription className="text-amber-400/70">
                  上位入賞で豪華報酬をゲット！腕を磨いてトップを目指せ。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 予想タイプセクション */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-amber-100 mb-4">
            6種類の予想タイプ
          </h2>
          <p className="text-center text-amber-400/70 mb-12">
            実際の競馬と同じ予想方法に対応
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "単勝", desc: "1着を予想", difficulty: "易" },
              { name: "複勝", desc: "3着以内", difficulty: "易" },
              { name: "馬連", desc: "1-2着の組合せ", difficulty: "中" },
              { name: "ワイド", desc: "3着内2頭", difficulty: "中" },
              { name: "3連複", desc: "3着内3頭", difficulty: "難" },
              { name: "3連単", desc: "着順まで", difficulty: "超難" },
            ].map((type) => (
              <Card key={type.name} className="bg-amber-950/50 border-amber-800/50 text-center">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-amber-100 text-lg mb-1">{type.name}</h3>
                  <p className="text-sm text-amber-400/70 mb-2">{type.desc}</p>
                  <Badge
                    variant="outline"
                    className={`
                      ${type.difficulty === "易" ? "border-green-500 text-green-400" : ""}
                      ${type.difficulty === "中" ? "border-yellow-500 text-yellow-400" : ""}
                      ${type.difficulty === "難" ? "border-orange-500 text-orange-400" : ""}
                      ${type.difficulty === "超難" ? "border-red-500 text-red-400" : ""}
                    `}
                  >
                    {type.difficulty}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* コイン獲得方法セクション */}
      <section className="py-16 px-4 bg-amber-900/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-amber-100 mb-12">
            コインの獲得方法
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-amber-950/80 to-amber-900/50 border-amber-700/50">
              <CardContent className="pt-6">
                <Gift className="h-10 w-10 text-yellow-400 mb-4" />
                <h3 className="font-bold text-amber-100 mb-2">新規登録ボーナス</h3>
                <p className="text-2xl font-bold text-yellow-400 mb-2">10,000 コイン</p>
                <p className="text-sm text-amber-400/70">登録するだけで今すぐもらえる！</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-950/80 to-amber-900/50 border-amber-700/50">
              <CardContent className="pt-6">
                <Target className="h-10 w-10 text-green-400 mb-4" />
                <h3 className="font-bold text-amber-100 mb-2">予想的中</h3>
                <p className="text-2xl font-bold text-green-400 mb-2">賭金 × オッズ</p>
                <p className="text-sm text-amber-400/70">的中すればコインが増える！</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-950/80 to-amber-900/50 border-amber-700/50">
              <CardContent className="pt-6">
                <Users className="h-10 w-10 text-blue-400 mb-4" />
                <h3 className="font-bold text-amber-100 mb-2">ログインボーナス</h3>
                <p className="text-2xl font-bold text-blue-400 mb-2">毎日 100 コイン</p>
                <p className="text-sm text-amber-400/70">連続ログインでさらに増加！</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-950/80 to-amber-900/50 border-amber-700/50">
              <CardContent className="pt-6">
                <Trophy className="h-10 w-10 text-purple-400 mb-4" />
                <h3 className="font-bold text-amber-100 mb-2">ランキング報酬</h3>
                <p className="text-2xl font-bold text-purple-400 mb-2">最大 50,000</p>
                <p className="text-sm text-amber-400/70">上位入賞で豪華報酬！</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-100 mb-6">
            今すぐ始めて、予想の腕を試そう
          </h2>
          <p className="text-lg text-amber-300/80 mb-8">
            登録は無料。Googleアカウントで簡単ログイン。
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 font-bold text-lg px-12 py-6 hover:from-yellow-400 hover:to-amber-400 shadow-lg shadow-amber-500/25"
            >
              Googleでログインして10,000コインもらう
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
