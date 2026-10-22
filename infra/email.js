import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT),
  secure: false,
});

async function send({ to, subject, text }) {
  await transporter.sendMail({
    from: "Loja <contato@loja.local>",
    to,
    subject,
    text,
  });
}

const email = {
  send,
};

export default email;