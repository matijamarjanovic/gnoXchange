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
      broadcastType: BroadcastType.COMMIT
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
      broadcastType: BroadcastType.COMMIT
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
    broadcastType: BroadcastType.COMMIT
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
    _, err := gnoxchange.${createFunction}
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
      broadcastType: BroadcastType.COMMIT
    };

    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);

    console.log(response);
    return response.code === 0;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
}

export async function cancelTicket(ticket: Ticket): Promise<boolean> {
  const adenaService = AdenaService.getInstance();
  
  if (!adenaService.isConnected()) {
    throw new Error("Wallet not connected");
  }

  try {
    const tx = TransactionBuilder.create()
      .messages(
        makeMsgCallMessage({
          caller: adenaService.getAddress(),
          send: "",
          pkg_path: "gno.land/r/matijamarjanovic/gnoxchange",
          func: "CancelTicket",
          args: [ticket.id]
        })
      )
      .fee(1000000, 'ugnot')
      .gasWanted(200000000)
      .memo("")
      .build();

    const transactionRequest = {
      tx,
      broadcastType: BroadcastType.COMMIT
    };

    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);
    return response.code === 0;
  } catch (error) {
    console.error("Error cancelling ticket:", error);
    throw error;
  }
}

export async function createNFTTicket(
  nftPath: string,
  assetOutType: 'coin' | 'token',
  assetOutPath: string,
  minAmountOut: number,
  expiryHours: number
): Promise<boolean> {
  const adenaService = AdenaService.getInstance();
  
  if (!adenaService.isConnected()) {
    throw new Error("Wallet not connected");
  }

  try {
    const gnoPackage: GnoPackage = {
      name: "main",
      path: "gno.land/r/demo/main",
      files: [{
        name: "main.gno",
        body: `package main

import (
    "std"
    "gno.land/r/matijamarjanovic/gnoxchange"
    "gno.land/r/matijamarjanovic/tokenhub"
)

func main() {
    gnoxchangeAddr := std.DerivePkgAddr("gno.land/r/matijamarjanovic/gnoxchange")
    nft := tokenhub.GetNFT("${nftPath}")
    if nft == nil {
        panic("NFT not found")
    }
    
    nft.SetApprovalForAll(gnoxchangeAddr, true)

    var err error
    if "${assetOutType}" == "coin" {
        _, err = gnoxchange.CreateNFTToCoinTicket("${nftPath}", "${assetOutPath}", ${minAmountOut}, ${expiryHours})
    } else {
        _, err = gnoxchange.CreateNFTToTokenTicket("${nftPath}", "${assetOutPath}", ${minAmountOut}, ${expiryHours})
    }
    
    if err != nil {
        panic(err)
    }
}`
      }]
    };

    const tx = TransactionBuilder.create()
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

    const transactionRequest = {
      tx,
      broadcastType: BroadcastType.COMMIT
    };

    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);
    return response.code === 0;
  } catch (error) {
    console.error("Error creating NFT ticket:", error);
    throw error;
  }
}

export async function buyNFT(
  ticketID: string,
  amountOut: number,
  paymentType: 'coin' | 'token',
  paymentPath?: string
): Promise<boolean> {
  const adenaService = AdenaService.getInstance();
  
  if (!adenaService.isConnected()) {
    throw new Error("Wallet not connected");
  }

  try {
    let tx;
    if (paymentType === 'coin') {
      tx = TransactionBuilder.create()
        .messages(
          makeMsgCallMessage({
            caller: adenaService.getAddress(),
            send: `${amountOut}ugnot`,
            pkg_path: "gno.land/r/matijamarjanovic/gnoxchange",
            func: "BuyNFT",
            args: [ticketID, amountOut.toString()]
          })
        )
        .fee(1000000, 'ugnot')
        .gasWanted(200000000)
        .memo("")
        .build();
    } else {
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
    token := tokenhub.GetToken("${paymentPath}")
    if token == nil {
        panic("token not found")
    }
    
    teller := token.CallerTeller()
    teller.Approve(gnoxchangeAddr, ${amountOut})

    err := gnoxchange.BuyNFT("${ticketID}", ${amountOut})
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
    console.log(tx.fee)
    const transactionRequest = {
      tx,
      broadcastType: BroadcastType.COMMIT
    };

    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);
    return response.code === 0;
  } catch (error) {
    console.error("Error buying NFT:", error);
    throw error;
  }
}

export async function createPool(
  tokenA: string,
  tokenB: string,
  amountA: number,
  amountB: number,
): Promise<boolean> {
  const adenaService = AdenaService.getInstance();
  
  if (!adenaService.isConnected()) {
    throw new Error("Wallet not connected");
  }

  if (tokenA === tokenB) {
    throw new Error("Cannot create pool with identical assets");
  }

  try {
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
    
    tokenA := tokenhub.GetToken("${tokenA}")
    if tokenA == nil {
        panic("token A not found")
    }
    tellerA := tokenA.CallerTeller()
    tellerA.Approve(gnoxchangeAddr, ${amountA})

    tokenB := tokenhub.GetToken("${tokenB}")
    if tokenB == nil {
        panic("token B not found")
    }
    tellerB := tokenB.CallerTeller()
    tellerB.Approve(gnoxchangeAddr, ${amountB})

    _, err := gnoxchange.CreatePool("${tokenA}", "${tokenB}", ${amountA}, ${amountB})
    if err != nil {
        panic(err)
    }
}`
        }]
      };
      console.log(gnoPackage.files[0].body);

    const tx = TransactionBuilder.create()
      .messages(
        makeMsgRunMessage({
          caller: adenaService.getAddress(),
            send: "",
            package: gnoPackage
          })
        ).fee(1000000, 'ugnot')
          .gasWanted(200000000)
          .memo("")
          .build();

    const transactionRequest = {
      tx: tx,
      broadcastType: BroadcastType.COMMIT
    };

    const response = await adenaService.getSdk().broadcastTransaction(transactionRequest);
    return response.code === 0;
  } catch (error) {
    console.error("Error creating pool:", error);
    throw error;
  }
}



