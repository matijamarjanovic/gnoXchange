import { GnoJSONRPCProvider } from '@gnolang/gno-js-client'
//import { GnoWSProvider } from '@gnolang/gno-js-client'

export class GnoService {
  private provider: GnoJSONRPCProvider
  private providers: GnoJSONRPCProvider[]
  private static instance: GnoService | null = null
  private static defaultRpcUrls = [
    'http://localhost:26657/',
    'https://rpc.gno.land:443/'
  ]

  private constructor(rpcUrls: string[] = GnoService.defaultRpcUrls) {
    this.providers = rpcUrls.map(url => new GnoJSONRPCProvider(url))
    this.provider = this.providers[0]
  }

  public static getInstance(rpcUrls?: string[]): GnoService {
    if (!GnoService.instance) {
      GnoService.instance = new GnoService(rpcUrls)
    }
    return GnoService.instance
  }

  changeProvider(index: number) {
    if (index >= 0 && index < this.providers.length) {
      this.provider = this.providers[index]
    }
  }

  async getPackageData(packagePath: string, expression: string) {
    try {
      const result = await this.provider.evaluateExpression(
        packagePath,
        expression
      )
      return result
    } catch (error) {
      console.error('Error evaluating expression:', error)
      throw error
    }
  }

  async getPackageFunctions(packagePath: string) {
    try {
      const signatures = await this.provider.getFunctionSignatures(packagePath)
      return signatures
    } catch (error) {
      console.error('Error getting function signatures:', error)
      throw error
    }
  }

  async getRender(packagePath: string, path: string) {
    try {
      const rendered = await this.provider.getRenderOutput(packagePath, path)
      return rendered
    } catch (error) {
      console.error('Error getting render output:', error)
      throw error
    }
  }

  async getPackageSource(packagePath: string) {
    try {
      const source = await this.provider.getFileContent(packagePath)
      return source
    } catch (error) {
      console.error('Error getting file content:', error)
      throw error
    }
  }

  async evaluateExpression(packagePath: string, expression: string) {
    try {
      const result = await this.provider.evaluateExpression(packagePath, expression)
      return result
    } catch (error) {
      console.error('Error evaluating expression:', error)
      throw error
    }
  }
}
