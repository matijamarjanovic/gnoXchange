export interface AdenaCallMessage {
    type: "/vm.m_call"
    value: {
      caller: string
      send: string
      pkg_path: string
      func: string
      args: string[]
    }
  }
  
  export interface AdenaTransaction {
    messages: AdenaCallMessage[] | AdenaRunMessage[]
    gasFee: number
    gasWanted: number
  }
  
  export interface AdenaResponse {
    code: number
    status: string
    type: string
    message: string
    data: {
      height: string
      hash: string
      deliverTx: Record<string, unknown>
      checkTx: Record<string, unknown>
    }
  }
  
  export interface GnoFile {
    name: string
    body: string
  }
  
  export interface GnoPackage {
    name: string
    path: string
    files: GnoFile[]
  }
  
  export interface AdenaRunMessage {
    type: "/vm.m_run"
    value: {
      caller: string
      send: string
      package: GnoPackage
    }
  }
  
  export interface AdenaRunResponse {
    status: string
    data: {
      document: {
        msgs: AdenaRunMessage[]
        fee: {
          amount: {
            amount: string
            denom: string
          }[]
          gas: string
        }
        chain_id: string
        memo: string
        account_number: string
        sequence: string
      }
      signature: {
        pub_key: {
          type: string
          value: string
        }
        signature: string
      }
    }
    code: number
    message: string
    type: string
  }
  

  export interface AdenaAccount {
    code: number;
    status: string;
    type: string;
    message: string;
    data: {
      status: string; 
      address: string;
      coins: string; 
      public_key: {
        '@type': string; 
        value: string; 
      };
      account_number: string; 
      sequence: string; 
      chainId: string; 
    };
  }
