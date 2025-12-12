const router = require('express').Router();
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const usersRouter = require('./users');
const articlesRouter = require('./articles');

router.post('/signup', createUser);
router.post('/signin', login);

router.use(auth);
router.use('/users', usersRouter);
router.use('/articles', articlesRouter);

module.exports = router;
