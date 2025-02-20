import { AdenaAccount, AdenaResponse, AdenaRunResponse, AdenaTransaction } from '@/app/types/adena-types'

export class AdenaService {
  private static instance: AdenaService
  private currentAddress: string = ''
  private isInitialized: boolean = false
  private readonly STORAGE_KEY = 'adena_wallet_address'

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
      return true
    } catch (error) {
      console.error('Failed to initialize Adena wallet:', error)
      return false
    }
  }

  async connect(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      if (!window.adena) {
        throw new Error('Adena wallet not found')
      }

      const account = await window.adena.GetAccount()
      this.currentAddress = account.data.address
      localStorage.setItem(this.STORAGE_KEY, this.currentAddress)
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
    this.isInitialized = false
    this.currentAddress = ''
    localStorage.removeItem(this.STORAGE_KEY)
  }

  getAddress(): string {
    return this.currentAddress
  }

  isConnected(): boolean {
    return this.isInitialized && !!this.currentAddress
  }
}

declare global {
  interface Window {
    adena?: {
      AddEstablish: (appName: string) => Promise<void>
      GetAccount: () => Promise<AdenaAccount> 
      DoContract: (tx: AdenaTransaction) => Promise<AdenaResponse | AdenaRunResponse>
    }
  }
} 
