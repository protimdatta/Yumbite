import express from 'express';
import { sslSuccess, sslFail, sslCancel, sslIpn } from '../controllers/orderController.js';

const router = express.Router();

// SSLCommerz posts (and sometimes redirects) here — accept both verbs.
// None of these trust the frontend: sslSuccess/sslIpn re-validate
// server-side with the gateway before anything becomes paid.
router.get('/ssl/success', sslSuccess);
router.post('/ssl/success', sslSuccess);
router.get('/ssl/fail', sslFail);
router.post('/ssl/fail', sslFail);
router.get('/ssl/cancel', sslCancel);
router.post('/ssl/cancel', sslCancel);
router.post('/ssl/ipn', sslIpn);

export default router;
