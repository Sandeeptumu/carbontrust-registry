import { api } from './client'

export function purchaseCredits(ccbId, payload) {
  return api.post(`/buyer/carbon-credits/${ccbId}/purchase`, payload)
}

export function myPurchases() {
  return api.get('/buyer/purchases')
}

export function retireCredits(purchaseId, payload) {
  return api.post(`/buyer/purchases/${purchaseId}/retire`, payload)
}

export function myRetirements() {
  return api.get('/buyer/retirements')
}
