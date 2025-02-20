import { AdenaService } from "@/app/services/adena-service";
import { AdenaRunMessage, GnoPackage } from "@/app/types/adena-types";

export async function approveAllTokens(revokeApproval?: boolean): Promise<boolean> {
  const adenaService = AdenaService.getInstance();
  let amount = 0
  if (!adenaService.isConnected()) {
    throw new Error("Wallet not connected");
  }

  if(revokeApproval){
    amount = 0
  } else {
    amount = 9223372036854775807
  }

  const gnoPackage: GnoPackage = {
    name: "main",
    path: "gno.land/r/demo/main",
    files: [
      {
        name: "main.gno",
        body: `package main

import (
    "std"
    "strings"
    "gno.land/r/matijamarjanovic/tokenhub"
)

func main() {
    gnoxchangeAddr := std.DerivePkgAddr("gno.land/r/matijamarjanovic/gnoxchange")

    allTokensStr := tokenhub.GetAllTokens()
    tokenKeys := strings.Split(allTokensStr, ",")

    for _, tokenStr := range tokenKeys {
        if tokenStr == "" {
            continue
        }
        tokenKey := strings.TrimPrefix(tokenStr, "Token:")
        
        token := tokenhub.GetToken(tokenKey)
        if token == nil {
            continue
        }
        
        teller := token.CallerTeller()
        teller.Approve(gnoxchangeAddr, ${amount})
    }
}`
      }
    ]
  };

  const runMessage: AdenaRunMessage = {
    type: "/vm.m_run",
    value: {
      caller: adenaService.getAddress(),
      send: "0",
      package: gnoPackage
    }
  };

  try {
    const response = await adenaService.runContract({
      messages: [runMessage],
      gasFee: 1000000,
      gasWanted: 200000000
    });

    return response.code === 0; 
  } catch (error) {
    console.error("Error approving tokens:", error);
    throw error;
  }
}

export async function approveTokenAmounts(tokenAmounts: Record<string, number>): Promise<boolean> {
  const adenaService = AdenaService.getInstance();
  
  if (!adenaService.isConnected()) {
    throw new Error("Wallet not connected");
  }

  const tokenAmountsStr = Object.entries(tokenAmounts)
    .map(([key, amount]) => `"${key}": ${amount}`)
    .join(", ");

  const gnoPackage: GnoPackage = {
    name: "main",
    path: "gno.land/r/demo/main",
    files: [
      {
        name: "main.gno",
          body: `package main

  import (
      "std"
      "gno.land/r/matijamarjanovic/tokenhub"
  )

  func main() {
      gnoxchangeAddr := std.DerivePkgAddr("gno.land/r/matijamarjanovic/gnoxchange")
      
      tokenAmounts := map[string]int64{${tokenAmountsStr}}

      for tokenKey, amount := range tokenAmounts {
          token := tokenhub.GetToken(tokenKey)
          if token == nil {
              continue
          }
          
          teller := token.CallerTeller()
          teller.Approve(gnoxchangeAddr, uint64(amount))
      }
  }`
      }
    ]
  };

  const runMessage: AdenaRunMessage = {
    type: "/vm.m_run",
    value: {
      caller: adenaService.getAddress(),
      send: "0",
      package: gnoPackage
    }
  };

  try {
    const response = await adenaService.runContract({
      messages: [runMessage],
      gasFee: 1000000,
      gasWanted: 200000000
    });

    return response.code === 0;
  } catch (error) {
    console.error("Error approving token amounts:", error);
    throw error;
  }
}


