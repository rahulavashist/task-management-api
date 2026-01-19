const nodemailer = require('nodemailer');

let transporter = null;

const initEmail = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
};

const sendEmail = async (to, subject, text, html) => {
    if (!transporter) {
        console.log('Email service not configured. Skipping email send.');
        return false;
    }

    try {
        await transporter.sendMail({
            from: `"Task Management" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

const sendRegistrationEmail = async (email, username) => {
    const subject = 'Welcome to Task Management System';
    const html = `
    <h2>Welcome ${username}!</h2>
    <p>Thank you for registering with our Task Management System.</p>
    <p>Your account has been successfully created.</p>
    <p>You can now log in and start managing your tasks.</p>
  `;
    return await sendEmail(email, subject, '', html);
};

module.exports = { initEmail, sendEmail, sendRegistrationEmail };
