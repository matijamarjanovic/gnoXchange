'use client'

import { AdenaService } from "@/app/services/adena-service"
import { TooltipProvider } from "@/components/ui/tooltip"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useLocalStorage } from 'react-use'
import { TicketSidebarProvider } from "./contexts/TicketSidebarContext"
import { Navbar } from "../../components/nav-bar"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useLocalStorage<string>("walletAddress", "")
  const [partialAddress, setPartialAddress] = useState<string>("")

  

  const toggleWallet = async () => {
    const adenaService = AdenaService.getInstance()
    
    if (walletAddress) {
      await adenaService.disconnectWallet()
      setWalletAddress("")
      setPartialAddress("")
    } else {
      const address = await adenaService.connectWallet()
      if (address) {
        setWalletAddress(address)
        setPartialAddress(address.slice(0, 6) + "..." + address.slice(-4))
      }
    }
  }

  useEffect(() => {
    const handleAddressChange = (event: CustomEvent) => {
      const { newAddress } = event.detail
      if (newAddress) {
        setPartialAddress(newAddress.slice(0, 6) + "..." + newAddress.slice(-4))
        setWalletAddress(newAddress)
      } else {
        setWalletAddress("")
        setPartialAddress("")
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
                  src="/gnologo.png"
                  alt=""
                  width={100}
                  height={100}
                  className=""
                />
              </div>
            ))}
          </div>
          <Navbar walletAddress={partialAddress ?? ""} onWalletToggleAction={toggleWallet} />
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
