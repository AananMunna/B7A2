import { Router } from 'express';
import { create, getAll, getSingle, update, remove, metrics } from './issues.controller';
import { authenticate, authorizeRole } from '../../middleware/auth';

const router = Router();

// Public
router.get('/', getAll);
router.get('/metrics', authenticate, authorizeRole('maintainer'), metrics);
router.get('/:id', getSingle);

// Authenticated
router.post('/', authenticate, create);

// Maintainer OR Contributor (own issue, open only)
router.patch('/:id', authenticate, update);

// Maintainer only
router.delete('/:id', authenticate, authorizeRole('maintainer'), remove);

export default router;