import { AdenaAccount, AdenaResponse, AdenaRunResponse, AdenaTransaction } from '@/app/types/adena-types'

export class AdenaService {
  private static instance: AdenaService
  private currentAddress: string = ''
  private isInitialized: boolean = false

  private constructor() {}

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
