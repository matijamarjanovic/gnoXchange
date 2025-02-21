import { AdenaAccount, AdenaResponse, AdenaRunResponse, AdenaTransaction } from '@/app/types/adena-types'

export class AdenaService {
  private static instance: AdenaService
  private currentAddress: string = ''
  private isInitialized: boolean = false
  private readonly STORAGE_KEY = 'walletAddress'
  private pollInterval: NodeJS.Timeout | null = null

  private constructor() {
    if (typeof window !== 'undefined') {
      const savedAddress = localStorage.getItem(this.STORAGE_KEY)
      if (savedAddress) {
        this.currentAddress = savedAddress
        this.isInitialized = true
      }
    }
  }

  static getInstance(): AdenaService {
    if (!AdenaService.instance) {
      AdenaService.instance = new AdenaService()
    }
    return AdenaService.instance
  }

  async initialize(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false

      if (!window.adena) {
        window.open("https://adena.app/", "_blank")
        return false
      }

      await window.adena.AddEstablish("gnoxchange")
      this.isInitialized = true
      
      window.adena.On("changedAccount", (address: string) => {
        this.handleAddressChange(address)
      })
            
      return true
    } catch (error) {
      console.error('Failed to initialize Adena wallet:', error)
      return false
    }
  }

  async connect(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize()
        if (!initialized) return null;
      }

      if (!window.adena) {
        throw new Error('Adena wallet not found')
      }

      const account = await window.adena.GetAccount()
      const newAddress = account.data.address
      
      this.handleAddressChange(newAddress)
            
      return this.currentAddress
    } catch (error) {
      console.error('Failed to connect to Adena wallet:', error)
      return null
    }
  }

  async callContract(tx: AdenaTransaction): Promise<AdenaResponse> {
    if (!window.adena) {
      throw new Error('Wallet not initialized')
    }
    return await window.adena.DoContract(tx) as AdenaResponse
  }

  async runContract(tx: AdenaTransaction): Promise<AdenaRunResponse> {
    if (!window.adena) {
      throw new Error('Wallet not initialized')
    }
    return await window.adena.DoContract(tx) as AdenaRunResponse
  }

  async disconnect(): Promise<void> {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    
    this.isInitialized = false
    this.currentAddress = ''
    localStorage.removeItem(this.STORAGE_KEY)
  }

  getAddress(): string {
    return this.currentAddress
  }

  getAccount(): Promise<AdenaAccount> {
    return window.adena?.GetAccount() as Promise<AdenaAccount>
  }

  isConnected(): boolean {
    return this.isInitialized && !!this.currentAddress
  }

  private handleAddressChange(newAddress: string): void {
    const oldAddress = this.currentAddress
    this.currentAddress = newAddress
    localStorage.setItem(this.STORAGE_KEY, newAddress)
    
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('adenaAddressChanged', {
        detail: { oldAddress, newAddress }
      })
      window.dispatchEvent(event)
    }
  }

  async ensureWalletReady(): Promise<boolean> {
    if (!this.isConnected()) {
      const address = await this.connect()
      return !!address
    }
    return true
  }
}

declare global {
  interface Window {
    adena?: {
      AddEstablish: (appName: string) => Promise<void>
      GetAccount: () => Promise<AdenaAccount> 
      DoContract: (tx: AdenaTransaction) => Promise<AdenaResponse | AdenaRunResponse>
      On: (event: string, callback: (address: string) => void) => void
    }
  }
} 
