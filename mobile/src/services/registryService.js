import api from './api';
import { ENDPOINTS } from '../constants/config';

/**
 * Registry domain services — thin wrappers over the EXISTING backend
 * controllers. Payloads match the Spring DTOs exactly.
 */

/* ------------------------------- Projects ------------------------------ */

export const getProjects = () => api.get(ENDPOINTS.PROJECTS);

export const getProject = (id) => api.get(ENDPOINTS.project(id));

export const createProject = (payload) =>
  api.post(ENDPOINTS.PROJECTS, {
    projectName: payload.projectName,
    description: payload.description || '',
    ecosystemType: payload.ecosystemType,
    location: payload.location,
    area: Number(payload.area),
    startDate: payload.startDate, // yyyy-MM-dd
  });

export const updateProject = (id, payload) =>
  api.put(ENDPOINTS.project(id), {
    projectName: payload.projectName,
    description: payload.description || '',
    ecosystemType: payload.ecosystemType,
    location: payload.location,
    area: Number(payload.area),
    startDate: payload.startDate,
  });

export const deleteProject = (id) => api.delete(ENDPOINTS.project(id));

/* --------------------------------- MRV --------------------------------- */

export const submitMRV = (projectId, { photoVerification, remarks }) =>
  api.post(ENDPOINTS.mrvSubmissions(projectId), {
    photoVerification: Boolean(photoVerification),
    remarks: remarks || '',
  });

export const getProjectMRV = (projectId) =>
  api.get(ENDPOINTS.mrvSubmissions(projectId));

/* ------------------------------ Verifier ------------------------------- */

export const getVerifierQueue = (status) =>
  api.get(status ? ENDPOINTS.verifierMrvByStatus(status) : ENDPOINTS.VERIFIER_MRV);

export const getVerifierHistory = () => api.get(ENDPOINTS.VERIFIER_HISTORY);

export const submitVerification = (mrvId, { verificationStatus, comments }) =>
  api.post(ENDPOINTS.verifyMrv(mrvId), {
    verificationStatus, // 'APPROVED' | 'REJECTED'
    comments: comments || '',
  });

export const getMRVVerifications = (mrvId) =>
  api.get(ENDPOINTS.mrvVerifications(mrvId));

/* ---------------------------- Credit batches --------------------------- */

export const issueCredits = (projectId, quantity) =>
  api.post(ENDPOINTS.issueCredits(projectId), { quantity: Number(quantity) });

export const getProjectCredits = (projectId) =>
  api.get(ENDPOINTS.projectCredits(projectId));

/* ------------------------------ Marketplace ---------------------------- */

export const getMarketplaceCredits = () =>
  api.get(ENDPOINTS.MARKETPLACE_CREDITS);

/* -------------------------------- Buyer -------------------------------- */

export const purchaseCredits = (ccbId, { quantity, paymentMethod }) =>
  api.post(ENDPOINTS.purchaseCredits(ccbId), {
    quantity: Number(quantity),
    paymentMethod,
  });

export const getBuyerPurchases = () => api.get(ENDPOINTS.BUYER_PURCHASES);

export const retireCredits = (purchaseId, { quantity, reason }) =>
  api.post(ENDPOINTS.retireCredits(purchaseId), {
    quantity: Number(quantity),
    reason,
  });

export const getBuyerRetirements = () => api.get(ENDPOINTS.BUYER_RETIREMENTS);

/* -------------------------------- Admin -------------------------------- */

export const getAdminStats = () => api.get(ENDPOINTS.ADMIN_STATS);

export const getAdminUsers = () => api.get(ENDPOINTS.ADMIN_USERS);

export const getAdminProjects = () => api.get(ENDPOINTS.ADMIN_PROJECTS);

export const getAdminCredits = () => api.get(ENDPOINTS.ADMIN_CREDITS);

export const getAdminPurchases = () => api.get(ENDPOINTS.ADMIN_PURCHASES);

export const getAdminRetirements = () => api.get(ENDPOINTS.ADMIN_RETIREMENTS);
