import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-amber-200/10 bg-amber-950">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ロゴ・説明 */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🏇</span>
              <span className="font-serif text-xl font-bold text-amber-100">
                競馬チャンプ
              </span>
            </Link>
            <p className="text-amber-400/70 text-sm leading-relaxed">
              実際の競馬レースを使って、無料で予想を楽しめるゲームです。
              ゲーム内コインで予想して、的中すればコインが増えます。
            </p>
          </div>

          {/* リンク */}
          <div>
            <h3 className="font-medium text-amber-100 mb-4">サービス</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/races" className="text-amber-400/70 hover:text-amber-200 transition-colors">
                  レース一覧
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="text-amber-400/70 hover:text-amber-200 transition-colors">
                  ランキング
                </Link>
              </li>
              <li>
                <Link href="/how-to-play" className="text-amber-400/70 hover:text-amber-200 transition-colors">
                  遊び方
                </Link>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h3 className="font-medium text-amber-100 mb-4">サポート</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-amber-400/70 hover:text-amber-200 transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-amber-400/70 hover:text-amber-200 transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-amber-400/70 hover:text-amber-200 transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-amber-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-amber-500/60">
            <p>&copy; 2025 競馬チャンプ. All rights reserved.</p>
            <p className="mt-2 md:mt-0">
              ※ このサービスは実際の競馬の購入には使用できません。
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

