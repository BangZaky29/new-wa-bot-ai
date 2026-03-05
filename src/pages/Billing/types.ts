export interface PackageData {
    id: string;
    name: string;
    display_name: string;
    price: number;
    token_amount: number;
    duration_days: number;
    features: Record<string, any>;
}

export interface SubscriptionData {
    id: string;
    status: string;
    started_at: string;
    expires_at: string;
    payment_method: string;
    packages: PackageData;
}

export interface TokenTransaction {
    id: string;
    amount: number;
    type: string;
    description: string;
    balance_after: number;
    created_at: string;
}

export interface TopupTier {
    token_amount: number;
    price: number;
}
