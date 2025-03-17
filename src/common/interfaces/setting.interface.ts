export interface ISettings {
  app: App;
  // transfer: ITransfer;
}

export interface App {
  name: string;
  supportEmail: string;
  shoppingFee: {
    percentage: number;
    maxAmount: number;
  };
  minWithdrawalAmount: number;
  urls: {
    webHomepage: string;
    productsPage: string;
  };
}

// export interface ITransfer {
//   needsApproval: boolean;
//   providers: {
//     name: PaymentTypeEnum;
//     active: boolean;
//     transfer: boolean;
//     withdrawal: boolean;
//   }[];
// }
