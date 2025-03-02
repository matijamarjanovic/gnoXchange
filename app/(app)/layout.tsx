'use client'

import { AdenaService } from "@/app/services/adena-service"
import { TooltipProvider } from "@/components/ui/tooltip"
import { seededRandom } from '@/utils/random'
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useLocalStorage } from 'react-use'
import { Navbar } from "../../components/nav-bar"
import { TicketSidebarProvider } from "./contexts/TicketSidebarContext"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useLocalStorage<string>("walletAddress", "")

  const logoPositions = useMemo(() => {
    const random = seededRandom(123)
    return Array.from({ length: 50 }, () => ({
      transform: `rotate(${random() * 360}deg)`,
      left: `${random() * 100}%`,
      top: `${random() * 100}%`,
      width: '100px',
      height: '100px',
      mask: 'radial-gradient(circle, black 30%, transparent 70%)',
      WebkitMask: 'radial-gradient(circle, black 30%, transparent 70%)',
    }))
  }, [])

  const toggleWallet = async () => {
    const adenaService = AdenaService.getInstance()
    setIsConnecting(true)
    
    try {
      if (walletAddress) {
        await adenaService.disconnectWallet()
        setWalletAddress("")
      } else {
        const address = await adenaService.connectWallet()
        if (address) {
          setWalletAddress(address)
        }
      }
    } finally {
      setIsConnecting(false)
    }
  }

  useEffect(() => {
    const handleAddressChange = (event: CustomEvent) => {
      const { newAddress } = event.detail
      if (newAddress) {
        setWalletAddress(newAddress)
      } else {
        setWalletAddress("")
      }
    }

    const handleLoadingChange = (event: CustomEvent) => {
      setIsConnecting(event.detail.isLoading)
    }

    window.addEventListener('adenaAddressChanged', handleAddressChange as EventListener)
    window.addEventListener('adenaLoadingChanged', handleLoadingChange as EventListener)
    setIsLoading(false)
    
    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange as EventListener)
      window.removeEventListener('adenaLoadingChanged', handleLoadingChange as EventListener)
    }
  }, [walletAddress, setWalletAddress])

  return (
    <TicketSidebarProvider>
      <TooltipProvider>
        <div className="min-h-screen flex-col bg-gray-700 text-gray-400">
          <div className="fixed inset-0 w-full h-full overflow-hidden opacity-10">
            {logoPositions.map((style, i) => (
              <div
                key={i}
                className="absolute"
                style={style}
              >
                <Image
                  src="/gnologo.png"
                  alt=""
                  width={100}
                  height={100}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
          <Navbar 
            walletAddress={isLoading ? "" : walletAddress ?? ""} 
            onWalletToggleAction={toggleWallet}
            isLoading={isLoading || isConnecting}
          />
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
