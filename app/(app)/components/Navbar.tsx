'use client'

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'

interface NavbarProps {
  walletAddress: string
  onWalletToggleAction: () => Promise<void>
}

export function Navbar({ walletAddress, onWalletToggleAction }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
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
            <Tabs value={pathname} onValueChange={(value) => router.push(value)} className="w-fit">
              <TabsList className="bg-gray-900/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="/tickets"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-blue-400"
                >
                  P2P Tickets
                </TabsTrigger>
                <TabsTrigger 
                  value="/nftmarket"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-blue-400"
                >
                  NFT Marketplace
                </TabsTrigger>
                <TabsTrigger 
                  value="/pools"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-blue-400"
                >
                  Liquidity Pools
                </TabsTrigger>
                <TabsTrigger 
                  value="/ticket-history"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-blue-400"
                >
                  Ticket History
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                onClick={onWalletToggleAction}
                variant="ghost" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-gray-900/50 hover:bg-gray-700/50 hover:text-gray-300"
              >
                <Wallet className="mr-2" size={16} />
                {walletAddress || "Connect Wallet"}
                <Image src="/adena.png" alt="Adena Logo" width={16} height={16} className="ml-2" />
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
  )
} 
