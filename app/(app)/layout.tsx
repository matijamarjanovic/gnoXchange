import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { TicketSidebarProvider } from "./contexts/TicketSidebarContext"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TicketSidebarProvider>
      <div className="min-h-screen flex-col bg-gray-700 text-gray-400">
        <div className="fixed inset-0 w-full h-full overflow-hidden opacity-10">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                transform: `rotate(${Math.random() * 360}deg)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '100px',
                height: '100px',
                mask: 'radial-gradient(circle, black 30%, transparent 70%)',
                WebkitMask: 'radial-gradient(circle, black 30%, transparent 70%)',
              }}
            >
              <Image
                src="https://avatars.githubusercontent.com/u/75237105?s=280&v=4"
                alt=""
                width={100}
                height={100}
                className="opacity-70"
              />
            </div>
          ))}
        </div>
        <header className="relative z-10">
          <div className="flex h-16 items-center bg-gray-800 rounded-b-lg mb-2">
            <div className="flex w-full text-lg">
              <div className="flex items-center gap-4">
                <Link 
                  href="/" 
                  className={`font-bold text-xl bg-blue-600 bg-clip-text text-transparent transition-colors`}
                >
                  <div className="flex items-center">
                    <Image
                      src="/gnoxchange-logo.png"
                      alt=""
                      width={40}
                      height={40}
                      className="ml-4 mr-2"
                    />
                    <Image
                      src="/gnoxchange-logo-letters.png"
                      alt=""
                      width={160}
                      height={160}
                    />
                  </div>
                </Link>
                <nav className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg backdrop-blur-sm">
                  <Link href="/tickets">
                    <Button 
                      variant="ghost" 
                      className="text-base font-medium transition-colors hover:bg-gray-800/50 hover:text-gray-300 data-[active]:bg-gray-800 data-[active]:text-gray-200"
                    >
                      P2P Tickets
                    </Button>
                  </Link>
                  <Link href="/nftmarket">
                    <Button 
                      variant="ghost" 
                      className="text-base font-medium transition-colors hover:bg-gray-800/50 hover:text-gray-300 data-[active]:bg-gray-800 data-[active]:text-gray-200"
                    >
                      NFT Marketplace
                    </Button>
                  </Link>
                  <Link href="/pools">
                    <Button 
                      variant="ghost" 
                      className="text-base font-medium transition-colors hover:bg-gray-800/50 hover:text-gray-300 data-[active]:bg-gray-800 data-[active]:text-gray-200"
                    >
                      Liquidity Pools
                    </Button>
                  </Link>
                  <Link href="/ticket-history">
                    <Button 
                      variant="ghost" 
                      className="text-base font-medium transition-colors hover:bg-gray-800/50 hover:text-gray-300 data-[active]:bg-gray-800 data-[active]:text-gray-200"
                    >
                      Ticket History
                    </Button>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </header>
        <main className="relative z-10">
          <div>
            {children}
          </div>
        </main>
      </div>
    </TicketSidebarProvider>
  )
}
