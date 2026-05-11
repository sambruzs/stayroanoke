// Stripe publishable key per Guesty providerAccountId.
// Each entry maps a Stripe account ID → that account's own pk_live key.
// The account ID is always embedded in the key: pk_live_5 + acct ID (minus the leading "acct_1" → "1")
export const STRIPE_KEY_BY_ACCOUNT = {
  'acct_1OsRr4IkkCBfs8qO': 'pk_live_51OsRr4IkkCBfs8qONLeCaV1mOC0T0dY1ZelZq7wqZdIfJzPSGFRVtuNeAk6Cru9HwOJiLE2Pi9NwtzXVtSF5tbya00z3QxsKD2', // Prescott Properties LLC
  'acct_1O2fA6AFkaPs9IJB': 'pk_live_51O2fA6AFkaPs9IJBLCNqRQuyo5oZSNSIqygdSUpbybvihXpy6IhtL524JHNTMzmSfOTpiLzSuyocKbceVg1Ufhjz00vZX3ZgXR', // Hunter's Properties
  'acct_1MBpieG90NkgQyC0': 'pk_live_51MBpieG90NkgQyC055bMeRtjdrHiAeN942K2VEuoxv4gnhdOUqC3gjQk49V4QkzI25hFpLpm3wOqI4t3Bhp81Dvt001a1X81yt', // BNB Sidekick
  'acct_1SnhROPdimLfShKb': 'pk_live_51SnhROPdimLfShKbFGpwbBNEx01L6Qj6MDm7409AhHeUy6JBwxtthBFIdIodWr8HTgRryehkAD7jvSTkAQm4lurk00BIuBdmhU', // Josh Lattuca
  'acct_1PeHUoJ1WcmKCPEK': 'pk_live_51PeHUoJ1WcmKCPEKgo9LFRDyBXRkXVdQqAdub5Y3caEMdKgvDTGJ2lFse9WTuopvultS5anxSCwNGhFSRBmH6wlx00dOpracOb', // Sycamore Development
  'acct_1RxpDSQec29Yq7FA': 'pk_live_51RxpDSQec29Yq7FAbwhpcHAWQMT9iVSt3YplTVrt3vTJgGTlo7nuZ2Z0pFisQTnVVFmTBrHBS9C0i0OgaRSuLGoQ00jqzlYfSG', // Stay Roanoke
}
