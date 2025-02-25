import { AdenaService } from "@/app/services/adena-service";
import { GnoPackage } from "@/app/types/adena-types";
import { BroadcastType, TransactionBuilder, makeMsgCallMessage, makeMsgRunMessage } from "@adena-wallet/sdk";
import { Ticket } from "../types/types";

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

  try {
    const tx = TransactionBuilder.create()
      .messages(
        makeMsgRunMessage({
          caller: adenaService.getAddress(),
          send: "",
          package: gnoPackage
        })
      )
      .fee(1, 'ugnot')
      .memo("")
      .build();

    const transactionRequest = {
      tx,
      broadcastType: BroadcastType.SYNC
    };

    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);
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

  try {
    const tx = TransactionBuilder.create()
      .messages(
        makeMsgRunMessage({
          caller: adenaService.getAddress(),
          send: "0",
          package: gnoPackage
        })
      )
      .fee(1000000, 'ugnot')
      .memo("")
      .build();

    const transactionRequest = {
      tx,
      broadcastType: BroadcastType.SYNC
    };

    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);
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


  const tx = TransactionBuilder.create()
    .messages(
      makeMsgRunMessage({
        caller: adenaService.getAddress(),
        send: ticket.assetOut.type === 'coin' ? amountOut.toString() + "ugnot" : "",
        package: gnoPackage
      })
    )
    .fee(1000000, 'ugnot')
    .gasWanted(200000000)
    .memo("memo")
    .build();

  const transactionRequest = {
    tx,
    broadcastType: BroadcastType.SYNC
  };

  try {
    
    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);

    console.log(response);
    return response.code === 0;
  } catch (error) {
    console.error("Error fulfilling ticket:", error);
    throw error;
  }
}

export async function createTicket(
  assetInType: 'coin' | 'token',
  assetOutType: 'coin' | 'token',
  assetInPath: string,
  assetOutPath: string,
  amountIn: number,
  minAmountOut: number,
  expiryHours: number
): Promise<boolean> {
  const adenaService = AdenaService.getInstance();
  
  if (!adenaService.isConnected()) {
    throw new Error("Wallet not connected");
  }

  try {
    let tx;
    
    if (assetInType === 'coin') {
      tx = TransactionBuilder.create()
        .messages(
          makeMsgCallMessage({
            caller: adenaService.getAddress(),
            send: `${amountIn}${assetInPath}`,
            pkg_path: "gno.land/r/matijamarjanovic/gnoxchange",
            func: "CreateCoinToTokenTicket",
            args: [
              assetInPath,
              assetOutPath,
              minAmountOut.toString(),
              expiryHours.toString()
            ]
          })
        )
        .fee(1000000, 'ugnot')
        .gasWanted(200000000)
        .memo("")
        .build();
    } else {
      let createFunction: string;
      const imports = `    "std"\n    "gno.land/r/matijamarjanovic/gnoxchange"\n    "gno.land/r/matijamarjanovic/tokenhub"`;
      
      const approvalCode = `
    gnoxchangeAddr := std.DerivePkgAddr("gno.land/r/matijamarjanovic/gnoxchange")
    token := tokenhub.GetToken("${assetInPath}")
    if token == nil {
        panic("token not found")
    }
    
    teller := token.CallerTeller()
    teller.Approve(gnoxchangeAddr, ${amountIn})
    `;

      if (assetInType === 'token' && assetOutType === 'coin') {
        createFunction = `CreateTokenToCoinTicket("${assetInPath}", "${assetOutPath}", ${amountIn}, ${minAmountOut}, ${expiryHours})`;
      } else {
        createFunction = `CreateTokenToTokenTicket("${assetInPath}", "${assetOutPath}", ${amountIn}, ${minAmountOut}, ${expiryHours})`;
      }

      const gnoPackage: GnoPackage = {
        name: "main",
        path: "gno.land/r/demo/main",
        files: [{
          name: "main.gno",
          body: `package main

import (
${imports}
)

func main() {${approvalCode}
    ticketID, err := gnoxchange.${createFunction}
    if err != nil {
        panic(err)
    }
}`
        }]
      };

      console.log(gnoPackage.files[0].body);

      tx = TransactionBuilder.create()
        .messages(
          makeMsgRunMessage({
            caller: adenaService.getAddress(),
            send: "",
            package: gnoPackage
          })
        )
        .fee(1000000, 'ugnot')
        .gasWanted(200000000)
        .memo("")
        .build();
    }

    const transactionRequest = {
      tx,
      broadcastType: BroadcastType.SYNC
    };

    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);

    console.log(response);
    return response.code === 0;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
}
  

