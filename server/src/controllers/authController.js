const crypto = require('crypto');
const User = require('../models/User');
const { hashPassword } = require('../utils/hasher');
const { sendPasswordResetEmail } = require('../services/emailService');
const logger = require('../utils/logger');
const { signupValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } = require('../validations/profileValidation');
const authService = require('../services/authService');

exports.register = async (req, res, next) => {
    try {
        // Validate the request data
        const { error } = signupValidation(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { rollNumber, department, fullName, email, password } = req.body;

        const { user } = await authService.registerUser(rollNumber, department, fullName, email, password);
        res.status(201).json({ user });
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(400).json({ error: 'User already registered' });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        // Validate the request data
        const { error } = loginValidation(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = req.body;
        const { token, user } = await authService.loginUser(email, password);

        // Send the token only in the header
        res.header('Access-Token', token).status(200).json({ user, token });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        logger.info('Forgot password request received.', { email: req.body.email });
        const { error } = forgotPasswordValidation(req.body);
        if (error) {
            logger.warn('Forgot password validation failed.', { error: error.details[0].message });
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            logger.info('Forgot password user found.', { email });
            const resetToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

            user.passwordResetToken = tokenHash;
            user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();

            const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
            const resetUrl = `${appBaseUrl}/v2/auth/reset-password?token=${resetToken}`;

            try {
                await sendPasswordResetEmail({
                    to: user.email,
                    resetUrl,
                    fullName: user.fullName,
                });
            } catch (mailError) {
                logger.error('Failed to send password reset email.', { error: mailError.message });
            }
        } else {
            logger.info('Forgot password user not found.', { email });
        }

        return res.status(200).json({
            message: 'If an account exists for this email, a reset link has been sent.',
        });
    } catch (error) {
        logger.error('Forgot password handler error.', { error: error.message });
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        logger.info('Reset password request received.');
        const { error } = resetPasswordValidation(req.body);
        if (error) {
            logger.warn('Reset password validation failed.', { error: error.details[0].message });
            return res.status(400).json({ error: error.details[0].message });
        }

        const { token, password } = req.body;
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: tokenHash,
            passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
            logger.warn('Reset password token invalid or expired.');
            return res.status(400).json({ error: 'Invalid or expired reset token.' });
        }

        user.password = await hashPassword(password);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        logger.info('Password reset successful.', { email: user.email });
        return res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        logger.error('Reset password handler error.', { error: error.message });
        next(error);
    }
};
