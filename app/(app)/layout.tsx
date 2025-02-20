'use client'

import { AdenaService } from "@/app/services/adena-service"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useEffect } from "react"
import { useLocalStorage } from 'react-use'
import { TicketSidebarProvider } from "./contexts/TicketSidebarContext"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useLocalStorage<string>("walletAddress", "")
  const pathname = usePathname()

  const toggleWallet = async () => {
    const adenaService = AdenaService.getInstance()
    
    if (walletAddress) {
      await adenaService.disconnect()
      setWalletAddress("")
    } else {
      const address = await adenaService.connect()
      if (address) {
        setWalletAddress(address.slice(0, 6) + "..." + address.slice(-4))
      }
    }
  }

  useEffect(() => {
    const handleAddressChange = (event: CustomEvent) => {
      const { newAddress } = event.detail
      if (newAddress) {
        setWalletAddress(newAddress.slice(0, 6) + "..." + newAddress.slice(-4))
      } else {
        setWalletAddress("")
      }
    }

    window.addEventListener('adenaAddressChanged', handleAddressChange as EventListener)
    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange as EventListener)
    }
  }, [setWalletAddress])

  return (
    <TicketSidebarProvider>
      <TooltipProvider>
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
            <div className="flex w-full text-lg items-center justify-between px-4">
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
                      className={`text-base font-medium transition-colors hover:bg-gray-800/50 hover:text-gray-300 ${
                        pathname === '/tickets' ? 'bg-gray-800 text-gray-200' : ''
                      }`}
                    >
                      P2P Tickets
                    </Button>
                  </Link>
                  <Link href="/nftmarket">
                    <Button 
                      variant="ghost" 
                      className={`text-base font-medium transition-colors hover:bg-gray-800/50 hover:text-gray-300 ${
                        pathname === '/nftmarket' ? 'bg-gray-800 text-gray-200' : ''
                      }`}
                    >
                      NFT Marketplace
                    </Button>
                  </Link>
                  <Link href="/pools">
                    <Button 
                      variant="ghost" 
                      className={`text-base font-medium transition-colors hover:bg-gray-800/50 hover:text-gray-300 ${
                        pathname === '/pools' ? 'bg-gray-800 text-gray-200' : ''
                      }`}
                    >
                      Liquidity Pools
                    </Button>
                  </Link>
                  <Link href="/ticket-history">
                    <Button 
                      variant="ghost" 
                      className={`text-base font-medium transition-colors hover:bg-gray-800/50 hover:text-gray-300 ${
                        pathname === '/ticket-history' ? 'bg-gray-800 text-gray-200' : ''
                      }`}
                    >
                      Ticket History
                    </Button>
                  </Link>
                </nav>
              </div>
              
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={toggleWallet}
                    variant="ghost" 
                    className="ml-auto text-base font-medium bg-gray-900/50 hover:bg-gray-700/50 hover:text-gray-300"
                  >
                    <Wallet className="mr-2" size={20} />
                    {walletAddress || "Connect Wallet"}
                    <Image src="/adena.png" alt="Adena Logo" width={20} height={20} className="ml-2" />
                  </Button>
                </TooltipTrigger>
                {walletAddress && (
                  <TooltipContent className="bg-gray-900/50 text-red-400 border-none">
                    <p>Disconnect wallet</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </header>
        <main className="relative z-10">
          <div>
            {children}
          </div>
        </main>
      </div>
      </TooltipProvider>
    </TicketSidebarProvider>
  )
}
