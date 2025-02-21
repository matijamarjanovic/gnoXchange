import { AdenaService } from "@/app/services/adena-service";
import { GnoPackage } from "@/app/types/adena-types";
import { BroadcastType } from "@adena-wallet/sdk";
import { Tx } from "@gnolang/tm2-js-client";
import { Ticket } from "../types/types";
import { MsgRun } from '@gnolang/gno-js-client/bin/proto/gno/vm';


export async function approveAllTokens(revokeApproval?: boolean): Promise<boolean> {
  const adenaService = AdenaService.getInstance();
  let amount = 0
  if (!adenaService.isConnected()) {
    throw new Error("Wallet not connected");
  }

  if(revokeApproval){
    amount = 0
  } else {
    amount = Number.MAX_SAFE_INTEGER
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
      send: "",
      package: gnoPackage
    }
  };


  try {
    const response = await adenaService.signAndBroadcastTransaction({
      messages: [runMessage],
      gasFee: 1,
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
    const response = await adenaService.signAndBroadcastTransaction({
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

export async function fulfillTicket(ticket: Ticket, amountOut: number): Promise<boolean> {
  const adenaService = AdenaService.getInstance();
  
  if (!adenaService.isConnected()) {
    throw new Error("Wallet not connected");
  }

  const gnoPackage: GnoPackage = {
    name: "main",
    path: "gno.land/r/demo/main",
    files: [{
      name: "main.gno",
      body: `package main

import (
    "std"
    "gno.land/r/matijamarjanovic/tokenhub"
    "gno.land/r/matijamarjanovic/gnoxchange"
)

func main() {
    gnoxchangeAddr := std.DerivePkgAddr("gno.land/r/matijamarjanovic/gnoxchange")

    if "${ticket.assetOut.type}" == "token" {
        token := tokenhub.GetToken("${ticket.assetOut.path}")
        if token == nil {
            panic("token not found")
        }
        
        teller := token.CallerTeller()
        teller.Approve(gnoxchangeAddr, ${amountOut})
    }

    err := gnoxchange.FulfillTicket("${ticket.id}", ${amountOut})
    if err != nil {
        panic("error fulfilling ticket")
    }
}`
    }]
  };

  const transactionRequest = {
    tx: Tx.create({
      messages: [{
        type: "/vm.m_run",
        value: {
          caller: adenaService.getAddress(),
          send: ticket.assetOut.type === 'coin' ? amountOut.toString() : "0",
          package: gnoPackage
        }
      }],
      fee: {
        gasFee: '3000000ugnot',
        gasWanted: 60000000
      },
      memo: ""
    }),
    broadcastType: BroadcastType.SYNC,
  };

  try {
    // First sign the transaction
    const signedTx = await adenaService.getSdk().signTransaction(transactionRequest);
    
    // Then broadcast it
    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);
    console.log('Transaction response:', response);
    return response.code === 0;
  } catch (error) {
    console.error("Error fulfilling ticket:", error);
    throw error;
  }
}


