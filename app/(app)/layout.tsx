import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex-col bg-gray-800 text-gray-400">
      <header className="">
        <div className="flex h-12 items-center px-4">
          <div className="flex w-full text-sm">
            <div className="flex items-center gap-2">
              <Link href="/" className="font-semibold">
                GnoXchange
              </Link>
              <Link href="/pools">
                <Button variant="ghost" className="bg-transparent hover:bg-gray-700 hover:text-gray-400">
                  Liquidity Pools
                </Button>
              </Link>
              <Link href="/tickets">
                <Button variant="ghost" className="bg-transparent hover:bg-gray-700 hover:text-gray-400">
                  Tickets
                </Button>
              </Link>
              <Link href="/nftmarket">
                <Button variant="ghost" className="bg-transparent hover:bg-gray-700 hover:text-gray-400">
                  NFT Marketplace
                </Button>
              </Link>
            <Link href="/ticket-history">
                <Button variant="ghost" className="bg-transparent hover:bg-gray-700 hover:text-gray-400" >
                  Ticket History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div>
          {children}
        </div>
      </main>
    </div>
  )
}
